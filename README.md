# 汉字偏旁与五行查询工具

基于新华字典数据的汉字查询工具，支持根据偏旁部首和五行属性查找汉字。适用于中文起名等场景。

## 功能特性

- ✨ **偏旁查询**：支持选择一个或多个偏旁部首进行查询
- 🔥 **五行筛选**：支持按金木水火土五行属性筛选汉字
- 🎯 **多维度查询**：支持仅按五行查询，或结合偏旁与五行联合筛选
- 🔄 **双模式搜索**：
  - OR 模式：查找包含任一选中偏旁的汉字
  - AND 模式：查找包含所有选中偏旁的汉字
- 💎 **汉字详情**：显示拼音（ruby 注音）、五行属性、释义（悬浮显示）
- ❤️ **收藏功能**：可将喜欢的汉字加入收藏，数据保存在浏览器本地
- 📱 **响应式设计**：支持桌面和移动设备
- 🎨 **现代 UI**：使用 shadcn/ui 组件库，界面简洁美观

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **包管理器**：pnpm
- **UI 组件库**：shadcn/ui + Tailwind CSS
- **状态管理**：Zustand
- **代码质量**：Biome (格式化 + Lint)
- **汉字处理**：[cnchar](https://github.com/theajack/cnchar) 生态
  - `cnchar-radical`: 部首识别
  - `cnchar-poly`: 多音字处理
  - `cnchar-info`: 五行属性识别
- **数据来源**：[chinese-xinhua](https://github.com/pwxcoo/chinese-xinhua) (汉字、拼音、释义)

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 初始化 submodule

如果是首次克隆项目，需要初始化 submodule：

```bash
git submodule update --init --recursive
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173 即可使用。

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 项目结构

```
naming-tools/
├── chinese-xinhua/          # Git submodule - 新华字典数据
├── public/
│   └── chinese-xinhua/      # 符号链接到数据目录
├── src/
│   ├── components/          # React 组件
│   │   ├── ui/              # shadcn/ui 基础组件
│   │   ├── CharacterCard.tsx
│   │   ├── RadicalSelector.tsx
│   │   ├── FiveElementSelector.tsx
│   │   ├── SearchResults.tsx
│   │   ├── ModeToggle.tsx
│   │   └── FavoritesView.tsx
│   ├── data/
│   │   └── loader.ts        # 数据加载和索引构建
│   ├── stores/
│   │   ├── useSearchStore.ts      # 搜索状态管理
│   │   └── useFavoritesStore.ts   # 收藏状态管理
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── lib/
│   │   └── utils.ts         # 工具函数
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── biome.json
```

## 使用说明

1. **选择偏旁**：在偏旁选择器中点击一个或多个偏旁部首（可选）
2. **选择五行**：在五行选择器中选择一个或多个五行属性（金木水火土）（可选）
3. **切换模式**：使用模式切换器在 OR/AND 模式间切换（仅对偏旁搜索生效）
4. **查看结果**：匹配的汉字会自动显示，包含拼音（ruby 注音）、五行标签、释义（悬浮显示）
5. **灵活组合**：可以单独使用偏旁查询、单独使用五行查询，或组合使用两者进行联合筛选
6. **收藏汉字**：点击汉字卡片右上角的心形图标添加收藏
7. **查看收藏**：切换到"收藏"标签页查看已收藏的汉字

## 代码规范

项目使用 Biome 进行代码格式化和检查：

```bash
# 检查代码
pnpm lint

# 格式化代码
pnpm format
```

## 数据来源

- **汉字数据**：来自 [chinese-xinhua](https://github.com/pwxcoo/chinese-xinhua) 项目，包含 16142 个汉字的拼音和释义信息
- **部首识别**：使用 [cnchar](https://github.com/theajack/cnchar) 的 `cnchar-radical` 插件动态获取汉字的部首，更加准确和灵活
- **五行属性**：使用 [cnchar](https://github.com/theajack/cnchar) 的 `cnchar-info` 插件动态获取汉字的五行属性（金木水火土）

## License

MIT
