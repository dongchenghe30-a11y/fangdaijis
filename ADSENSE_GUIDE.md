# Google AdSense 集成指南

## 快速开始

### 1. 申请AdSense账户

1. 访问 [Google AdSense](https://www.google.com/adsense/)
2. 点击"开始使用"
3. 登录Google账号
4. 填写网站信息和付款详情
5. 等待审核通过（通常需要2-3天）

### 2. 获取广告代码

审核通过后：

1. 登录AdSense控制台
2. 进入"广告" → "按广告单元"
3. 点击"创建广告单元"
4. 选择广告类型：
   - **横幅广告**：适合页面顶部和底部
   - **信息流广告**：适合内容之间
   - **自适应广告**：自动适应各种屏幕尺寸
5. 复制生成的HTML代码

### 3. 添加广告代码

#### 步骤1：添加AdSense脚本

在 `index.html` 的 `<head>` 标签中取消注释并替换为您的代码：

```html
<!-- Google AdSense 代码 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

将 `ca-pub-XXXXXXXXXXXXXXXX` 替换为您自己的发布者ID。

#### 步骤2：添加广告单元代码

在以下三个广告位中，取消注释并替换广告代码：

**广告位1 - 页头横幅**（适合横幅广告）：
```html
<div class="ad-container ad-header">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"
         data-ad-format="horizontal"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
```

**广告位2 - 侧边广告**（适合矩形广告）：
```html
<div class="ad-container ad-sidebar">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"
         data-ad-format="rectangle"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
```

**广告位3 - 页脚广告**（适合自适应广告）：
```html
<div class="ad-container ad-footer">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
```

### 4. 广告位说明

| 广告位 | 位置 | 推荐广告类型 | 尺寸 |
|--------|------|--------------|------|
| ad-header | 页面顶部 | 横幅广告 | 728x90, 320x50 |
| ad-sidebar | 结果区域 | 矩形广告 | 336x280, 300x250 |
| ad-footer | 表格下方 | 自适应广告 | 自动 |

### 5. 广告格式说明

#### 横幅广告 (Horizontal)
- 适合页面顶部和底部
- 桌面端：728x90
- 移动端：320x50

#### 矩形广告 (Rectangle)
- 适合侧边栏
- 常见尺寸：336x280, 300x250

#### 自适应广告 (Auto)
- 自动适应屏幕宽度
- 最灵活的选项
- 适合不确定尺寸的场景

### 6. 验证广告显示

添加代码后：

1. 在浏览器中打开网站
2. 如果广告不显示，可能是以下原因：
   - 网站尚未通过审核
   - AdSense正在验证网站
   - 广告被广告拦截器阻止
   - 等待24-48小时让AdSense系统处理

3. 使用AdSense的"审核中心"查看状态

### 7. 提高广告收益

- **内容质量**：提供有价值的房贷计算服务
- **流量**：增加网站访问量
- **位置优化**：将广告放在用户容易看到的位置
- **响应式设计**：确保广告在移动设备上正常显示
- **页面加载速度**：优化网站性能

### 8. 广告政策

Google AdSense有严格的政策，请确保：

- ❌ 不要点击自己的广告
- ❌ 不要鼓励他人点击广告
- ❌ 不要将广告放置在误导性内容旁
- ❌ 不要修改AdSense代码
- ❌ 确保网站内容适合所有年龄段

### 9. 常见问题

**Q: 广告不显示怎么办？**
A: 检查以下几点：
- AdSense账户是否已审核通过
- 代码是否正确粘贴
- 是否使用了广告拦截器
- 等待24-48小时让系统更新

**Q: 可以在本地测试广告吗？**
A: 可以，但本地测试不会显示真实广告。需要部署到线上域名后才能看到实际广告。

**Q: 如何知道广告是否生效？**
A: 登录AdSense控制台查看"报告"页面，会显示展示次数、点击次数和收入。

**Q: 一个页面可以放多少广告？**
A: Google建议每个页面不超过3个广告单元，本网站已设置3个位置。

### 10. 部署步骤

完成广告代码添加后：

1. 保存所有文件
2. 部署到Cloudflare Pages
3. 等待域名解析完成
4. 访问网站验证广告显示
5. 登录AdSense查看报告

### 11. 技术支持

如遇问题：
- AdSense帮助中心：https://support.google.com/adsense
- AdSense论坛：https://support.google.com/adsense/community

## 提示

- 广告代码已添加到HTML中，但默认被注释掉
- 取消注释并替换为您的AdSense代码即可使用
- 广告样式已在styles.css中配置好，无需修改
- 确保遵守Google AdSense政策以避免账号被封禁
