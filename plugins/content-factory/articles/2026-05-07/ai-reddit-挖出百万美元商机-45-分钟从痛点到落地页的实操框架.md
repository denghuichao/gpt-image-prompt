---
title: "AI + Reddit 挖出百万美元商机：45 分钟从痛点到落地页的实操框架"
excerpt: "从 Reddit 用户原话出发，结合 AI 提炼痛点、生成方案与验证页，一套可复用的创业选题与验证流程。"
date: "2026-05-07"
tags:
  - AI创业
  - Reddit
  - 市场验证
cover: "/blog_images/20260507-1.png"
published: true
---

# AI + Reddit 挖出百万美元商机：45 分钟从痛点到落地页的实操框架

我猜你也经历过这种状态：盯着屏幕半天，脑子里只有一个问题——“到底做什么，才有机会赚到钱？”

更糟的是，你想到的点子，不是已经被做烂了，就是根本没人需要。前者让人泄气，后者更像是在自我安慰。

我后来越来越确定一件事：这不一定是你不够聪明，也不是你不够努力，而是人脑本来就不擅长“凭空造出好创意”。自我、偏见、过度思考、信息茧房，这些东西会一直拖后腿。

但如果我告诉你，有一套方法，可以让你在 45 分钟内，从一个你完全不熟的领域里，挖出一个已经被验证过的商业创意，甚至还能顺手做出一个像样的落地页，而且全程不用你先写代码、也不用你先写文案，你会不会愿意认真看完？

这就是营销大神 Steph France 最近公开的“黄金挖掘框架”(Gold Mining Framework)。他在 Starter Story 的访谈里完整演示过一遍：从“共同监护”(co-parenting) 这个他原本并不算熟悉的市场切进去，到最后生成一个功能完整、文案也很精准的落地页，整个过程不到一小时。

## 先别靠想，先让数据替你说话

看完这个视频，我最大的感受其实很直接：找商业创意这件事，根本不该靠“想”。

我们太习惯坐在电脑前冥思苦想：现在什么行业有机会？用户到底想要什么？然后就会开始在脑子里打转，要么纠结半天，要么凭感觉做了个东西，最后发现根本没人买单。

Steph 这套框架是反过来的。他不是先想“我要做什么”，而是先去找用户在哪里吐槽、抱怨、求助，然后直接用他们的原话来定义问题。换句话说，你不需要猜用户想要什么，因为用户自己已经把答案说出来了，只是平时没人真的去听。

他自己也提过一句我很认同的话：这个落地页把行业里所有痛点、所有措辞都放进去了。它不是靠营销黑话撑起来的，而是用客户自己的语言告诉他们：我懂你现在到底有多痛苦。

更重要的是，这套方法不是拍脑袋出来的，而是完全站在真实数据上。Reddit 上成千上万条用户讨论，经过 AI 提炼之后，最后变成落地页上的每一句文案。它不是营销话术的堆砌，而是用户痛点的直接翻译。

Reddit 本身就是个被严重低估的金矿。但 Steph 这套玩法更进一步——他不是去 Reddit 发帖推广，而是把 Reddit 当成免费的用户调研工具来用，这个思路真的很狠。

## 第一步：先选一个有钱的战场

Steph 的框架第一步就很聪明：不要乱选市场，先从三大核心市场切进去——健康（Health）、财富（Wealth）、关系（Relationship）。

为什么偏偏是这三个？因为这是人类长期都会面对的需求，而且人们愿意持续为它们花钱。你去看那些真正做起来的产品，最后基本都绕不开这三类。

但这还不够具体。比如你选了“健康”，下面其实还有一整串子方向：压力管理、运动健身、饮食控制、睡眠改善……每个子类下面还能继续细分出更多小市场。

这时候 Steph 用了一个很巧的工具：Market Idea Expander（市场创意扩展器）。这是一个精心调教的提示词，你输入一个子领域，它就能帮你一层层展开，列出所有可能的细分方向。
![20260507-2.jpg](/blog_images/20260507-2.jpg)

