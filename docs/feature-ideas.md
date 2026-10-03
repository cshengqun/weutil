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

---

## 2026-10-01

### 一、现状盘点

| 状态 | 内容 |
|---|---|
| 已上线（main） | JSON Lab、Epoch Lab、HTTP Client、QR Code Studio、Trend Radar（9 源 serverless）、Feedback |
| 自上次探索以来代码变更 | 无新工具上线（最新 commit 为 2026-09-30 的 docs 探索记录 2cbf638） |
| 候选池 | #2-#26 共 25 个建议待排期（#1 QR Code 已落地），本次不重复展开 |
| 用户反馈 | Formspree 后台内容连续三期未导出，已成为持续性待办 |

### 二、新功能建议（5 个）

汇总：

| # | 功能 | OPC 场景 | 技术可行性 | 优先级 |
|---|---|---|---|---|
| 27 | Email Auth Record Studio（SPF/DKIM/DMARC/BIMI 记录生成器） | Newsletter 发信防进垃圾箱 | 纯前端（DNS TXT 记录拼装） | **高** |
| 28 | LLM API Cost Calculator（大模型调用成本计算器） | 给 AI 功能定价、控成本 | 纯前端（价格表 + 公式） | **中高** |
| 29 | Cookie Consent Banner Generator（Cookie 同意横幅生成器） | 上线合规、配合隐私政策 | 纯前端（生成 vanilla JS 片段） | **中高** |
| 30 | Security Headers & CSP Studio（安全响应头/CSP 生成器） | 站点安全加固、安全评分 | 纯前端（输出 vercel.json 等配置） | 中 |
| 31 | llms.txt Studio（AI 可读站点说明生成器） | AI 搜索时代的"新 SEO" | 纯前端（Markdown 拼装） | 中 |

#### 27. Email Auth Record Studio（SPF / DKIM / DMARC / BIMI 记录生成器）— 高
- **场景**：OPC 用 Resend/Postmark/Mailgun 给订阅用户发 newsletter，Google/Yahoo 自 2024 年起强制批量发件人（每天 >5000 封）配置 SPF/DKIM/DMARC，否则直接进垃圾箱或被拒；一个人看着 DNS 后台的 TXT 记录一脸懵，不知道 p=none/quarantine/reject 怎么渐进切换。
- **核心能力**：分步向导——① 输入域名 + 发信服务商（预设 Resend/Postmark/Mailgun/SendGrid/Beehiiv 的 include 片段）生成 SPF 记录（含 10 次 DNS 查询上限检测）；② DKIM 记录表单（selector + 公钥粘贴，校验格式）；③ DMARC 记录可视化构建（p/rua/ruf/pct/adkim/aspf 每个 tag 带解释，提供 none→quarantine→reject 的 90 天渐进路线建议）；④ 可选 BIMI（品牌 Logo 邮件头像）记录；输出"主机记录/记录类型/记录值"三列表，直接照填 Cloudflare/Vercel DNS。
- **技术可行性**：纯前端字符串拼装，零依赖。验证功能（查域名实际记录）可选做 serverless DNS-over-HTTPS 查询，首期不做。
- **参考产品**：EasyDMARC、MXToolbox DMARC Generator、SmartReach 免费生成器。
- **理由**：newsletter 是 OPC 核心获客渠道（#18 邮件标题分析、#22 发票都在这条链上），而 DNS 记录配置是发信链路中最容易翻车、搜索意图极强的一环；2026 年 Google/Microsoft 进一步收紧，需求只增不减；纯前端、开发量小、与 #16 Sitemap Studio 同属"上线配置类"工具家族。

#### 28. LLM API Cost Calculator（大模型调用成本计算器）— 中高
- **场景**：OPC 给产品加 AI 功能（或用 API 批量跑内容），需要在 OpenAI / Claude / Gemini 多个模型间算账："每天 1000 个用户、每人 2000 input + 800 output tokens，一个月多少钱？缓存命中能省多少？"；#15 Prompt Studio 解决"写"，本工具解决"算钱"。
- **核心能力**：模型选择器（内置主流模型 input/output/cached 价格表，按厂商分组）；输入预估 tokens、输出 tokens、日活/月请求量、缓存命中率；实时算单次成本、日成本、月成本；多模型并排对比（同一用量下 GPT vs Claude vs Gemini 差价）；盈亏平衡提示（"你的 $9/月订阅需要每用户每天 <X 次调用才不亏"）。
- **技术可行性**：纯前端。价格表写死在 JS 中，需在页面标注价格更新日期并建立每月人工核对机制（模型调价频繁，这是主要维护成本）。
- **参考产品**：tokencalculator.app、ai-toolbox.co token counter、各家官方 pricing calculator。
- **理由**：2026 年 OPC 产品几乎都嵌 AI，定价前必须算清单位经济模型，这是"收钱运营"环节的新刚需；与 #15 Prompt Studio 天然联动（prompt 页直接显示这段 prompt 的调用成本）；竞品多为单模型计算器，多厂商对比 + 盈亏平衡视角有差异化。

