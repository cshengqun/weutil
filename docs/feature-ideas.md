# WeUtil 功能探索记录

> 本文档由「每日功能探索」任务按日追加，记录 WeUtil 还需要支持哪些功能。
> WeUtil 的目标：面向所有 Builder（程序员、产品经理、设计师、独立开发者、运营、内容创作者、创业者）的通用免费在线工具站。
> 技术约束：纯静态 HTML/CSS/JS，无框架、无构建、零依赖，浏览器端本地运行；Vercel 部署，`api/` 可放 serverless 函数。

---

## 2026-09-26

### 一、现状盘点

| 页面 | 已有能力 |
|---|---|
| JSON Lab (`json.html`) | 格式化/压缩、语法校验（定位错误行）、key 递归排序、树视图（展开/折叠/搜索）、字段详情面板、双版本 diff（支持嵌套 JSON 字符串细粒度 diff）、嵌套 JSON 字符串解包、复制值/JSONPath、下载、输入恢复、明暗主题 |
| Epoch Lab (`timestamp.html`) | 时间戳↔日期双向转换、s/ms/µs/ns 自动精度识别、本地/UTC、ISO 8601/RFC 2822 输出、相对时间、实时时钟、IANA 全时区输出 |
| HTTP Client (`http.html`) | GET/POST/PUT/DELETE、自定义 headers/body、cURL 导入（含 `-b/--cookie`）、请求历史、响应复制、响应 JSON 树视图/格式化视图；经 `api/proxy.js` 转发解决 CORS（SSRF 防护、15s 超时、10MB 上限） |
| Feedback (`feedback.html`) | Formspree 提交，支持 bug / feature / general / other 四类 |

git 历史显示团队偏好：频繁打磨单工具细节、坚持干净的全屏工具 UI（曾 revert SEO 内容区块）、移除了 sponsor 页面。本次为首期探索，无历史建议。

### 二、新功能建议（8 个）

汇总：

| # | 功能 | 主要目标用户 | 技术可行性 | 优先级 |
|---|---|---|---|---|
| 1 | ✅ QR Code Studio（2026-09-26 已上线 qrcode.html） | 全 Builder（运营/PM/程序员） | 纯前端 | ✅ 已落地 |
| 2 | Image Toolkit 图片压缩/转换/缩放 | 设计师/运营/创作者/学生 | 纯前端（Canvas） | **高** |
| 3 | Encoder Lab 编解码工作台 | 程序员（Base64 图片部分面向所有人） | 纯前端（Web API） | **高** |
| 4 | Generator Lab 生成器（UUID/Hash/密码） | 程序员 | 纯前端（Web Crypto） | **高** |
| 5 | Regex Tester 正则测试器 | 程序员/数据/运营（文本清洗） | 纯前端 | 中 |
| 6 | PDF Toolkit 合并/拆分/图片互转 | PM/学生/行政/全 Builder | 纯前端（pdf-lib/pdf.js） | 中 |
| 7 | Converter Lab（YAML↔JSON、进制转换） | 程序员 | 纯前端（内嵌小型解析库） | 中 |
| 8 | Cron Parser 定时表达式解析 | 程序员/运维 | 纯前端，与 Epoch Lab 协同 | 低 |

#### 1. ✅ QR Code Studio（二维码生成器）— 高 · 2026-09-26 已落地
- **目标用户与场景**：运营/营销生成活动码、WiFi 码；PM/创业者生成名片码（vCard）；程序员调试扫码登录/支付链路；小商家生成 WhatsApp 码。
- **核心能力**：支持 URL/纯文本/vCard/WiFi/邮件/电话等内容类型；容错等级、尺寸、前景/背景色、Logo 嵌入；批量生成；PNG/SVG 导出。
- **技术可行性**：纯前端。可内嵌一份压缩版 qrcode 生成库（无依赖风格一致），SVG 输出零成本。
- **参考产品**：Toolxa、Tooleem、qr-code 类工具（均为 2026 年 Product Hunt 在榜品类）。
- **理由**：全 Builder 通用、搜索量高、与现有工具零重叠、开发量小，是扩圈到非程序员的第一块跳板。

#### 2. Image Toolkit（图片压缩 / 格式转换 / 缩放）— 高
- **目标用户与场景**：创作者上传社媒前压缩；设计师批量转 WebP；运营调整头图尺寸；学生转换 HEIC 照片。
- **核心能力**：JPG/PNG/WebP 互转、质量调节的压缩、按像素/比例缩放、裁剪、批量处理、打包下载；显示压缩前后体积对比。
- **技术可行性**：纯前端 Canvas `drawImage` + `canvas.toBlob`，文件不离开设备；HEIC 解码依赖较新浏览器能力，可作为渐进增强。
- **参考产品**：PixelTools（86 个图片/PDF 工具）、TinyWow、Squoosh。
- **理由**：非程序员最高频的工具需求之一，"100% 浏览器处理、文件不上传"是 2026 年工具站最有效的隐私卖点，且是天然的大流量入口。

