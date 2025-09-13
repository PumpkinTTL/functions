# WARP.md

本文件为 WARP (warp.dev) 在此代码仓库中工作时提供指导。

## 项目概览

这是一个使用 Vue 3（通过 CDN）和原生 HTML/CSS/JavaScript 构建的网页实用工具集合。项目采用现代玻璃拟态设计风格，界面使用中文，提供 6 个主要功能模块。

## 架构与结构

### 前端技术栈
- **框架**: Vue 3（通过 CDN 加载，非脚手架项目）
- **UI 组件**: Ant Design Vue（仅重置样式）
- **图标**: Font Awesome 6.4.0
- **动画**: Animate.css 4.1.1
- **构建**: 无构建过程 - 纯 HTML/CSS/JS 文件

### 目录结构
```
D:\DevelopmentProject\HTML\functions\
├── index.html                    # 主导航首页
├── calcencrypt.html             # 加密货币计算器
├── pwdgen.html                  # 密码生成器
├── todolist.html                # 待办事项管理器
├── decision-wheel.html          # 随机决策轮盘
├── textprocessor.html           # 文本处理工具
├── typing-test.html             # 打字速度测试
├── css/                         # 样式表目录
│   ├── normal.css              # 基础/重置样式
│   ├── index.css               # 首页样式
│   ├── calcencrypt.css         # 计算器样式
│   ├── pwdgen.css              # 密码生成器样式
│   ├── todolist.css            # 待办事项样式
│   ├── decision-wheel.css      # 决策轮盘样式
│   └── textprocessor.css       # 文本处理器样式
├── js/                         # JavaScript 模块目录
│   ├── index.js                # 首页功能
│   ├── calcencrypt.js          # 计算器逻辑
│   ├── pwdgen.js               # 密码生成逻辑
│   ├── todolist.js             # 待办事项管理
│   ├── decision-wheel.js       # 随机轮盘逻辑
│   └── textprocessor.js        # 文本处理功能
└── .augment/rules/functions.md  # 设计准则
```

### 应用模块

1. **加密货币计算器** (`calcencrypt.*`)
   - 计算现货交易和期货/保证金交易盈亏
   - 支持杠杆计算和手续费计算
   - 实时盈亏可视化，带颜色编码结果

2. **智能密码生成器** (`pwdgen.*`)
   - 根据自定义条件生成安全密码
   - 多种字符集（大写、小写、数字、符号）
   - 密码强度分析和生成历史
   - 一键复制到剪贴板功能

3. **智能待办管理器** (`todolist.*`)
   - 带优先级的任务管理（高/中/低）
   - 按完成状态和优先级筛选
   - 本地存储持久化
   - 编辑和删除功能，带确认对话框

4. **随机决策轮盘** (`decision-wheel.*`)
   - 交互式转盘随机决策工具
   - 支持选项权重设置
   - 预设分类（美食、活动、地点）
   - 动画效果和声音反馈
   - 结果历史记录

5. **智能文本处理工具** (`textprocessor.*`)
   - 大小写转换（大写/小写/首字母大写）
   - 中文转拼音（有限词典）
   - 摩斯密码编码
   - 文本分析（可读性、关键词、重复内容）
   - 二维码生成
   - 格式化工具（去空白、缩进、列表符、编号）

## 常用开发命令

### 运行/测试应用
由于这是一个静态 HTML 项目，不需要构建命令：

```powershell
# 使用 Python 本地服务（如果已安装 Python）
python -m http.server 8000

# 或使用 Node.js http-server（如果已安装）
npx http-server .

# 或直接在浏览器中打开文件
start index.html
```

### 测试单独组件
每个 HTML 文件都是独立的，可以直接打开：
```powershell
# 测试特定模块
start calcencrypt.html
start pwdgen.html
start todolist.html
start decision-wheel.html
start textprocessor.html
```

## 设计系统与模式

### 颜色方案（来自 .augment/rules/functions.md）
- 主色调：科技蓝 (#637cec) / 莫兰迪颜色系统
- 现代极简玻璃拟态设计，带半透明毛玻璃效果
- 渐变色彩，细腻阴影和充足留白

### 使用的 UI 组件
- Ant Design Vue 组件（表格、卡片、统计、导航菜单）
- Font Awesome Solid 图标
- Animate.css 效果（fadeInUp 入场动画、pulse 悬停效果、float 微交互）

### 响应式设计
- 网格系统配合媒体查询，适配多屏幕
- 无硬编码背景色（适配暗色模式）
- 所有页面使用一致的 CSS 架构

### Vue.js 实现模式
每个页面都遵循这种结构：
```javascript
window.addEventListener('load', function() {
  if (typeof Vue === 'undefined') {
    console.error('Vue 未加载');
    showFallbackContent(); // 优雅降级
    return;
  }

  const { createApp, ref, computed, onMounted } = Vue;
  const app = createApp({
    setup() {
      // 使用 ref() 的响应式数据
      // 计算属性
      // 方法
      // 生命周期钩子
      return { /* 暴露的数据和方法 */ };
    }
  });

  app.mount('#app');
});
```

### 本地存储模式
大多数模块使用 localStorage 持久化数据：
```javascript
// 保存数据
localStorage.setItem('moduleNameData', JSON.stringify(data));

// 加载数据
const saved = localStorage.getItem('moduleNameData');
if (saved) {
  data.value = JSON.parse(saved);
}
```

### 消息提示系统
各模块间一致的消息提示：
```javascript
showToast(message, type); // 类型: success, error, warning, info
```

## 开发指南

### 添加新模块
1. 按现有结构创建新的 HTML 文件
2. 在 `css/` 目录中创建对应的 CSS 文件
3. 在 `js/` 目录中创建对应的 JS 文件
4. 在 `index.js` 的 navItems 数组中添加导航项
5. 更新 `index.js` 中的 statsData 统计数据

### CSS 架构
- 每个模块都有自己的 CSS 文件和作用域样式
- `normal.css` 包含基础样式和重置
- 通过 `@media (prefers-color-scheme: dark)` 支持暗色模式
- 一致的命名规范：`.module-name-element`

### 错误处理
所有模块都包含：
- Vue 加载检查和回退内容
- Vue 应用初始化的 try-catch 块
- localStorage 错误处理
- 带用户反馈的输入验证

### 浏览器兼容性
- 使用现代 JavaScript 特性 (ES6+)
- 依赖 CDN 资源 (Vue 3, Font Awesome, Animate.css)
- Web Audio API 音效（带错误处理）
- Clipboard API 复制功能（带回退方案）

## 使用此代码库

修改或扩展此项目时，请注意：
- 每个工具都是独立的，但共享相同的设计模式
- 始终使用 Vue 3 Composition API
- UI 文本使用中文
- 无构建过程意味着更改立即可见
- 大量使用本地存储进行数据持久化
- 始终应用响应式设计原则
