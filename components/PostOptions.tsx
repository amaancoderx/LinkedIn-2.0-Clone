"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Repeat2, Send, ThumbsUpIcon } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentFeed from "./CommentFeed";
import { useUser } from "@clerk/nextjs";
import { LikePostRequestBody } from "@/app/api/posts/[post_id]/like/route";
import { IPostDocument } from "@/mongodb/models/post";
import { cn } from "@/lib/utils";
import { UnlikePostRequestBody } from "@/app/api/posts/[post_id]/unlike/route";
import { Button } from "./ui/button";
import { toast } from "sonner";
import LikesModal from "./LikesModal";
import SendPostModal from "./SendPostModal";
import RepostModal from "./RepostModal";
import { useRouter } from "next/navigation";

function PostOptions({
  postId,
  post,
}: {
  postId: string;
  post: IPostDocument;
}) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const router = useRouter();

  useEffect(() => {
    if (user?.id && post.likes) {
      const hasLiked = post.likes.includes(user.id);
      setLiked(hasLiked);
    }
  }, [post, user]);

  const likeOrUnlikePost = async () => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const originalLiked = liked;
    const originalLikes = likes;

    const newLikes = liked
      ? likes?.filter((like) => like !== user.id)
      : [...(likes ?? []), user.id];

    const body: LikePostRequestBody | UnlikePostRequestBody = {
      userId: user.id,
    };

    setLiked(!liked);
    setLikes(newLikes);

    const response = await fetch(
      `/api/posts/${postId}/${liked ? "unlike" : "like"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...body }),
      }
    );

    if (!response.ok) {
      setLiked(originalLiked);
      setLikes(originalLikes);
      throw new Error("Failed to like post");
    }

    // Fetch updated likes from server to ensure consistency
    const fetchLikesResponse = await fetch(`/api/posts/${postId}/like`);
    if (!fetchLikesResponse.ok) {
      setLikes(originalLikes);
      throw new Error("Failed to fetch likes");
    }

    const newLikesData = await fetchLikesResponse.json();

    setLikes(newLikesData);
  };

  const handleSendMessage = () => {
    setShowSendModal(true);
  };

  return (
    <div className="">
      <div className="flex justify-between p-4">
        <div>
          {likes && likes.length > 0 && (
            <p
              onClick={() => setShowLikesModal(true)}
              className="text-xs text-gray-500 cursor-pointer hover:underline hover:text-blue-600"
            >
              {likes.length} {likes.length === 1 ? "like" : "likes"}
            </p>
          )}
        </div>

        <div>
          {post?.comments && post.comments.length > 0 && (
            <p
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="text-xs text-gray-500 cursor-pointer hover:underline"
            >
              {post.comments.length} comments
            </p>
          )}
        </div>
      </div>

      <div className="flex p-2 justify-between px-2 border-t">
        <Button
          variant="ghost"
          className="postButton"
          onClick={likeOrUnlikePost}
        >
          {/* If user has liked the post, show filled thumbs up icon */}
          <ThumbsUpIcon
            className={cn("mr-1", liked && "text-[#4881c2] fill-[#4881c2]")}
          />
          Like
        </Button>

        <Button
          variant="ghost"
          className="postButton"
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
        >
          <MessageCircle
            className={cn(
              "mr-1",
              isCommentsOpen && "text-gray-600 fill-gray-600"
            )}
          />
          Comment
        </Button>

        <Button
          variant="ghost"
          className="postButton"
          onClick={() => setShowRepostModal(true)}
        >
          <Repeat2 className="mr-1" />
          Repost
        </Button>

        <Button variant="ghost" className="postButton" onClick={handleSendMessage}>
          <Send className="mr-1" />
          Send
        </Button>
      </div>

      {isCommentsOpen && (
        <div className="p-4">
          {user?.id && <CommentForm postId={postId} />}
          <CommentFeed post={post} />
        </div>
      )}

      {showLikesModal && (
        <LikesModal
          likes={likes || []}
          onClose={() => setShowLikesModal(false)}
        />
      )}

      {showSendModal && (
        <SendPostModal
          postId={postId}
          postText={post.text}
          onClose={() => setShowSendModal(false)}
        />
      )}

      {showRepostModal && (
        <RepostModal post={post} onClose={() => setShowRepostModal(false)} />
      )}
    </div>
  );
}

export default PostOptions;
