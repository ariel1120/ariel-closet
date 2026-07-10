import json

# 讀取 data.json
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 移除所有 image 欄位
for item in data:
    if 'image' in item:
        del item['image']

# 寫回 data.json
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

print(f"成功移除了 {len(data)} 件商品的 image 欄位")
