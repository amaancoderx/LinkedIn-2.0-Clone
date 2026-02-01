import { currentUser } from "@clerk/nextjs/server";
import { Message } from "@/mongodb/models/message";
import connectDB from "@/mongodb/db";
import { redirect } from "next/navigation";
import MessagingUI from "@/components/MessagingUI";

export default async function MessagingPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await connectDB();
  const conversations = await Message.getUserConversations(user.id);

  return (
    <div className="h-[calc(100vh-64px)] max-w-6xl mx-auto">
      <MessagingUI
        conversations={conversations}
        currentUserId={user.id}
        currentUserName={`${user.firstName} ${user.lastName}`}
        currentUserImage={user.imageUrl}
      />
    </div>
  );
}
