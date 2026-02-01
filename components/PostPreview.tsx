"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { ExternalLink } from "lucide-react";

interface PostData {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    userImage: string;
  };
  text: string;
  imageUrl?: string;
  createdAt: string;
}

interface PostPreviewProps {
  postUrl: string;
}

export default function PostPreview({ postUrl }: PostPreviewProps) {
  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostData();
  }, [postUrl]);

  const fetchPostData = async () => {
    try {
      // Extract post ID from URL
      const urlParts = postUrl.split("/");
      const postId = urlParts[urlParts.length - 1];

      const response = await fetch(`/api/posts/${postId}/preview`);
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      setPostData(data);
    } catch (error) {
      console.error("Error fetching post preview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 my-2 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (!postData) {
    return null;
  }

  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-300 dark:border-gray-600 rounded-lg p-4 my-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={postData.user.userImage} />
            <AvatarFallback>
              {postData.user.firstName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">
              {postData.user.firstName} {postData.user.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(postData.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-500" />
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">
        {postData.text}
      </p>

      {postData.imageUrl && (
        <img
          src={postData.imageUrl}
          alt="Post"
          className="w-full max-h-48 object-cover rounded-lg"
        />
      )}

      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
        View post on LinkedIn Clone
      </p>
    </a>
  );
}
