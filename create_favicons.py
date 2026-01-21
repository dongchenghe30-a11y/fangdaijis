"""
Favicon生成脚本
使用Pillow库创建不同尺寸的favicon文件
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 颜色定义
PRIMARY_COLOR = (59, 130, 246)  # #3b82f6 - 蓝色
SECONDARY_COLOR = (37, 99, 235)  # #2563eb - 深蓝色
WHITE = (255, 255, 255, 255)

def create_favicon(size):
    """创建指定尺寸的favicon"""
    # 创建透明背景的图像
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # 简化的房子图标
    scale = size / 512
    
    # 房子主体
    house_x = 50 * scale
    house_y = 200 * scale
    house_width = 412 * scale
    house_height = 280 * scale
    
    draw.rectangle([house_x, house_y, house_x + house_width, house_y + house_height],
                   fill=PRIMARY_COLOR)
    
    # 房顶
    roof_points = [
        (house_x, house_y),
        (size / 2, 50 * scale),
        (house_x + house_width, house_y)
    ]
    draw.polygon(roof_points, fill=SECONDARY_COLOR)
    
    # 门
    door_x = 200 * scale
    door_y = 300 * scale
    door_width = 112 * scale
    door_height = 180 * scale
    draw.rectangle([door_x, door_y, door_x + door_width, door_y + door_height],
                   fill=WHITE)
    
    # 窗户
    window_x = 215 * scale
    window_y = 380 * scale
    window_width = 82 * scale
    window_height = 100 * scale
    draw.rectangle([window_x, window_y, window_x + window_width, window_y + window_height],
                   fill=SECONDARY_COLOR)
    
    # 添加¥符号（简化为圆形货币符号）
    center_x = size / 2
    center_y = 440 * scale
    radius = 20 * scale
    
    # 绘制货币符号（简化版）
    draw.ellipse([center_x - radius, center_y - radius,
                   center_x + radius, center_y + radius],
                  fill=PRIMARY_COLOR)
    
    return img

def create_apple_touch_icon(size):
    """创建iOS设备图标"""
    img = Image.new('RGBA', (size, size), PRIMARY_COLOR)
    draw = ImageDraw.Draw(img)
    
    # 添加白色房子图标
    scale = size / 512
    
    # 房子主体
    house_x = 100 * scale
    house_y = 150 * scale
    house_width = 312 * scale
    house_height = 280 * scale
    
    draw.rectangle([house_x, house_y, house_x + house_width, house_y + house_height],
                   fill=WHITE)
    
    # 房顶
    roof_points = [
        (house_x, house_y),
        (size / 2, 50 * scale),
        (house_x + house_width, house_y)
    ]
    draw.polygon(roof_points, fill=WHITE)
    
    # 门
    door_x = 210 * scale
    door_y = 300 * scale
    door_width = 90 * scale
    door_height = 130 * scale
    draw.rectangle([door_x, door_y, door_x + door_width, door_y + door_height],
                   fill=PRIMARY_COLOR)
    
    return img

def create_ico():
    """创建ICO格式的favicon"""
    # 创建不同尺寸的图像
    sizes = [16, 32, 48]
    images = []
    
    for size in sizes:
        img = create_favicon(size)
        images.append(img)
    
    # 保存为ICO格式
    images[0].save('favicon.ico', format='ICO', sizes=[(16,16), (32,32), (48,48)])

def main():
    """主函数"""
    print("开始生成favicon文件...")
    
    # 创建16x16 PNG
    print("创建 favicon-16x16.png...")
    img_16 = create_favicon(16)
    img_16.save('favicon-16x16.png', 'PNG')
    
    # 创建32x32 PNG
    print("创建 favicon-32x32.png...")
    img_32 = create_favicon(32)
    img_32.save('favicon-32x32.png', 'PNG')
    
    # 创建48x48 PNG（用于ICO）
    print("创建 48x48 favicon...")
    img_48 = create_favicon(48)
    img_48.save('favicon-48x48.png', 'PNG')
    
    # 创建ICO格式
    print("创建 favicon.ico...")
    create_ico()
    
    # 创建180x180 iOS图标
    print("创建 apple-touch-icon.png...")
    apple_icon = create_apple_touch_icon(180)
    apple_icon.save('apple-touch-icon.png', 'PNG')
    
    print("所有favicon文件生成完成！")
    print("\n生成的文件:")
    print("- favicon.ico (传统格式)")
    print("- favicon-16x16.png (小图标)")
    print("- favicon-32x32.png (标准图标)")
    print("- favicon-48x48.png (中图标)")
    print("- apple-touch-icon.png (iOS图标)")
    print("\n请将这些文件放在网站根目录（与index.html同级）")

if __name__ == '__main__':
    main()
