import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  leaseUploader: f({ pdf: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
