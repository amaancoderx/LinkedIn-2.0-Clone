import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import {
  Briefcase,
  HomeIcon,
  MessagesSquare,
  SearchIcon,
  UsersIcon,
  BellIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Notification } from "@/mongodb/models/notification";
import { Message } from "@/mongodb/models/message";
import connectDB from "@/mongodb/db";

async function Header() {
  const user = await currentUser();
  let notificationCount = 0;
  let messageCount = 0;

  if (user) {
    await connectDB();
    notificationCount = await Notification.getUnreadCount(user.id);
    messageCount = await Message.getUnreadCount(user.id);
  }

  return (
    <div className="flex items-center px-4 py-1 max-w-7xl mx-auto border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-50">
      {/* Logo and Search grouped together */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image
            className="rounded-lg"
            src="https://links.papareact.com/b3z"
            width={34}
            height={34}
            alt="logo"
          />
        </Link>

        {/* Search */}
        <div className="w-64">
          <form className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">
            <SearchIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent flex-1 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
            />
          </form>
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex items-center space-x-1 ml-auto">
        <Link href="/" className="icon">
          <HomeIcon className="h-6 w-6" strokeWidth={1.5} />
          <p>Home</p>
        </Link>

        <Link href="/my-network" className="icon hidden md:flex">
          <UsersIcon className="h-6 w-6" strokeWidth={1.5} />
          <p>My Network</p>
        </Link>

        <Link href="/jobs" className="icon hidden md:flex">
          <Briefcase className="h-6 w-6" strokeWidth={1.5} />
          <p>Jobs</p>
        </Link>

        <Link href="/messaging" className="icon">
          <div className="relative">
            <MessagesSquare className="h-6 w-6" strokeWidth={1.5} />
            {messageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center border border-white dark:border-gray-800">
                {messageCount > 9 ? "9+" : messageCount}
              </span>
            )}
          </div>
          <p>Messaging</p>
        </Link>

        <Link href="/notifications" className="icon">
          <div className="relative">
            <BellIcon className="h-6 w-6" strokeWidth={1.5} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center border border-white dark:border-gray-800">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </div>
          <p>Notifications</p>
        </Link>

        <SignedIn>
          <div className="icon">
            <UserButton />
            <p>Me</p>
          </div>
        </SignedIn>

        <SignedOut>
          <Button asChild variant="secondary" size="sm">
            <SignInButton />
          </Button>
        </SignedOut>
      </div>
    </div>
  );
}

export default Header;
