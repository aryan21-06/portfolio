# Product Requirements Document
## Terminal-Style Interactive Portfolio

**Version:** 1.1
**Owner:** Aryan Sewani
**Status:** Active
**Last Updated:** September 13, 2026

---

## 1. Overview

### 1.1 Summary
A personal portfolio website styled as an interactive Linux CLI terminal. Visitors navigate skills, projects, experience, and blog content by typing commands (or tapping autocomplete suggestions), while the site remains fully accessible, shareable, and readable for non-technical visitors (e.g., recruiters, LinkedIn connections) via deep-linked routes that auto-execute the relevant commands.

### 1.2 Problem Statement
Standard portfolio sites (card grids, generic templates) are forgettable and don't differentiate a developer's personal brand. A terminal-based UI signals technical craft and curiosity while creating a memorable, interactive experience — but only if it doesn't sacrifice usability for non-technical visitors or break basic web expectations (shareable links, readable content, SEO, mobile use).

### 1.3 Goals
- Build a portfolio that is **distinctive and memorable** without being a usability trap.
- Support **skills, projects, experience, and blogs** (tech + non-tech), editable via an admin panel. Project media is the deliberate exception: the two existing project images remain local code assets.
- Make every piece of content **deep-linkable** (e.g., shareable blog post URLs) and readable even for visitors unfamiliar with CLI conventions.
- Provide a **screening-friendly consolidated view** (skills + experience + projects in one scrollable place) for recruiters who won't explore interactively.
- Keep the build **achievable incrementally** by a solo developer without devolving into unstructured "vibecoding."

### 1.4 Non-Goals
- Not building a real shell/sandboxed code execution environment.
- Not supporting arbitrary Linux commands beyond the defined registry.
- Not targeting multi-user accounts — single admin (site owner) only.

---

## 2. Target Users & Personas

| Persona | Description | Primary Need |
|---|---|---|
| **Recruiter / Hiring Manager** | Time-constrained, may not know CLI syntax, often arrives via a specific shared link (e.g., LinkedIn) | Fast, readable access to relevant content; option for a consolidated "resume view" |
| **Fellow Developer** | Curious, enjoys exploring, will try typing commands | Fun, discoverable interactive experience with easter eggs |
| **General Reader (blog)** | Arrives via a direct blog link (social media, search) | Needs instantly readable content, terminal styling should not impede reading |
| **Site Owner (Admin)** | You | Needs a simple, reliable admin panel to add/edit content without touching code |

---

## 3. Core Concept & Interaction Model

### 3.1 Principle: URL is the source of truth
The terminal is a **renderer of route state**, not an independent state machine. Every meaningful interaction corresponds to a real route:

| Route | Auto-executed command | Description |
|---|---|---|
| `/` | *(none — shows boot message + hint)* | Landing terminal, idle prompt |
| `/skills` | `cd skills && ls` | Lists skills |
| `/projects` | `cd projects && ls` | Lists projects |
| `/projects/[slug]` | `cd projects && cat [slug]` | Opens a specific project |
| `/experience` | `cd experience && ls` | Lists experience entries |
| `/blogs` | `cd blogs && ls` | Lists blog posts |
| `/blogs/[slug]` | `cd blogs && cat [slug]` | Opens a specific blog post |
| `/resume` (or `/overview`) | `cat skills experience projects` | Consolidated screening view |

Typing a command in the terminal triggers `router.push()` to the matching route rather than mutating local-only state. This guarantees every state is shareable, back-button-safe, and bookmarkable.

### 3.2 Command Surface (v1 — deliberately minimal)
| Command | Behavior |
|---|---|
| `help` | Lists all available commands, always accessible |
| `ls` | Lists contents of current "directory" (root, skills, projects, experience, blogs) |
| `cd <dir>` | Navigates into a section, auto-runs `ls` |
| `cat <name>` | Opens/renders a specific item (project detail, blog post) |
| `cat skills experience projects` | Consolidated view (aliased as `resume` or `overview`) |
| `whoami` / `about` | Short bio |
| `clear` | Clears terminal buffer |
| `sudo make coffee` | Easter egg (personality, no functional output) |

Command set stays intentionally small in v1 to keep the interface guessable without a manual.