#### 3. Encoder Lab（编解码工作台）— 高
- **目标用户与场景**：程序员调试 token、URL 参数、HTML 实体；任何用户需要把图片转 Base64 内嵌到 CSS/邮件。
- **核心能力**：Base64 文本/图片编解码、URL 编解码、HTML entity 编解码、JWT 解码（展示 header/payload、过期时间校验）；同一输入多格式并列输出。
- **技术可行性**：纯前端。`atob/btoa`、`encodeURIComponent`、JWT 仅需 Base64URL 解析；无需 serverless。
- **参考产品**：it-tools、DevToys、jwt.io。
- **理由**：it-tools/DevToys 工具榜中编码类占比最高、开发量最小；JWT 解码是程序员几乎每周必用的刚需，可快速补齐"工具站"心智。

#### 4. Generator Lab（UUID / Hash / 密码生成器）— 高
- **目标用户与场景**：程序员造测试数据、生成密钥/追踪 ID；任何用户生成强密码。
- **核心能力**：UUID v4 批量生成与复制；ULID；MD5/SHA-1/SHA-256/SHA-512 哈希（文本与文件）；密码生成器（长度、字符集、批量、熵值指示）。
- **技术可行性**：纯前端。SHA 系列用原生 Web Crypto API（`crypto.subtle`）；MD5 需内嵌约几十行实现；UUID 用 `crypto.randomUUID()`。
- **参考产品**：it-tools Crypto 分类、DevToys Generators。
- **理由**：与建议 3 同为"低成本高刚需"组合，一个页面聚合三类生成器，可在极短时间内上线。

#### 5. Regex Tester（正则测试器）— 中
- **目标用户与场景**：程序员写校验/提取规则；运营/数据岗从大段文本中批量提取手机号、订单号；支持正则替换。
- **核心能力**：匹配高亮、分组展示、替换预览、常用标志位切换、常用正则速查表（邮箱/手机号/IP/URL）、 cheatsheet。
- **技术可行性**：纯前端原生 `RegExp`，注意超时防护（长文本灾难性回溯需提示）。
- **参考产品**：regex101.com、regexr.com。
- **理由**：搜索量大、使用粘性强；运营场景让它超出纯程序员范围。优先级中是因为 regex101 等竞品极强，需要靠"零广告、加载快、隐私"差异化。

#### 6. PDF Toolkit（合并 / 拆分 / 图片↔PDF）— 中
- **目标用户与场景**：PM 合并多份方案；学生整理扫描件；行政把图片收据转 PDF；任何人发邮件前压缩 PDF。
- **核心能力**：多 PDF 合并（可拖拽排序）、按页范围拆分/提取、图片打包转 PDF、PDF 转图片；全部本地完成。
- **技术可行性**：纯前端。合并/拆分/图片转 PDF 用内嵌 pdf-lib；PDF 转图片用 pdf.js；"压缩 PDF"在纯前端较难（可做简单重压缩或后置）。
- **参考产品**：iLovePDF、Smallpdf、PixelTools、PDF24。
- **理由**：非程序员流量最大的品类之一，但功能复杂度和库体积高于图片工具，建议在 Image Toolkit 之后做，复用其文件处理与下载交互。

#### 7. Converter Lab（YAML↔JSON、数字进制转换）— 中
- **目标用户与场景**：程序员处理配置文件、调试协议字段；进制转换用于位运算/颜色值/硬件调试。
- **核心能力**：JSON↔YAML 双向转换（保留错误定位）、二/八/十/十六进制互转、颜色 HEX/RGB 互转可顺带纳入。
- **技术可行性**：纯前端。进制转换为原生 `toString(radix)`；YAML 需内嵌一份精简 js-yaml 解析器（与零依赖原则有出入，需评估库体积，或独立为单页按需加载）。
- **参考产品**：DevToys Converters、it-tools。
- **理由**：DevToys 上 YAML 转换是排名第一的转换器；开发量小，可与 Encoder Lab 同期规划。

#### 8. Cron Parser（Cron 表达式解析器）— 低
- **目标用户与场景**：程序员/运维编写和验证定时任务表达式，查看未来若干次执行时间。
- **核心能力**：标准 5/6 段 cron 解析、未来 10 次执行时间预览（含时区）、人类语言描述、常用表达式模板。
- **技术可行性**：纯前端；时区能力可直接复用 Epoch Lab 的 IANA 时区数据与逻辑。
- **参考产品**：crontab.guru、DevToys Cron Parser。
- **理由**：受众较窄（程序员/运维），但与 Epoch Lab 协同明显、开发简单，适合作为 Epoch Lab 的增强页或附属 tab。

### 三、现有工具增强建议

1. **首页升级为工具目录导航**（基础设施，建议随第 3/4 个工具上线同步做）：工具数量即将超过单页可承载范围，首页需要分类卡片、搜索、最近使用；保留干净无营销区块的风格。
2. **JSON Lab**：
   - JSONPath 在线测试（目前只能复制 path，不能验证/批量提取）；
   - JSON → CSV / Markdown 表格导出（PM、数据分析场景，t00lz 等站点的热门功能）；
   - JSON → 假数据/JSON Schema 生成（AI 时代造测试数据需求上升）。
3. **Epoch Lab**：增加日期差/倒计时计算（项目排期、天数/年龄计算，非程序员也高频）；Cron Parser 可作为其扩展。
4. **HTTP Client**：支持导出为 cURL（目前只能导入）；请求集合的导入导出；WebSocket 测试可作为后续差异化方向。
5. **PWA 化**：加 Service Worker 支持离线使用与"添加到桌面"，契合工具站定位，也是 DevToys 类离线工具的核心卖点。

