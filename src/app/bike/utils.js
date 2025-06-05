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

  getReadableError: (error, statusCode) => {
    const baseMessage = "抱歉！";

    if (error.includes("Token")) {
      return `${baseMessage}系統認證發生問題 (錯誤代碼: ${statusCode})，請稍後再試。`;
    }
    if (error.includes("站點資訊")) {
      return `${baseMessage}目前無法取得站點資訊 (錯誤代碼: ${statusCode})，系統將自動重試。`;
    }
    if (error.includes("可用性資訊")) {
      return `${baseMessage}目前無法取得即時車輛資訊 (錯誤代碼: ${statusCode})，系統將自動重試。`;
    }
    return `${baseMessage}發生預期外的錯誤 (錯誤代碼: ${statusCode})，請稍後再試。`;
  },
};