#### 29. Cookie Consent Banner Generator（Cookie 同意横幅生成器）— 中高
- **场景**：OPC 站点加了 Plausible/GA、广告像素或 Stripe，面向欧洲用户就需要 Cookie 同意横幅；CookieYes/Termly 免费层有页面浏览量上限且带品牌水印，独立站主要么手写 JS 要么付费。
- **核心能力**：表单配置横幅文案、位置（顶部/底部）、按钮（Accept/Reject/Preferences）、配色（与 #20 配色工具呼应）、语言；生成一段 <10KB 无依赖 vanilla JS（同意前阻止非必要脚本、localStorage 记录选择、可选简单偏好中心）；实时预览；一键复制。与 #21 Legal Pages Studio 互相跳转（横幅页脚链接到生成的 Cookie Policy）。
- **技术可行性**：纯前端代码生成器，生成的 JS 也是零依赖的，符合 WeUtil 自身技术哲学。
- **参考产品**：CookieYes、Termly、PieEye、policygen.dev（开源，<10KB + preference center）、cookiebannergenerator.com。
- **理由**：与 #21 法律页面是同一合规工作流的两半（政策文本 + 前端横幅），建议作为"合规套件"前后脚落地；竞品免费层普遍带水印/限额，"生成自有代码、无水印、无浏览量上限"是明确卖点；policygen.dev 已验证"开源 + 免注册"路线成立。

#### 30. Security Headers & CSP Studio（安全响应头 / CSP 生成器）— 中
- **场景**：OPC 上线后想在 securityheaders.com 拿 A+ 评分、通过安全扫描，但不懂 CSP 指令；尤其 WeUtil 这类纯静态 + Vercel 部署，需要知道配置写在 vercel.json 的 headers 字段里。
- **核心能力**：可视化勾选 HSTS、X-Content-Type-Options、X-Frame-Options、Referrer-Policy、Permissions-Policy；CSP 构建器（script-src/style-src/img-src/connect-src 等指令 + 域名白名单 chips + nonce/hash 辅助，unsafe-inline/unsafe-eval 风险警告 + 安全评分）；输出多平台配置：vercel.json headers、Netlify _headers、Nginx、Apache、Cloudflare；Report-Only 模式建议。
- **技术可行性**：纯前端。可选 serverless 抓取目标站现有响应头做检测（复用 api/proxy.js），首期只做生成不做检测。
- **参考产品**：ZeroTool CSP Generator、DevBolt Security Headers、securityheaders.com、ScanSuite。
- **理由**：同类工具站已把它列为标配品类（ZeroTool 主打 100% client-side），需求验证充分；"直接输出 vercel.json 片段"对 Vercel 用户群体（WeUtil 自身用户画像高度重合）是差异化；WeUtil 自己也能 dogfood；开发量中等（CSP 校验逻辑是主要工作量）。

#### 31. llms.txt Studio（AI 可读站点说明生成器）— 中
- **场景**：2026 年 AI 搜索（ChatGPT search、Perplexity、Claude）带来新流量入口，llms.txt 被称为"AI 时代的 robots.txt"——放在站点根目录，告诉 AI agent 这个站是做什么的、哪些页面最重要；2026 年 5 月 Chrome Lighthouse 新增 Agentic Browsing 审计项检查它，而 top 1000 网站仅 0.3% 部署，存在早期红利。
- **核心能力**：表单填写站点名/简介/主要链接（标题 + URL + 描述列表，可增删拖拽排序）/可选 llms-full.txt；按 llmstxt.org v2 规范生成 Markdown；实时预览 + 校验（H1 标题、引用块摘要、链接列表格式）；顺带生成 HTML `<link rel="describedby">` 标签；下载 llms.txt。
- **技术可行性**：纯前端 Markdown 模板拼装，零依赖。
- **参考产品**：mintlify、brandcited.ai、mindtrixai、Firecrawl 的 llms.txt generator。
- **理由**：与 #16 Sitemap/Robots Studio 是同一工作流（"给爬虫看的文件"家族），建议后者落地时直接把 llms.txt 作为第三个 tab；AI 搜索优化（GEO/AEO）是 2026 年 SEO 内容的最大增量话题，早期工具页有长尾流量红利；注意需如实标注"llms.txt 仍是社区提案而非正式标准，Google 官方未承诺优待"。

### 三、现有工具增强建议

