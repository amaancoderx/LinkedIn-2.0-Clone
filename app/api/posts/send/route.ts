import connectDB from "@/mongodb/db";
import { Message } from "@/mongodb/models/message";
import { Post } from "@/mongodb/models/post";
import { Connection } from "@/mongodb/models/connection";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectDB();

  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId, recipientIds, senderName } = await request.json();

    if (!postId || !recipientIds || recipientIds.length === 0) {
      return NextResponse.json(
        { error: "Post ID and recipients are required" },
        { status: 400 }
      );
    }

    // Verify the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get post URL
    const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/post/${postId}`;

    // Create a message for each recipient
    const messagePromises = recipientIds.map(async (recipientId: string) => {
      // Get recipient details from connections
      const connection = await Connection.findOne({
        $or: [
          { senderId: user.id, receiverId: recipientId },
          { senderId: recipientId, receiverId: user.id },
        ],
        status: "accepted",
      });

      if (!connection) {
        console.log(`No connection found for recipient: ${recipientId}`);
        return null;
      }

      // Determine recipient details
      const isCurrentUserSender = connection.senderId === user.id;
      const receiverName = isCurrentUserSender
        ? connection.receiverName
        : connection.senderName;
      const receiverImage = isCurrentUserSender
        ? connection.receiverImage
        : connection.senderImage;

      // Create message with post link
      const message = await Message.create({
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        senderImage: user.imageUrl,
        receiverId: recipientId,
        receiverName: receiverName,
        receiverImage: receiverImage,
        content: `${senderName} shared a post with you: ${postUrl}`,
        read: false,
      });

      return message;
    });

    const results = await Promise.allSettled(messagePromises);
    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value !== null
    ).length;

    return NextResponse.json({
      message: `Post sent to ${successCount} ${
        successCount === 1 ? "person" : "people"
      }`,
      successCount,
    });
  } catch (error) {
    console.error("Error sending post:", error);
    return NextResponse.json(
      { error: "An error occurred while sending the post" },
      { status: 500 }
    );
  }
}
