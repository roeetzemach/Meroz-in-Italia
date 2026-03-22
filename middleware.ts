import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

// This middleware intercepts all requests and routes them to the correct locale.
// Hebrew (he) is the default — visiting / serves Hebrew automatically.
// English is at /en.
export default createMiddleware(routing);

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
