import connectDB from "@/mongodb/db";
import { Post } from "@/mongodb/models/post";
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

    // Return only necessary data for preview
    const previewData = {
      _id: post._id.toString(),
      user: {
        firstName: post.user.firstName,
        lastName: post.user.lastName,
        userImage: post.user.userImage,
      },
      text: post.text,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
    };

    return NextResponse.json(previewData);
  } catch (error) {
    console.error("Error fetching post preview:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching post preview" },
      { status: 500 }
    );
  }
}