### 3.3 Input Methods
- **Desktop:** Type + `Tab` for autocomplete (cycles matches, shows ghost-text of top match), `↑`/`↓` for history.
- **Mobile:** No physical Tab key — persistent suggestion chip bar above the keyboard. Tapping a chip autocompletes and, if it forms a complete valid command, can auto-submit. This is the primary interaction mode for non-technical/mobile visitors, who may never type manually.
- **Clickable content:** Any link inside terminal output (GitHub links, external URLs) is a real clickable inline element, styled like a shell hyperlink (e.g., underlined, accent color, optional `→` prefix).

### 3.4 Consolidated "Screening" View
A dedicated `/resume` route renders skills, experience, and projects concatenated into one scrollable, readable page — styled with terminal chrome but with zero interaction required. This exists specifically for recruiters who want a single static overview without exploring commands.

---

## 4. Content Types & Data Model

The following Firestore structure is final for the current application. The seeded data is the source of truth; implementation must not introduce a second content model.

```
/site/about
  {
    displayName, handle, headline, shortBio, longBio,
    location, timezone,
    availability: { status, label },
    email, avatarUrl, socialLinks: [{ label, url }],
    interests: string[], currentlyWorkingOn, resumeUrl,
    updatedAt: Timestamp
  }

/skills/{skillId}
  {
    slug, name, category, summary, tools: string[],
    featured, status: 'published' | 'draft', order,
    createdAt, updatedAt
  }

/experience/{experienceId}
  {
    slug, role, company, companyUrl, location,
    startDate: 'YYYY-MM', endDate: 'YYYY-MM' | null,
    summary, highlights: string[], tags: string[],
    status: 'published' | 'draft', order,
    createdAt, updatedAt
  }

/projects/{projectId}
  {
    slug, title, summary, content: string, role,
    tags: string[], links: string[], imageUrl: string,
    featured, status: 'published' | 'draft', order,
    createdAt, updatedAt
  }

/blogs/{blogId}
  {
    slug, title, excerpt, content: string, tags: string[],
    isTech, readingTimeMinutes, coverImageUrl,
    publishedAt: Timestamp,
    status: 'published' | 'draft', order,
    seo: { title, description },
    createdAt, updatedAt
  }
```

Current document IDs are:

```text
skills: frontend-engineering, backend-databases, programming, business-analysis
experience: atomnik-technologies, malhar-26
projects: cosmikerp, prayog, swar, the-laughing-hippo, database-cache
blogs: om-namah-shivay
```

All timestamps are Firestore `Timestamp` values generated by the seed process.

### 4.2 Content Authoring
- Blog content is currently stored as a plain `string`, not TipTap JSON.
- The first implementation must render the existing string content safely as readable text/Markdown-like content.
- TipTap is a future enhancement, not a requirement for the current data model. Do not change the Firestore blog field to TipTap JSON without an explicit migration.
- Project links are currently stored as URL strings. The UI must derive a display label where necessary instead of requiring link objects.

### 4.3 Project Images
- Firebase Storage is not used.
- `projects.imageUrl` remains an existing string field and is currently empty in the seeded documents.
- The only project images are local application assets for `cosmikerp` and `prayog`.
- Store them in `public/projects/` and resolve them through a code-owned project media map.
- Projects without a matching local asset must render normally without an image or an image placeholder.
- Adding or changing a local project image requires a code change and deployment; adding regular project content does not.

### 4.4 Admin Panel (v1 scope)
- Firebase Auth (single admin user, email/password is sufficient — no need for social login)
- CRUD forms for skills, experience, projects
- Plain text/Markdown-compatible content field + metadata fields (slug, tags, isTech, status) for blogs
- Draft/Published status so unfinished posts aren't publicly linkable
- Local project images are not uploaded through the admin panel

---

## 5. Rendering Strategy (Critical Design Decision)

Two distinct rendering modes are required — conflating them is the most common failure mode for terminal-style UIs:

### 5.1 Type A — Animated/typed text
Used for: system messages, `ls` output, short prose lines, command echoes.
- Line-by-line or char-by-char reveal via a timed queue (`{ type: 'line', text, delay }` played through a reducer)
- Lightweight implementation (CSS `steps()` or JS interval); Framer Motion used for cursor blink and line fade-in, not per-character animation (too expensive for longer content)

### 5.2 Type B — Mounted rendered components
Used for: blog post bodies, project detail cards, the consolidated resume view.
- **Never character-typed.** A short intro line animates (`> opening ~/blogs/my-post.md...`), then the actual content mounts as a real component with a simple fade/slide-in (`AnimatePresence`)
- Fully readable instantly — critical for the LinkedIn-link use case where a non-technical reader lands directly on a blog post