### 四、趋势与新视角

- **Local-first / 隐私是 2026 工具站第一卖点**：PixelTools、ToolPkg、Tooleem 等新站点均以"100% browser-based, files never leave your device"为主标语——这与 WeUtil 纯静态技术栈天然契合，建议在每个文件类工具页明确展示本地处理标识。
- **工具站的"流量品 + 留存品"组合**：图片/PDF/二维码类工具搜索量大、能带来非程序员流量；编码/生成/JSON 类工具频次高、构成程序员留存基本盘。WeUtil 目前只有留存品，缺少拉新品。
- **AI 带来的新工具位**：Prompt Builder（结构化 prompt 编辑 + 模板 + token 计数）、Image→Prompt（图片反推 Midjourney/SD 提示词）在 2026 年上新密集，Builder 群体需求明确，可作为下一期重点验证方向。
- **小商家/自由职业场景**：VAT 计算器、WhatsApp 链接生成器等在 Tooleem 等产品中表现突出，是"通用 Builder"定位下可低成本覆盖的长尾。

### 五、待验证

- 内嵌第三方库（pdf-lib、js-yaml、qrcode）与项目"零依赖"原则的边界：建议统一采用"源码内嵌到单页、无 npm/构建"的方式保持架构一致。
- Formspree 中的实际用户反馈内容（需登录 Formspree 后台查看），下一次探索前建议人工导出一次高频需求。

---

## 2026-09-28

### 一、现状盘点

| 状态 | 内容 |
|---|---|
| 已上线（main） | JSON Lab、Epoch Lab、HTTP Client（+api/proxy.js）、QR Code Studio、Feedback |
| 已开发待推送 | **Trend Radar**（`trends.html` + `api/trends.js`）：聚合 GitHub Trending、Hacker News、Lobsters、Hugging Face、arXiv 五个源；`vercel.json` 已配每日 UTC 0:00（北京 8:00）cron 预热，API 带 24h CDN 缓存 |
| 定位变更 | 站点定位从"泛 Builder 工具站"收窄为 **OPC（One Person Company，一人公司）工具站** |
| 用户反馈 | feedback 走 Formspree，后台内容本次未读取 |

历史 8 个建议中 #1 QR Code 已落地；#2-8（Image/Encoder/Generator/Regex/PDF/Converter/Cron）仍在候选池，本次不重复展开，只新增方向。

### 二、新功能建议（6 个）

汇总：

| # | 功能 | OPC 场景 | 技术可行性 | 优先级 |
|---|---|---|---|---|
| 9 | Favicon & App Icon Studio | 产品上线前生成全套图标 | 纯前端（Canvas + ICO 编码） | **高** |
| 10 | OG Image Studio | 博客/产品社交分享图 | 纯前端（Canvas） | **高** |
| 11 | Meta Tags Preview & Debugger | 上线前检查各平台分享卡片 | 需 api serverless 抓取 | **中高** |
| 12 | Markdown Studio | 写 README / 博客 / 文档 | 纯前端（内嵌 MD 解析） | 中 |
| 13 | UTM Link Builder | 渠道投放链接追踪 | 纯前端，与 QR Code 协同 | 中 |
| 14 | Stripe Fee & MRR Calculator | 定价与收入测算 | 纯前端 | 中低 |

#### 9. Favicon & App Icon Studio — 高
- **场景**：indie hacker 产品上线前，一张 logo 要产出 favicon.ico、16/32 PNG、apple-touch-icon 180、PWA 192/512（含 maskable）、site.webmanifest，通常要开 3 个网站凑齐。
- **核心能力**：上传/绘制单图 → 自动裁切缩放全套尺寸；emoji/文字作为图标源；ICO 多分辨率打包；ZIP 打包下载 + 复制 HTML 引入片段；PWA maskable 安全区预览。
- **技术可行性**：纯前端 Canvas；ICO 格式手写编码器（BMP/PNG 条目，约 100 行）；ZIP 可用极简 store 打包或内嵌小型 zip 实现。
- **参考产品**：favicon.run、favicon.io、Free Icon Generator（PH 2026）、LogoFast。
- **理由**：2026 年该品类在 PH 和工具站密集上新，需求被反复验证；全部竞品都主打 client-side，与 WeUtil 栈完全一致；和 QR Code 同属"发产品前必做"的高意图场景，SEO 关键词明确。

#### 10. OG Image Studio（社交分享图生成器）— 高
- **场景**：发博客、上 PH、发推前需要 1200×630 分享图；不会设计、不想开 Figma。
- **核心能力**：模板库（标题+副标题+品牌名+logo+网址）、渐变/纯色/网格背景、多尺寸（OG 1200×630、X 1600×900、小红书/LinkedIn）、字体大小与对齐调节、PNG 下载、按 URL 参数自动填充（可配合博客链接动态生成）。
- **技术可行性**：纯前端 Canvas 文字排版（注意 CJK 换行与字体加载），logo 复用 QR Code 的上传逻辑。
- **参考产品**：LogoFast OG、og-image 类 Vercel 模板、Cloudinary OG。
- **理由**：与 #9 构成"上线视觉资产两件套"，开发模式高度复用；indie hacker 每篇内容都需要，使用频次高。

