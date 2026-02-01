"use client";

import { X } from "lucide-react";

interface LikesModalProps {
  likes: string[];
  onClose: () => void;
}

export default function LikesModal({ likes, onClose }: LikesModalProps) {
  if (likes.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">Reactions</h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Likes Count */}
        <div className="px-4 py-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {likes.length} {likes.length === 1 ? "person" : "people"} liked this
          </p>
        </div>
      </div>
    </div>
  );
}
