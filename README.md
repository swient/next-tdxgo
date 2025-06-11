# next-tdxgo

一個以 Next.js 與 React 打造的台灣交通查詢平台，整合自行車、公車、火車等多種運輸資訊，提供即時查詢與友善介面

## 功能特色

- 自行車站點查詢
- 公車路線、站點與即時動態查詢
- 火車時刻表與站點查詢
- 支援多種交通工具切換
- 現代化 UI，行動裝置友善

## 安裝與啟動

1. 安裝相依套件
   ```bash
   npm install
   ```
2. 設定 TDX API 金鑰  
   前往 [TDX 平台](https://tdx.transportdata.tw/) 申請「CLIENT_ID」與「CLIENT_SECRET」。  
   於專案根目錄建立 `.env.local` 檔案，內容如下：
   ```
   CLIENT_ID=你的_CLIENT_ID
   CLIENT_SECRET=你的_CLIENT_SECRET
   ```
3. 啟動開發伺服器
   ```bash
   npm run dev
   ```
4. 打包正式版
   ```bash
   npm run build
   npm start
   ```

## 目錄結構簡介

- `src/app/bike/`：自行車相關頁面、元件與 API
- `src/app/bus/`：公車相關頁面、元件與 API
- `src/app/train/`：火車相關頁面、元件與 API
- `src/app/NavBar.js`：主導覽列元件
- `src/app/layout.js`：全域佈局
- `public/`：靜態資源與圖示

## 技術棧

- Next.js 15
- React 19
- Tailwind CSS 4
