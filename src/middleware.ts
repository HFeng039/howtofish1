import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(en|pt-br|es-419|ko)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
