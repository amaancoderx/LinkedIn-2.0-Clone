import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
import { Notification } from "@/mongodb/models/notification";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  await connectDB();

  try {
    const post = await Post.findById(params.post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const likes = post.likes;
    return NextResponse.json(likes);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching likes" },
      { status: 500 }
    );
  }
}

export interface LikePostRequestBody {
  userId: string;
}

export async function POST(
  request: Request,
  { params }: { params: { post_id: string } }
) {
  await connectDB();

  const { userId }: LikePostRequestBody = await request.json();
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const post = await Post.findById(params.post_id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await post.likePost(user.id);

    // Create notification for post author (if not liking own post)
    if (user && post.user.userId !== user.id) {
      await Notification.create({
        userId: post.user.userId,
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        actorImage: user.imageUrl,
        type: "like",
        postId: params.post_id,
        message: `${user.firstName} ${user.lastName} liked your post`,
        read: false,
      });
    }

    return NextResponse.json({ message: "Post liked successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while liking the post" },
      { status: 500 }
    );
  }
}
