import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IConnectionBase {
  senderId: string;
  senderName: string;
  senderImage: string;
  receiverId: string;
  receiverName: string;
  receiverImage: string;
  status: "pending" | "accepted" | "rejected";
}

interface IConnectionMethods {
  acceptConnection(): Promise<void>;
  rejectConnection(): Promise<void>;
}

export interface IConnection
  extends IConnectionBase,
    Document,
    IConnectionMethods {
  createdAt: Date;
  updatedAt: Date;
}

interface IConnectionStatics {
  sendConnectionRequest(
    senderId: string,
    senderName: string,
    senderImage: string,
    receiverId: string,
    receiverName: string,
    receiverImage: string
  ): Promise<IConnection>;
  getPendingRequests(userId: string): Promise<IConnection[]>;
  getAcceptedConnections(userId: string): Promise<IConnection[]>;
  getAllConnections(userId: string): Promise<IConnection[]>;
}

interface IConnectionModel extends Model<IConnection>, IConnectionStatics {}

const ConnectionSchema = new Schema<IConnection>(
  {
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderImage: { type: String, required: true },
    receiverId: { type: String, required: true },
    receiverName: { type: String, required: true },
    receiverImage: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

ConnectionSchema.methods.acceptConnection = async function () {
  try {
    this.status = "accepted";
    await this.save();
  } catch (error) {
    console.log("error when accepting connection", error);
  }
};

ConnectionSchema.methods.rejectConnection = async function () {
  try {
    this.status = "rejected";
    await this.save();
  } catch (error) {
    console.log("error when rejecting connection", error);
  }
};

ConnectionSchema.statics.sendConnectionRequest = async function (
  senderId: string,
  senderName: string,
  senderImage: string,
  receiverId: string,
  receiverName: string,
  receiverImage: string
) {
  try {
    const existingConnection = await this.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existingConnection) {
      throw new Error("Connection request already exists");
    }

    const connection = await this.create({
      senderId,
      senderName,
      senderImage,
      receiverId,
      receiverName,
      receiverImage,
      status: "pending",
    });

    return connection;
  } catch (error) {
    console.log("error when sending connection request", error);
    throw error;
  }
};

ConnectionSchema.statics.getPendingRequests = async function (userId: string) {
  try {
    const requests = await this.find({
      receiverId: userId,
      status: "pending",
    }).sort({ createdAt: -1 });
    return requests;
  } catch (error) {
    console.log("error when getting pending requests", error);
    return [];
  }
};

ConnectionSchema.statics.getAcceptedConnections = async function (
  userId: string
) {
  try {
    const connections = await this.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: "accepted",
    }).sort({ createdAt: -1 });
    return connections;
  } catch (error) {
    console.log("error when getting accepted connections", error);
    return [];
  }
};

ConnectionSchema.statics.getAllConnections = async function (userId: string) {
  try {
    const connections = await this.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });
    return connections;
  } catch (error) {
    console.log("error when getting all connections", error);
    return [];
  }
};

export const Connection =
  (models.Connection as IConnectionModel) ||
  mongoose.model<IConnection, IConnectionModel>(
    "Connection",
    ConnectionSchema
  );
