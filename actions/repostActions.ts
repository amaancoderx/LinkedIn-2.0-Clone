"use server";

import { Post } from "@/mongodb/models/post";
import connectDB from "@/mongodb/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function repostDirectly(originalPostId: string, userId: string) {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Get the original post
    const originalPost = await Post.findById(originalPostId);
    if (!originalPost) {
      throw new Error("Original post not found");
    }

    // Create a repost (copy of the original post with repost metadata)
    await Post.create({
      user: {
        userId: user.id,
        userImage: user.imageUrl,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      },
      text: originalPost.text,
      imageUrl: originalPost.imageUrl,
      videoUrl: originalPost.videoUrl,
      imageUrls: originalPost.imageUrls,
      videoUrls: originalPost.videoUrls,
      isRepost: true,
      originalPostId: originalPostId,
      originalAuthor: originalPost.user,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error reposting:", error);
    throw new Error("Failed to repost");
  }
}

export async function repostWithThoughts(
  originalPostId: string,
  userId: string,
  userName: string,
  userImage: string,
  thoughts: string
) {
  try {
    await connectDB();

    const user = await currentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Get the original post
    const originalPost = await Post.findById(originalPostId);
    if (!originalPost) {
      throw new Error("Original post not found");
    }

    console.log("Creating repost with thoughts. Original post:", {
      _id: originalPost._id,
      text: originalPost.text,
      imageUrl: originalPost.imageUrl,
      videoUrl: originalPost.videoUrl,
    });

    // Create a new post with thoughts and reference to original
    const newPost = await Post.create({
      user: {
        userId: user.id,
        userImage: user.imageUrl,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      },
      text: thoughts,
      isRepost: true,
      originalPostId: originalPostId,
      originalPost: {
        _id: originalPost._id.toString(),
        user: originalPost.user,
        text: originalPost.text,
        imageUrl: originalPost.imageUrl,
        videoUrl: originalPost.videoUrl,
        createdAt: originalPost.createdAt,
      },
    });

    console.log("Repost created with originalPost:", {
      isRepost: newPost.isRepost,
      hasOriginalPost: !!newPost.originalPost,
      originalPostId: newPost.originalPost?._id,
      originalPostText: newPost.originalPost?.text,
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error reposting with thoughts:", error);
    throw new Error("Failed to repost with thoughts");
  }
}
