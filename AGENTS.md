# CampusLink — Agent Rules (Simplified & Animated Direction)

## Product
CampusLink is an AI-powered Campus-to-Corporate placement platform (BPUT PS10). One Next.js web app (`Frontend`) contains three portals: Student, Recruiter, Placement Cell. It talks to two existing backends through a same-origin proxy: `cell-api` (Express + MySQL, :5000) and `recruiter-api` (FastAPI + SQLite, :8000). The demo shows: Profiling -> Matching -> Scheduling -> Notification -> Offer Tracking -> Analytics.

## Design intent
A warm, light-first, highly focused product that replaces heavy dashboards with 3 sliding pill tabs, 7 single-job screens, and physics-based motion you can actually see (cards gliding on re-rank, self-drawing checkmarks, smooth clash reallocation).

## Hard bans
- No emoji in UI code. Use Lucide icons or plain text.
- No confetti, no bouncing or pulsing elements, no floating orbs, no aurora gradients, no neon glow.
- No heavy dark-only dashboards. Default is warm off-white canvas (`#FBFAF7`) with soft tinted portal panels.
- Lists show at most 5 items for clarity and demo punchiness.

## Color Palette (Semantic Tokens)
~~~css
:root {
  --canvas: #FBFAF7;
  --surface: #FFFFFF;
  --line: #ECE9E1;
  --ink: #1B1F3B;
  --ink-2: #3E435E;
  --ink-3: #5F6580;
  --accent: #4F46E5; /* Indigo action */
  --accent-tint: #EEF0FF;
  --mint: #10B981; /* Good */
  --mint-dark: #0B7A55;
  --mint-tint: #E6F7F0; /* Student portal panel */
  --amber: #F5A524; /* Medium */
  --amber-dark: #9A5B05;
  --amber-tint: #FFF4DC;
  --coral: #E5484D; /* Attention / Clash */
  --coral-dark: #B3261E;
  --coral-tint: #FDECEC;
  --peach-tint: #FFF1E6; /* Placement cell panel */
}
~~~

## Top Bar & Navigation
- No 232px sidebar, no breadcrumbs, no command palette, no compare trays.
- Single top bar:
  - Left: "CampusLink" wordmark with 22px indigo squircle icon.
  - Center: Three sliding pill tabs: **Student**, **Recruiter**, **Placement cell** with smooth sliding pill background (`transition: transform 450ms cubic-bezier(.34, 1.4, .64, 1)`).
  - Right: Subtle "Judges' Corner" link and "Guided tour" button.
- Main portal panel smoothly transitions background tint:
  - Student: `--mint-tint` (`#E6F7F0`)
  - Recruiter: `--accent-tint` (`#EEF0FF`)
  - Placement cell: `--peach-tint` (`#FFF1E6`)

## 7 Focused Screens (One job each, max 5 items)
1. **Student Readiness & Skill-Gap**: 150px SVG score ring (fills and changes color dynamically) + interactive skill checklist with self-drawing checkmarks.
2. **Student Drives & Offers**: 4-5 matched job cards + inline apply with self-drawing checkmark + offer acceptance card.
3. **Recruiter Matching**: Single "Grades / Skills" slider (`[Grades] ----o---- [Skills]`) + cards glide and flash soft indigo on re-rank + Hidden gem Subham Panda glides to #1.
4. **Recruiter Talent Pipeline**: 5-column Kanban pipeline with clean risk indicators.
5. **Recruiter JD Studio**: 2-column natural language JD parser with instant competency chips.
6. **Placement Cell Conflict Scheduler**: Visual timetable with Seminar Hall A / B / Auditorium 1 + "Fix it" button slides Apex Cloud down by 52px into Hall B with self-drawing checkmark.
7. **Judges' Corner & Architecture**: Clean box-and-line SVG architecture + formula calculator + statistically sound multi-factor vs cutoff evaluation (circular 0% vs 84.2% removed).

## Motion Budget
- **Sliding tab pill**: 450ms spring (`cubic-bezier(.34, 1.4, .64, 1)`)
- **Readiness score ring**: 800ms fill (`cubic-bezier(.22, 1, .36, 1)`) + color morphing
- **Candidate card glide**: 650ms vertical translate (`cubic-bezier(.34, 1.35, .64, 1)`) + 700ms soft indigo rank-change flash
- **Self-drawing checkmarks**: 400ms SVG draw animation (`stroke-dashoffset: 0`)
- **Conflict slot slide**: 800ms vertical translate (`transform: translateY(52px)`) + Coral-to-Mint transition
- All motion instant under `prefers-reduced-motion`.
