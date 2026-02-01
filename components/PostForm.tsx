"use client";

import createPostAction from "@/actions/createPostAction";
import { useUser } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ImageIcon, XIcon, Video, Smile } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

function PostForm() {
  const ref = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user, isSignedIn, isLoaded } = useUser();

  const handlePostAction = async (formData: FormData): Promise<void> => {
    const formDataCopy = formData;
    ref.current?.reset();

    const text = formDataCopy.get("postInput") as string;

    if (!text) {
      throw new Error("You must provide a post input");
    }

    setPreview(null);
    setVideoPreview(null);
    setMediaType(null);
    setShowEmojiPicker(false);

    try {
      await createPostAction(formDataCopy);
    } catch (error) {
      console.error(`Error creating post: ${error}`);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setVideoPreview(null);
      setMediaType("image");
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
      setPreview(null);
      setMediaType("video");
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    if (textInputRef.current) {
      const currentValue = textInputRef.current.value;
      textInputRef.current.value = currentValue + emojiData.emoji;
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className="mb-2">
      <form
        ref={ref}
        action={(formData) => {
          const promise = handlePostAction(formData);
          toast.promise(promise, {
            loading: "Creating post...",
            success: "Post created!",
            error: (e) => "Error creating post: " + e.message,
          });
        }}
        className="p-3 bg-white rounded-lg border"
      >
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 relative">
            <input
              ref={textInputRef}
              type="text"
              name="postInput"
              placeholder="Start writing a post..."
              className="w-full outline-none rounded-full py-3 px-4 border"
            />
          </div>

          {/* Emoji Picker Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-600 dark:text-gray-400"
          >
            <Smile className="h-5 w-5" />
          </Button>

          {/* add input file selector for images only */}
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />

          {/* add input file selector for videos only */}
          <input
            ref={videoInputRef}
            type="file"
            name="video"
            accept="video/*"
            hidden
            onChange={handleVideoChange}
          />

          <button type="submit" hidden>
            Post
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute z-50 mt-2">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Preview" className="w-full object-cover" />
          </div>
        )}

        {videoPreview && (
          <div className="mt-2">
            <video
              src={videoPreview}
              controls
              className="w-full object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex justify-end mt-2 space-x-2">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant={preview ? "secondary" : "outline"}
          >
            <ImageIcon className="mr-2" size={16} color="currentColor" />
            {preview ? "Change" : "Add"} image
          </Button>

          <Button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            variant={videoPreview ? "secondary" : "outline"}
          >
            <Video className="mr-2" size={16} color="currentColor" />
            {videoPreview ? "Change" : "Add"} video
          </Button>

          {(preview || videoPreview) && (
            <Button
              type="button"
              onClick={() => {
                setPreview(null);
                setVideoPreview(null);
                setMediaType(null);
              }}
              variant="outline"
            >
              <XIcon className="mr-2" size={16} color="currentColor" />
              Remove {mediaType}
            </Button>
          )}

          <Button type="submit" variant="default">
            Post
          </Button>
        </div>
      </form>

      <hr className="mt-2 border-gray-300" />
    </div>
  );
}

export default PostForm;
