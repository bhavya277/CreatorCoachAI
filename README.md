# CreatorCoach AI — Gaming Creator Growth Coach

**CreatorCoach AI** is a full-stack web application designed for gaming creators who publish short-form clips on **Instagram Reels** and **YouTube Shorts** (focusing on titles such as *Minecraft*, *Valorant*, *BGMI*, and *CODM (Call of Duty: Mobile)*).

It replaces generic chatbots and vanity dashboards with deterministic creator analytics, open-weight AI coaching (via Ollama), high-retention video script generation, and structured weekly sprint planning.

---

## Key Highlights

- **Deterministic Analytics Engine**: Computes performance strictly via TypeScript math functions using the explicitly documented engagement rate formula:
  $$\text{Engagement Rate} = \frac{\text{likes} + \text{comments} + \text{shares}}{\text{views}} \times 100$$
  *Missing metrics are omitted rather than coerced to zero*, preventing skewed baselines.
- **Open-Weight AI Coach (Ollama)**: Epistemically honest diagnostic reasoning. Clearly differentiates observed empirical data from causal hypotheses. Never promises "viral hacks" or pretends to possess proprietary algorithm secrets. Generates 3 actionable recommendations and 5 testable video experiments with confidence tiers.
- **Content Studio**: Generates 3 alternative opening hooks (shock, curiosity gap, action climax), full spoken voiceover scripts, scene-by-scene visual/audio outlines, on-screen text overlays, platform-tailored captions, and Reels vs. Shorts adaptation tips.
- **Weekly Sprint Planner**: Interactive Kanban pipeline (Idea → Scripting → Recorded → Published) to track 5 weekly concepts, test hypotheses, and record actual post-publish metrics.
- **CSV Importer & Manual Entry**: Automatic field mapping for YouTube Studio and Instagram Insights exports with sample CSV download, validation warnings, and inline video editing.
- **Instant Demo Mode**: Includes 18 pre-loaded realistic gaming clips (including clutch highlights, redstone tutorials, and funny fails) and pre-analyzed coaching reports. Zero external dependencies required to explore.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom sleek dark-mode SaaS tokens (near-black, charcoal `#090b10`, `#11141e`, purple `#8b5cf6`, cyan `#38bdf8`)
- **Icons**: Lucide Icons
- **Charts**: Recharts (Responsive bar charts, trend area lines, platform comparisons)
- **Data Parsing & Validation**: Papa Parse (CSV) & Zod (JSON schema validation)
- **AI Inference**: Ollama API client (open-weight models e.g. `llama3.2:latest`, `mistral:7b`, `qwen2.5:7b`)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) policies and automatic LocalStorage fallback

---

## Application Pages

| Route | Name | Purpose |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Value proposition, feature showcase, sample AI coaching card, open-source AI philosophy, pricing, and FAQ. |
| `/dashboard` | **Dashboard** | Total views, average views baseline, likes, shares, comments, strict engagement rate, recent performance chart, format comparison chart, latest AI recommendations, and sprint progress. |
| `/analytics` | **Analytics & Datasets** | Video catalog table, game/platform/format search and filtering, CSV import with column mapping, manual entry modal, format reach charts, and missing metric denominator tracking. |
| `/coach` | **AI Coach** | Observed performance summary, top formats, underperforming content hypotheses, 3 recommendations with confidence scores, and 5 upcoming experiments with one-click "Add to Planner". |
| `/studio` | **Content Studio** | Input game, format, platform, target audience, tone, length, and objective. Generates 3 hooks, spoken script, scene breakdown, on-screen text, captions, and platform adaptation. |
| `/planner` | **Weekly Planner** | 4-column sprint board (Concept Ideas, In Scripting, Recorded & Edited, Published & Tracking). Edit ideas, move statuses, and record post-publish actuals. |
| `/profile` | **Settings & AI Config** | Creator identity, main games selector, audience niche, weekly goals, Ollama endpoint test diagnostic, and database connection status. |

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ / v22+
- **npm** or **pnpm**
- (Optional) **Ollama**: For running open-weight AI inference locally

### 2. Installation

Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd "Week 2"
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:
```env
# Optional: Supabase PostgreSQL (defaults to LocalStorage Demo Mode if not provided)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Ollama Open-Source AI (defaults to local Ollama if installed)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:latest
OLLAMA_TIMEOUT_MS=30000
```

### 4. Running the Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Open-Source AI Setup (Ollama)

CreatorCoach AI uses **Ollama** as the inference engine for open-weight instruction models.

### Recommended Models
- **`llama3.2:latest`** (Recommended for balanced speed and reasoning)
- **`llama3.1:8b`**
- **`mistral:7b`**
- **`qwen2.5:7b`**

### Quick Setup Steps:
1. Download and install Ollama from [ollama.com](https://ollama.com).
2. Pull your model of choice:
   ```bash
   ollama pull llama3.2
   ```
3. Start the Ollama server:
   ```bash
   ollama serve
   ```
4. Verify connectivity in CreatorCoach AI by navigating to `/profile` and clicking **"Test Connection"**.

> **Note on Zero-Setup Demo Mode**: If you do not have Ollama installed, the app does not fail or block you! You can click **"Load Demo Report"** or **"Instant Sample Script"** to inspect production-quality outputs generated from real gaming creator datasets.

---

## Database Configuration (Supabase)

The project includes an SQL schema in `supabase/schema.sql`.

### Tables Created:
1. `profiles`: Creator handles, niche, games, weekly targets, and Ollama configuration.
2. `videos`: Catalog of clips with views, likes, comments, shares, retention rate, and platform.
3. `video_metrics`: Time-series metric snapshots for historical tracking.
4. `coaching_reports`: Stored AI coaching reports, recommendations, and hypotheses.
5. `content_ideas`: Weekly planner video concepts and post-publish actual performance.
6. `content_experiments`: Concrete testable experiments linked to video concepts.

### Applying Migrations:
1. Create a project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** tab in the Supabase Dashboard.
3. Paste the contents of `supabase/schema.sql` and click **Run**.
4. Add your Supabase project URL and anon public key to `.env.local`.

---

## Deployment to Vercel

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Set the required environment variables in the Vercel project settings (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.).
4. **Ollama Reachability in Cloud Deployments**:
   - Vercel serverless functions cannot connect to `http://localhost:11434` (the developer's personal machine).
   - For cloud inference, set `OLLAMA_BASE_URL` to a publicly accessible, secured Ollama endpoint (e.g. hosted on a GPU VPS like RunPod, Modal, or Vultr with an authentication proxy).
   - If no remote inference host is configured, the application continues to run all deterministic analytics, CSV imports, and sample demo generation smoothly.

---

## License

MIT License. Designed and built for gaming creators.
