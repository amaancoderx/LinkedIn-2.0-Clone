import { currentUser } from "@clerk/nextjs/server";
import { Notification } from "@/mongodb/models/notification";
import connectDB from "@/mongodb/db";
import { redirect } from "next/navigation";
import NotificationItem from "@/components/NotificationItem";

export default async function NotificationsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await connectDB();
  const notifications = await Notification.getUserNotifications(user.id);

  // Mark all notifications as read when page is viewed
  await Notification.markAllAsRead(user.id);

  const notificationsData = notifications.map((notif) => ({
    ...notif.toObject(),
    _id: notif._id.toString(),
  }));

  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">Notifications</h1>
        </div>

        {notificationsData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No notifications yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notificationsData.map((notification: any) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
