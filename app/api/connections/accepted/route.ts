import connectDB from "@/mongodb/db";
import { Connection } from "@/mongodb/models/connection";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const connections = await Connection.getAcceptedConnections(user.id);
    return NextResponse.json(connections);
  } catch (error) {
    console.error("Error fetching accepted connections:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching connections" },
      { status: 500 }
    );
  }
}
