import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en" className="dark">
      <body className="grid min-h-screen place-items-center bg-[#0a0a0a] font-sans text-[#fafafa]">
        <main className="text-center">
          <h1 className="font-serif text-4xl">Page not found</h1>
          <Link href="/" className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-medium text-black">
            Return home
          </Link>
        </main>
      </body>
    </html>
  );
}
