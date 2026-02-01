import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IMessageBase {
  senderId: string;
  senderName: string;
  senderImage: string;
  receiverId: string;
  receiverName: string;
  receiverImage: string;
  content: string;
  read: boolean;
  imageUrl?: string;
}

interface IMessageMethods {
  markAsRead(): Promise<void>;
}

export interface IMessage extends IMessageBase, Document, IMessageMethods {
  createdAt: Date;
  updatedAt: Date;
}

interface IMessageStatics {
  getConversation(
    userId1: string,
    userId2: string
  ): Promise<IMessage[]>;
  getUserConversations(userId: string): Promise<any[]>;
  getUnreadCount(userId: string): Promise<number>;
}

interface IMessageModel extends Model<IMessage>, IMessageStatics {}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderImage: { type: String, required: true },
    receiverId: { type: String, required: true },
    receiverName: { type: String, required: true },
    receiverImage: { type: String, required: true },
    content: { type: String, default: "" },
    read: { type: Boolean, default: false },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

MessageSchema.methods.markAsRead = async function () {
  try {
    this.read = true;
    await this.save();
  } catch (error) {
    console.log("error when marking message as read", error);
  }
};

MessageSchema.statics.getConversation = async function (
  userId1: string,
  userId2: string
) {
  try {
    const messages = await this.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    }).sort({ createdAt: 1 });
    return messages;
  } catch (error) {
    console.log("error when getting conversation", error);
    return [];
  }
};

MessageSchema.statics.getUserConversations = async function (userId: string) {
  try {
    // Get all unique conversations for the user
    const messages = await this.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    // Group by conversation and get the latest message for each
    const conversationsMap = new Map();

    for (const message of messages) {
      const otherId =
        message.senderId === userId ? message.receiverId : message.senderId;

      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          userId: otherId,
          userName:
            message.senderId === userId
              ? message.receiverName
              : message.senderName,
          userImage:
            message.senderId === userId
              ? message.receiverImage
              : message.senderImage,
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unread: message.receiverId === userId && !message.read,
        });
      }
    }

    return Array.from(conversationsMap.values());
  } catch (error) {
    console.log("error when getting user conversations", error);
    return [];
  }
};

MessageSchema.statics.getUnreadCount = async function (userId: string) {
  try {
    const count = await this.countDocuments({
      receiverId: userId,
      read: false,
    });
    return count;
  } catch (error) {
    console.log("error when getting unread count", error);
    return 0;
  }
};

export const Message =
  (models.Message as IMessageModel) ||
  mongoose.model<IMessage, IMessageModel>("Message", MessageSchema);
