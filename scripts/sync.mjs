#!/usr/bin/env node
/**
 * Generic game content sync.
 *
 * Zero-dependency Node 22+ script. Every game is a config file in games/.
 * Source layers per game:
 *   1. Official:   Roblox or Steam public APIs (optional platform source)
 *   2. Community:  watch pages (wiki / competitor / any public URL)
 *   3. Discovery:  Google News RSS; YouTube + Google SERP via SERPER_API_KEY
 *
 * Files under data/<slug>/ are written only when content actually changed,
 * so a clean run leaves the git tree untouched.
 *
 * Add a game: create games/<slug>.json (+ keywords/<slug>.json for stage 2).
 *
 * Subcommands:
 *   sync [--game <slug>]     monitor all games or one game (default, used by CI)
 *   collect --game <slug>    stage 2: run game-material collect locally
 *   update  --game <slug>    sync, then collect
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const DATA_ROOT = path.resolve("data");
const GAMES_DIR = path.resolve("games");
const ROOT = path.resolve(".");
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const REQUEST_TIMEOUT_MS = 20_000;
const RETRIES = 3;

const SERPER_API = "https://google.serper.dev/search";
const SERPER_VIDEO_API = "https://google.serper.dev/video";
const DEFAULT_UPDATE_TITLE_PATTERN = "update|code|event|new";
const GAME_MATERIAL_SCRIPT =
  process.env.GAME_MATERIAL_SCRIPT ||
  "/Users/fh/Documents/coding/优秀游戏站总结/game-material-scraper/collect_material.py";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha1 = (value) => createHash("sha1").update(value).digest("hex");
const clean = (value) => value.replace(/\s+/g, " ").trim();

async function loadGames(gameFilter = "") {
  let files;
  try {
    files = await readdir(GAMES_DIR);
  } catch {
    return [];
  }
  const games = [];
  for (const file of files.filter((name) => name.endsWith(".json"))) {
    const config = JSON.parse(await readFile(path.join(GAMES_DIR, file), "utf8"));
    games.push({ ...config, slug: config.slug || file.replace(/\.json$/, "") });
  }
  if (!gameFilter) return games;
  const selected = games.filter((game) => game.slug === gameFilter);
  if (selected.length === 0) throw new Error(`no game config found: ${gameFilter}`);
  return selected;
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTableRows(html) {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  const rows = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let row;
  while ((row = rowRe.exec(withoutScripts))) {
    const cells = [];
    const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    let cell;
    while ((cell = cellRe.exec(row[1]))) {
      cells.push(clean(decodeEntities(cell[1])));
    }
    if (cells.some((value) => value.length > 0)) rows.push(cells);
  }
  return rows;
}

function extractNewsItems(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let item;
  while ((item = itemRe.exec(xml))) {
    const block = item[1];
    const title = /<title>([\s\S]*?)<\/title>/.exec(block)?.[1] ?? "";
    const link = /<link>([^<]+)<\/link>/.exec(block)?.[1] ?? "";
    const pubDate = /<pubDate>([^<]+)<\/pubDate>/.exec(block)?.[1] ?? "";
    if (title) {
      items.push({
        title: clean(decodeEntities(title)),
        link: link.trim(),
        pubDate: pubDate.trim(),
      });
    }
  }
  return items;
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
}

async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "user-agent": USER_AGENT,
          accept: "application/json, text/html;q=0.9, */*;q=0.8",
          ...options.headers,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) await sleep(attempt * 2000);
    }
  }
  throw lastError;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function diffAndWrite(file, next, describe, signatureKeys) {
  const previous = await readJson(file);
  const signature = (value) => {
    if (signatureKeys) return JSON.stringify(signatureKeys.map((key) => value?.[key]));
    return JSON.stringify({ ...value, fetchedAt: undefined });
  };
  if (previous && signature(previous) === signature(next)) return null;
  await writeFile(file, `${JSON.stringify(next, null, 2)}\n`);
  return describe(previous);
}

