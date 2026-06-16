# Atpio

Atpio 是一个用于创建、嵌入和管理产品反馈问卷的工具。产品负责人只需要用自然语言描述想了解的问题，Atpio 会生成合适的问卷结构，并通过一段脚本把问卷放进自己的网站或产品中。

普通填写者不需要注册或登录 Atpio；只有创建、管理、查看数据的人需要 Atpio 账号。

## 线上入口

- Atpio 产品入口：<https://atpio.vercel.app>
- 示例产品页面：<https://mock-product.vercel.app>
- 接入指南下载：<https://atpio.vercel.app/resources/mock-product-integration-skill>

## 核心能力

- 注册或登录后，每个账号都有自己的项目空间。
- 用自然语言描述需求，生成中文、英文或中英双语问卷。
- 在项目详情页调整问题、页面、选项、校验规则和视觉样式。
- 选择一个项目作为“外部展示项目”，让外部产品自动加载该问卷。
- 也可以固定加载某一个项目，适合只在特定页面收集反馈。
- 普通用户可以直接在外部产品中提交反馈，无需 Atpio 账号。
- 项目创建者可以查看回答、导出数据，并下载独立的 HTML 问卷。

## 客户使用流程

1. 打开 <https://atpio.vercel.app>。
2. 注册或登录 Atpio；也可以先跳过登录，查看产品介绍和接入指南。
3. 新建项目，描述想了解的产品问题。
4. 选择问卷语言：中文、英文或中英双语。
5. 生成问卷，并用整体修改意见继续调整。
6. 保存项目。
7. 在项目详情页细调问题、页面、校验和视觉样式。
8. 在项目空间中选择要展示到外部产品里的项目。
9. 外部产品引入 Atpio 脚本，并传入自己的公开接入密钥。
10. 普通用户在外部产品中填写反馈，数据回到对应的 Atpio 项目。

## 接入方式

推荐使用“项目空间接入”。这样你只需要在 Atpio 里切换外部展示项目，自己的网站不需要每次改代码。

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-atpio-workspace-key="YOUR_WORKSPACE_KEY"
  data-atpio-position="bottom-right"
  data-atpio-label="提交反馈"
></script>
```

如果某个页面永远只需要展示同一个问卷，也可以固定项目：

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-project-id="YOUR_PROJECT_ID"
  data-atpio-position="bottom-right"
  data-atpio-label="提交反馈"
></script>
```

更完整的客户网站接入说明见：

```text
skills/mock-product-integration/SKILL.md
```

也可以直接下载线上版本：

```text
https://atpio.vercel.app/resources/mock-product-integration-skill
```

## 账号与权限

需要登录的页面：

- `/projects`
- `/projects/new`
- `/projects/[projectId]`
- 项目编辑、数据导出、回答管理相关接口

不需要登录的页面：

- `/`
- `/gadget.js`
- `/embed/[projectId]`
- `/api/projects/[projectId]/schema`
- `/api/projects/[projectId]/responses`
- 示例产品页面

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:3000
```

本地示例产品：

```bash
npm run mock-product
```

打开：

```text
http://127.0.0.1:4000
```

## 环境变量

生产环境推荐使用 Vercel + Neon/PostgreSQL。

必需：

```text
AUTH_SECRET=随机长字符串
DATABASE_URL=PostgreSQL 连接串
NEXT_PUBLIC_APP_URL=https://atpio.vercel.app
NEXT_PUBLIC_MOCK_PRODUCT_URL=https://mock-product.vercel.app
PPIO_API_KEY=你的模型接口密钥
PPIO_BASE_URL=https://api.ppinfra.com/v3/openai
PPIO_MODEL=deepseek/deepseek-v3-turbo
PPIO_TIMEOUT_MS=30000
```

客户使用时不需要提前配置共享账号。用户可以在 `/register` 自行注册自己的 Atpio 账号。

## 数据与部署

- 数据库使用 Prisma + PostgreSQL。
- Vercel 构建命令使用 `npm run vercel-build`。
- 构建过程会执行 `prisma generate && prisma migrate deploy && next build`。
- 没有 `DATABASE_URL` 的本地环境会使用 `data/app-store.json` 作为开发数据文件。

## 验证命令

```bash
npm run lint
npm run test
npm run build
```

## 当前边界

- Atpio 负责生成问卷、嵌入问卷、收集回答和导出数据。
- 示例产品只是一个宿主产品示例，用于展示如何把 Atpio 接到其他产品里。
- 普通填写者不需要 Atpio 账号。
- 不同 Atpio 账号默认拥有独立项目空间；当前还没有团队协作或共享项目空间权限系统。
