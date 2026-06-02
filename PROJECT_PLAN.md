# Atpio 项目说明与执行计划

## 1. 当前项目定位

Atpio 是一个 TypeScript-first 的 data gathering gadget 项目。

它要解决的问题是：

1. 允许其他产品用标准方式接入 Atpio。
2. 在其他产品页面上渲染一个 data gathering gadget。
3. 允许产品方用自然语言描述想收集什么数据。
4. Atpio 调用 LLM，把这个 brief 转成一个 form/questionnaire schema。
5. Atpio 根据 schema 动态渲染表单。
6. 用户提交 responses 后，Atpio 保存数据并提供基础聚合结果。

当前阶段的重点是 **data gathering flow**，不是完整 Clio/OpenClio analysis。

## 2. 2026-06-02 新指示后的执行原则

根据新的 mentor 指示，Atpio 当前阶段的执行原则调整为：

1. **OpenClio 只看概念，不直接接入。**
   OpenClio 可以作为参考资料，帮助理解 privacy-preserving analysis 的方向，但当前 repo 不以它作为依赖，也不把跑通 OpenClio 当成当前阶段目标。

2. **保持 solo TypeScript codebase。**
   当前 repo 最好保持一套语言和一套工程方式：Next.js + TypeScript + React。除非后续高级分析明确需要 Python，否则不新增 Python service 作为主路径。

3. **先把 data gathering 部分跑通。**
   当前最重要的是证明：
   - 其他产品可以标准化接入 Atpio。
   - Atpio 可以在别的产品页面渲染 gadget。
   - 用户可以用自然语言配置想收集的数据。
   - Atpio 可以调用 LLM 生成 form/questionnaire。
   - responses 可以被保存，并在 dashboard 中看到基础状态。

4. **分析能力后置。**
   当前只保留基础 TypeScript aggregation。等 data gathering flow 稳定后，再决定是否做更复杂的 taxonomy、facet、summary、clustering，届时可以参考 OpenClio，也可以直接用 TypeScript 重新实现。

因此，当前优先级不是“跑 OpenClio”，而是：

```text
standard embed API
→ dynamic gadget UI
→ natural-language brief to schema
→ response collection
→ local mock product integration
```

## 3. OpenClio 的位置

OpenClio 只作为 reference，不作为当前 repo 的主依赖。

原因：

1. 不确定 OpenClio 的完整度和维护状态。
2. 不确定它是否适配 Atpio 的真实 data gathering 场景。
3. OpenClio 偏 Python/vLLM，本 repo 最好保持 solo TypeScript codebase。
4. 当前阶段最重要的是把 data gathering gadget 跑通。
5. 后续如果需要高级分析，可以参考 OpenClio 的概念，在 TypeScript 里重新实现需要的部分，或再单独接 Python service。

所以当前 plan 不要求真正跑 OpenClio，也不保留 Python/OpenClio worker 作为当前 repo 的一部分。

执行指示：

- 不要把 OpenClio 放在当前开发前置路径里。
- 不要为了适配 OpenClio 改 Atpio 的 repo 结构。
- 不要因为线上已有 open-source project 就默认接入或 fork 它。
- 当前更推荐把 OpenClio 当成 reference，看懂概念后按 Atpio 的真实场景和 TypeScript repo 重新实现需要的部分。
- 只有当 data gathering flow 跑通后，且分析能力成为明确需求时，才重新评估是 TypeScript 自研、参考 OpenClio 重写，还是单独接 Python service。

## 4. 当前推荐架构

```text
Other product
  |
  | <script src="https://atpio-domain/gadget.js" data-project-id="...">
  v
Atpio gadget.js
  |
  | opens iframe
  v
Atpio /embed/[projectId]
  |
  | submit response
  v
Atpio API + local/store database
  |
  | basic aggregation
  v
Atpio dashboard
```

技术栈：

- Next.js
- TypeScript
- React
- Tailwind CSS
- PPIO LLM API for brief-to-schema generation
- Local JSON store for MVP
- Future production database: Supabase/Postgres/Vercel Postgres

## 5. 已完成的 MVP 能力

### 4.1 标准接入方式

其他产品可以通过 script tag 接入：

```html
<script
  src="http://127.0.0.1:3000/gadget.js"
  data-project-id="project_onboarding_feedback">
</script>
```

Atpio 会在宿主页面右下角渲染 Feedback 按钮，点击后打开 iframe 表单。

本地验证方式：

- Atpio app: `http://127.0.0.1:3000`
- Mock product: `http://127.0.0.1:4000`

运行：

