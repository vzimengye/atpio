# Atpio

Atpio 是一个用于收集产品反馈的 AI 问卷与嵌入式反馈工具。客户只需要用自然语言描述想了解的问题，Atpio 会生成合适的反馈问卷，并通过一段 `gadget.js` 脚本嵌入到自己的网站或产品里。

普通填写反馈的用户不需要注册或登录；只有创建和管理项目的人需要 Atpio 账号。

## 线上入口

- Atpio 产品入口：<https://atpio.vercel.app>
- Mock product 示例：<https://mock-product.vercel.app>
- Mock 接入指南下载：<https://atpio.vercel.app/resources/mock-product-integration-skill>

## Atpio 能做什么

- 注册/登录后，每个账号拥有自己的 project workspace。
- 根据 brief 自动生成反馈问卷。
- 支持生成中文、英文、中英双语问卷。
- 支持在项目详情页细调字段、页面、选项、校验和嵌入样式。
- 支持把某个项目设为当前 workspace 的 active embed。
- 支持客户网站通过 `data-atpio-workspace-key` 自动加载当前 active project。
- 支持固定加载某一个项目的 `data-project-id`。
- 普通用户可以在客户网站中直接提交 feedback，无需登录 Atpio。
- 项目创建者可以查看 responses，并下载项目数据。

## 客户使用流程

1. 打开 <https://atpio.vercel.app>。
2. 注册或登录 Atpio 账号；也可以先跳过，查看产品介绍和接入指南。
3. 进入 New Project，输入想收集的反馈 brief。
4. 选择问卷语言：中文、英文或中英双语。
5. 生成问卷，如需整体调整，可以用 “Ask Atpio to revise”。
6. 保存项目。
7. 在项目详情页细调字段、页面、校验和 embed 设置。
8. 在 Workspace 中把某个项目设为 active embed。
9. 客户网站引入 Atpio 的 `gadget.js`，并传入自己的 workspace key。
10. 普通用户在客户网站中填写反馈，数据回到 Atpio 项目。

## 接入方式

推荐使用 workspace 方式接入。这样客户只需要在 Atpio 内选择 active project，自己的网站不需要每次改代码。

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-atpio-workspace-key="YOUR_WORKSPACE_KEY"
  data-atpio-position="bottom-right"
  data-atpio-label="Share feedback"
></script>
```

也可以固定加载某一个项目：

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-project-id="YOUR_PROJECT_ID"
  data-atpio-position="bottom-right"
  data-atpio-label="Share feedback"
></script>
```

更完整的 mock/客户网站接入说明见：

```text
skills/mock-product-integration/SKILL.md
```

也可以直接从线上下载：

```text
https://atpio.vercel.app/resources/mock-product-integration-skill
```

## 管理端与公开端

需要登录的页面：

- `/projects`
- `/projects/new`
- `/projects/[projectId]`
- 项目编辑、导出、response 管理相关接口

不需要登录的页面：

- `/`
- `/gadget.js`
- `/embed/[projectId]`
- `/api/projects/[projectId]/schema`
- `/api/projects/[projectId]/responses`
- mock product 页面

## 本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:3000
```

本地 mock product：

```bash
npm run mock-product
```

打开：

```text
http://127.0.0.1:4000
```

## 环境变量

生产环境推荐使用 Vercel + Postgres/Neon。

必需：

```text
AUTH_SECRET=随机长字符串
DATABASE_URL=Postgres 连接串
NEXT_PUBLIC_APP_URL=https://atpio.vercel.app
NEXT_PUBLIC_MOCK_PRODUCT_URL=https://mock-product.vercel.app
PPIO_API_KEY=你的 PPIO key
PPIO_BASE_URL=https://api.ppinfra.com/v3/openai
PPIO_MODEL=deepseek/deepseek-v3-turbo
PPIO_TIMEOUT_MS=30000
```

客户使用时不需要提前配置共享账号，用户可以在 `/register` 自行注册自己的 Atpio 账号。

## 数据与部署

- 数据库使用 Prisma + PostgreSQL。
- Vercel 构建命令使用 `npm run vercel-build`。
- 构建过程会执行 `prisma generate && prisma migrate deploy && next build`。
- 没有 `DATABASE_URL` 的本地环境会使用 `data/app-store.json` 作为开发 fallback。

## 验证命令

```bash
npm run lint
npm run build
```

## 当前边界

- Atpio 负责生成、嵌入和收集反馈。
- mock-product 只是示例客户网站，用于展示如何接入 Atpio。
- 普通填写者永远不需要 Atpio 账号。
- 不同 Atpio 账号默认拥有独立 workspace；当前还没有团队协作/共享 workspace 权限系统。
