<!-- Git Repository: https://github.com/rick-peng-li/mern-starter-new-web.git -->

# MERN Starter New Web

一个基于现代 MERN 技术栈重构的内容管理示例项目，提供完整的前后端文章管理闭环，适合作为后台管理台、内容中台、企业内部 CMS 原型或教学演示项目的起点。

## 项目简介

本项目保留了原仓库的 MERN 主题，但已经从早期的同构模板升级为更适合当前维护方式的前后端分离结构：

- 前端使用 React 19 + Vite 7，开发体验更轻量，构建更快
- 路由升级为 React Router 7，采用现代化声明式页面组织方式
- 数据请求使用 TanStack Query，统一处理缓存、刷新与突变更新
- 后端升级为 Express 5 + Mongoose 8，接口结构更清晰
- 使用 Zod 做请求校验，降低脏数据进入数据库的风险
- 支持本地 MongoDB，也支持无数据库配置时自动启用内存 MongoDB，方便快速启动和演示

## 核心功能

### 业务功能

- 公开内容浏览：首页列表、文章详情、统计概览、健康状态
- 账号体系：注册、登录、读取当前用户信息、前端受保护路由
- 内容管理：新建、编辑、删除文章，支持草稿与发布状态
- 内容增强：Markdown 编辑、实时预览、封面图上传、正文图片插入
- 数据能力：关键字搜索、分类筛选、标签筛选、状态筛选、分页、排序
- 分类标签管理：分类与标签的创建、重命名、删除及文章联动更新
- 演示能力：首次启动自动注入管理员账号、分类标签和示例文章

### 默认演示账号

- 邮箱：`admin@example.com`
- 密码：`Admin123456`
- 可通过 `.env` 覆盖

## 页面设计

### 1. Dashboard 首页

路径：`/`

功能说明：

- 展示文章总数、已发布数量、草稿数量、分类数量
- 展示热门标签与活跃作者
- 提供搜索、状态、分类、标签、排序、分页容量筛选
- 展示文章卡片列表与分页切换
- 未登录用户可浏览内容，已登录用户可直接进入管理操作

### 2. 登录页

路径：`/login`

功能说明：

- 使用邮箱和密码登录
- 登录成功后进入原目标受保护页面或首页
- 支持使用默认管理员账号快速体验

### 3. 注册页

路径：`/register`

功能说明：

- 注册新的编辑账号
- 注册成功后自动建立登录态

### 4. 新建文章页

路径：`/posts/new`

功能说明：

- 创建 Markdown 文章
- 维护标题、摘要、正文、分类、标签、状态
- 上传封面图
- 上传内容图片并自动插入 Markdown
- 实时预览渲染效果

### 5. 编辑文章页

路径：`/posts/:postId/edit`

功能说明：

- 回填已有文章内容
- 修改文章元数据与正文
- 保存后跳转到详情页

### 6. 文章详情页

路径：`/posts/:postId`

功能说明：

- 渲染 Markdown 正文
- 展示阅读时长、最后编辑人、状态、作者、分类、标签、时间信息

### 7. 分类标签管理页

路径：`/manage/taxonomy`

功能说明：

- 创建分类
- 创建标签
- 重命名分类与标签
- 删除分类与标签
- 删除分类时，关联文章自动转移到 `General`
- 删除标签时，关联文章自动移除该标签

## 接口设计

接口统一前缀：`/api`

### 1. 健康检查

- `GET /api/health`

### 2. 认证接口

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### 3. 文章接口

- `GET /api/posts`
- `GET /api/posts/:postId`
- `POST /api/posts`
- `PUT /api/posts/:postId`
- `DELETE /api/posts/:postId`
- `GET /api/posts/stats/overview`

文章列表支持查询参数：

- `search`：按标题、摘要、正文、作者模糊搜索
- `status`：按状态筛选
- `category`：按分类筛选
- `tag`：按标签筛选
- `page`：分页页码
- `limit`：每页数量
- `sort`：排序方式，支持 `updated`、`newest`、`oldest`、`title`、`published`

### 4. 分类与标签接口

