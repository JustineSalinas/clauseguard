// Entry point passed to `node --import`. Registers the "@/" alias resolver
// from resolve-aliases.mjs so pipeline code under test can use the same
// "@/lib/..." imports as the rest of the app.
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./resolve-aliases.mjs", pathToFileURL(import.meta.filename));