1. **上线合规套件应打包做**：#21 Legal Pages + #29 Cookie Banner + #27 Email Auth 三个工具覆盖"收款合规 + 访客合规 + 发信合规"，页面间互相导流、共用"产品名/域名/联系方式"输入（localStorage 共享一份站点 profile，填一次三个工具复用），体验上会明显强于零散竞品。
2. **#15 Prompt Studio 与 #28 Cost Calculator 合并设计**：Prompt Studio 的 token 计数区可直接挂成本估算（选模型即显示这段 prompt 单次/千次成本），Cost Calculator 做独立页承接 SEO 流量，两者共用 token 估算内核。
3. **#16 Sitemap Studio 落地时直接纳入 llms.txt**：robots.txt / sitemap.xml / llms.txt 三个"根目录文件"一个工具生成，避免重复立项 #31。
4. **首页 Trend Radar 卡片描述过期问题连续三期未修**：仍写 5 个源，实际 9 个源；属一行文案改动，建议下次任何代码改动时顺手修掉。
5. **Trend Radar AI 中文早报连续四期未落地**：仍是全站差异化最大的 feature，建议优先级高于任何新工具。

### 四、趋势与新视角

- **邮件认证从"最佳实践"变成"强制基础设施"**：Google/Yahoo/Microsoft 2024-2026 持续收紧批量发件人要求，SPF/DKIM/DMARC 不配就进垃圾箱；OPC 把 newsletter 当核心获客渠道，DNS 记录生成是确定性刚需，且老牌工具（MXToolbox 等）界面陈旧、广告密集，干净的新工具有机会。
- **AI Readiness 成为新 SEO 品类**：llms.txt 2026 年上半年采用率增长约 6 倍、进入 Lighthouse 审计，GEO（生成引擎优化）内容爆发；虽然 Google 官方表态矛盾（一边说不依赖 llms.txt，一边 Lighthouse 审计它），但"低成本、早期红利、与 sitemap 同源"使它值得做。
- **AI 成本透明化工具走热**：模型定价越来越复杂（input/output/cached/batch 四种价格 × 十几个模型 × 频繁调价），做 AI wrapper 的 OPC 第一周就需要算账工具；这类工具的护城河是价格表维护速度，WeUtil 需接受月度更新成本。
- **合规工具的竞品正在"开源化 + 免注册化"**：policygen.dev 把隐私政策 + Cookie 横幅做成开源免注册，验证了 WeUtil 同款打法可行；同时说明这个窗口不会一直开着，#21/#29 建议尽早落地占位。
- **安全头生成器已成工具站标配**：ZeroTool、DevBolt、ScanSuite 等多家 2026 年新品都主打"100% client-side CSP 生成"，需求真实但拥挤；WeUtil 的切入点只能是 Vercel/Netlify 静态站部署配置 + 与上线工具箱联动，不建议做通用安全扫描平台。

### 五、待验证

- DMARC 报告解析（rua 聚合报告是 XML 压缩包邮件）是否值得做第二期功能——可做纯前端拖拽上传解析，帮助用户看懂谁在伪造发信。
- LLM 价格表的维护机制：需要确认每月人工更新一次的成本可接受，或是否有公开价格 JSON API 可 serverless 拉取。
- llms.txt v2 规范的最终格式细节（rel="describedby" 等）在落地前需再读一次 llmstxt.org 最新版。
- Formspree 后台用户反馈连续三期未导出，强烈建议本周人工查看。

---

## 2026-10-02

### 一、现状盘点

| 状态 | 内容 |
|---|---|
| 已上线（main） | JSON Lab、Epoch Lab、HTTP Client、QR Code Studio、Trend Radar（9 源 serverless）、Feedback |
| 自上次探索以来变更 | 新增 **llms.txt**（commit eeac7c8，#31 的静态文件部分已落地；#31 建议的"llms.txt 生成器工具页"未做） |
| 候选池 | #2-#30 共 29 个建议待排期；#1 QR Code、#31 静态 llms.txt 已落地 |
| 待用户拍板 | 各页面 `<head>` 是否加 `<link rel="describedby" href="/llms.txt">`（10/1 已提议，未答复） |
| 用户反馈 | Formspree 后台内容连续四期未导出 |

### 二、新功能建议（5 个）

汇总：

| # | 功能 | OPC 场景 | 技术可行性 | 优先级 |
|---|---|---|---|---|
| 32 | MCP Config Studio（MCP 客户端配置生成/合并/校验器） | 给 AI 编程工具接 MCP server | 纯前端 | **中高** |
| 33 | .gitignore Generator | 新建仓库、防泄露密钥 | 纯前端（模板内嵌） | **中高** |
| 34 | JSON → Types Studio（JSON 转 TS/Zod/Go/Python 类型） | 对接 API 快速出类型 | 纯前端 | 中 |
| 35 | Redirect Rules Generator（多平台重定向规则生成器） | 改版/迁移保 SEO | 纯前端 | 中 |
| 36 | RSS / Atom Feed Generator | 博客/newsletter/播客分发 | 纯前端 | 中低 |

