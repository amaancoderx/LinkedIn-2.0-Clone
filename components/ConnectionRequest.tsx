"use client";

import { acceptConnectionRequest, rejectConnectionRequest } from "@/actions/connectionActions";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface ConnectionRequestProps {
  request: {
    _id: string;
    senderId: string;
    senderName: string;
    senderImage: string;
  };
}

export default function ConnectionRequest({ request }: ConnectionRequestProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    const promise = acceptConnectionRequest(request._id);

    toast.promise(promise, {
      loading: "Accepting connection...",
      success: "Connection accepted!",
      error: "Error accepting connection",
    });

    await promise;
    setIsProcessing(false);
  };

  const handleIgnore = async () => {
    setIsProcessing(true);
    const promise = rejectConnectionRequest(request._id);

    toast.promise(promise, {
      loading: "Ignoring request...",
      success: "Request ignored",
      error: "Error ignoring request",
    });

    await promise;
    setIsProcessing(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={request.senderImage}
            alt={request.senderName}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{request.senderName}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Wants to connect
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleIgnore}
            variant="outline"
            disabled={isProcessing}
            className="rounded-full"
          >
            Ignore
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="rounded-full bg-blue-600 hover:bg-blue-700"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