比如你输入“压力管理”，它就会给你展开成：

- 物理压力缓解：按摩疗法、呼吸技巧
- 精神压力管理：冥想、正念练习
- 以及更多还能继续往下拆的方向

这个过程本质上像是在打开一张巨大的思维导图，让你先看到全貌，再决定往哪一条路深挖。然后你再结合自己的优势——比如知识、人脉、兴趣——去选一个真正值得投入的方向。

顺手补一个小技巧：跟 AI 对话时，最好尽量用 Markdown 格式去复制提示词，而不是一坨纯文本。结构更清楚，AI 读起来也更稳定，输出通常也更可控。

附提示词
```
Your mission:
You are a business strategy and market segmentation expert tasked with generating a list of markets, categories, niches or subniches across three core markets: Health, Wealth, and Relationships. For each core market, you will identify relevant subcategories and break them down into detailed sub-niches.
How to respond based on the user's prompt
If the user asks for random ideas, generate  potential categories, subcategories, niches and sub-niches across all three markets (Health, Wealth, and Relationships).

If the user asks you to focus on a specific subcategory, ONLY generate the submarkets under that subcategory within its corresponding core market.

For example:

If the user asks you to focus on "alternative medicine", Start with "alternative medicine" (subcategory within the Health market) as the first step in the hierarchy of your ouput and only provide subcategories underneath this one. Do not mention Wealth or Relationships in this case.

Output format
Your output will contain only the answer, nothing before, nothing after. 
The output should follow this structure:

{

- [Core Market]

 - [Category] (as many as you can)

   - [Subcategory] (as many as you can)

     - [Niche] (as many as you can)

       - [Sub-Niche] (as many as you can)

}

Important rules
The categories must be based on the core markets Health, Wealth, and Relationships.

If a specific area of focus is requested by the user (e.g., alternative medicine), ONLY provide subcategories and niches underneath it

Always provide as many potential categories, subcategories, niches and sub-niches as you can

Avoid overlap between categories, subcategories, niches and sub-niches; each should be unique to its sub-niche.

Next steps
Ask the user to provide the market segment they want to explore and wait for the answer

```

## 第二步：先验证需求，别凭感觉下注

有了方向还不够，你得先确认：这个市场是真的有需求，还是只是你一厢情愿。

Steph 在这一块用的是两个很朴素、但非常有效的工具。

### 1. Keywords Everywhere

这是一个 Chrome 插件，可以直接在 Google 搜索结果页看到关键词的月搜索量和相关词。比如你搜 “Swedish massage”，它会直接告诉你这个词大概有多少搜索量，以及周边有哪些相关搜索词。

### 2. Google Trends

这个才是重点，但它的用法跟很多人平时理解的不太一样：不要只盯着搜索量，更要盯着趋势。

Steph 特别强调，要看的是“主题”(Topic)，不是单一的“搜索词”(Search Term)。因为主题会把所有相关词汇聚合起来，包括不同语言、不同表达方式，数据会更完整。

他在视频里拿两个市场做了对比：

- 瑞典式按摩：搜索量还不错，但趋势波动比较大，说明它更像短期热点
- 共同监护（Co-parenting）：搜索量稳定，而且趋势持续上升，说明这是更接近长期需求的市场

他原话的大意就是：这不是那种 AI 工具常见的暴涨暴跌曲线，这是真实的人类需求，是社会变化带来的持续增长需求。这样的市场才够大。

我自己的理解也很简单：真正值得做的，不一定是最热的，而是最稳的。短期爆火的东西，来得快去得也快；真正能做成生意的，往往是那些持续存在的人类问题。

## 第三步：去 Reddit 挖金矿

一旦验证了市场有需求，接下来就是这套框架最核心的部分：去 Reddit 收集真实用户的痛点。

