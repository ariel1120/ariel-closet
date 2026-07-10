import os
import re

assets_dir = r'c:\Users\ariel\Desktop\clothes-catalog\assets'
os.chdir(assets_dir)

# 獲取所有 LINE_ALBUM 格式的圖片
files = [f for f in os.listdir('.') if f.startswith('LINE_ALBUM_closets_260710_') and f.endswith('.jpg')]
files.sort(key=lambda x: int(re.search(r'_(\d+)\.jpg$', x).group(1)))

print(f"找到 {len(files)} 個需要重新命名的圖片")

# 重新命名
for filename in files:
    match = re.search(r'LINE_ALBUM_closets_260710_(\d+)\.jpg', filename)
    if match:
        old_number = int(match.group(1))
        new_id = 124 - old_number
        new_name = f'{new_id:04d}.jpg'
        print(f'改名: {filename} → {new_name}')
        os.rename(filename, new_name)

print("完成！")
