import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface INotificationBase {
  userId: string; // The user who will receive this notification
  actorId: string; // The user who performed the action
  actorName: string;
  actorImage: string;
  type:
    | "like"
    | "comment"
    | "connection_request"
    | "connection_accepted"
    | "message"
    | "profile_view";
  postId?: string;
  message?: string;
  read: boolean;
}

interface INotificationMethods {
  markAsRead(): Promise<void>;
}

export interface INotification
  extends INotificationBase,
    Document,
    INotificationMethods {
  createdAt: Date;
  updatedAt: Date;
}

interface INotificationStatics {
  getUserNotifications(userId: string): Promise<INotification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<void>;
}

interface INotificationModel
  extends Model<INotification>,
    INotificationStatics {}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true },
    actorId: { type: String, required: true },
    actorName: { type: String, required: true },
    actorImage: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "like",
        "comment",
        "connection_request",
        "connection_accepted",
        "message",
        "profile_view",
      ],
      required: true,
    },
    postId: { type: String },
    message: { type: String },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.methods.markAsRead = async function () {
  try {
    this.read = true;
    await this.save();
  } catch (error) {
    console.log("error when marking notification as read", error);
  }
};

NotificationSchema.statics.getUserNotifications = async function (
  userId: string
) {
  try {
    const notifications = await this.find({ userId }).sort({ createdAt: -1 });
    return notifications;
  } catch (error) {
    console.log("error when getting user notifications", error);
    return [];
  }
};

NotificationSchema.statics.getUnreadCount = async function (userId: string) {
  try {
    const count = await this.countDocuments({ userId, read: false });
    return count;
  } catch (error) {
    console.log("error when getting unread count", error);
    return 0;
  }
};

NotificationSchema.statics.markAllAsRead = async function (userId: string) {
  try {
    await this.updateMany({ userId, read: false }, { read: true });
  } catch (error) {
    console.log("error when marking all as read", error);
  }
};

export const Notification =
  (models.Notification as INotificationModel) ||
  mongoose.model<INotification, INotificationModel>(
    "Notification",
    NotificationSchema
  );
