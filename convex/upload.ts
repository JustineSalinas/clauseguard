/**
 * Replaces the Supabase 'contracts' private bucket + its storage.objects RLS
 * policies. Convex's generateUploadUrl pattern is the equivalent of a
 * short-lived signed URL: the client asks for one, uploads the file
 * directly to Convex storage over it, then calls documents.create with the
 * storageId it gets back. No ownership check needed on the upload URL
 * itself -- it's single-use and content-addressed; ownership is enforced
 * where it matters, in documents.create and documents.get.
 */

import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");
    return await ctx.storage.generateUploadUrl();
  },
});
