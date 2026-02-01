import { currentUser } from "@clerk/nextjs/server";
import { getPendingConnectionRequests, getAcceptedConnections } from "@/actions/connectionActions";
import ConnectionRequest from "@/components/ConnectionRequest";
import { redirect } from "next/navigation";

export default async function MyNetworkPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const pendingRequests = await getPendingConnectionRequests(user.id);
  const connections = await getAcceptedConnections(user.id);

  return (
    <div className="max-w-6xl mx-auto p-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-4">
            <h2 className="font-semibold text-lg mb-4">Manage my network</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <span className="text-sm">Connections</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {connections.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <span className="text-sm">Following & followers</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <span className="text-sm">Groups</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <span className="text-sm">Events</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <span className="text-sm">Pages</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <span className="text-sm">Newsletters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Pending Invitations */}
          {pendingRequests.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">
                  Invitations ({pendingRequests.length})
                </h2>
                <button className="text-sm text-gray-600 dark:text-gray-400 hover:underline">
                  Show all
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingRequests.map((request: any) => (
                  <ConnectionRequest key={request._id} request={request} />
                ))}
              </div>
            </div>
          )}

          {/* Suggested Connections */}
          <div>
            <h2 className="font-semibold text-lg mb-4">People you may know</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-4 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No suggestions at the moment
              </p>
            </div>
          </div>

          {/* My Connections */}
          {connections.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold text-lg mb-4">
                My Connections ({connections.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((conn: any) => {
                  const isReceiver = conn.receiverId === user.id;
                  const connectionUser = isReceiver
                    ? {
                        name: conn.senderName,
                        image: conn.senderImage,
                        id: conn.senderId,
                      }
                    : {
                        name: conn.receiverName,
                        image: conn.receiverImage,
                        id: conn.receiverId,
                      };

                  return (
                    <div
                      key={conn._id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={connectionUser.image}
                          alt={connectionUser.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">
                            {connectionUser.name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Connected
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
