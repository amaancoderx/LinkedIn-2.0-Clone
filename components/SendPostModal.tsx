"use client";

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { IConnection } from "@/mongodb/models/connection";

interface SendPostModalProps {
  postId: string;
  postText: string;
  onClose: () => void;
}

interface ConnectionUser {
  userId: string;
  name: string;
  image: string;
  title?: string;
}

export default function SendPostModal({
  postId,
  postText,
  onClose,
}: SendPostModalProps) {
  const { user } = useUser();
  const [connections, setConnections] = useState<ConnectionUser[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<
    ConnectionUser[]
  >([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConnections(connections);
    } else {
      const filtered = connections.filter((conn) =>
        conn.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConnections(filtered);
    }
  }, [searchQuery, connections]);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections/accepted");
      if (!response.ok) throw new Error("Failed to fetch connections");

      const data: IConnection[] = await response.json();

      // Transform connections to ConnectionUser format
      const users: ConnectionUser[] = data.map((conn) => {
        // If current user is the sender, return receiver info, otherwise return sender info
        const isCurrentUserSender = conn.senderId === user?.id;
        return {
          userId: isCurrentUserSender ? conn.receiverId : conn.senderId,
          name: isCurrentUserSender ? conn.receiverName : conn.senderName,
          image: isCurrentUserSender ? conn.receiverImage : conn.senderImage,
        };
      });

      setConnections(users);
      setFilteredConnections(users);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSend = async () => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one connection");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/posts/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          recipientIds: Array.from(selectedUsers),
          senderName: `${user?.firstName} ${user?.lastName}`,
        }),
      });

      if (!response.ok) throw new Error("Failed to send post");

      toast.success(
        `Post sent to ${selectedUsers.size} ${
          selectedUsers.size === 1 ? "person" : "people"
        }`
      );
      onClose();
    } catch (error) {
      console.error("Error sending post:", error);
      toast.error("Failed to send post");
    } finally {
      setSending(false);
    }
  };

  const copyLinkToPost = () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            Send {user?.firstName}&apos;s Post
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Box */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Type a name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Connections List */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading connections...
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? "No connections found"
                : "You don't have any connections yet"}
            </div>
          ) : (
            filteredConnections.map((connection) => (
              <div
                key={connection.userId}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => toggleUserSelection(connection.userId)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={connection.image} />
                    <AvatarFallback>
                      {connection.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{connection.name}</p>
                    {connection.title && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {connection.title}
                      </p>
                    )}
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={selectedUsers.has(connection.userId)}
                  onChange={() => toggleUserSelection(connection.userId)}
                  className="h-5 w-5 cursor-pointer"
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={copyLinkToPost}
            className="text-blue-600 hover:underline text-sm mb-3 flex items-center"
          >
            <span className="mr-2">🔗</span>
            Copy link to post
          </button>

          <Button
            onClick={handleSend}
            disabled={selectedUsers.size === 0 || sending}
            className="w-full"
          >
            {sending
              ? "Sending..."
              : selectedUsers.size === 0
              ? "Send"
              : `Send (${selectedUsers.size})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