### 5.3 Rule of thumb
Content under ~15 words → animate as typed text.
Content longer than that (blog bodies, detailed descriptions) → mount as styled component, animate the *entry*, not the *text itself*.

---

## 6. UX Requirements

### 6.1 First-time / onboarding
- On first load, a pinned hint animates in: `type 'help' to get started, or press Tab ⇥`
- `help` output always accessible and lists every command with a one-line description

### 6.2 Deep-link behavior (LinkedIn / social sharing case)
- A shared blog link (`/blogs/my-post-slug`) must load as an **instantly readable page** — terminal-styled chrome (monospace font, title bar, accent colors) wrapping normal, real DOM content
- No requirement for the visitor to understand or use CLI commands to read the shared content
- Optional subtle prompt/button ("Enter the terminal →") for curious visitors to explore the rest of the site interactively

### 6.3 Accessibility & Fallbacks
- Semantic, readable DOM underneath all terminal styling (screen-reader compatible)
- A visible fallback navigation (or the `help` output) must always provide a non-command way to reach every section, for visitors who don't want to type or tap commands

### 6.4 Mobile
- Suggestion-chip bar in place of physical Tab key
- Terminal font/sizing must remain legible on small viewports without horizontal scroll

---

## 7. Technical Architecture

### 7.1 Stack
- **Next.js** — routing (auto-executes commands per route, see §3.1), SSR/SSG for blog SEO
- **Framer Motion** — line fade-ins, cursor blink, component mount transitions
- **Firebase** — Firestore (content), Firebase Auth (admin login)
- **Local public assets** — project images for CosmikERP and Prayog; no Firebase Storage

### 7.2 Execution Pipeline
```
Input (typed / route-triggered / clicked link)
   → Parse into { command, args }
   → Look up in command registry
   → Registry returns a sequence of terminal "events"
   → Renderer plays events into scroll buffer (Type A or Type B, per §5)
   → router.push() if the resulting state maps to a new URL
```

### 7.3 Command Registry Pattern
Commands are defined as a registry object mapping command name + arg pattern to a handler function returning a render-event sequence — not nested if/else logic. This keeps the parser extensible (adding a new command = adding a new registry entry) and testable in isolation from the UI.

---

## 8. Phased Build Plan

| Phase | Scope | Goal |
|---|---|---|
| **1. Static shell** | Hardcoded commands (`help`, `ls`, `about`), plain input, `console.log` output | Prove parse-and-print loop |
| **2. Command registry** | Registry pattern, `cd`/`cat` with fake data, command chaining | Prove `cd blogs && ls` chaining logic |
| **3. Routing sync** | Real Next.js routes auto-firing matching commands; typed commands trigger `router.push()` | Prove URL ↔ terminal state sync |
| **4. Firebase integration** | Read the final seeded collections from Firestore; render published skills, experience, projects, and blogs | Prove real data flows through unchanged pipeline |
| **5. Local project media** | Add the CosmikERP and Prayog assets from `public/projects/`; conditionally render them by project ID/slug | Prove projects work with and without images |
| **6. Admin and access control** | Firebase Auth, protected CRUD forms, draft/published filtering | Allow content updates without editing code |
| **7. Rich editing (future)** | Optionally migrate blog strings to TipTap only after defining and running a data migration | Add structured blog authoring without invalidating current data |
| **8. Polish** | Animation (Type A/B per §5), autocomplete, mobile chip bar, Framer Motion, easter eggs | Final UX layer, deliberately last |

Each phase should be treated as a standalone, testable milestone with one clear success question (e.g., "does the URL match the command state?") rather than attempting the full spec in one build session.

---

## 9. Success Metrics (informal / personal project)

- A recruiter can land on `/blogs/[slug]` from a shared link and read the full post without needing any CLI knowledge.
- A visitor can reach every section (skills, projects, experience, blogs) using only Tab/chip-based autocomplete, without typing a full command from memory.
- Admin panel allows adding a new blog post, project, or skill entry without any code changes or redeploy. Local project images are intentionally excluded from this requirement.
- Site remains usable and legible on mobile viewports.

---

## 10. Open Questions / Future Considerations

- Should blog posts support comments or reactions, or remain read-only?
- Should there be a "search" command (`grep <keyword>`) across blog content?
- Analytics: track which commands are most used to inform which sections to expand?
- Dark/light theme toggle (`theme dark` / `theme light` command) — nice-to-have, not v1.
- Should `sudo` scoped easter eggs expand over time as a returning-visitor delight?

---

*End of document.*