#### 11. Meta Tags Preview & Debugger — 中高
- **场景**：上线前输入 URL，检查 Google 搜索摘要、Facebook/Twitter/LinkedIn/微信分享卡片长什么样、缺哪些标签。
- **核心能力**：serverless 抓取目标 HTML，解析 title/description/canonical/OG/Twitter Card/JSON-LD；按平台渲染分享卡片预览；问题清单（标签缺失、图片尺寸不符、描述超长截断提示）；一键复制修复用 meta 片段。
- **技术可行性**：需 api serverless（复用 proxy.js 的 SSRF 防护与超时）；HTML 解析手写正则即可。
- **参考产品**：metatags.io、opengraph.xyz、heymeta。
- **理由**：把 #9/#10 产出的资产"验收闭环"，三个工具互相导流；搜索量稳定，且竞品普遍广告多、体验旧。

#### 12. Markdown Studio — 中
- **场景**：写 README、博客、文档；MD ↔ HTML 互转、表格处理。
- **核心能力**：左右分栏实时预览、GitHub 风格 MD 解析、MD→HTML、HTML→MD、MD 表格 ↔ CSV/JSON、目录(TOC)生成、字数统计、复制/下载。
- **技术可行性**：纯前端，内嵌一份精简 MD 解析器（marked 风格，源码内嵌单页）。
- **参考产品**：stackedit、dillinger、it-tools Markdown。
- **理由**：OPC 写 README 和 newsletter 几乎每天发生；可顺带承接历史建议中 JSON→Markdown 表格导出的需求。

#### 13. UTM Link Builder — 中
- **场景**：一个人做增长，给不同渠道（邮件/推特/合作链接）加 UTM 参数并追踪。
- **核心能力**：表单式 utm_source/medium/campaign/term/content、实时链接预览、短链参数校验、历史记录、批量生成；可一键跳转 QR Code 把链接变成二维码。
- **技术可行性**：纯前端 URL 拼接。
- **参考产品**：ga-dev-tools Campaign Builder、utm.io。
- **理由**：开发量极小，与 QR Code、Trend Radar 形成"链接三件套"互链；是获客环节的基础工具。

#### 14. Stripe Fee & MRR/ARR Calculator — 中低
- **场景**：定价时算 Stripe/PayPal 实际到账、MRR↔ARR、需要多少客户达到目标月收入。
- **核心能力**：多费率档位（Stripe 国际/国内支付）、MRR/ARR/ARPU 换算、目标倒推（目标 MRR ÷ 客单价 = 客户数）、分享结果链接。
- **技术可行性**：纯前端计算。
- **参考产品**：stripe.com/fees 计算器、baremetrics 计算器。
- **理由**：单页小工具、搜索意图明确；作为"收钱环节"补位，优先级低于上线资产类。

### 三、现有工具增强建议

1. **首页工具目录化（优先级提高）**：上线 Trend Radar 后共 6 个工具，#9/#10 落地后将达 8 个，首页需要分组（Dev / Launch / Growth / Ops）、搜索框、最近使用——建议在第 8 个工具上线时同步做。
2. **Trend Radar 后续**：① 推送上线；② AI 中文早报（需 LLM API，可在 cron 预热链路里加一步生成，结果随 JSON 返回）；③ 加 Product Hunt/YouTube 源（用户配置 env token 后启用）。
3. **QR Code Studio**：与 #13 UTM Builder 联动（UTM 链接一键生成二维码）；加批量生成入口。
4. **JSON Lab**：JSON→CSV/Markdown 导出仍建议优先（可与 #12 Markdown Studio 共用表格转换逻辑）。
5. **PWA 化**：#9 产出的 manifest/图标正好可以直接用于 WeUtil 自身的 PWA 离线化，两个工作天然合并。

### 四、趋势与新视角

- **"Launch Asset（上线资产）"是 2026 indie hacker 工具最密集的新品类**：favicon、OG image、icon bundle、meta preview 在 PH 上半年内集中出现，且全部以 client-side 为卖点——WeUtil 用 #9-#11 三连切这个方向，工具间可互相导流，形成"上线前工具箱"的组合心智。
- **订阅疲劳催生免费本地整合工具**：PH 新品 SoloPM 的核心叙事就是"一人工作室被 10+ 订阅和 per-seat 定价压垮"——这正是 WeUtil"免费、无账号、本地运行"的结构性机会，建议首页文案强化"$0, no seat, no signup"。
- **SEO 是 OPC 最大的系统性缺口**：多份 2026 stack 复盘都指出 solo founder 普遍不做 SEO，而 GSC/robots/sitemap/meta/OG 这条链全是免费可工具化的环节；#10/#11/#13 都在这条链上。
- **AI agent 内容管线兴起**：research brief → 成稿的 agent 工作流被频繁提及，Trend Radar 的 AI 简报是 WeUtil 切入这个叙事最轻的方式。

### 五、待验证

- ICO 编码器与极简 ZIP 打包在"零依赖"原则下的实现成本（预计各 100-200 行可覆盖）。
- Meta Tags 抓取对 SPA 站点（客户端渲染）无效的边界，需在结果中明确提示。
- Formspree 后台真实用户反馈仍待人工导出，建议本周查看一次。

