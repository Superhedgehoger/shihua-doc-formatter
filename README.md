# 石化公文自动排版工具

> 纯前端 Web 应用，AI 辅助识别文档结构，一键导出符合中国石化公文规范（Q/SH 0758-2019）或国家标准（GB/T 9704-2012）的 Word 文档。

## ✨ 功能特性

- 🤖 **AI 智能识别**：使用 Claude API 自动分析文档结构，识别标题层级、落款、附件等
- 📄 **多格式支持**：支持粘贴文字、上传 .docx 或 .txt 文件
- 👁️ **实时预览**：A4 比例可视化预览，支持手动调整段落类型
- ⚠️ **规范校验**：自动检测标题末尾标点、层级连续性、日期格式等问题
- 🔒 **隐私安全**：纯前端处理，文件不上传任何服务器，API Key 仅存 sessionStorage
- 📦 **双标准支持**：支持中国石化标准 Q/SH 0758-2019 和 国家标准 GB/T 9704-2012
- 📋 **模板管理器**：可视化选择、创建、导入/导出公文模板
- 🎨 **模板生成器**：一键生成符合标准的空白 Word 模板
- 🏷️ **多类型支持**：红头文件、通知、报告、请示、批复、签报、会议纪要、函等

## 🚀 快速开始

### 环境要求

- Node.js 18+
- 现代浏览器（Chrome、Firefox、Edge、Safari）
- Claude API Key（从 [Anthropic Console](https://console.anthropic.com/settings/keys) 获取）

### 安装依赖

```bash
npm install
```

### 生成模板文件（首次使用必需）≤

```bash
cd templates
node create-template.js
cd ..
```

### 开发模式

```bash
npm run dev
```

浏览器访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物位于 `dist/` 目录，可部署到任意静态托管服务。

## 📝 使用说明

### 模板管理

点击「选择模板」按钮打开模板管理器：

1. **选择模板**：浏览内置模板或自定义模板
2. **创建自定义模板**：基于现有标准创建个性化模板配置
3. **生成 Word 模板**：下载符合标准的空白 .docx 模板文件
4. **导入/导出**：通过 JSON 格式分享模板配置

### 排版流程

1. **配置 API Key**：首次使用点击右上角「配置 API」，输入 Claude API Key
2. **选择公文类型**：红头文件 / 工作表单 / 会议纪要
3. **选择模板**：点击「选择模板」选择适合的标准和公文类型
4. **输入内容**：粘贴文字或上传 .docx/.txt 文件
5. **填写元数据**（可选）：发文字号、主送机关等
6. **点击「解析文档结构」**：AI 自动分析文档结构
7. **预览并修正**：检查预览效果，点击段落可修改类型
8. **导出 .docx**：点击导出按钮下载排版后的文档

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Enter` | 解析文档结构 |
| `Ctrl + S` | 导出 .docx |

## ⚠️ CORS 说明

浏览器直连 Claude API 可能遇到 CORS 限制，解决方案：

### 方案 1：浏览器扩展（临时）
安装 [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino) 扩展

### 方案 2：本地代理（推荐）
使用 Nginx 或 Caddy 配置反向代理：

```nginx
location /api/anthropic {
    proxy_pass https://api.anthropic.com;
    proxy_set_header Host api.anthropic.com;
    add_header Access-Control-Allow-Origin *;
}
```

### 方案 3：部署在允许域名
将应用部署在 Anthropic 允许的域名下（如 claude.ai 的 Artifact）

## 📋 公文规范速查

### Q/SH 0758-2019（中国石化标准）

| 参数 | 数值 |
|------|------|
| 纸张 | A4 (21cm × 29.7cm) |
| 上边距 | 3.7cm |
| 下边距 | 3.5cm |
| 左边距 | 2.8cm |
| 右边距 | 2.6cm |
| 每页行数 | 22 行 |
| 每行字数 | 28 字 |

### GB/T 9704-2012（国家标准）

| 参数 | 数值 |
|------|------|
| 纸张 | A4 (21cm × 29.7cm) |
| 上边距 | 2.54cm |
| 下边距 | 2.54cm |
| 左边距 | 3.17cm |
| 右边距 | 3.17cm |
| 每页行数 | 22 行 |
| 每行字数 | 28 字 |

### 字体规范（两标准通用）

| 元素 | 字体 | 字号 |
|------|------|------|
| 主标题 | 方正小标宋简体 | 二号 (22pt) |
| 一级标题 | 黑体 | 三号 (16pt) |
| 二级标题 | 楷体 | 三号 (16pt) |
| 三级标题 | 仿宋 | 三号 (16pt) |
| 四级标题 | 仿宋 | 三号 (16pt) |
| 正文 | 仿宋 | 三号 (16pt) |

## 🛠️ 技术栈

- **构建工具**：Vite 5
- **前端框架**：React 18
- **样式**：Tailwind CSS
- **文件解析**：mammoth.js
- **文档生成**：PizZip + 原生 XML
- **AI 接口**：Claude API (claude-sonnet-4-5)

## 📁 项目结构

```
shihua-doc-formatter/
├── templates/              # Word 模板文件
│   ├── 红头文件.docx
│   ├── 工作表单.docx
│   └── 会议纪要.docx
├── docs/                   # 文档
│   └── 模板制作指南.md    # 模板制作详细指南
├── src/
│   ├── api/               # API 封装
│   ├── core/              # 核心逻辑
│   │   ├── templateInjector.js    # 模板注入器
│   │   ├── templateGenerator.js   # 模板生成器
│   │   ├── structureAnalyzer.js   # 结构分析器
│   │   └── validator.js           # 规范验证器
│   ├── parsers/           # 文件解析器
│   ├── ui/                # UI 组件
│   │   ├── TemplateManager.jsx    # 模板管理器
│   │   ├── TemplateGenerator.jsx  # 模板生成界面
│   │   └── TemplateImportExport.jsx # 导入/导出界面
│   └── constants/         # 常量定义
│       └── templateRegistry.js    # 模板注册表
├── vite.config.js
└── package.json
```

## 🎨 模板定制

### 方式一：使用内置模板生成器（推荐）

1. 点击「选择模板」→「生成 Word 模板」
2. 选择标准（Q/SH 或 GB/T）和公文类型
3. 点击「下载模板」

### 方式二：手动制作模板

详见 [docs/模板制作指南.md](docs/模板制作指南.md)

### 方式三：导入外部模板配置

通过「导入/导出」功能，使用 JSON 格式分享和导入模板配置。

## ⚡ 已知限制

| 限制 | 说明 |
|------|------|
| 字体预览 | Web 预览使用宋体近似，Word 中显示真实字体 |
| 方正小标宋 | 需本地安装该字体才能正确显示 |
| 复杂排版 | 含大量图片/表格的文稿建议手动处理 |
| 浏览器 CORS | 部分环境需配置代理才能调用 API |

## 📄 许可证

MIT License

## 🔗 相关标准

- [Q/SH 0758-2019 中国石化公文处理规范](http://www.sinopec.com)

---

> 中国石化公文自动排版工具 | 遵循 Q/SH 0758-2019 标准
