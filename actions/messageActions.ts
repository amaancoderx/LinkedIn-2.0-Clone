"use server";

import { Message } from "@/mongodb/models/message";
import { Notification } from "@/mongodb/models/notification";
import connectDB from "@/mongodb/db";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { randomUUID } from "crypto";

const BUCKET_NAME = "posts";

export async function sendMessage(
  senderId: string,
  senderName: string,
  senderImage: string,
  receiverId: string,
  receiverName: string,
  receiverImage: string,
  content: string,
  imageUrl?: string
) {
  try {
    await connectDB();

    const message = await Message.create({
      senderId,
      senderName,
      senderImage,
      receiverId,
      receiverName,
      receiverImage,
      content,
      read: false,
      imageUrl,
    });

    // Create notification for receiver
    await Notification.create({
      userId: receiverId,
      actorId: senderId,
      actorName: senderName,
      actorImage: senderImage,
      type: "message",
      message: `${senderName} sent you a message`,
      read: false,
    });

    revalidatePath("/messaging");
    return { success: true, message };
  } catch (error: any) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
}

export async function getConversationMessages(
  userId1: string,
  userId2: string
) {
  try {
    await connectDB();
    const messages = await Message.getConversation(userId1, userId2);
    return messages.map((msg) => ({
      ...msg.toObject(),
      _id: msg._id.toString(),
    }));
  } catch (error) {
    console.error("Error getting conversation:", error);
    return [];
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    await connectDB();
    const message = await Message.findById(messageId);
    if (message) {
      await message.markAsRead();
    }
    revalidatePath("/messaging");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking message as read:", error);
    return { success: false, error: error.message };
  }
}

export async function markConversationAsRead(
  currentUserId: string,
  otherUserId: string
) {
  try {
    await connectDB();
    // Mark all messages from the other user to current user as read
    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: currentUserId,
        read: false,
      },
      { read: true }
    );
    revalidatePath("/messaging");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking conversation as read:", error);
    return { success: false, error: error.message };
  }
}

export async function uploadMessageImage(formData: FormData): Promise<string | null> {
  try {
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      throw new Error("No file provided");
    }

    const timestamp = new Date().getTime();
    const file_name = `messages/${randomUUID()}_${timestamp}.${file.name.split('.').pop()}`;

    const imageBuffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(file_name, imageBuffer, {
        contentType: file.type,
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

    return urlData.publicUrl;
  } catch (error: any) {
    console.error("Error uploading message image:", error);
    return null;
  }
}
