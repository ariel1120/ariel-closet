import os
import re
import glob

assets_dir = r'c:\Users\ariel\Desktop\clothes-catalog\assets'
os.chdir(assets_dir)

# 1. 找出所有現存圖片的最高編號
existing_files = glob.glob('*.jpg')
highest_id = 0
for filename in existing_files:
    match = re.match(r'(\d{4})\.jpg', filename)
    if match:
        num = int(match.group(1))
        highest_id = max(highest_id, num)

print(f"目前最高編號：{highest_id:04d}.jpg")

# 2. 找出所有未改名的 LINE_ALBUM 圖片
line_files = [f for f in os.listdir('.') if f.startswith('LINE_ALBUM_closets_260710_') and f.endswith('.jpg')]

if not line_files:
    print("沒有找到需要改名的圖片")
else:
    print(f"找到 {len(line_files)} 個需要改名的圖片")
    
    # 按照原始編號排序
    line_files.sort(key=lambda x: int(re.search(r'_(\d+)\.jpg$', x).group(1)))
    
    # 3. 從最高編號之後開始編號
    new_id = highest_id + 1
    
    for filename in line_files:
        new_name = f'{new_id:04d}.jpg'
        print(f'改名: {filename} → {new_name}')
        os.rename(filename, new_name)
        new_id += 1
    
    print(f"完成！新增了 {len(line_files)} 個圖片（{highest_id+1:04d}.jpg ~ {new_id-1:04d}.jpg）")