#### 32. MCP Config Studio（MCP 客户端配置生成 / 合并 / 校验器）— 中高
- **场景**：OPC 用 Claude Desktop、Cursor、VS Code（Copilot）、Claude Code、Windsurf 等多个 AI 编程客户端，每接一个 MCP server（GitHub、Postgres、filesystem、Playwright…）都要手写 JSON；各客户端格式还不一样（VS Code 用 `servers` 且要显式 `"type": "stdio"`，其余用 `mcpServers`），改错一个客户端就看不到 server；已有配置时手工合并容易把现有 server 改坏。
- **核心能力**：① 可视化表单添加 server（command/args/env，env 值用 `${TOKEN}` 占位符避免泄露真实密钥）；② 一键切换目标客户端，输出对应格式与文件路径（含 macOS/Windows 路径提示）；③ **导入现有配置 → 合并新 server → 输出完整配置**（差异化核心，竞品普遍只做从零生成）；④ 校验：重复 server 名、缺失 command、VS Code 缺 type 字段、Windows 路径转义等问题给出错误定位；⑤ 内置常见 server 预设（filesystem/github/postgres/playwright/puppeteer 等 npx 命令模板）。
- **技术可行性**：纯前端 JSON 拼装与校验，零依赖。
- **参考产品**：mcpserverspot.com Config Generator、dev-toolbox.tech MCP Config Generator、ctxlint（MCP 配置 lint 规范，9/30 刚发布）、miftah 多客户端预设。
- **理由**：9/30 文档把"MCP 配置生成器"列为观察 1-2 周的方向，观察窗口已到——本周调研发现该品类正在快速成型（多家工具站 4-9 月集中上线，9/30 还出现了专门的配置 lint 规范），说明需求被验证且尚未出现垄断者；MCP 已是 2026 年 agent 时代的事实标准接口，OPC 人人都在配；WeUtil 用户画像（一个人用 AI 写代码的开发者）与该工具高度重合，是 agent 时代的"上线配置类"新成员。

#### 33. .gitignore Generator — 中高
- **场景**：OPC 每周开新仓库（产品、landing page、小工具），初始化时需要 .gitignore；手写容易漏掉 `.env`、`.vercel`、`node_modules`、IDE 文件，把密钥或构建产物提交上去是独立开发者最高频的事故之一。
- **核心能力**：勾选语言/框架/IDE/OS（Node、Python、Go、Rust、React、Next.js、Vite、VS Code、JetBrains、macOS、Windows、Vercel、Terraform、Docker…），合并模板、去重、分区注释；自定义规则追加；**密钥泄露风险提示**（当自定义规则或检测到 .env 模式时高亮警告）；一键复制/下载。模板全部内嵌在页面 JS 中（基于 GitHub gitignore 模板，离线可用、无外部请求）。
- **技术可行性**：纯前端，模板文本内嵌，零依赖。
- **参考产品**：gitignore.io / Toptal、iotools.cloud、genx.tools、alexandrai.org（均主打 in-browser）。
- **理由**："gitignore generator" 是开发者工具领域搜索量最大的常青词之一，SEO 价值高；竞品虽多但格局稳定（gitignore.io 依赖服务端且已多次宕机/跳转，新生工具站普遍把它作为标配引流页），WeUtil 以"模板内嵌零外部请求 + 密钥泄露警告"切入；开发量极小，适合作为引流工具快速上线。

#### 34. JSON → Types Studio（JSON 转多语言类型 / Zod Schema）— 中
- **场景**：OPC 对接第三方 API（支付、AI、趋势数据），拿到一段 JSON 响应后要手写 TypeScript interface 或 Zod 校验 schema，嵌套层级一多又烦又容易错；#3 JSON Lab 解决"看 JSON"，本工具解决"用 JSON 写类型"。
- **核心能力**：粘贴 JSON → 推断类型（嵌套对象拆分为独立 interface、数组元素类型、null 合并为联合类型、混合数组出 union）；输出切换：TypeScript interface / type alias、**Zod v3/v4 schema**（2026 年 TS 运行时校验事实标准）、Go struct、Python dataclass/TypedDict；可设根类型名、可选字段处理；复制/下载 .ts 文件。
- **技术可行性**：纯前端递归类型推断，零依赖。
- **参考产品**：quicktype（行业标杆但 UI 重、加载慢）、jsonic.io、jsmanifest（TS+Zod）、jsontooncraft、utilokit。
- **理由**："json to typescript" 搜索意图明确、竞品验证充分；差异化在多语言 + Zod 双版本 + 与 JSON Lab 互相导流（JSON Lab 加"Generate Types"按钮，本工具作为独立页承接 SEO）；开发量中等，类型推断边界 case（null/空数组/枚举）是主要工作量。