---

## 2026-09-29

### 一、现状盘点

| 状态 | 内容 |
|---|---|
| 已上线（main） | JSON Lab、Epoch Lab、HTTP Client、QR Code Studio、Trend Radar（9 源 serverless）、Feedback |
| Trend Radar 最新 | GitHub/HN/Lobsters/HF/arXiv/PH/YouTube/X/Google Trends US，全部 serverless，无本机快照依赖 |
| 定时任务 | 本机趋势采集 cron 已删除；功能探索 cron 已改为每天 9:00（Asia/Shanghai） |
| 待验收 | Product Hunt + YouTube token 已配 Vercel，线上渲染效果待确认 |

历史建议 #1-#14 均未落地新工具（#1 QR Code 已上线）。本次不重复展开 #2-#14，只新增方向。

### 二、新功能建议（6 个）

汇总：

| # | 功能 | OPC 场景 | 技术可行性 | 优先级 |
|---|---|---|---|---|
| 15 | Prompt Studio（AI Prompt 构建器 + Token 计数器） | 写 AI prompt、调 token | 纯前端（WASM tokenizer） | **高** |
| 16 | Sitemap & Robots.txt Studio | SEO 上线前必备 | 纯前端 + serverless 验证 | **中高** |
| 17 | Launch Checklist（产品上线检查清单） | 发产品前不遗漏 | 纯前端交互 checklist | 中 |
| 18 | Email Subject Line Analyzer | Newsletter/邮件获客 | 纯前端 | 中 |
| 19 | Fake Data Generator（JSON Schema → 假数据） | 造测试数据/Mock API | 纯前端 | 中 |
| 20 | Color Palette Generator | Landing page 配色 | 纯前端 Canvas | 中低 |

#### 15. Prompt Studio（AI Prompt 构建器 + Token 计数器）— 高
- **场景**：OPC 每天用 Claude/ChatGPT/Cursor 写 prompt，需要结构化管理变量、估算 token 消耗、复用模板。
- **核心能力**：结构化 prompt 编辑（system/user/assistant 分栏）、变量插入（{{name}}）、实时 token 计数（内嵌 tiktoken WASM 或 GPT-style 估算）、prompt 模板库（代码审查/写作/翻译/总结）、保存到 localStorage、复制为 API 调用格式。
- **技术可行性**：纯前端。token 计数可用轻量估算（~4 chars/token）或内嵌 tiktoken WASM（~500KB，按需加载）。
- **参考产品**：PromptPerfect、PromptBuilder、LangChain Hub 编辑器。
- **理由**：2026 年 AI coding agent（Lovable/Bolt/Cursor/Claude Code）主导 Builder 工作流，prompt 是新的"源代码"；每个 Builder 每天写 prompt 但没有好的本地工具；纯前端运行契合隐私卖点。

#### 16. Sitemap & Robots.txt Studio — 中高
- **场景**：产品上线前配 SEO，一个人不会写 sitemap.xml 格式，也不知道 robots.txt 该怎么写。
- **核心能力**：输入域名/URL 列表 → 自动生成标准 sitemap.xml（含 lastmod/changefreq/priority）；robots.txt 可视化编辑器（Allow/Disallow 规则、Sitemap 声明、常见爬虫预设）；serverless 一键检查线上 robots.txt 是否 block 了搜索引擎；下载 .xml/.txt 文件。
- **技术可行性**：纯前端生成；检查功能复用 api/proxy.js 抓取目标站点 robots.txt。
- **参考产品**：xml-sitemaps.com、robots.txt generator 类工具。
- **理由**：SEO 是 OPC 最大系统性缺口（多份 2026 stack 复盘确认）；和 #11 Meta Tags Preview、#13 UTM Builder 构成 SEO 三件套；开发量小。

#### 17. Launch Checklist（产品上线检查清单）— 中
- **场景**：一个人发产品，容易漏掉关键项——analytics 没装、隐私政策页没有、OG image 没配、邮件列表没接。
- **核心能力**：交互式 checklist 按工作流分组（Pre-launch → Launch → Post-launch），每组含具体检查项（如"GA4/Plausible 已装"、"OG image 已生成"、"Stripe webhook 已配置"、"隐私政策页存在"）；进度条；本地保存勾选状态；可打印/导出 PDF。
- **技术可行性**：纯前端，数据写死在 JS 里。
- **参考产品**：Launch Checklist 类网站（e.g. launch checklist for indie hackers）。
- **理由**：OPC 发产品高频场景；和 #9 Favicon、#10 OG Image、#11 Meta Preview、#16 Sitemap 形成"上线前工具箱"导流闭环；开发量极小。

#### 18. Email Subject Line Analyzer — 中
- **场景**：OPC 做 newsletter/邮件营销获客，标题决定打开率，一个人没有 Copy.ai 这类付费工具。
- **核心能力**：输入邮件标题 → 分析长度（最佳 6-10 词）、情感词检测、emoji 建议、数字/符号使用、spam trigger words 检测（"free/guaranteed/act now"等）、A/B 两个标题对比打分。
- **技术可行性**：纯前端词典 + 规则。
- **参考产品**：CoSchedule Headline Analyzer、Subject.com。
- **理由**：Newsletter 是 OPC 核心获客渠道（Beehiiv/Mailchimp）；竞品都是重型 SaaS，纯前端轻量版有差异化；开发量小。

