"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface NotificationItemProps {
  notification: {
    _id: string;
    actorName: string;
    actorImage: string;
    type: string;
    message?: string;
    createdAt: Date;
    read: boolean;
  };
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "👍";
      case "comment":
        return "💬";
      case "connection_request":
        return "🤝";
      case "connection_accepted":
        return "✅";
      case "message":
        return "✉️";
      case "profile_view":
        return "👁️";
      default:
        return "🔔";
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
        !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <Avatar>
          <AvatarImage src={notification.actorImage} />
          <AvatarFallback>
            {notification.actorName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="text-sm">
            <span className="font-semibold">{notification.actorName}</span>{" "}
            {notification.message}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>

        <span className="text-2xl">
          {getNotificationIcon(notification.type)}
        </span>
      </div>
    </div>
  );
}