#### 35. Redirect Rules Generator（多平台重定向规则生成器）— 中
- **场景**：OPC 改版 landing page、给 URL 做 SEO 规范化（.html → clean URL）、换域名或迁移部署平台时，需要批量 301；规则语法 Vercel（vercel.json）、Netlify（_redirects/netlify.toml）、Cloudflare、Apache .htaccess、Nginx 各不相同，写错一条旧链接就 404，流失来之不易的搜索流量。
- **核心能力**：表格录入旧路径→新路径（支持粘贴 CSV 两列批量导入）；常用预设（www→apex、http→https、去尾斜杠、SPA fallback /* → /index.html 200、整域迁移通配符）；301/302/rewrite(200) 选择；通配符 `:path*` / `:splat` / `$1` 跨平台映射；同时输出 vercel.json、_redirects、netlify.toml、.htaccess、Nginx 五种配置；规则冲突/重复检测。
- **技术可行性**：纯前端字符串模板，零依赖。
- **参考产品**：zerodeploy.dev _redirects Generator（9/27 刚上线）、wutools 重定向规则生成器、Vercel/Netlify 官方迁移文档。
- **理由**：与 #30 Security Headers/CSP Studio 输出同一份 vercel.json，建议组成"Deployment Config Studio"家族（同一套表单外壳、共享站点 profile）；WeUtil 自己就经历过 .html → clean URL 迁移，可直接 dogfood；竞品刚出现（9/27）说明需求开始被注意到，趁早占位；属"做产品/收钱运营"阶段的低频高痛场景。

#### 36. RSS / Atom Feed Generator — 中低
- **场景**：OPC 写博客或做播客做内容获客，静态站（手写 HTML/Astro/Hugo 初期）没有自动 feed；newsletter 作者也越来越多需要把内容转 RSS 供聚合器收录（2026 年 RSS 复兴，RSSHub、Folo、Kill the Newsletter 等项目热度上升）。
- **核心能力**：填写频道元信息（title/link/description/语言/封面/作者）+ 文章列表（标题/链接/摘要/发布时间/分类），输出合法 RSS 2.0 与 Atom 1.0（自动 XML 转义、RFC 822/RFC 3339 日期、GUID）；可选 iTunes/podcast 标签扩展（音频 URL、时长、season/episode，可直接提交 Apple Podcasts/Spotify）；实时校验 + 下载。
- **技术可行性**：纯前端 XML 拼装，零依赖。
- **参考产品**：iotools.cloud RSS/Atom Generator（9/30 刚上线）、abacktools 播客 feed 生成器、rss.app（托管型，收费）。
- **理由**：与 #16 Sitemap、#31 llms.txt 同属"站点分发文件"家族，建议在 Sitemap Studio 落地时作为第四个 tab 一起做，不单独立项；需求真实但搜索量和频次低于前几个，故中低优先级；播客 RSS（iTunes 标签）是差异化点，多数免费生成器不含。

### 三、现有工具增强建议

1. **#31 状态更新**：llms.txt 静态文件已上线（https://weutil.top/llms.txt），但两件事未完成——① 各页面 `<head>` 的 `<link rel="describedby">` 待用户拍板；② llms.txt 生成器工具页未做（可并入 #16 Sitemap Studio，届时 #31/#36 一并落地）。
2. **部署配置家族化**：#30 Security Headers + #35 Redirect Rules 都输出 vercel.json，建议合并为一个 "Deploy Config Studio"（tab 切换 Headers / Redirects / 未来的 CORS），共享站点 profile，避免两个工具各生成半份配置让用户手工拼。
3. **#34 作为 JSON Lab 的延伸入口**：JSON Lab 工具栏加 "To Types" 跳转，类型推断内核未来还可支撑 JSON→JSON Schema→Mock Data（与 #19 Fake Data Generator 联动）。
4. **首页 Trend Radar 卡片描述过期问题连续第四期未修**（仍写 5 个源，实际 9 个）；README 的 Project Structure 也未收录 trends.html、api/、llms.txt。建议任何一次代码改动顺手修掉。
5. **Trend Radar AI 中文早报连续五期未落地**，仍是全站差异化最大的 feature，优先级高于任何新工具。

### 四、趋势与新视角

- **MCP 工具链开始"配置层" consolidation**：2026 上半年 MCP 生态在铺 server 数量，9 月起明显转向开发者体验层——配置生成器（mcpserverspot、dev-toolbox）、多客户端格式转换（miftah）、配置 lint 规范（ctxlint，9/30）集中出现；各客户端配置格式不统一（`mcpServers` vs `servers`、stdio 显式声明）是真实痛点，类似早期 .editorconfig/ESLint 配置混乱期，WeUtil 此时进场正当时。
- **GEO（生成引擎优化）工具登上 Product Hunt**：9/24 PH 榜单出现 jev（开源 Rust 写的 SEO/GEO 审计 CLI），与昨天记录的 llms.txt 进 Lighthouse 审计互相印证——"让 AI 搜到并引用你的站"正在形成工具品类；WeUtil 的 llms.txt 已占位第一步，后续可观察纯前端 GEO 审计页（检查 llms.txt、结构化数据、标题可引用性）的机会，但该方向需要 serverless 抓取，暂列观察。
- **PH 9 月月榜主题：给 AI agent 卖铲子**——tiun（AI builder 的 auth/billing/支付）、Creem（支付）、Mastra（agent 框架）、Context.dev（抓取 API）、多家 voice agent 测试工具；OPC 工具站的选品启示：agent 基础设施周边的"配置/算账/合规"小工具（#28 LLM 成本、#32 MCP 配置）需求持续走强。
- **常青引流页仍是工具站流量基本盘**：.gitignore、JSON→TS、时间戳这类高频小词页面是各家工具站（iotools、abacktools、kordu、genx）2026 年仍在持续新增的品类，开发成本低、SEO 长尾稳定；WeUtil 目前这类常青页偏少（仅 timestamp/json），#33/#34 应优先补齐。
- **RSS 低调复兴**：newsletter→RSS、播客分发、RSSHub 5000+ 路由、Folo 等 AI reader 带动 feed 需求，iotools 9/30 上线 feed 生成器；属慢热方向，跟随 sitemap/llms.txt 家族一起做即可。

### 五、待验证

- MCP 各客户端 2026 年 10 月最新配置格式（尤其 VS Code `servers` 根键、Claude Code 的配置位置），落地 #32 前需对照官方文档核实一次。
- GEO 审计纯前端可行性：浏览器端 fetch 任意站点受 CORS 限制，可能必须走 api/proxy.js；若做需评估缓存与限流。
- .gitignore 模板内嵌的体积与更新机制（GitHub 模板库约百级文件，全量内嵌体积可控但需定期同步）。
- Formspree 后台用户反馈连续四期未导出，强烈建议本周人工查看。

---

## 2026-10-03

### 一、现状盘点

| 状态 | 内容 |
|---|---|
| 已上线（main） | JSON Lab、Epoch Lab、HTTP Client、QR Code Studio、Trend Radar（9 源 serverless）、Feedback、llms.txt |
| 自上次探索以来代码变更 | 无（最新 commit 6e16acb 为 10/2 docs） |
| 候选池 | #2-#30、#32-#36 待排期；#1、#31 静态文件已落地 |
| 用户反馈 | Formspree 后台内容连续五期未导出 |

### 二、新功能建议（5 个）

汇总：

| # | 功能 | OPC 场景 | 技术可行性 | 优先级 |
|---|---|---|---|---|
| 37 | AGENTS.md Studio（AI 编程指令文件生成器） | 让 AI agent 按你的规范写代码 | 纯前端 | **高** |
| 38 | .env Inspector（环境变量检查/脱敏/多格式转换） | 防密钥泄露、配置多平台部署 | 纯前端 | **中高** |
| 39 | PWA Manifest & Icon Studio | 站点可安装到手机/桌面 | 纯前端（Canvas 裁图） | 中 |
| 40 | Waitlist Page Generator（候补着陆页生成器） | 写代码前验证需求、收邮箱 | 纯前端（下载单 HTML） | 中 |
| 41 | Open Source License Picker | 新仓库选协议、生成 LICENSE | 纯前端 | 低（建议打包） |

#### 37. AGENTS.md Studio（AI 编程指令文件生成器）— 高
- **场景**：OPC 用 Claude Code、Cursor、Codex、Copilot、Windsurf、Jules 等多个 AI 编程工具，但每个 agent 对项目的理解全靠根目录的指令文件——写得好，生成的代码像自己写的；写不好，全是要返工的通用模板。AGENTS.md 已成为跨工具事实标准（2026 年中 28+ 工具自动读取，OpenAI Codex 发起），但多数人不知道该写哪些小节、各工具还要不要单独的 CLAUDE.md。
- **核心能力**：① 引导式表单：技术栈、安装/构建/测试/lint 命令（可点"我不确定"给出常见命令占位）、目录结构、代码规范、commit 规范、always/never 规则块、安全约束；② 一次生成三份文件：**AGENTS.md**（跨工具通用）、**CLAUDE.md**（`@AGENTS.md` 引入 + Claude 专属说明）、`.cursor/rules` 片段；③ 支持反向：粘贴现有 AGENTS.md 做结构体检（缺哪些必备小节、命令是否写全）；④ 常见项目模板预设（Vite/Next/静态站/Vercel serverless，WeUtil 自身配置可作为"纯静态无构建"样板）。
- **技术可行性**：纯前端 Markdown 模板拼装，零依赖。
- **参考产品**：agents-md-generator（CLI，扫描代码生成）、spike-init（CLI，实际跑命令验证后写文件）、bal.pe.kr/tools/agentsmd（指南+生成器）、env.dev dark-factory 指南。
- **理由**：现有方案几乎全是 CLI（要求先有代码、会命令行），**面向"还没写代码/不想装 CLI"的浏览器表单生成器是空白**；与昨天的 #32 MCP Config 同属"agent 时代的项目配置"家族，与 llms.txt（给内容 agent 看）形成对仗——AGENTS.md 是给编程 agent 看的，WeUtil 有机会把"agent 可读文件"这个新品类做全；用户画像 100% 重合，纯前端开发量小。

#### 38. .env Inspector（环境变量检查 / 脱敏 / 多格式转换）— 中高
- **场景**：OPC 的项目塞满 API key（WeUtil 自己就有 GITHUB_TOKEN、PRODUCTHUNT_TOKEN、YOUTUBE_API_KEY），日常三大事故：① 把 .env 提交到 GitHub；② 给协作者/AI 贴配置时连密钥一起贴出去；③ 同一套变量要在 Vercel、GitHub Actions、Docker Compose 之间手抄三遍。
- **核心能力**：① 粘贴 .env → 语法校验（重复 key、缺值、空格/引号问题）；② **密钥识别**：20+ 服务商 key 模式正则（AWS/GitHub/Stripe/Slack/OpenAI/Anthropic/SendGrid/Twilio 等）+ 通用 SECRET/TOKEN/PASSWORD 模式，高亮风险；③ 一键生成脱敏的 .env.example（保留 key、注释、分组顺序，非敏感默认值如 NODE_ENV/PORT 可保留）；④ 格式互转：docker-compose.yml、Kubernetes ConfigMap、GitHub Actions secrets env、Vercel CLI、shell export；⑤ 明确"零网络请求"隐私承诺（页面可放网络面板自检说明，devbit.dev 已用此作卖点）。
- **技术可行性**：纯前端正则 + 字符串转换，零依赖。
- **参考产品**：devbit.dev ENV Inspector、env.dev（Builder/Converter/Validator 三件套，9/27 更新）、iotools API Secret Scanner（9/17）、altftool、envtools.dev、crenvex（CLI）。
- **理由**：2026 年 8-9 月至少 6 家工具站集中上线同类功能，品类正在快速成型且无垄断者；"密钥泄露"是 OPC 最高频、代价最大的事故之一，隐私本地处理与 WeUtil 定位完全一致；与 #33 .gitignore 天然联动（生成 .gitignore 时提醒 .env 规则）。

#### 39. PWA Manifest & Icon Studio — 中
- **场景**：OPC 想让自己的工具站/产品能"添加到主屏幕"、像原生 App 一样全屏运行（WeUtil 自身也适合 PWA 化），但 manifest.json 字段琐碎（short_name 12 字符限制、display 模式、theme/background color、maskable 图标安全区），图标还要切 192/512/apple-touch-icon 等多个尺寸。
- **核心能力**：表单生成 manifest.json（名称、short_name、start_url、display、orientation、颜色、categories、shortcuts）；**上传一张 Logo，浏览器 Canvas 本地生成全套图标**（192/512/maskable 带安全区预览/apple-touch-icon-180/favicon 联动）；实时手机桌面预览；输出 `<link rel="manifest">` 与 iOS 私有 meta 标签；可选最简 service worker（离线缓存壳）代码片段；打包下载。
- **技术可行性**：纯前端，Canvas 裁图零依赖；service worker 只输出静态模板字符串。
- **参考产品**：iotools PWA Manifest Generator（10/2 刚上线）、codeshack（含 Icon Resizer）、octawebtools PWA Maker（ZIP 包）、nativeappai、wutools。
- **理由**：iotools 昨天（10/2）刚上线同类，验证需求仍在被持续补齐；图标裁切引擎与 #9 Favicon Studio 完全共用，建议作为"应用图标家族"二期一起做（Favicon 面向浏览器标签页，PWA 面向安装），一套 Canvas 内核两个引流页；开发量主要在图标安全区预览。

#### 40. Waitlist Page Generator（候补 / Coming Soon 着陆页生成器）— 中
- **场景**：OPC 验证新想法的标准动作是先上一个 waitlist 页收邮箱，再决定写不写代码（#17 Launch Checklist 的前置环节）；但 Carrd 要托管账号、AI landing builder 要月费，而 OPC 想要的是一个能丢到 Vercel/Cloudflare Pages 的单文件。
- **核心能力**：表单填写产品名、一句话价值主张、3 个卖点、邮箱表单 endpoint（预设 Formspree/Formgrid/Waitlister 接入格式——WeUtil feedback 页已在用 Formspree，可直接 dogfood 同款流程）、倒计时（可选上线日期）、配色（复用 #20 配色思路）、社交链接；实时预览；**下载一个自包含 index.html**（内联 CSS/JS、零依赖、含成功态、基础 OG 标签位）；暗色/亮色两版。
- **技术可行性**：纯前端代码生成器，零依赖。
- **参考产品**：Carrd（托管）、Waitlister、Mixo（$9/月 AI builder）、formgrid.dev 静态 waitlist 教程、V0 waitlist 模板（Next.js 重栈）。
- **理由**：竞品要么收费托管、要么给的是 Next.js/shadcn 重栈，"生成一个零依赖单 HTML 文件、免费部署到 Vercel"正好是 WeUtil 技术哲学的差异化；与 #10 OG Image、#11 Meta Preview、#17 Launch Checklist 构成完整"发布前"链路；注意避免做成通用 landing page builder（范围会失控），只做 waitlist 单一场景。

#### 41. Open Source License Picker（开源协议选择器 / LICENSE 生成器）— 低（建议打包不立项）
- **场景**：OPC 开源 side project 时不知道 MIT/Apache 2.0/GPL/MPL 的区别，仓库里没有 LICENSE 文件。
- **核心能力**：问卷式选择（要不要商用/改作是否必须开源/是否要专利授权）→ 推荐协议（权限/条件/限制三栏对比）→ 填版权人/年份生成完整 LICENSE 文本下载。
- **技术可行性**：纯前端文本模板，零依赖。
- **参考产品**：choosealicense.com（GitHub 官方，流量垄断）、toolszone、toolsvana、neotoolkit、stackutils 等 10+ 家。
- **理由**：品类极度拥挤且 GitHub 官方站占据垄断流量，单独立页 SEO 胜算低；但它是"新仓库四件套"之一，**强烈建议不单独立项，而是与 #33 .gitignore + #37 AGENTS.md + #38 .env.example 打包成 "Repo Bootstrap Kit"**：一个入口、一份项目信息表单，最后打包下载 .gitignore / LICENSE / AGENTS.md / .env.example 四个文件——这个"打包一次配齐"的组合是任何单一竞品都没做的差异化。

### 三、现有工具增强建议

1. **战略建议：做 "Repo Bootstrap Kit" 套件**（#33 + #37 + #38 + #41）：新仓库初始化是 OPC 最高频动作，四个文件共享一份"项目信息"（项目名、技术栈、作者、年份），一个向导走完、打包下载；四个子工具各自保留独立页面承接 SEO 长尾，套件页承接 "new repo setup / project bootstrap" 词。这是本期最重要的产品化建议。
2. **#39 与 #9 Favicon Studio 共用图标内核**：Canvas 缩放/圆角/maskable 安全区一套代码两个页面，落地顺序建议先 #9 后 #39。
3. **#40 与 #17 Launch Checklist 联动**：Checklist 的"发布前"步骤直接链接到 Waitlist Generator、#10 OG、#11 Meta、#16 Sitemap，形成发布工具链闭环。
4. **WeUtil 自身 dogfood**：#37 生成的 AGENTS.md、#39 的 PWA manifest 都可以直接用在 weutil 仓库和 weutil.top 上，生成后即真实案例。
5. **首页 Trend Radar 卡片描述过期问题连续第五期未修**（仍写 5 源，实际 9 源）；README Project Structure 未收录 trends.html、api/、llms.txt；**AI 中文早报连续六期未落地**，仍建议优先级高于新工具。

### 四、趋势与新视角

- **"Agent 可读文件"成为新文件品类**：2026 年中 AGENTS.md 获 28+ AI 编程工具支持（Codex/Copilot/Cursor/Windsurf/Claude Code/Jules），与 llms.txt（给内容/搜索 agent）、MCP 配置（给 agent 接工具）共同构成"agent-facing project files"新品类；传统工具站还在做给人看的文件，WeUtil 可以系统性地做"给 agent 看的文件"工具线（llms.txt 已占位第一格，AGENTS.md、MCP 配置紧随其后），这是与 it-tools 类老工具站差异化的清晰主线。
- **密钥卫生工具集中爆发**：8-9 月至少 6 家工具站上线 .env 脱敏/密钥扫描类功能（devbit、env.dev、iotools、altftool、envtools、crenvex CLI），背景是 OPC 项目 API key 数量随 AI 服务激增、GitHub 密钥泄露自动化扫描攻击产业化；"本地处理、零上传"是该品类共同卖点，与 WeUtil 隐私定位天然契合。
- **Waitlist-first 仍是 OPC 方法论主流**：2026 年的教程（formgrid、findclout、Waitlister）全部指向"静态单页 + 表单后端（Formspree/Formgrid/D1）"架构，零后端 waitlist 页的技术门槛已降到最低，门槛只剩"写页面"——正是生成器的机会。
- **PWA 品类回温**：10/2 iotools 上线 manifest 生成器、9 月 octawebtools/nativeappai 等多家刷新同类工具，移动端"添加到主屏幕"与 iOS 18+ 对 PWA 的持续开放让该需求稳定存在；但属常青工具而非爆发品类，跟随 Favicon 一起做即可。
- **CLI 与网页工具的分工明确化**：AGENTS.md、.env.example 的现有方案多为 CLI（要求有代码仓库和命令行环境），浏览器表单工具覆盖的是"起项目前/非技术协作者/不想装工具"的场景——WeUtil 不与 CLI 竞争，吃浏览器端的即时使用与搜索流量。

### 五、待验证

- AGENTS.md 最新跨工具规范细节（OpenAI Codex 仓库的 agents.md 约定、嵌套 AGENTS.md 合并规则、与 CLAUDE.md 的推荐引用写法），落地 #37 前需读一次官方仓库。
- "Repo Bootstrap Kit" 打包下载在纯前端的实现（JSZip 需源码内嵌，约 100KB，评估是否符合单页体积约束；或改为逐个文件下载）。
- 各表单后端（Formspree/Formgrid/Waitlister）2026 年免费额度与防垃圾邮件机制，#40 落地前核实。
- Formspree 后台用户反馈连续五期未导出，强烈建议本周人工查看。