#### 19. Fake Data Generator（JSON Schema → 假数据）— 中
- **场景**：做前端/调试 API 时需要造测试数据；OPC 做 landing form 演示需要假用户数据。
- **核心能力**：输入 JSON 模板（含类型提示 `{{name}}` `{{email}}` `{{date}}` `{{number:1-100}}`），批量生成 N 条假数据；支持姓名/邮箱/电话/日期/URL/UUID/中文姓名；导出 JSON/CSV。
- **技术可行性**：纯前端，内嵌小型 faker 实现（姓名池/邮箱生成器）。
- **参考产品**：Mockaroo、JSON Generator。
- **理由**：和 JSON Lab 天然联动（粘贴假 JSON → 格式化）；AI 时代造 mock 数据需求上升；纯前端隐私卖点。

#### 20. Color Palette Generator — 中低
- **场景**：Builder 做 landing page 不懂配色，需要从一个品牌色生成整套配色方案。
- **核心能力**：输入主色 HEX → 自动生成 5-8 色配色（类比色/互补色/三角色/单色调）；导出 CSS variables、Tailwind config、SVG 色板预览；对比度检查（WCAG AA/AAA）。
- **技术可行性**：纯前端 HSL 色彩数学计算。
- **参考产品**：Coolors、ColorHexa。
- **理由**：和 #10 OG Image、#9 Favicon 同属"视觉资产"链；开发量极小，但竞品强（Coolors 体验很好），优先级中低。

### 三、现有工具增强建议

1. **首页 Trend Radar 卡片描述需更新**：现在有 9 个源（GitHub/HN/Lobsters/HF/arXiv/PH/YouTube/X/Google Trends），首页卡片仍写"aggregates GitHub Trending, Hacker News, Lobsters, Hugging Face and arXiv"——应更新为"9 sources"并补上 PH/YouTube/X/Google Trends。
2. **Trend Radar AI 中文早报**：之前多次提到，可在 Vercel Cron 预热时调一次 LLM API，把当天 top items 总结成一段中文简报，随 API JSON 返回，前端在页面顶部展示。这是 WeUtil 差异化最大的 feature。
3. **JSON Lab**：JSON→CSV 导出仍建议优先（PM/数据分析场景高频）。
4. **全站 PWA 化**：#9 Favicon Studio 落地时正好顺带做 WeUtil 自身的 manifest + Service Worker。

### 四、趋势与新视角

- **AI coding agent 主导 2026 Builder 工作流**：Lovable/Bolt/Cursor/Claude Code 已成 OPC 标配（$20-40/月），Builder 从"写代码"变成"写 prompt + 审代码"——Prompt Studio 是这个转变下的直接工具需求。
- **工具疲劳（tool fatigue）是 OPC 第一痛点**：多份 2026 报告指出 solopreneur 平均用 7+ 工具，订阅成本 $100-300/月——WeUtil"$0, no signup, local-first"的定位正好切这个痛点，建议首页文案强化"stop paying for tools you use once a month"。
- **SEO 仍是 OPC 最大缺口**：多份 stack 复盘确认 solo founder 普遍不做 SEO，而 sitemap/robots/meta/OG/UTM 这条链全是免费可工具化的环节——#16 + #11 + #13 三连切这个方向。
- **Newsletter/email list 是 OPC 核心获客渠道**：Beehiiv/Mailchimp 免费层支撑 2500 订阅者，发产品时"发给已有 list"是第一波启动流量——#18 Email Subject Analyzer 直接服务这个环节。

### 五、待验证

- tiktoken WASM 在 Vercel serverless 冷启动下的体积限制（若纯前端则无此问题，token 计算在浏览器端）。
- Formspree 后台用户反馈仍未查看，建议本周人工导出一次高频需求。
- Trend Radar 线上 Product Hunt/YouTube 卡片渲染效果待用户验收。

---

## 2026-09-30

### 一、现状盘点

| 状态 | 内容 |
|---|---|
| 已上线（main） | JSON Lab、Epoch Lab、HTTP Client、QR Code Studio、Trend Radar（9 源 serverless）、Feedback |
| 自上次探索以来代码变更 | 无新工具上线（最新 commit 为 2026-09-29 的 docs 探索记录） |
| 候选池 | #2-#20 共 19 个建议待排期（#1 QR Code 已落地），本次不重复展开 |
| 用户反馈 | feedback 走 Formspree，后台内容仍未导出查看（连续两期待办） |

### 二、新功能建议（6 个）

汇总：

| # | 功能 | OPC 场景 | 技术可行性 | 优先级 |
|---|---|---|---|---|
| 21 | Legal Pages Studio（隐私政策/服务条款/Cookie 政策生成器） | SaaS 上线前必备法律页 | 纯前端（向导 + 模板） | **高** |
| 22 | Invoice Generator（发票/账单生成器） | 自由职业/接单收钱 | 纯前端（打印为 PDF） | **中高** |
| 23 | CSV Studio（CSV↔JSON、清洗、去重） | 数据处理、邮件列表清洗 | 纯前端 | 中 |
| 24 | Webhook Inspector（Webhook 调试接收器） | 调试 Stripe/GitHub 等回调 | 需 serverless + KV 存储 | 中 |
| 25 | Changelog Generator（发版日志生成器） | 产品迭代发布 | 需 api serverless（GitHub API） | 中 |
| 26 | README Badge Studio（SVG 徽章生成器） | README 美化、状态展示 | 纯前端（SVG 生成） | 中低 |