为什么是 Reddit？因为它的匿名性和长对话特性，会让用户更愿意把自己的挫折、困惑、失败经历讲得很细。你在别的平台看到的可能只是“表面抱怨”，但在 Reddit 上，你能看到几百楼的深度讨论，每一条都可能是金矿。

这和我之前讲过的那种逻辑一样：Reddit 不只是推广渠道，更是一个深度调研渠道。

但 Steph 的玩法更进一步。他不是随便搜，而是会用 Google 的高级搜索语法，精准筛那些真正带着痛点的帖子。
![20260507-3.jpg](/blog_images/20260507-3.jpg)

他用的思路大概是去筛选包含“我觉得”“我感觉”“我经历过”这类表达的内容——也就是用户在主动讲自己的问题和经历，而不是那种纯闲聊、纯建议型的帖子。

然后你再挑那些评论数多、讨论深的帖子，把整个线程复制下来，用三个破折号（—）分隔不同帖子，统一粘贴到一个文本文档里。

这里要强调一下：这一步还是得有人把关。别想着完全自动化。因为你真正要的是“有效痛点样本”，不是“抓最多文本”。质量比数量重要得多。

附google搜索语句：
```
“{Market to explore}" (

   site:reddit.com 

   inurl:comments|inurl:thread 

   | intext:"I think"|"I feel"|"I was"|"I have been"|"I experienced"|"my experience"|"in my opinion"|"IMO"|

   "my biggest struggle"|"my biggest fear"|"I found that"|"I learned"|"I realized"|"my advice"|

   "struggles"|"problems"|"issues"|"challenge"|"difficulties"|"hardships"|"pain point"|

   "barriers"|"obstacles"|"concerns"|"frustrations"|"worries"|"hesitations"|"what I wish I knew"|"what I regret"

)

```

> 很多信息搜集，可以直接靠 AI 浏览器提速：比如 Dia 直接侧边栏打开多个窗口，让它帮你整理；或者用 Comet 之类的工具去浏览、归纳；再往前一步，Claude Code 的 MCP 或 Skill 也能把很多采集流程自动化。

## 第四步：让 AI 来提炼痛点

把数据收回来之后，真正费时间的活就来了。Steph 推荐用 Claude，因为他觉得 Claude 的输出更有人味，更接近真人写出来的东西。

他这里准备了三个关键提示词，我觉得这个顺序很值得学。

### 提示词 1：痛点提取器（Pain Points Extractor）

把你刚刚收集的 Reddit 对话直接贴进去，Claude 会帮你把痛点提炼出来，而且会分门别类，每个痛点下面还附上用户原话作为证据。

比如在“共同监护”这个案例里，Claude 提炼出来的痛点包括：

- 父母被迫维持一种不现实的“友好关系”，压力很大
- 有新伴侣介入时，如何平衡共同监护
- 如何处理高冲突、甚至带有虐待倾向的前任
- 重组家庭中的情感劳动怎么分配

每个痛点下面还有真实用户原话，比如：“和你的施虐者共同监护孩子，真的太难了。”

