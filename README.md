# 我的衣櫃電商頁面

這是一個手機優先的衣服收藏與購物慾望整理頁面，適合用來記錄你所有的衣服種類、照片與想買清單。

## 特色
- 手機版介面
- 可搜尋與分類
- 可將喜歡的衣服加入「想買清單」
- 直接部署到 GitHub Pages

## 使用方式
1. 把你整理好的衣服資料填入 data.json。
2. 把衣服照片放到 assets/ 資料夾，並用連號命名，例如 `0001.jpg`, `0002.jpg`, `0003.jpg`。
   - 如果你的 `data.json` 內每件商品都使用 `id`，網頁會自動讀取 `./assets/0001.jpg`、`./assets/0002.jpg`。
   - 也可以同時保留 `image` 欄位指定特殊圖片網址。
3. 在 GitHub 建立名為 ariel1120.github.io 的 Repository。
4. 把這個資料夾內容推到 main 分支。
5. 到 Repository 的 Settings → Pages，選擇 Deploy from a branch，Branch 選 main / root。
6. 網站會在 https://ariel1120.github.io/ 開啟。

## 本地預覽
在這個資料夾執行：

```bash
python -m http.server 8000
```

然後打開 http://127.0.0.1:8000/