#### 21. Legal Pages Studio（隐私政策 / 服务条款 / Cookie 政策生成器）— 高
- **场景**：OPC 把 SaaS 上线到 Stripe 收款阶段，支付商和应用商店都要求隐私政策与服务条款；一个人不会找律师，现有生成器（Termly、PrivacyPolicies.com、GetTerms）要么要邮箱注册、要么免费版缺 GDPR 条款、要么按页收费。
- **核心能力**：表单向导（产品名/网址/收集的数据类型/是否用 Cookie/是否用 Stripe 或 GA/联系方式）→ 生成 Privacy Policy、Terms of Service、Cookie Policy 三份文档；勾选式条款库（GDPR/CCPA 适配声明、分析工具、第三方处理器清单）；HTML / Markdown / 纯文本导出；明确"非法律意见，使用前自行审核"免责声明。
- **技术可行性**：纯前端。条款模板写死在 JS 中按条件拼装，零外部依赖。
- **参考产品**：Termly、GetTerms、PrivacyPolicies.com、PolicyGen（2026-03 登 PH，"答 12 个问题即时生成，免注册"）。
- **理由**：上线收款的强制前置环节，搜索意图极强（"privacy policy generator free"是百万级月搜词）；竞品普遍邮箱门控+付费墙，"免注册、纯本地、可直接复制 HTML"是明确差异化；与 #9 Favicon、#10 OG Image、#16 Sitemap、#17 Launch Checklist 共同构成完整"上线工具箱"。

#### 22. Invoice Generator（发票 / 账单生成器）— 中高
- **场景**：独立开发者接外包、卖 lifetime deal、收咨询费，需要给客户开发票/账单；不想订阅 QuickBooks、FreshBooks。
- **核心能力**：填写发件人/收件人信息、行项目（描述/数量/单价）、税率、币种、发票号与日期；实时预览专业版式发票；浏览器打印为 PDF；localStorage 保存发件人信息与发票编号序列；支持美元/欧元/人民币等多币种。
- **技术可行性**：纯前端 HTML 排版 + `window.print()` 打印样式（@media print），无需 PDF 库。
- **参考产品**：Invoice Simple、Wave Invoice Generator、invoice-generator.com。
- **理由**：补全 OPC 工作流"收钱运营"环节（目前只有 #14 Stripe Fee Calculator 一个点）；搜索量大、纯静态可实现、隐私卖点突出（账单财务数据不上传）；开发量小。

#### 23. CSV Studio（CSV ↔ JSON / 清洗 / 去重）— 中
- **场景**：OPC 从 Plausible/Stripe/Mailchimp 导出 CSV，需要转 JSON 喂脚本、清洗邮件列表（去重、去空行、按列筛选）；运营批量处理数据。
- **核心能力**：CSV↔JSON 双向转换（自定义分隔符、表头识别）、按列去重、空行/空白清理、列筛选与排序、行数统计、大文件分块处理；结果导出 CSV/JSON。
- **技术可行性**：纯前端，注意用流式/分块解析处理 10MB+ 文件，避免页面卡死。
- **参考产品**：ConvertCSV、CyberChef、devlab 的 CSV Cleaner。
- **理由**：DevKitLab、devlab 等同类工具站均把 CSV 工具列为高频品类；与 JSON Lab 互相导流（JSON→CSV 导出在历史增强建议中已被两次提及，本工具直接承接）；非程序员也能用，是拉新流量品。

#### 24. Webhook Inspector（Webhook 调试接收器）— 中
- **场景**：OPC 接入 Stripe 支付回调、GitHub webhook、Contact form 转发时，需要一个临时 URL 查看对方实际发来的 headers 和 payload；本地开发时还要能转发到 localhost。
- **核心能力**：打开页面即获得唯一 URL（如 /api/hook/{id}）；serverless 接收任意 POST/GET 并存储；前端轮询/SSE 实时展示请求列表、headers、query、格式化 body；支持自定义响应状态码与 body（mock 回调）；请求历史保留 24-48 小时。
- **技术可行性**：需 api serverless + 持久化。Vercel 纯函数无状态，需配 Vercel KV（Upstash Redis 免费层）或外部免费 KV；这是本建议与纯静态栈的主要差距，落地前需验证 KV 免费额度与冷启动。
- **参考产品**：webhook.site、RequestBin、Svix Play、Hook0 Play、DevToolLab Webhook Receiver。
- **理由**：2026 年开发者工具站的"标配品类"（DevToolLab 把它列为 Popular 第一位）；与 HTTP Client 形成"发出请求 + 接收回调"的完整调试闭环；但竞品多且强，差异化只能靠"免注册+干净 UI"，且引入首个有状态依赖，建议在纯前端工具铺到 10 个以后再做。

