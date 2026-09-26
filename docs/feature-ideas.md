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
