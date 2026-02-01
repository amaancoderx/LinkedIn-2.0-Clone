"use server";

import { Connection } from "@/mongodb/models/connection";
import { Notification } from "@/mongodb/models/notification";
import connectDB from "@/mongodb/db";
import { revalidatePath } from "next/cache";

export async function sendConnectionRequest(
  senderId: string,
  senderName: string,
  senderImage: string,
  receiverId: string,
  receiverName: string,
  receiverImage: string
) {
  try {
    await connectDB();

    const connection = await Connection.sendConnectionRequest(
      senderId,
      senderName,
      senderImage,
      receiverId,
      receiverName,
      receiverImage
    );

    // Create notification for receiver
    await Notification.create({
      userId: receiverId,
      actorId: senderId,
      actorName: senderName,
      actorImage: senderImage,
      type: "connection_request",
      message: `${senderName} sent you a connection request`,
      read: false,
    });

    revalidatePath("/my-network");
    return { success: true, connection };
  } catch (error: any) {
    console.error("Error sending connection request:", error);
    return { success: false, error: error.message };
  }
}

export async function acceptConnectionRequest(connectionId: string) {
  try {
    await connectDB();

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    await connection.acceptConnection();

    // Create notification for sender
    await Notification.create({
      userId: connection.senderId,
      actorId: connection.receiverId,
      actorName: connection.receiverName,
      actorImage: connection.receiverImage,
      type: "connection_accepted",
      message: `${connection.receiverName} accepted your connection request`,
      read: false,
    });

    revalidatePath("/my-network");
    return { success: true };
  } catch (error: any) {
    console.error("Error accepting connection:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectConnectionRequest(connectionId: string) {
  try {
    await connectDB();

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    await connection.rejectConnection();

    revalidatePath("/my-network");
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting connection:", error);
    return { success: false, error: error.message };
  }
}

export async function getPendingConnectionRequests(userId: string) {
  try {
    await connectDB();
    const requests = await Connection.getPendingRequests(userId);
    return requests.map((req) => ({
      ...req.toObject(),
      _id: req._id.toString(),
    }));
  } catch (error) {
    console.error("Error getting pending requests:", error);
    return [];
  }
}

export async function getAcceptedConnections(userId: string) {
  try {
    await connectDB();
    const connections = await Connection.getAcceptedConnections(userId);
    return connections.map((conn) => ({
      ...conn.toObject(),
      _id: conn._id.toString(),
    }));
  } catch (error) {
    console.error("Error getting accepted connections:", error);
    return [];
  }
}
