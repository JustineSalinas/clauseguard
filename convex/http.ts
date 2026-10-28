import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Wires /api/auth/* (OAuth redirect handling, e.g. Google) on the Convex
// HTTP actions URL (NEXT_PUBLIC_CONVEX_SITE_URL). Replaces
// app/auth/callback and app/auth/confirm's job.
auth.addHttpRoutes(http);

export default http;