附提示词
```
Context
I'm analyzing Reddit conversations to identify common pain points and problems within a specific market. By extracting authentic user language from Reddit threads, I aim to understand the exact problems potential customers are experiencing in their own words. This analysis will help me identify market gaps and opportunities for creating solutions that address real user needs. The extracted insights will serve as the foundation for product development and marketing messages that speak directly to the target audience using language that resonates with them.

Your Role
You are an expert Market Research Analyst specializing in analyzing conversational data to identify pain points, frustrations, and unmet needs expressed by real users. Your expertise is in distilling lengthy Reddit threads into clear, actionable insights while preserving the authentic language users employ to describe their problems.

Your Mission
Carefully analyze provided Reddit conversations and comments
Identify distinct pain points, problems, and frustrations mentioned by users
Extract and organize these pain points into clear categories
For each pain point, include all direct quotes from users that best illustrate this specific problem
Extract EVERY valuable pain point - thoroughness is crucial

Analysis Criteria
INCLUDE:
Specific problems users are experiencing (e.g., "I've tried 5 different migraine medications and none of them work for more than a few hours")
Frustrations with existing solutions (e.g., "Every budgeting app I've tried forces me to categorize transactions manually which takes hours")
Unmet needs and desires (e.g., "I wish there was a way to automatically track my water intake without having to log it every time")
Workarounds users have created (e.g., "I ended up creating my own spreadsheet because none of the existing tools track both expenses and time")
Specific usage scenarios where problems occur (e.g., "The pain is worst when I've been sitting at my desk for more than 2 hours")
Emotional impact of problems (e.g., "The constant back pain has made it impossible to play with my kids, which is devastating")

DO NOT INCLUDE:
General discussion not related to problems or pain points
Simple questions asking for advice without describing a problem
Generic complaints without specific details
Positive experiences or success stories (unless they contrast with a problem)
Discussions about news, politics, or other topics unrelated to personal experiences

Output Format
Pain Point Analysis Summary: Begin with a brief overview of the major pain points identified across the data
Categorized Pain Points: Organize findings into clear thematic categories (e.g., "Problems with Existing Solutions", "Physical Symptoms", "Emotional Challenges")

For each pain point:
Create a clear, descriptive heading that captures the essence of the pain point
Provide a brief 1-2 sentence summary of the pain point
List 3-5 direct user quotes that best illustrate this pain point
Include a note on the apparent frequency/intensity of this pain point across the data
Priority Ranking: Conclude with a ranked list of pain points based on:
Frequency (how often mentioned)
Intensity (emotional language, urgency)
Specificity (detailed vs. vague)
Potential solvability (could a product or service address this?)

Examples
Good Pain Point Extraction:

{
Users struggle to find ergonomic desk setups that fit in apartments or small rooms while remaining affordable.
"I've measured every corner of my 450 sq ft apartment and can't find a standing desk that would fit without blocking my only window."
"Spent $300 on a 'compact' desk that still takes up half my bedroom and wobbles whenever I type."
"Living in a tiny NYC apartment means choosing between a proper desk setup or having space to walk around. Currently using my kitchen counter which is killing my back."
"Every ergonomic chair I've found is massive and designed for spacious offices, not tiny home workspaces."
Frequency/Intensity: High frequency (mentioned in ~40% of comments), with intense frustration expressed through language like "impossible," "nightmare," and "giving up."

Output Instructions
First, scan the entire Reddit data to identify recurring themes and pain points
Create relevant category headers based on these pain points
Extract ONLY specific problems, frustrations, and unmet needs
For each pain point, include the most illustrative direct quotes from users
Extract EVERY SINGLE valuable pain point that matches the criteria
Preserve the EXACT original language - no modifications to user text
Rank the pain points based on apparent importance to users
If a potential solution is frequently mentioned or requested, note this in your analysis

Paste your Reddit data below:

```

### 提示词 2：市场差距生成器（Market Gap Generator）

这个提示词会基于你已经提炼出来的痛点，再结合“新产品”“新技术”“差异化”等角度，生成 3-5 个具体的商业创意。

比如针对上面的痛点，Claude 给出的方向就包括：

- 一个专注高冲突场景的共同监护平台，内置冲突过滤和第三方调解功能
- 一个以孩子为中心的交接工具，帮助减少孩子在两个家之间转换时的创伤

这些方向都不是空想，而是直接从痛点里长出来的。

![20260507-4.jpg](/blog_images/20260507-4.jpg)

