export const utils = {
  formatUpdateTime: (date) => {
    if (!date) return "尚未更新";
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  },

  getBikeStatusColor: (count) => {
    if (count === undefined) return "bg-gray-100";
    if (count === 0) return "bg-red-100";
    if (count < 5) return "bg-yellow-100";
    return "bg-green-100";
  },
};