async function alert(text) {
  const lark = process.env.LARK_WEBHOOK_URL;
  const slack = process.env.SLACK_WEBHOOK_URL;
  if (!lark && !slack) return;
  try {
    if (lark) {
      await fetch(lark, {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ msgtype: "text", text: { content: text } }),
      });
    } else {
      await fetch(slack, {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
    }
  } catch (error) {
    console.error(`alert failed: ${error.message}`);
  }
}

async function serperPost(url, body) {
  const response = await fetchWithRetry(url, {
    method: "post",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return JSON.parse(response);
}

async function syncRobloxGame(game, dir) {
  const api = `https://games.roblox.com/v1/games?universeIds=${game.robloxUniverseId}`;
  const payload = JSON.parse(await fetchWithRetry(api));
  const info = payload?.data?.[0];
  if (!info) throw new Error("game not found in Roblox API response");
  const next = {
    id: info.id,
    name: info.name,
    rootPlaceId: info.rootPlaceId,
    creator: {
      id: info.creator?.id,
      name: info.creator?.name,
      type: info.creator?.type,
    },
    description: info.description,
    updated: info.updated,
    playing: info.playing,
    visits: info.visits,
    favoritedCount: info.favoritedCount,
    url: `https://www.roblox.com${info.canonicalUrlPath}`,
    fetchedAt: now,
  };
  return diffAndWrite(
    path.join(dir, "roblox-game.json"),
    next,
    (previous) => ({
      reason: previous
        ? `game updated: ${previous.updated} -> ${next.updated}`
        : "initial snapshot",
    }),
    ["updated", "description", "name"],
  );
}

async function syncSteamGame(game, dir) {
  const appId = String(game.steamAppId);
  const api = new URL("https://store.steampowered.com/api/appdetails");
  api.searchParams.set("appids", appId);
  api.searchParams.set("cc", game.steamCountry ?? "us");
  api.searchParams.set("l", game.steamLanguage ?? "english");
  const payload = JSON.parse(await fetchWithRetry(api));
  const result = payload?.[appId];
  const info = result?.data;
  if (!result?.success || !info) throw new Error("game not found in Steam app API response");
  const next = {
    appId: info.steam_appid,
    name: info.name,
    type: info.type,
    isFree: Boolean(info.is_free),
    price: info.price_overview?.final_formatted ?? "",
    shortDescription: info.short_description ?? "",
    website: info.website ?? "",
    headerImage: info.header_image ?? "",
    developers: info.developers ?? [],
    publishers: info.publishers ?? [],
    dlcCount: Array.isArray(info.dlc) ? info.dlc.length : 0,
    releaseDate: info.release_date?.date ?? "",
    comingSoon: Boolean(info.release_date?.coming_soon),
    genres: (info.genres ?? []).map((item) => item.description).filter(Boolean),
    categories: (info.categories ?? []).map((item) => item.description).filter(Boolean),
    url: `https://store.steampowered.com/app/${appId}/`,
    fetchedAt: now,
  };
  return diffAndWrite(
    path.join(dir, "steam-game.json"),
    next,
    (previous) => ({
      reason: previous ? "Steam store details changed" : "initial snapshot",
    }),
    [
      "name",
      "type",
      "isFree",
      "price",
      "shortDescription",
      "website",
      "developers",
      "publishers",
      "dlcCount",
      "releaseDate",
      "comingSoon",
      "genres",
      "categories",
    ],
  );
}

async function syncSteamNews(game, dir) {
  const appId = String(game.steamAppId);
  const count = Math.min(Math.max(Number(game.steamNewsCount ?? 20), 1), 20);
  const api = new URL("https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/");
  api.searchParams.set("appid", appId);
  api.searchParams.set("count", String(count));
  api.searchParams.set("maxlength", "500");
  api.searchParams.set("format", "json");
  const payload = JSON.parse(await fetchWithRetry(api));
  const items = (payload?.appnews?.newsitems ?? []).map((item) => {
    const timestamp = Number(item.date);
    return {
      gid: String(item.gid ?? ""),
      title: clean(decodeEntities(item.title ?? "")),
      url: item.url ?? "",
      author: item.author ?? "",
      feedLabel: item.feedlabel ?? "",
      date: Number.isFinite(timestamp) ? new Date(timestamp * 1000).toISOString() : "",
      excerpt: clean(htmlToText(item.contents ?? "")).slice(0, 500),
    };
  });
  const next = {
    appId,
    items,
    fetchedAt: now,
  };
  return diffAndWrite(path.join(dir, "steam-news.json"), next, (previous) => ({
    reason: previous ? "Steam news or announcements changed" : "initial snapshot",
    entries: items.slice(0, 5).map((item) => `${item.title} ${item.url}`),
  }));
}

async function syncWatchPage(game, dir, page) {
  const html = await fetchWithRetry(page.url);
  const contentHash = sha1(clean(htmlToText(html)));
  const next = {
    slug: page.slug,
    url: page.url,
    contentHash,
    tables: page.parseTables ? extractTableRows(html) : [],
    fetchedAt: now,
  };
  return diffAndWrite(path.join(dir, `watch-${page.slug}.json`), next, (previous) => ({
    url: page.url,
    reason: previous ? "page content changed" : "initial snapshot",
  }));
}

async function syncYoutube(game, dir) {
  const data = await serperPost(SERPER_VIDEO_API, {
    q: game.youtubeQuery,
    num: 15,
  });
  const updateTitleRe = new RegExp(
    game.updateTitlePattern ?? DEFAULT_UPDATE_TITLE_PATTERN,
    "i",
  );
  const videos = (data.videos ?? [])
    .map((item) => ({
      title: clean(decodeEntities(item.title ?? "")),
      link: item.link ?? "",
      channel: item.channel ?? "",
    }))
    .filter((item) => item.title && updateTitleRe.test(item.title))
    .slice(0, 10);
  const next = { query: game.youtubeQuery, videos, fetchedAt: now };
  return diffAndWrite(path.join(dir, "watch-youtube.json"), next, (previous) => ({
    reason: previous ? "new update-related videos" : "initial snapshot",
    entries: videos.map((item) => `${item.title} ${item.link}`),
  }));
}

async function syncGoogleNews(game, dir) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    game.newsQuery,
  )}&hl=en-US&gl=US&ceid=US:en`;
  const xml = await fetchWithRetry(url);
  const items = extractNewsItems(xml).slice(0, 10);
  const next = { query: game.newsQuery, items, fetchedAt: now };
  return diffAndWrite(path.join(dir, "watch-google-news.json"), next, (previous) => ({
    reason: previous ? "news results changed" : "initial snapshot",
    entries: items.map((item) => item.title),
  }));
}

async function syncGoogleSerp(game, dir) {
  const data = await serperPost(SERPER_API, {
    q: game.serperQuery,
    tbs: "qdr:w",
    num: 10,
  });
  const results = (data.organic ?? []).slice(0, 10).map((item) => ({
    title: item.title,
    link: item.link,
    date: item.date ?? "",
  }));
  const next = { query: game.serperQuery, window: "qdr:w", results, fetchedAt: now };
  return diffAndWrite(path.join(dir, "watch-google-serp.json"), next, (previous) => ({
    reason: previous ? "weekly SERP results changed" : "initial snapshot",
    entries: results.map((item) => `${item.title} ${item.link}`),
  }));
}

function buildTasks(game, dir) {
  const tasks = [];
  if (game.robloxUniverseId) {
    tasks.push(["roblox-game", () => syncRobloxGame(game, dir)]);
  }
  if (game.steamAppId) {
    tasks.push(["steam-game", () => syncSteamGame(game, dir)]);
    tasks.push(["steam-news", () => syncSteamNews(game, dir)]);
  }
  for (const page of game.watchPages ?? []) {
    tasks.push([`watch:${page.slug}`, () => syncWatchPage(game, dir, page)]);
  }
  if (process.env.SERPER_API_KEY) {
    if (game.youtubeQuery) {
      tasks.push(["watch:youtube", () => syncYoutube(game, dir)]);
    }
    if (game.serperQuery) {
      tasks.push(["watch:google-serp", () => syncGoogleSerp(game, dir)]);
    }
  }
  if (game.newsQuery) {
    tasks.push(["watch:google-news", () => syncGoogleNews(game, dir)]);
  }
  return tasks;
}

let now = new Date().toISOString();

async function runSync(gameFilter = "") {
  now = new Date().toISOString();
const games = await loadGames(gameFilter);
if (games.length === 0) {
  console.error(`no game configs found in ${GAMES_DIR}`);
  process.exit(1);
}

const changes = [];
const errors = [];
let taskCount = 0;

for (const game of games) {
  const dir = path.join(DATA_ROOT, game.slug);
  await mkdir(dir, { recursive: true });
  const tasks = buildTasks(game, dir);
  taskCount += tasks.length;
  for (const [name, task] of tasks) {
    try {
      const change = await task();
      if (change) changes.push({ game: game.slug, source: name, ...change });
    } catch (error) {
      errors.push(`[${game.slug}] ${name}: ${error.message}`);
    }
  }
}

if (changes.length > 0) {
  for (const game of games) {
    const gameChanges = changes.filter((change) => change.game === game.slug);
    if (gameChanges.length === 0) continue;
    await writeFile(
      path.join(DATA_ROOT, game.slug, "changes.json"),
      `${JSON.stringify({ ranAt: now, changes: gameChanges }, null, 2)}\n`,
    );
  }
  const lines = changes
    .map((change) => {
      const detail = change.entries ? `: ${change.entries.join(" | ")}` : "";
      return `- [${change.game}] ${change.source}: ${change.reason}${detail}`;
    })
    .join("\n");
  await alert(`[Game Sync] content changes detected:\n${lines}`);
  console.log(`changed sources: ${changes.length}`);
} else {
  console.log("no changes");
}

if (errors.length > 0) {
  const lines = errors.join("\n");
  await alert(`[Game Sync] sync errors:\n${lines}`);
  console.error(lines);
  if (errors.length === taskCount) process.exit(1);
}
}

function usage() {
  return [
    "Usage:",
    "  node scripts/sync.mjs                     # monitor all games (default, CI)",
    "  node scripts/sync.mjs sync                # same as above",
    "  node scripts/sync.mjs sync --game <slug>  # monitor one game",
    "  node scripts/sync.mjs collect --game <slug> [collect_material.py args]",
    "  node scripts/sync.mjs update --game <slug> [collect_material.py args]",
  ].join("\n");
}

function parseGameArgs(argv) {
  let game = "";
  const passthrough = [];
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === "--game") {
      game = argv[index + 1] ?? "";
      index++;
    } else {
      passthrough.push(argv[index]);
    }
  }
  return { game, passthrough };
}

async function runCollect(gameSlug, passthrough) {
  const configFile = path.join(GAMES_DIR, `${gameSlug}.json`);
  const config = await readJson(configFile);
  if (!config) throw new Error(`missing ${configFile}`);
  const keywordsFile = path.join(ROOT, "keywords", `${gameSlug}.json`);
  if (!(await readJson(keywordsFile))) throw new Error(`missing ${keywordsFile}`);
  const args = [
    GAME_MATERIAL_SCRIPT,
    "--keywords-file",
    keywordsFile,
    "--game",
    config.name ?? gameSlug,
    "--output-dir",
    path.join(ROOT, "content", gameSlug),
    "--cache-dir",
    path.join(ROOT, ".cache"),
    ...passthrough,
  ];
  if (config.steamAppId) {
    args.push("--steam-appid", String(config.steamAppId));
  }
  const child = spawn("python3", args, { stdio: "inherit" });
  await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`collect_material.py exited with code ${code}`));
    });
  });
}

const [command = "sync", ...rest] = process.argv.slice(2);
try {
  if (command === "sync") {
    const { game } = parseGameArgs(rest);
    await runSync(game);
  } else if (command === "collect" || command === "update") {
    const { game, passthrough } = parseGameArgs(rest);
    if (!game) {
      console.error(usage());
      process.exit(1);
    }
    if (command === "update") await runSync(game);
    await runCollect(game, passthrough);
  } else {
    console.error(`unknown command: ${command}\n${usage()}`);
    process.exit(1);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