#### 25. Changelog Generator（发版日志生成器）— 中
- **场景**：OPC 频繁发版但懒得手写 changelog；需要从 GitHub 自上次 tag 以来的 commits / PR 自动归类（Features / Fixes / Other）生成 Markdown 发布日志。
- **核心能力**：输入 repo + 两个 tag（或 since 日期），serverless 调 GitHub API 拉 commits/PR；按 conventional commits（feat:/fix:/chore:）自动分组；输出 Keep a Changelog 格式 Markdown，可编辑后复制；可选一键填充 GitHub Release notes。
- **技术可行性**：需 api serverless（复用已有 GITHUB_TOKEN 与 GitHub API 模式）；分组逻辑纯字符串规则。
- **参考产品**：release-prompt、GitHub Auto Release Notes、changelog.md 生成器。
- **理由**：WeUtil 自身就在高频发版，dogfooding 成本低；与 Trend Radar 共用 GitHub API 基建；开发者搜索意图明确。优先级中是因为 conventional commits 不规范时输出质量打折，需要人工编辑兜底。

#### 26. README Badge Studio（SVG 徽章生成器）— 中低
- **场景**：开发者给 README 加"license / version / stars / 自定义状态"徽章；不会写 shields.io URL 参数。
- **核心能力**：表单式选择左右文案、颜色、样式（flat/flat-square/plastic）、logo（简单内置几个）；实时预览；生成 shields.io URL 或纯前端自绘 SVG（无外部依赖）；批量生成。
- **技术可行性**：纯前端 SVG 字符串生成；自绘版本零外部请求，也可默认提供 shields.io 链接。
- **参考产品**：shields.io、badgen.net。
- **理由**：开发量极小、纯静态契合；但 shields.io 本身免费且极成熟，独立价值有限，适合作为 Markdown Studio（#12）或上线工具箱的附属小功能，不建议单独立项做重。

### 三、现有工具增强建议

1. **JSON Lab 增加 JSONPath / jq 求值器**：DevKitLab、devlab 等竞品已把"JSONPath 查询 + jq 过滤 + 匹配计数"作为 JSON 工具的标配功能，WeUtil 目前只能复制 JSONPath 不能执行验证，建议加一个查询输入框，对已粘贴的 JSON 实时求值并高亮匹配节点。
2. **首页 Trend Radar 卡片描述过期**：卡片仍写"Aggregates GitHub Trending, Hacker News, Lobsters, Hugging Face and arXiv"5 个源，实际已 9 个源（+Product Hunt/YouTube/X/Google Trends US），SEO 文案与 features tags 需同步更新。
3. **Trend Radar AI 中文早报**：连续三期提及仍未落地，仍是全站差异化最大的 feature；建议在 Vercel Cron 预热链路中加一步 LLM 总结，随 JSON 返回，前端顶部展示 3-5 句话。
4. **HTTP Client 与 #24 Webhook Inspector 联动**：未来做 webhook 调试时，HTTP Client 可直接把某个请求"发送到我的 hook URL"做回放，形成调试闭环。

### 四、趋势与新视角

- **工具站进入"广度军备竞赛"，WeUtil 不应跟进**：DevToolLab 宣称 500+ 浏览器工具、DevKitLab 40+ 工具终端式聚合——拼数量是纯 SEO 打法，单工具体验普遍粗糙。WeUtil 的机会是"OPC 工作流精选工具箱"：每个工具都做到上线即用、互相导流（上线资产链：Favicon→OG→Meta→Sitemap→Legal Pages→Launch Checklist 已现雏形）。
- **法律页面生成是被付费墙和邮箱门控让出的缺口**：2026 年主流隐私政策生成器全部要求注册或按文档收费，而 PolicyGen 这类"答 12 题免注册即时生成"的新品在 PH 表现良好——与 WeUtil"免注册、本地运行"的定位完全吻合，是本期最高优先级。
- **Webhook 调试已成开发者工具站标配**：webhook.site、RequestBin、Svix Play、Hook0 Play、DevToolLab 五家以上在做，且都主打"打开即得 URL、免注册"；说明需求真实且高频，但也意味着后发者必须靠体验和与其他工具的联动取胜。
- **MCP / Agent 工具链讨论升温**：Simon Willison 等意见领袖在强调 agent 时代的认证隔离、审计日志、MCP 价值；OPC 用 AI agent 干活时需要的配套小工具（如 MCP server 配置生成器、agent prompt 模板）可能是下一个新工具位，建议持续观察 1-2 周再决定是否立项。
- **"Solo SaaS 数字看板"在 Indie Hackers 走热**：Know My SaaS 等产品主打"自动告诉创始人关键数字"，反映一人公司对轻量化运营分析的需求；这类产品本身是 SaaS 不适合静态栈，但其中可工具化的单点（如 MRR 测算 #14、Stripe 费用计算）仍值得逐个覆盖。

### 五、待验证

- Vercel KV（UpStash Redis）免费层的请求额度与数据保留期，决定 #24 Webhook Inspector 是否零成本可行。
- 法律模板的多地区适配深度：GDPR/CCPA 条款模板可自行整理，但需在页面显著位置声明"非法律意见"；首期建议只做英文 + 通用国际版，不做特定国家细分区。
- Formspree 后台用户反馈已连续两期未导出，建议尽快人工查看一次，避免闭门造工具。
