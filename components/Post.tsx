"use client";

import { Trash2, Repeat2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { IPostDocument } from "@/mongodb/models/post";
import PostOptions from "./PostOptions";
import Image from "next/image";
import deletePostAction from "@/actions/deletePostAction";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import ReactTimeago from "react-timeago";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import ConnectButton from "./ConnectButton";

function Post({ post }: { post: IPostDocument }) {
  const { user } = useUser();

  const isAuthor = user?.id === post.user.userId;

  // Debug logging
  console.log("Post component rendering:", {
    postId: post._id,
    hasImageUrl: !!post.imageUrl,
    hasImageUrls: !!post.imageUrls,
    imageUrlsLength: post.imageUrls?.length || 0,
    imageUrls: post.imageUrls,
    isRepost: post.isRepost,
    hasOriginalPost: !!post.originalPost,
    originalPostId: post.originalPost?._id,
    originalPostText: post.originalPost?.text,
  });

  return (
    <div className="bg-white rounded-md border">
      {/* Repost indicator */}
      {post.isRepost && (
        <div className="px-4 pt-3 flex items-center text-xs text-gray-500">
          <Repeat2 className="h-3 w-3 mr-1" />
          <span>
            {post.user.firstName} {post.user.lastName} reposted this
          </span>
        </div>
      )}
      <div className="p-4 flex space-x-2">
        <div>
          <Avatar>
            <AvatarImage src={post.user.userImage} />
            <AvatarFallback>
              {post.user.firstName?.charAt(0)}
              {post.user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex justify-between flex-1">
          <div>
            <p className="font-semibold">
              {post.user.firstName} {post.user.lastName}{" "}
              {isAuthor && (
                <Badge className="ml-2" variant="secondary">
                  Author
                </Badge>
              )}
            </p>
            <p className="text-xs text-gray-400">
              @{post.user.firstName}
              {post.user.firstName}-{post.user.userId.toString().slice(-4)}
            </p>

            <p className="text-xs text-gray-400" suppressHydrationWarning>
              <ReactTimeago date={new Date(post.createdAt)} />
            </p>
          </div>

          <div className="flex items-start gap-2">
            {!isAuthor && user && (
              <ConnectButton
                currentUserId={user.id}
                currentUserName={`${user.firstName} ${user.lastName}`}
                currentUserImage={user.imageUrl}
                targetUserId={post.user.userId}
                targetUserName={`${post.user.firstName} ${post.user.lastName}`}
                targetUserImage={post.user.userImage}
                variant="outline"
                size="sm"
              />
            )}
            {isAuthor && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const promise = deletePostAction(String(post._id));
                  toast.promise(promise, {
                    loading: "Deleting post...",
                    success: "Post deleted!",
                    error: "Error deleting post",
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="">
        <p className="px-4 pb-2 mt-2">{post.text}</p>

        {/* Display original post if this is a repost with thoughts */}
        {post.isRepost && post.originalPost && (
          <div className="mx-4 mb-2 border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start space-x-3 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.originalPost.user.userImage} />
                <AvatarFallback>
                  {post.originalPost.user.firstName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">
                  {post.originalPost.user.firstName}{" "}
                  {post.originalPost.user.lastName}
                </p>
                <p className="text-xs text-gray-500" suppressHydrationWarning>
                  {new Date(post.originalPost.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              {post.originalPost.text}
            </p>
            {post.originalPost.imageUrl && (
              <img
                src={post.originalPost.imageUrl}
                alt="Original post"
                className="w-full rounded-lg"
              />
            )}
            {post.originalPost.videoUrl && (
              <video
                src={post.originalPost.videoUrl}
                controls
                className="w-full rounded-lg"
              />
            )}
          </div>
        )}

        {/* Display multiple images if available */}
        {post.imageUrls && post.imageUrls.length > 0 ? (
          <div className={`grid gap-1 ${post.imageUrls.length === 1 ? "grid-cols-1" : post.imageUrls.length === 2 ? "grid-cols-2" : post.imageUrls.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {post.imageUrls.map((url, index) => (
              <Image
                key={index}
                src={url}
                alt={`Post Image ${index + 1}`}
                width={500}
                height={500}
                className="w-full object-cover"
              />
            ))}
          </div>
        ) : post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt="Post Image"
            width={500}
            height={500}
            className="w-full mx-auto"
          />
        ) : null}

        {/* Display multiple videos if available */}
        {post.videoUrls && post.videoUrls.length > 0 ? (
          <div className={`grid gap-1 ${post.videoUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {post.videoUrls.map((url, index) => (
              <video
                key={index}
                src={url}
                controls
                className="w-full"
                preload="metadata"
              />
            ))}
          </div>
        ) : post.videoUrl ? (
          <video
            src={post.videoUrl}
            controls
            className="w-full mx-auto"
            preload="metadata"
          />
        ) : null}
      </div>

      <PostOptions postId={String(post._id)} post={post} />
    </div>
  );
}

export default Post;