```bash
npm run dev
npm run mock-product
```

### 4.2 自然语言生成 gadget schema

API：

```http
POST /api/projects/generate-schema
```

输入：

```json
{
  "brief": "I want to collect player feedback about whether this game level is too difficult."
}
```

输出：

```json
{
  "name": "Player Feedback Project",
  "schema": {
    "title": "Player Feedback",
    "description": "...",
    "fields": []
  },
  "source": "ppio"
}
```

这个接口优先调用 PPIO。失败时回退到本地 deterministic schema generator。

### 4.3 动态表单渲染

Atpio 根据 schema 动态渲染 form/questionnaire。

支持字段：

- short text
- long text
- single select
- multi select
- rating
- boolean

### 4.4 数据收集

API：

```http
POST /api/projects/[projectId]/responses
```

当前 MVP 写入本地 `data/app-store.json`。

生产环境需要替换成数据库。

### 4.5 基础聚合和隐私保护

当前已实现：

- audit log
- project list / project detail
- editable generated schema
- configurable gadget position / theme / label / success message
- host metadata capture
- gadget open / close / success events
- success callback
- multi-page questionnaire rendering
- field validation metadata
- no temporary admin token gate

当前只保留 data gathering 所需的基础 guard，不做 analysis privacy layer。

## 6. 当前不做的内容

### 5.1 不直接接 OpenClio

OpenClio 当前只作为 reference。

暂时不做：

- 安装 OpenClio
- 跑 vLLM 或其他 Python-only runtime
- 用 Python worker 做正式 analysis backend
- 把 OpenClio output 嵌入 dashboard

后续如果 analysis 变成重点，可以再决定：

1. 参考 OpenClio，在 TypeScript 里重写需要的 analysis pipeline。
2. 或者把 OpenClio 单独做成 Python service。

### 5.2 不做生产数据库

当前只用 local JSON store。

后续可换：

- Supabase Postgres
- Vercel Postgres
- Neon

## 7. 下一步开发计划

### Phase 1: Data Gathering 产品流增强

目标：让用户更容易创建不同类型的 data gathering gadget。

任务：

- 继续改进 PPIO prompt。
- 支持更丰富的 validation UI。
- 支持更友好的 schema editor。

### Phase 2: Gadget 接入增强

目标：让 Atpio 更像一个真正可以被其他产品接入的 SDK。

任务：

- 支持更多 gadget 动画和品牌样式。
- 支持 host product 读取更多 lifecycle event detail。

### Phase 3: Data Storage

目标：从 local JSON store 切到真实数据库。

任务：

- 设计 Postgres schema。
- 替换 `src/lib/store.ts`。
- 增加 migration。
- 保留同一套 API surface。

### Phase 4: Analysis Later

目标：等 data gathering flow 稳定后再做高级分析。

可选方向：

- TypeScript analysis pipeline。
- PPIO/LLM summarization。
- OpenClio-inspired taxonomy/facet generation。
- 单独 Python analysis service。

OpenClio 只作为参考，不是当前必须接入的依赖。

## 8. Demo 标准

一个完整本地 demo 应该展示：

1. 打开 Atpio `/projects/new`。
2. 输入任意 data collection brief。
3. 生成 form schema。
4. 保存 project。
5. 打开 mock product `localhost:4000`。
6. mock product 通过 `gadget.js` 渲染 Atpio gadget。
7. 用户提交 response。
8. Atpio dashboard 显示 response count、schema fields 和基础 collection summary。

这个 demo 已经足够证明当前阶段的核心价值。

## 9. 2026-06-02 最新完成状态

本轮把之前“部分完成”的 data gathering 增强项补完：

- schema editor：已从纯 JSON textarea 升级为可视化 schema builder，并保留 Advanced JSON 作为兜底。
- validation：builder 里已支持 text 字段的 min/max length 和 rating 字段的 min/max 可视化配置。
- PPIO prompt：已增强 prompt，并在服务端补了 field type 归一化，继续保证 `source: "ppio"` 可用，失败时回退 local generator。
- gadget branding：已支持 position、theme、label、success message、brand color、accent color、button shape、font family，并同步到 embed code 和 `gadget.js`。

当前仍然不直接接入 OpenClio。它只作为后续 analysis 的概念参考；现阶段完成重点是 Atpio 的 TypeScript-first data gathering flow。

当前剩余的主要工作已经从 MVP 功能补齐转向生产化：

- 切换到真实数据库。
- 部署到 Vercel。
- 增加更完整的 aggregate reporting。
- 在高级 analysis 前增加隐私保护能力。
