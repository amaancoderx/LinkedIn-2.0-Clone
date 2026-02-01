"use client";

import { useState, useRef } from "react";
import { X, Repeat2, Edit3 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { IPostDocument } from "@/mongodb/models/post";
import { toast } from "sonner";
import { repostDirectly, repostWithThoughts } from "@/actions/repostActions";

interface RepostModalProps {
  post: IPostDocument;
  onClose: () => void;
}

export default function RepostModal({ post, onClose }: RepostModalProps) {
  const { user } = useUser();
  const [showThoughtsForm, setShowThoughtsForm] = useState(false);
  const [thoughts, setThoughts] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleDirectRepost = async () => {
    if (!user?.id) return;

    setIsSubmitting(true);
    const promise = repostDirectly(post._id.toString(), user.id);

    toast.promise(promise, {
      loading: "Reposting...",
      success: "Reposted successfully!",
      error: "Failed to repost",
    });

    await promise;
    setIsSubmitting(false);
    onClose();
  };

  const handleRepostWithThoughts = async () => {
    if (!user?.id || !thoughts.trim()) return;

    setIsSubmitting(true);
    const promise = repostWithThoughts(
      post._id.toString(),
      user.id,
      `${user.firstName} ${user.lastName}`,
      user.imageUrl,
      thoughts
    );

    toast.promise(promise, {
      loading: "Creating repost...",
      success: "Reposted with your thoughts!",
      error: "Failed to create repost",
    });

    await promise;
    setIsSubmitting(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (showThoughtsForm) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Repost with your thoughts</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start space-x-3 mb-4">
              <Avatar>
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  placeholder="What do you want to say about this?"
                  className="w-full outline-none border rounded-lg p-3 min-h-[100px] resize-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Original Post Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start space-x-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.user.userImage} />
                  <AvatarFallback>
                    {post.user.firstName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {post.user.firstName} {post.user.lastName}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{post.text}</p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="mt-2 w-full rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleRepostWithThoughts}
              disabled={!thoughts.trim() || isSubmitting}
            >
              Repost
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-2">
          <button
            onClick={() => setShowThoughtsForm(true)}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition"
          >
            <Edit3 className="h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">Repost with your thoughts</p>
              <p className="text-xs text-gray-500">
                Create a new post with this post attached
              </p>
            </div>
          </button>

          <button
            onClick={handleDirectRepost}
            disabled={isSubmitting}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition"
          >
            <Repeat2 className="h-5 w-5" />
            <div className="text-left">
              <p className="font-semibold">Repost</p>
              <p className="text-xs text-gray-500">
                Instantly bring this post to others&apos; feeds
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
