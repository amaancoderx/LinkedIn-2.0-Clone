"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Smile, Paperclip, Image as ImageIcon } from "lucide-react";
import { sendMessage, markConversationAsRead, getConversationMessages, uploadMessageImage } from "@/actions/messageActions";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import PostPreview from "./PostPreview";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface Conversation {
  userId: string;
  userName: string;
  userImage: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: boolean;
}

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderImage: string;
  receiverId: string;
  receiverName: string;
  receiverImage: string;
  content: string;
  read: boolean;
  createdAt: Date;
  imageUrl?: string;
}

interface MessagingUIProps {
  conversations: Conversation[];
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string;
}

export default function MessagingUI({
  conversations,
  currentUserId,
  currentUserName,
  currentUserImage,
}: MessagingUIProps) {
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(conversations[0] || null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      markConversationAsRead(currentUserId, selectedConversation.userId);
    }
  }, [selectedConversation, currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    const msgs = await getConversationMessages(
      currentUserId,
      selectedConversation.userId
    );
    setMessages(msgs);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedFile) || !selectedConversation) return;

    let messageContent = messageInput;
    let uploadedImageUrl: string | null = null;

    // Upload image if selected
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      toast.loading("Uploading image...");

      const formData = new FormData();
      formData.append("file", selectedFile);

      uploadedImageUrl = await uploadMessageImage(formData);

      if (!uploadedImageUrl) {
        toast.error("Failed to upload image");
        return;
      }
      toast.dismiss();
    }

    const promise = sendMessage(
      currentUserId,
      currentUserName,
      currentUserImage,
      selectedConversation.userId,
      selectedConversation.userName,
      selectedConversation.userImage,
      messageContent || "",
      uploadedImageUrl || undefined
    );

    toast.promise(promise, {
      loading: "Sending message...",
      success: "Message sent!",
      error: "Error sending message",
    });

    await promise;
    setMessageInput("");
    clearFile();
    setShowEmojiPicker(false);

    // Fetch messages immediately after sending
    setTimeout(() => fetchMessages(), 500);
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const formatMessageTime = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const extractPostUrl = (content: string): string | null => {
    const postUrlRegex = /https?:\/\/[^\s]+\/post\/[a-zA-Z0-9]+/;
    const match = content.match(postUrlRegex);
    return match ? match[0] : null;
  };

  return (
    <div className="flex h-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-300 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Messaging</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.userId}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 ${
                  selectedConversation?.userId === conv.userId
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={conv.userImage} />
                    <AvatarFallback>{conv.userName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {conv.userName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={selectedConversation.userImage} />
                <AvatarFallback>
                  {selectedConversation.userName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.userName}
                </h3>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400">
                  <p>Start a conversation with {selectedConversation.userName}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isCurrentUser = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-end space-x-2 max-w-[70%] ${
                            isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.senderImage} />
                            <AvatarFallback>
                              {msg.senderName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            {(() => {
                              const postUrl = extractPostUrl(msg.content);

                              return (
                                <>
                                  <div
                                    className={`rounded-2xl px-4 py-2 ${
                                      isCurrentUser
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    }`}
                                  >
                                    {/* Display image if present */}
                                    {msg.imageUrl && (
                                      <img
                                        src={msg.imageUrl}
                                        alt="Message attachment"
                                        className="max-w-xs max-h-64 rounded-lg mb-2 cursor-pointer hover:opacity-90"
                                        onClick={() => window.open(msg.imageUrl, "_blank")}
                                      />
                                    )}
                                    {/* Display message content if not a post URL */}
                                    {msg.content && !postUrl && (
                                      <p className="text-sm whitespace-pre-wrap break-words">
                                        {msg.content}
                                      </p>
                                    )}
                                    {/* Show text before post URL if present */}
                                    {msg.content && postUrl && (
                                      <p className="text-sm whitespace-pre-wrap break-words">
                                        {msg.content.split(postUrl)[0]}
                                      </p>
                                    )}
                                  </div>

                                  {/* Display post preview if URL detected */}
                                  {postUrl && (
                                    <div className="mt-2 max-w-xs">
                                      <PostPreview postUrl={postUrl} />
                                    </div>
                                  )}

                                  <p
                                    className={`text-xs text-gray-500 mt-1 ${
                                      isCurrentUser ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {formatMessageTime(msg.createdAt)}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* File Preview */}
              {previewUrl && (
                <div className="mb-2 relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-32 rounded-lg"
                  />
                  <button
                    onClick={clearFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}

              <div className="flex space-x-2">
                {/* File Input (Hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />

                {/* Attachment Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                {/* Image Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "image/*";
                      fileInputRef.current.click();
                    }
                  }}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>

                {/* Emoji Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <Smile className="h-5 w-5" />
                </Button>

                {/* Message Input */}
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Write a message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />

                {/* Send Button */}
                <Button onClick={handleSendMessage} className="px-4">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
