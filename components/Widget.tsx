import { InfoIcon } from "lucide-react";

interface NewsItem {
  title: string;
  timeAgo: string;
  readers: string;
}

function Widget() {
  const newsItems: NewsItem[] = [
    {
      title: "Tech layoffs continue in 2026",
      timeAgo: "2h ago",
      readers: "12,458 readers",
    },
    {
      title: "AI adoption surges across industries",
      timeAgo: "4h ago",
      readers: "8,932 readers",
    },
    {
      title: "Remote work policies evolve",
      timeAgo: "6h ago",
      readers: "15,234 readers",
    },
    {
      title: "Startup funding reaches new high",
      timeAgo: "8h ago",
      readers: "6,721 readers",
    },
    {
      title: "Cybersecurity threats on the rise",
      timeAgo: "10h ago",
      readers: "9,845 readers",
    },
  ];

  return (
    <div className="ml-6 sticky top-20">
      {/* LinkedIn News Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-3 flex items-center justify-between border-b border-gray-300 dark:border-gray-700">
          <h2 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100">
            LinkedIn News
          </h2>
          <InfoIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>

        {/* Top Stories */}
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">
            Top stories
          </h3>
          <div className="space-y-3">
            {newsItems.map((item, index) => (
              <div
                key={index}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -mx-3 px-3 py-1 rounded"
              >
                <div className="flex items-start">
                  <span className="text-gray-700 dark:text-gray-300 mr-2 mt-1">
                    •
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {item.timeAgo} • {item.readers}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700" />

        {/* Today's Puzzles */}
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Today's puzzles
          </h3>
          <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -mx-3 px-3 py-2 rounded">
            <div className="flex items-start">
              <span className="text-gray-700 dark:text-gray-300 mr-2 mt-1">
                •
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  Queens
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Crown each region
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700" />

        {/* Show More */}
        <button className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Show more →
          </span>
        </button>
      </div>

      {/* Advertisement */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
        <div className="p-4 text-center">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            See who's hiring on LinkedIn
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Discover opportunities from companies actively recruiting
          </p>
          <button className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Widget;
