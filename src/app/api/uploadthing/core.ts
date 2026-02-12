import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createClient } from "@/lib/supabase/server";

const f = createUploadthing();

/**
 * Authentication middleware for file uploads.
 * Ensures only authenticated users can upload files.
 */
async function authMiddleware() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: You must be logged in to upload files.");
  }

  return { userId: user.id };
}

export const ourFileRouter = {
  productImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 8,
    },
  })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      // metadata contains { userId } from middleware
      return { url: file.url, uploadedBy: metadata.userId };
    }),
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(authMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url, uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
