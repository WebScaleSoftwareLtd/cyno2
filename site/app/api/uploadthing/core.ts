import getDiscordUser from "@/utils/getDiscordUser";
import { createUploadthing, type FileRouter as UploadThingFileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();

export const fileRouter = {
    imageUrlUploader: f({ image: { maxFileSize: "8MB" } }).
        middleware(async () => {
            const user = await getDiscordUser();
            if (!user) throw new UploadThingError("Unauthorized");
            return {};
        }).
        onUploadComplete(async ({ file }) => {
            return { url: file.url };
        }),
} satisfies UploadThingFileRouter;

export type FileRouter = typeof fileRouter;
