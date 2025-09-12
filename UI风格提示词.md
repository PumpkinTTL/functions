# 现代毛玻璃UI风格提示词

## 🎨 整体风格描述

请按照以下风格创建界面：

### 核心美学
- **毛玻璃拟态风格**：渐变背景 + backdrop-filter: blur(10px) + 装饰元素营造层次感
- **精致装饰主义**：适度装饰不花哨，光效、渐变条、高光线增强美感
- **科技轻奢感**：主色#637cec，渐变背景，深浅文字层次，彩色点缀
- **细节丰富化**：多层阴影、交互光效、装饰条、边框高光

### 颜色与组件库适配
```
背景色系：使用组件库变量（自动适配深色模式）
- Element UI Plus：var(--el-bg-color) / var(--el-bg-color-page)
- Ant Design Vue：使用 ConfigProvider 的 token.colorBgContainer
- 普通项目：background-color: white 或 rgba(255,255,255,0.8)

元素色彩：固定硬编码（保持品牌一致）
- 主色：#637cec  成功：#38a169  警告：#d69e2e  错误：#e53e3e
- 文字：#1a202c主要 / #475569次要 / #a0aec0辅助

组件库使用策略：
- 可使用组件库的基础组件（Button、Input、Card等）
- 必须覆盖组件默认样式，应用毛玻璃效果
- 布局和容器主要使用自定义CSS实现
```

### 关键设计要素
```
毛玻璃效果：backdrop-filter: blur(10px) + linear-gradient渐变背景
- 不要纯色背景，使用：linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)
- 容器：backdrop-filter + 多层box-shadow营造悬浮感

精致装饰元素：
- 顶部装饰条：2px高 linear-gradient(90deg, #637cec, #38a169, #d69e2e, #e53e3e)
- 按钮光效：::before伪元素 linear-gradient(135deg, rgba(255,255,255,0.5), transparent)
- 边框高光：顶部1px rgba(255,255,255,0.4)渐变线

阴影层次：多层组合营造立体感
- 0 4px 6px rgba(0,0,0,0.02) + 0 10px 25px rgba(0,0,0,0.03)
- 悬停：0 8px 25px rgba(99,125,236,0.12) + 彩色阴影

圆角系统：8px按钮 / 12px卡片 / 6px小元素
字体层次：标题font-weight:100-200 / 正文font-weight:400-500
```

### 必须的交互效果与装饰
- 悬停：translateY(-2px) + 彩色阴影 + 主色变化 + 光效显现
- 点击：scale(0.98)瞬间回弹 + 轻微旋转效果
- 入场：fadeInUp 0.6s + 依次出现 + 装饰元素延迟动画
- 光效动画：hover时::before伪元素opacity从0到1
- 图标动画：悬停时scale(1.05) + 轻微旋转
- 背景装饰：极淡径向渐变增强氛围感

## 📝 使用模板

```
请创建现代毛玻璃风格的精美界面：

【核心风格】半透明毛玻璃拟态 + 极简现代 + 轻奢质感
【毛玻璃实现】backdrop-filter: blur(10px) + rgba半透明背景  
【配色与组件库】
- 背景色：Element Plus用var(--el-bg-color) / Ant Design用token.colorBgContainer / 普通项目用white
- 元素色：主色#637cec 成功#38a169 警告#d69e2e 错误#e53e3e（固定硬编码）
- 文字层次：#1a202c主要 #475569次要 #a0aec0辅助
- 组件库：可使用基础组件但必须覆盖样式，布局主要用自定义CSS
【视觉效果与装饰】
- 毛玻璃：backdrop-filter + linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)，避免纯色
- 装饰元素：顶部2px彩色渐变条 + 按钮光效 + 边框高光线
- 阴影层次：多层组合 0 4px 6px + 0 10px 25px 营造悬浮感
- 圆角：8px按钮 12px卡片 6px小元素（优雅不过圆）
- 字体：标题font-weight:100-200超轻 正文font-weight:400-500适中
【必需交互与装饰】
- 悬停：translateY(-2px)+彩色阴影+主色变化+光效::before显现+图标scale(1.05)
- 点击：scale(0.98)瞬间回弹+轻微rotate效果
- 入场：fadeInUp 0.6s依次展现+装饰元素延迟动画
- 装饰：顶部渐变装饰条+按钮内光效+边框高光+背景径向渐变氛围
- 过渡：0.3s cubic-bezier(0.4,0,0.2,1)自然缓动
【布局要求】响应式flex/grid，16px基础间距，充足留白营造呼吸感

功能需求：[描述具体界面内容和功能]
```

---

*基于现有首页风格的简洁提示词，适用于任何界面类型*