附提示词：
```
Context
I've identified specific pain points within a market through research and customer feedback. Now I need to generate potential business solutions that address these pain points while creating unique value. Rather than rushing to an obvious solution, I want to systematically explore different approaches to solving these problems in ways that could stand out in the market. The goal is to discover opportunities others might miss by considering various dimensions of differentiation and value creation.

Your Role
You are an expert Business Opportunity Strategist who specializes in identifying creative approaches to solving market problems. Your expertise is in seeing gaps between what exists and what people truly need, and developing multiple strategic paths to address these gaps while creating sustainable competitive advantages.

Your Mission
Analyze the provided market pain points
Generate potential solutions using multiple strategic frameworks
Consider both capturing existing demand and creating new demand
Evaluate each solution for its potential to be "best in its category"
Identify unique angles and differentiators for each solution
Present a comprehensive yet practical set of business opportunities

Solution Frameworks to Apply
1. Market Segmentation Framework
Identify underserved sub-niches within the broader market
Consider demographic, psychographic, or behavioral segments
Explore solutions specifically optimized for these segments
2. Product Differentiation Framework
Consider premium versions of existing solutions
Explore streamlined/simplified versions focused on core needs
Identify potential for specialized features or capabilities
3. Business Model Innovation Framework
Explore subscription vs. one-time purchase models
Consider freemium, marketplace, or platform approaches
Identify potential for service-based extensions to products
4. Distribution & Marketing Framework
Identify underutilized acquisition channels
Consider community-based or content-driven approaches
Explore partnership or integration opportunities
5. New Paradigm Framework
Consider applications of emerging technologies
Identify relevant new trends, regulations, or data sources
Explore potential for creating entirely new categories

Output Format
Executive Summary: Brief overview of the identified market opportunity and key solution themes
For each framework, provide:
2-3 specific solution concepts
Key differentiators for each concept
Target audience specifics
Potential challenges to overcome
"Best in the world" potential assessment
For each solution concept, include:
Clear descriptive name
2-3 sentence explanation
Key features or components
Primary value proposition
Potential business model
How it specifically addresses identified pain points
Opportunity Assessment: Conclude with a ranked evaluation of the top 3 solutions based on:
Market size and growth potential
Competitive advantage sustainability
Implementation feasibility
Potential for category dominance ("best in the world" potential)

Examples
Good Solution Generation:
Market Gap: Difficulty finding comfortable work-from-home furniture for small spaces

Segmentation Approach Solution: Urban Apartment Workspace System

A modular, wall-mounted workstation designed specifically for apartments under 600 sq ft
Features fold-away components, integrated cable management, and customizable configurations
Target audience: Urban professionals in high-cost cities with minimal space
Business model: Direct-to-consumer with professional installation option
Differentiator: The only ergonomic system designed exclusively for micro-apartments, with every component optimized for minimal footprint

Business Model Innovation Solution: Nomad Desk Subscription

Monthly subscription service providing high-quality, compact desks with free exchanges
Allows users to upgrade, downsize, or change styles as their living situation changes
Target audience: Young professionals who move frequently or want flexibility
Business model: Recurring revenue with asset utilization optimization
Differentiator: Eliminates the risk of investing in furniture that might not fit future spaces

Output Instructions
Begin by reviewing the pain points to understand the core market needs
Apply each framework systematically to generate diverse solution approaches
For each solution, clearly articulate how it addresses the specific pain points
Evaluate each solution for its potential to be "best in its category" in some way
Generate solutions across different price points and complexity levels
Ensure solutions span both immediate tactical opportunities and longer-term strategic plays
Prioritize practical, implementable ideas over theoretical concepts

```

### 提示词 3：落地页提示词创建器（Landing Page Prompt Creator）

选定一个你最感兴趣的方向之后，这个提示词会把所有信息——痛点、用户原话、产品定位——整合成一个新的提示词，专门用来生成落地页。

它还会自动适配 Lovable 这类 AI 低代码工具的最佳实践，尽量让你生成出来的页面更像“能用的页面”，而不是“一个看起来像页面的草稿”。

所以这一步基本就是：从 Claude 复制提示词，贴到 Lovable（或者 V0 这类编辑器）里跑，或者直接喂给codex或者claude code。

![20260507-5.jpg](/blog_images/20260507-5.jpg)

