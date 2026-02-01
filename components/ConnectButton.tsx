"use client";

import { sendConnectionRequest } from "@/actions/connectionActions";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";

interface ConnectButtonProps {
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string;
  targetUserId: string;
  targetUserName: string;
  targetUserImage: string;
  isConnected?: boolean;
  isPending?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export default function ConnectButton({
  currentUserId,
  currentUserName,
  currentUserImage,
  targetUserId,
  targetUserName,
  targetUserImage,
  isConnected = false,
  isPending = false,
  variant = "outline",
  size = "sm",
}: ConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(
    isConnected ? "connected" : isPending ? "pending" : "not_connected"
  );

  const handleConnect = async () => {
    if (status !== "not_connected") return;

    setLoading(true);
    const promise = sendConnectionRequest(
      currentUserId,
      currentUserName,
      currentUserImage,
      targetUserId,
      targetUserName,
      targetUserImage
    );

    toast.promise(promise, {
      loading: "Sending connection request...",
      success: "Connection request sent!",
      error: "Error sending request",
    });

    const result = await promise;
    if (result.success) {
      setStatus("pending");
    }
    setLoading(false);
  };

  if (status === "connected") {
    return (
      <Button variant={variant} size={size} disabled className="gap-2">
        <UserCheck className="h-4 w-4" />
        Connected
      </Button>
    );
  }

  if (status === "pending") {
    return (
      <Button variant={variant} size={size} disabled>
        Pending
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnect}
      disabled={loading}
      className="gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
    >
      <UserPlus className="h-4 w-4" />
      Connect
    </Button>
  );
}
