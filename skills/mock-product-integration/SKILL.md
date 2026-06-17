# Atpio 示例产品接入指南 / Demo Product Integration Guide

## 中文版本

这份文档给需要把 Atpio 接入自己产品的客户或合作方使用。接入完成后，你的网站或应用里会出现一个反馈入口；普通用户点击后即可填写 Atpio 里的反馈表单，提交的数据会回到对应的 Atpio 项目。

线上下载地址：

```text
https://atpio.vercel.app/resources/mock-product-integration-skill
```

### 推荐方式：跟随项目空间

如果你希望以后在 Atpio 里切换要展示的反馈项目，而不改自己网站的代码，请使用项目空间密钥。

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-atpio-workspace-key="YOUR_WORKSPACE_KEY"
  data-atpio-position="bottom-right"
  data-atpio-label="提交反馈"
></script>
```

使用步骤：

1. 在 Atpio 注册或登录账号。
2. 创建一个反馈项目，并保存。
3. 在项目空间里选择哪个项目用于外部展示。
4. 把上面的代码复制到你的网站或应用里。
5. 普通用户无需登录 Atpio，就可以在你的网站或应用里填写反馈。

如果你还没有手动选择展示项目，Atpio 会默认使用该项目空间里最新保存的项目。

反馈按钮的文字可以在 Atpio 项目详情页的接入设置里修改。如果某个页面需要临时覆盖按钮文字，也可以在脚本里传入 `data-atpio-label`。

### 固定展示某一个项目

如果你希望某个页面永远展示同一个 Atpio 项目，可以使用固定项目编号。

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-project-id="YOUR_PROJECT_ID"
  data-atpio-position="bottom-right"
  data-atpio-label="提交反馈"
></script>
```

### 附加信息

你可以把页面、用户分组、实验编号等上下文一起写入每条反馈，方便之后分析。

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-atpio-workspace-key="YOUR_WORKSPACE_KEY"
  data-atpio-meta-page="价格页"
  data-atpio-meta-user-segment="试用用户"
  data-atpio-meta-experiment-id="新手引导第二版"
></script>
```

### 事件通知

如果你的网站需要知道用户什么时候打开、关闭或成功提交反馈，可以监听这些事件。

```js
window.addEventListener("atpio:open", function (event) {
  console.log("Atpio 已打开", event.detail);
});

window.addEventListener("atpio:close", function (event) {
  console.log("Atpio 已关闭", event.detail);
});

window.addEventListener("atpio:success", function (event) {
  console.log("Atpio 已提交", event.detail);
});
```

### 本地测试

1. 启动 Atpio：`http://127.0.0.1:3000`。
2. 启动示例产品：`http://127.0.0.1:4000`。
3. 用 `?workspaceKey=YOUR_WORKSPACE_KEY` 打开示例产品。
4. 确认页面上出现反馈按钮，并且点击后能打开 Atpio 表单。
5. 提交一次反馈，确认数据出现在 Atpio 项目里。

## English Version

Use this guide to install an Atpio feedback gadget in your website or product. After integration, your product shows a feedback entry point. Public users can submit feedback without signing in, and responses are saved to the matching Atpio project.

Downloadable guide:

```text
https://atpio.vercel.app/resources/mock-product-integration-skill
```

### Recommended: workspace embed

Use a workspace key when you want the host product to follow whichever project is marked active inside Atpio.

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-atpio-workspace-key="YOUR_WORKSPACE_KEY"
  data-atpio-position="bottom-right"
  data-atpio-label="Give feedback"
></script>
```

How it works:

1. Register or sign in to Atpio.
2. Create and save a feedback project.
3. Choose which project should appear in external products.
4. Copy the script into your website or app.
5. Public users submit feedback without signing in to Atpio.

If no active project is selected, Atpio loads the newest project in that workspace.

The feedback button label can be edited in the Atpio project detail page. For a page-specific override, pass `data-atpio-label` in the script.

### Fixed project embed

Use this when the host product should always load one specific Atpio project.

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-project-id="YOUR_PROJECT_ID"
  data-atpio-position="bottom-right"
  data-atpio-label="Give feedback"
></script>
```

### Metadata

Attach page, user segment, experiment, or other host-product context to every submitted response.

```html
<script
  src="https://atpio.vercel.app/gadget.js"
  data-atpio-workspace-key="YOUR_WORKSPACE_KEY"
  data-atpio-meta-page="pricing"
  data-atpio-meta-user-segment="trial"
  data-atpio-meta-experiment-id="onboarding-v2"
></script>
```

### Events

```js
window.addEventListener("atpio:open", function (event) {
  console.log("Atpio opened", event.detail);
});

window.addEventListener("atpio:close", function (event) {
  console.log("Atpio closed", event.detail);
});

window.addEventListener("atpio:success", function (event) {
  console.log("Atpio submitted", event.detail);
});
```

### Local test

1. Start Atpio on `http://127.0.0.1:3000`.
2. Start the demo product on `http://127.0.0.1:4000`.
3. Open the demo product with `?workspaceKey=YOUR_WORKSPACE_KEY`.
4. Confirm the feedback button opens the Atpio form.
5. Submit feedback and confirm the response appears in Atpio.