附提示词：
```
Next AI Prompt: Generate a Lovable Prompt for a Landing Page
Your new mission
From all the information in the conversation above, your new mission is to generate the best possible Lovable.dev prompt for creating a high-converting landing page.

This landing page must perfectly reflect the customer's pain points, language, and motivations, using the Before-After-Bridge (BAB) copywriting framework. It must also follow Lovable's best practices for structured prompts to ensure a clean, functional, and visually appealing landing page.

Your role is both an expert copywriter and a Lovable.dev landing page creation expert.

Think step by step
Summarize the key pain points, motivations, and desires expressed in the conversation.
Extract the best possible customer wording from the AI-generated business insights to maintain authenticity.
Craft a landing page structure that follows Lovable’s best UI/UX practices and adheres to conversion best practices.
Generate the perfect Lovable.dev prompt, ensuring the AI produces not only great copy but also an effective design.

Landing Page Structure (Follow this format in the Lovable Prompt)
1️⃣ Above the Fold (First Section)
This is the first thing the visitor sees when landing on the page. It must be immediately clear what the product is, who it’s for, and why it matters.

Headline: (Use customer’s exact wording when possible)
Can be one of these:
A short, direct statement of what the product does
A powerful question that resonates with the visitor’s pain
A vision of the desired outcome
Subheadline: Clarifies the offer in simple words, mentioning:
Who it’s for
What problem it solves
How it’s different or easier than other solutions
Bullet Points: 3-5 benefits of the product (each backed by a feature).
Call to Action (CTA): Simple, action-driven button text.

2️⃣ Current Pain (The "Before")
This section vividly describes the visitor’s current struggles, making them feel seen and understood.

Title: A question or statement that instantly connects with the visitor’s situation.
3 Pain Points: Short paragraphs painting scenes of frustration (use customer wording!).
Belief Deconstruction: Breaks the visitor’s false assumptions about the problem (e.g., why past solutions haven’t worked).

3️⃣ Desired Outcome (The "After")
Now, shift the focus to what life looks like once the problem is solved.

Title: A call to imagine their transformed life.
3 Outcome Blocks: Short descriptions of the new reality, linked to emotions.
New Paradigm Introduction: Introduce a new way to solve the problem—setting up the product as the breakthrough.

4️⃣ Introducing the Product
Now, finally introduce the offer.

Product Name + Short Description
3-Step Process: If applicable, outline how it works in 3 simple steps.
Message from the Founder: A personal statement to humanize the product.
Final CTA Block: Last push to get the visitor to take action (with urgency).

Lovable.dev Best Practices (Incorporate These in the Lovable Prompt!)
Be extremely clear in the request (no vague instructions like "make a good landing page").
Specify structure upfront (above-the-fold, pain points, solution, CTA, etc.).
Ensure strong CTA placement (e.g., after key sections).
Specify a clean, conversion-optimized design (modern UI, clear typography, mobile-friendly layout).
Use Lovable’s integrations wisely (e.g., include a contact form, email collection, Stripe for payments if relevant).

Now, Generate the Lovable.dev Prompt
Now, based on all the insights gathered, write a Lovable.dev prompt that will generate a full landing page that follows the structure above, using the customer’s own words wherever possible.

The Lovable prompt must:

Clearly instruct Lovable to create a landing page.
Include all the required sections and design instructions.
Use the customer’s own wording for headlines, pain points, and outcomes.
Ensure mobile responsiveness and a professional aesthetic.

Output:
A full Lovable.dev prompt that the user can copy and paste into Lovable to generate a fully functional, high-converting landing page.

Final Step
Once the Lovable.dev prompt is generated, review it to ensure:
✅ It includes clear instructions for layout & design.
✅ It follows conversion copywriting principles.
✅ It uses real customer insights from the previous conversation.
✅ It’s structured for Lovable to execute flawlessly.

Now, generate the best possible Lovable.dev prompt! 🚀

```

## 第五步：一键生成落地页

最后一步其实简单到有点夸张：把 Claude 生成的提示词复制到 Lovable，或者直接喂给codex或者claude code，点运行，等几分钟，一个完整的落地页就出来了。