- `GET /api/taxonomy/categories`
- `POST /api/taxonomy/categories`
- `PUT /api/taxonomy/categories/:categoryId`
- `DELETE /api/taxonomy/categories/:categoryId`
- `GET /api/taxonomy/tags`
- `POST /api/taxonomy/tags`
- `PUT /api/taxonomy/tags/:tagId`
- `DELETE /api/taxonomy/tags/:tagId`

### 5. 上传接口

- `POST /api/uploads/image`

说明：

- 需要登录后访问
- 使用 `multipart/form-data`
- 支持图片类型上传
- 上传成功后返回可直接访问的图片 URL

## 权限设计

- 公共访问：`首页`、`详情页`、`健康检查`、`列表与统计接口`
- 登录后访问：`新建文章`、`编辑文章`、`删除文章`、`分类标签管理`、`图片上传`

## 技术架构

### 总体架构

- `client`：React 前端应用，负责页面渲染、鉴权态维护、编辑器交互、查询与管理页
- `server`：Express API 服务，负责认证、文章管理、分类标签管理、上传与统计
- `MongoDB`：存储用户、文章、分类、标签数据
- `mongodb-memory-server`：本地无数据库时的内存库兜底方案

### 前端技术栈

- React 19
- React Router 7
- TanStack Query 5
- React Markdown
- Vite 7
- Vitest + Testing Library

### 后端技术栈

- Node.js 20+
- Express 5
- Mongoose 8
- JWT
- bcryptjs
- Multer
- Zod 4
- Vitest + Supertest
- Helmet / CORS / Morgan

## 目录结构

```text
mern-starter-new-web
├── client
│   ├── src
│   │   ├── context
│   │   ├── lib
│   │   ├── pages
│   │   ├── test
│   │   ├── ui
│   │   ├── main.jsx
│   │   ├── router.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server
│   ├── src
│   │   ├── __tests__
│   │   ├── config
│   │   ├── controllers
│   │   ├── db
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── utils
│   │   ├── validation
│   │   ├── app.js
│   │   └── index.js
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 启动方式

### 环境要求

- Node.js 20 及以上
- npm 10 及以上

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

主要配置项：

- `PORT`：后端服务端口，默认 `5001`
- `CLIENT_ORIGIN`：前端开发地址，默认 `http://localhost:5173`
- `MONGO_URI`：外部 MongoDB 连接地址
- `MONGO_DB_NAME`：数据库名称
- `USE_IN_MEMORY_DB`：未配置 `MONGO_URI` 时是否自动使用内存 MongoDB
- `SEED_DEMO_DATA`：是否自动注入演示数据
- `JWT_SECRET`：JWT 签名密钥
- `ADMIN_NAME`：默认管理员姓名
- `ADMIN_EMAIL`：默认管理员邮箱
- `ADMIN_PASSWORD`：默认管理员密码

### 3. 启动开发环境

```bash
npm run dev
```

启动后：

- 前端开发地址：`http://localhost:5173`
- 后端接口地址：`http://localhost:5001/api`
- 图片访问地址：`http://localhost:5001/uploads/...`

### 4. 构建项目

```bash
npm run build
```

### 5. 启动服务端

```bash
npm start
```

### 6. 运行测试

```bash
npm test
```

## 数据模型说明

### 用户模型

- `name`：姓名
- `email`：邮箱
- `passwordHash`：密码哈希
- `role`：角色，当前支持 `admin` / `editor`

### 文章模型

- `publicId`：前端路由与接口访问主键
- `title`：文章标题
- `slug`：标题生成的路径标识
- `summary`：摘要
- `content`：Markdown 正文
- `contentFormat`：当前固定为 `markdown`
- `author`：作者
- `category`：分类名
- `tags`：标签数组
- `status`：`draft` / `published`
- `coverImage`：封面图地址
- `publishedAt`：发布时间
- `lastEditedBy`：最后编辑人
- `createdAt` / `updatedAt`：创建与更新时间

### 分类与标签模型

- `name`：展示名称
- `slug`：规范化标识
- `description`：说明文字
