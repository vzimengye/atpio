# Atpio 项目说明与执行计划

## 1. 项目解释

Atpio 要做一个可嵌入到不同产品里的数据收集与分析工具：产品方用自然语言描述“想收集什么信息”，系统自动生成一个标准化的 data gathering gadget 页面，例如表单、问卷或轻量弹窗；用户提交数据后，后端用 Clio / OpenClio 类似的流程做聚合分析，输出隐私友好的主题、趋势和洞察。

可以把它理解成：

> Atpio 是一个面向内部产品的 “动态数据收集前端 + Clio 式非结构化数据分析后端”。

## 2. Clio 是什么

Clio 是 Anthropic 论文 [Clio: Privacy-Preserving Insights into Real-World AI Use](https://arxiv.org/abs/2412.13678) 里提出的一套方法。它的目标不是让人直接读原始用户对话，而是让模型先把大量对话变成更抽象、更安全的中间表示，再从这些中间表示里总结使用场景、主题分布、异常模式和安全风险。

它大致做三件事：

1. 对原始文本做摘要、主题抽取、聚类或层级分类。
2. 尽量避免人工查看原始数据，降低隐私暴露。
3. 只展示聚合后的洞察，例如 “用户最常问什么问题”“不同产品/语言/场景下需求有什么差异”。

网上也有一个开源方向可以参考：[OpenClio](https://github.com/Phylliida/OpenClio)。它更偏后端分析 pipeline，可以作为后续分析模块的参考或替换方案。

## 3. 我们要做的版本

Atpio 不需要一开始复刻完整 Clio。最小可行版本应该先完成一个闭环：

1. 产品方创建一个数据收集任务。
2. 产品方用自然语言描述想收集的数据，例如：
   - “我想知道用户为什么没有完成 onboarding。”
   - “我想收集玩家对这个关卡难度的反馈。”
   - “我想了解用户希望 dashboard 增加哪些指标。”
3. 系统把这个描述转换成一个结构化问卷或表单。
4. 表单可以通过标准方式嵌入其他产品页面。
5. 用户填写后，数据进入本项目后端。
6. 后端定期调用 LLM / Clio-like pipeline 做聚合分析。
7. 项目页面展示结果：主题、典型反馈、数量分布、趋势和可执行建议。

## 4. 推荐技术路线

为了避免前后端分散在不同语言和 codebase 里，建议先用一套 TypeScript + React + Vercel 的全栈方案。

推荐栈：

- Framework: Next.js
- Language: TypeScript
- UI: React + Tailwind CSS
- Database: Supabase / Postgres
- Deployment: Vercel
- LLM API: OpenAI / Anthropic / 其他可替换 provider
- Analysis pipeline: 先自己实现 Clio-like 简化流程，之后再接 OpenClio 或 Python service

OpenClio 的定位：

- Anthropic 原版 Clio 目前不是一个公开可直接调用的 API。
- OpenClio 是开源实现，可以作为后端分析引擎调用。
- Atpio 不需要重新设计 Clio 的分析方法，而是把 OpenClio 包成一个 service / worker。

为什么仍然需要做项目外壳：

- OpenClio 更像分析 pipeline，不负责前端 gadget、产品接入、任务配置、数据收集。
- 它可能依赖本地模型、vLLM、embedding model，部署成本比 MVP 高。
- 所以产品侧仍然要做：数据收集、schema 生成、gadget 嵌入、结果展示。
- 分析侧可以优先直接调用 OpenClio，避免重新实现聚类、摘要和可视化逻辑。

推荐架构：

```text
React / Next.js App
        |
        | create project / collect responses / show dashboard
        v
Next.js API
        |
        | send collected data for analysis
        v
Python OpenClio Worker
        |
        | runClio(...)
        v
OpenClio output files / insight JSON / static report
```

第一版可以先做成：

- Next.js 负责产品界面和数据收集。
- Python worker 负责调用 OpenClio。
- Next.js 只需要触发 worker，并读取 OpenClio 输出结果。

这样 Clio 本身不重写，只写一个很薄的 adapter。

## 5. 系统模块设计

### 5.1 Admin / Creator 页面

给产品方或内部同事使用。

功能：

- 创建一个 data gathering project。
- 输入自然语言 brief。
- 自动生成问卷 schema。
- 预览表单。
- 获取嵌入代码。
- 查看收集结果和分析报告。

核心页面：

- `/projects`
- `/projects/new`
- `/projects/[id]/builder`
- `/projects/[id]/results`

### 5.2 Gadget / Widget 页面

这是要嵌入到其他产品里的用户侧界面。

第一版可以先做两种接入方式：

1. iframe embed
2. script embed

示例：

```html
<script
  src="https://your-domain.com/gadget.js"
  data-project-id="project_xxx">
</script>
```

第一版 gadget 可以很简单：

- 一个浮动按钮
- 点击后打开问卷弹窗
- 用户填写并提交
- 提交成功后显示 thank you 状态

### 5.3 Schema Generator

把自然语言 brief 转成结构化 schema。

输入：

```text
我想知道用户为什么没有完成 onboarding，以及他们卡在哪一步。
```

输出：

```json
{
  "title": "Onboarding Feedback",
  "fields": [
    {
      "id": "dropoff_reason",
      "type": "textarea",
      "label": "你没有完成 onboarding 的主要原因是什么？",
      "required": true
    },
    {
      "id": "stuck_step",
      "type": "select",
      "label": "你卡在哪一步？",
      "options": ["账号设置", "权限授权", "功能理解", "其他"]
    }
  ]
}
```

支持字段类型：

- short text
- long text
- single select
- multi select
- rating
- boolean

### 5.4 Data Collection API

负责接收 gadget 提交的数据。

建议接口：

- `POST /api/projects`
- `POST /api/projects/[id]/generate-schema`
- `GET /api/projects/[id]/schema`
- `POST /api/projects/[id]/responses`
- `POST /api/projects/[id]/analyze`
- `GET /api/projects/[id]/insights`

### 5.5 OpenClio Analysis Adapter

OpenClio 的调用方式大致是：

```python
import openclio as clio
import vllm
from sentence_transformers import SentenceTransformer

data = load_project_responses(project_id)

llm = vllm.LLM(model="Qwen/Qwen3-8B")
embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

clio.runClio(
    facets=clio.genericSummaryFacets,
    llm=llm,
    embeddingModel=embedding_model,
    data=data,
    outputDirectory=f"outputs/{project_id}",
    htmlRoot=f"/clio-results/{project_id}",
)
```

项目里需要写的不是 Clio 算法，而是：

1. 把收集到的表单数据转换成 OpenClio 可接受的 data 格式。
2. 根据不同 project 选择合适的 facets。
3. 调用 `clio.runClio(...)`。
4. 保存 output directory。
5. 把 OpenClio 产出的静态页面或 JSON 嵌入 dashboard。

对于非对话数据，例如表单和问卷反馈，可以先用 `clio.genericSummaryFacets`。如果以后需要更细的分析，再为不同 project 自动生成自定义 facets。

隐私原则：

- dashboard 默认不展示原始用户输入。
- 代表性例子要先做脱敏和摘要。
- 对数量太少的主题不展示，避免单个用户被识别。
- 后续可加入 PII detection / redaction。

## 6. 数据模型草案

### Project

- `id`
- `name`
- `brief`
- `schema`
- `created_at`
- `updated_at`

### Response

- `id`
- `project_id`
- `answers`
- `source_url`
- `user_agent`
- `created_at`

### InsightRun

- `id`
- `project_id`
- `status`
- `input_count`
- `result`
- `created_at`

### Insight Result JSON

```json
{
  "summary": "Most users are blocked by unclear onboarding instructions.",
  "themes": [
    {
      "name": "Confusing onboarding copy",
      "count": 42,
      "percentage": 0.35,
      "examples": [
        "Users said they did not understand what to do after account setup."
      ]
    }
  ],
  "recommendations": [
    "Add a progress indicator to the onboarding flow.",
    "Rewrite the permission explanation screen."
  ]
}
```

## 7. MVP 开发计划

### Phase 0: 项目准备

- 初始化 git 仓库。
- 创建 Next.js + TypeScript 项目。
- 配置 lint / formatting。
- 建立 `docs/` 目录，记录 brief、decision、meeting notes。
- 建立小步提交规则：每新增或修改一个有意义的功能点、文档点、实验点，都 commit 一版。
- commit message 要写清楚这次改了什么，必要时补一句为什么改。
- 避免把多个不相关改动塞进同一个 commit，方便后续 review、回滚和向 mentor 展示过程。
- 全程用 `record-my-work` 或类似文档记录：
  - 需求来源
  - 技术选择
  - 关键决策
  - 遇到的问题
  - 后续 TODO

### Git 工作流规则

这个项目从一开始就要保持清晰的 git 记录。原则是：

1. 每多加一点东西，commit 一版。
2. 每改一个明确 decision，commit 一版。
3. 每完成一个实验或验证，commit 一版。
4. 每次 commit 前先看 `git diff`，确认只包含当前这一步的内容。
5. 每次 commit message 尽量具体，例如：
   - `docs: add OpenClio adapter plan`
   - `feat: add project creation flow`
   - `feat: render dynamic feedback form`
   - `test: add mock host page for gadget embed`
   - `docs: record local OpenClio experiment results`

推荐节奏：

- 文档变化单独 commit。
- UI 页面单独 commit。
- API route 单独 commit。
- worker / OpenClio adapter 单独 commit。
- bug fix 单独 commit。
- 实验结果和 decision log 单独 commit。

### Phase 1: 调研与技术验证

目标：确认最小实现路径。

任务：

- 阅读 Clio 论文，重点理解：
  - 输入数据如何被抽象化
  - 如何做主题聚合
  - 如何减少隐私暴露
  - 输出结果长什么样
- 阅读 OpenClio README，确认它的输入输出和依赖。
- 本地做一个最小实验：
  - 准备 20-50 条 mock feedback。
  - 用 LLM 抽取摘要和主题。
  - 生成聚合 insight JSON。

产出：

- `docs/research-notes.md`
- `docs/local-experiment.md`
- 一个可以跑通的 analysis prototype

### Phase 2: 基础产品闭环

目标：做出从 brief 到问卷再到 response 的完整流程。

任务：

- 创建 project。
- 输入自然语言 brief。
- 调用 LLM 生成 schema。
- 保存 schema。
- 根据 schema 渲染动态表单。
- 提交 response 到数据库。
- 做一个简单 results 页面，先展示原始统计数量。

产出：

- Project builder 页面
- Dynamic form renderer
- Response submission API
- Basic results 页面

### Phase 3: Gadget 接入

目标：让其他产品可以用标准方式接入。

任务：

- 实现 iframe embed。
- 实现简单 `gadget.js`。
- 支持传入 `projectId`。
- 支持浮动按钮 + 弹窗表单。
- 提供一段复制即可使用的 embed code。
- 本地创建一个 mock host page 测试嵌入效果。

产出：

- `/embed/[projectId]`
- `/gadget.js`
- `docs/embed-guide.md`

### Phase 4: 接入 OpenClio 分析

目标：直接调用 OpenClio，让收集到的数据生成 Clio 风格的分析结果。

任务：

- 创建 Python worker。
- 安装并跑通 OpenClio。
- 把项目 responses 转换成 OpenClio data input。
- 使用 `genericSummaryFacets` 跑第一版分析。
- 把 OpenClio output 保存到项目目录或对象存储。
- 在 results dashboard 中嵌入 OpenClio 静态报告，或解析它的 JSON 输出后展示。

产出：

- `POST /api/projects/[id]/analyze`
- `workers/openclio_worker.py`
- OpenClio output viewer
- Basic insight dashboard

### Phase 5: 隐私与质量增强

目标：让项目更像真正的 Clio，而不是普通问卷工具。

任务：

- 添加 PII redaction。
- 小样本主题不展示原文或例子。
- 只展示匿名化代表性摘要。
- 加 prompt guardrails，避免输出敏感个人信息。
- 增加人工可读的 audit log。

产出：

- Privacy checklist
- Safer insight output
- `docs/privacy-notes.md`

## 8. 最小 Demo 标准

一个可展示 demo 应该能做到：

1. 创建一个 project。
2. 输入一句自然语言需求。
3. 自动生成一个表单。
4. 复制 embed code。
5. 在 mock 产品页面里弹出这个表单。
6. 提交几条 mock response。
7. 点击 analyze。
8. dashboard 展示主题分布、摘要和建议。

如果这个闭环跑通，就已经完成了项目最重要的价值验证。

## 9. 后续扩展方向

- 接 OpenClio 作为正式分析 backend。
- 支持多种 gadget 样式。
- 支持 A/B 测试不同问卷。
- 支持按产品、页面、用户 segment 过滤 insights。
- 支持自动生成 follow-up questions。
- 支持定期分析和 Slack / email report。
- 支持更严格的 privacy-preserving pipeline，例如差分隐私、k-anonymity threshold、PII risk scoring。