Steph 演示的那个“TransitionGarden”页面，基本把该有的东西都放进去了：

- 清晰的价值主张，比如“把孩子在两个家之间转换时的痛苦，变成平和的告别”
- 明确的目标用户，比如“那些孩子在家庭转换时非常挣扎的离异父母”
- 核心功能列表，比如儿童友好的倒计时工具、结构化交接协议、情感检查系统、过渡模式追踪
- 常见问题解答，比如“是不是双方父母都要用才行？”

而且这些文案不是凭空编的，基本都是从真实用户语言里翻译出来的，不是营销话术。

## 但这只是开始，不是结束

看到这里，你大概率会问：那有了落地页，接下来是不是就可以直接开发了？

Steph 的建议很务实：不要立刻去写产品。

即使你已经有了页面、市场和痛点，从这里到真正跑起来的产品，中间还有大量工作。如果你时间有限，或者还不确定市场反应，最好再做一次验证。

他推荐的做法是：在落地页上加一个弹窗问卷。

你可以直接告诉用户：我们产品还在开发中，我们是个小团队，想听听你对这个问题的真实看法，能不能花几分钟回答几个问题？

然后问几个关键问题，最后再问一句：等产品上线时，要不要通知你？

![20260507-6.png](/blog_images/20260507-6.png)

## 深入了解 Steph France

我去翻了一下他的 X 账号（@meetstef），发现他的背景其实挺有意思。

他给自己的定位是“好奇营销人”(Curious Marketer)。他在 YouTube 上也有个频道，专门讲一些很“脑洞大开”的营销系统，订阅者已经超过 2.5 万。他之前在 a16z 工作过，现在在 Groq 负责增长。

从他的推文里能看出来，他是个典型的“网络挖掘狂”——会去研究专利到期时间、去科幻小说里找商业创意、去 Our World in Data 追踪社会趋势。他还在 “My First Million” 播客里分享过自己常用的 5 个“互联网金矿”工具，专门用来找下一波值得下注的趋势。

他对做事的态度也挺有意思。他在推特上说过，大意是：他的职业生涯就是一个接一个机会出现，而他根本没法拒绝。这种对机会的敏感度和执行力，可能才是他能做出这套框架的底层原因。

### Steph 提到的资源

- 黄金挖掘框架提示词包(http://starterstory.com/goldmining) - 免费下载所有提示词，前面几个步骤的提示词都在这里面
- 三大核心市场思维导图(https://whimsical.com/the-3-core-markets-giant-sub-niches-list-WbLp6Le8maXQDfTx5WBPyB)

## 相关链接

- Steph France 的 X:https://x.com/meetstef
- 原视频访谈:https://www.youtube.com/watch?v=L_FY6aW9cJ4
- Steph France 的 YouTube 频道:https://www.youtube.com/@steph_france

## 写在最后

看完这套框架，我最大的感受是：AI 时代的创业，已经不是“想创意”的游戏了，而是“挖数据”的游戏。

以前的创业思路通常是：我有个想法 -> 我觉得不错 -> 我去做 -> 最后发现没人要。现在这套逻辑反过来了：用户有问题 -> 去挖出他们真实的表达 -> 直接翻译成产品 -> 验证需求 -> 再开发。

这不是说创意不重要，而是创意的来源变了。以前创意来自你的脑子，现在创意更多来自用户的嘴。你真正要做的不是“想”，而是“听”和“挖”。

而且我发现，这套方法最妙的地方在于：它把最难的部分（理解用户）外包给了 AI，但把最关键的判断（选哪个市场、选哪个创意）留给了你。

AI 不会替你做决定，但它能把信息处理效率提升 100 倍，让你在 45 分钟内看到一个市场的全貌，这在以前可能要花几个月。

再次回顾一下整体流程：

![20260507-7.png](/blog_images/20260507-7.png)

如果你觉得这套方法有启发，欢迎点赞、转发。我是 louwlou，一个从大厂架构师转型独立开发的创业者，边学边实践边分享。
