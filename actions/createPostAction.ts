"use server";

import { AddPostRequestBody } from "@/app/api/posts/route";
import { supabaseAdmin } from "@/lib/supabase";
import { Post } from "@/mongodb/models/post";
import { IUser } from "@/types/user";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

const BUCKET_NAME = "posts";

export default async function createPostAction(formData: FormData) {
  const user = await currentUser();
  const postInput = formData.get("postInput") as string;
  const image = formData.get("image") as File;
  const video = formData.get("video") as File;
  let image_url = undefined;
  let video_url = undefined;

  if (!postInput) {
    throw new Error("Post input is required");
  }

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const userDB: IUser = {
    userId: user.id,
    userImage: user.imageUrl,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
  };

  try {
    // Handle image upload
    if (image && image.size > 0) {
      console.log("Uploading image to Supabase Storage...", image);

      const timestamp = new Date().getTime();
      const file_name = `${randomUUID()}_${timestamp}.png`;

      const imageBuffer = Buffer.from(await image.arrayBuffer());

      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(file_name, imageBuffer, {
          contentType: image.type || "image/png",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error("Failed to upload image");
      }

      // Get the public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file_name);

      image_url = urlData.publicUrl;

      console.log("Image uploaded successfully!", image_url);
    }

    // Handle video upload
    if (video && video.size > 0) {
      console.log("Uploading video to Supabase Storage...", video);

      const timestamp = new Date().getTime();
      const file_name = `${randomUUID()}_${timestamp}.mp4`;

      const videoBuffer = Buffer.from(await video.arrayBuffer());

      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(file_name, videoBuffer, {
          contentType: video.type || "video/mp4",
          upsert: false,
        });

      if (error) {
        console.error("Supabase video upload error:", error);
        throw new Error("Failed to upload video");
      }

      // Get the public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file_name);

      video_url = urlData.publicUrl;

      console.log("Video uploaded successfully!", video_url);
    }

    const body: AddPostRequestBody = {
      user: userDB,
      text: postInput,
      imageUrl: image_url,
      videoUrl: video_url,
    };

    await Post.create(body);
  } catch (error: any) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }

  revalidatePath("/");
}
