# Image Prompt Base

Image Prompt Base is a Next.js app for browsing, creating, and reusing AI image prompts. It includes:

- a public prompt gallery
- prompt template detail pages
- a prompt builder with variable filling and direct editing
- blog and landing pages
- Clerk auth, credits, and checkout flows
- Supabase-backed prompt/template storage
- SEO-friendly routes, metadata, and sitemap generation

Preview from: https://imagepromptbase.xyz/
![cover.png](https://github.com/denghuichao/gpt-image-prompt/blob/main/public/cover.png?raw=true)

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Clerk
- OpenAI image generation
- Creem checkout

## Project Structure

- `pages/` app routes and API routes
- `components/` shared UI
- `utils/` data access, SEO, auth, and helper logic
- `content/blog/` blog posts in Markdown
- `public/` static assets
- `scripts/` build-time helpers such as sitemap generation

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start a production build locally:

```bash
npm run start
```

Run lint:

```bash
npm run lint
```

## Environment Variables

Required for full functionality:

```bash
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
CREEM_API_KEY=
```

Optional but supported:

```bash
SITEMAP_SITE_URL=
SUPABASE_PROMPT_IMAGES_BUCKET=
SUPABASE_GENERATED_IMAGES_BUCKET=
PROMPTS_API_CACHE_TTL_MS=
PROMPTS_API_CACHE_MAX_ENTRIES=
ADMIN_EMAILS=
FREE_SIGNUP_CREDITS=
OPENAI_BASE_URL=
OPENAI_IMAGE_TIMEOUT_MS=
CREEM_WEBHOOK_SECRET=
NEXT_PUBLIC_SUPPORT_EMAIL=
NEXT_PUBLIC_SUPPORT_X_URL=
NEXT_PUBLIC_SUPPORT_GITHUB_URL=
```

## Main Routes

- `/` home
- `/gallery` prompt gallery
- `/prompts/[slug]` template detail page
- `/build` prompt builder
- `/blogs` blog index
- `/blogs/[slug]` blog post
- `/pricing` pricing page
- `/support` support page
- `/privacy` privacy policy
- `/terms` terms

## API Routes

- `GET /api/prompts`
- `POST /api/prompts`
- `GET /api/prompts/facets`
- `GET /api/prompts/[slug]/gallery`
- `GET /api/prompt-gallery`
- `POST /api/generate`
- `GET /api/credits`
- `GET|POST /api/conversations`
- `POST /api/checkout`
- `POST /api/checkout/confirm`
- `POST /api/webhooks/creem`

## Content and SEO

- Template pages are server-rendered and include metadata and JSON-LD.
- The sitemap is generated automatically before `dev`, `build`, and `start`.
- Blog posts live in `content/blog/` and are rendered as static pages.
- Robots.txt is served from `pages/robots.txt.ts`.

## Notes

- If Supabase or Clerk keys are missing, some features fall back to local or limited behavior.
- Template data can be sourced from Supabase or from local importable JSON during development.

