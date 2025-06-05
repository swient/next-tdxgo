import Link from "next/link";
import Image from "next/image";

const transportList = [
  {
    key: "bus",
    name: "公車",
    desc: "全台公路客運與市區公車車輛資訊",
    icon: "/icons/bus.svg",
    href: "/bus",
    available: true,
  },
  {
    key: "bike",
    name: "自行車",
    desc: "全台公共自行車車位及車輛資訊",
    icon: "/icons/youbike.svg",
    href: "/bike",
    available: true,
  },
  {
    key: "train",
    name: "火車",
    desc: "全台火車動態與車輛資訊",
    icon: "/icons/train.svg",
    href: "train",
    available: true,
  },
  {
    key: "hsr",
    name: "高鐵",
    desc: "台灣高鐵動態與車輛資訊（即將推出）",
    icon: "/icons/hsr.png",
    href: "#",
    available: false,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-start p-6 sm:p-12">
      <header className="flex flex-col items-center gap-2 mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/icons/TDXGo.png"
            alt="TDXGo Logo"
            width={50}
            height={50}
          />
          <h1 className="text-4xl font-bold tracking-tight">
            台灣運輸資訊平台
          </h1>
        </div>
        <p className="text-base text-gray-500 dark:text-gray-400">
          請選擇運輸工具
        </p>
      </header>
      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {transportList.map((item) => (
            <div
              key={item.key}
              className={`rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181818] flex flex-col items-center p-6 gap-4 transition hover:scale-105 ${
                item.available
                  ? "opacity-100"
                  : "opacity-60 pointer-events-none"
              }`}
            >
              <div className="w-16 h-16 flex items-center justify-center mb-2">
                <Image
                  src={item.icon}
                  alt={item.name + " icon"}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {item.desc}
              </p>
              {item.available ? (
                <Link
                  href={item.href}
                  className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  進入
                </Link>
              ) : (
                <span className="mt-2 px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-medium cursor-not-allowed">
                  敬請期待
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
      {/* Footer 區塊 */}
      <footer className="w-full mt-12 py-8 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <a
            href="mailto:contact@tdxgo.tw"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
          >
            聯絡我們
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
          >
            Facebook
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 hover:text-pink-500 transition"
          >
            Instagram
          </a>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-600">
          © 2025 TDXGo. 保留所有權利。
        </div>
      </footer>
    </div>
  );
}
