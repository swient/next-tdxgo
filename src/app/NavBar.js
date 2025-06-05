import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-[#181818]/80 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50 backdrop-blur">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="px-4 py-2 rounded bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition"
        >
          首頁
        </Link>
      </div>
      <div className="flex gap-4">
        <Link
          href="/bus"
          className="hover:underline font-medium text-gray-700 dark:text-gray-200"
        >
          公車
        </Link>
        <Link
          href="/bike"
          className="hover:underline font-medium text-gray-700 dark:text-gray-200"
        >
          自行車
        </Link>
        <Link
          href="/train"
          className="hover:underline font-medium text-gray-700 dark:text-gray-200"
        >
          火車
        </Link>
        <span className="pointer-events-none opacity-60 font-medium text-gray-400 dark:text-gray-500">
          高鐵
        </span>
      </div>
    </nav>
  );
}
