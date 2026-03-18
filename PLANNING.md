# DayForge — Planning Document

> An AI-powered daily scheduler for solo creators. Built with Electron, React, SQLite, and Claude Haiku.

---

## Vision

DayForge replaces scattered calendars and task managers with a single tool that knows your day, adapts in real time, and learns how you actually work — not how you planned to work.

---

## Architecture

```
src/
├── main/                    # Electron main process (Node.js)
│   ├── index.js             # App entry, BrowserWindow setup
│   ├── ipc.js               # All IPC handlers (wrap() pattern)
│   ├── db/
│   │   ├── database.js      # SQLite connection + schema + seeds
│   │   ├── blocks.js        # Daily schedule blocks CRUD
│   │   ├── templates.js     # Schedule templates CRUD
│   │   ├── meetings.js      # Meetings CRUD + GCal upsert
│   │   ├── completionStats.js
│   │   ├── settingsDb.js
│   │   └── userProfile.js   # Profile save/get + toPromptContext()
│   ├── services/
│   │   ├── aiService.js     # Claude Haiku calls (replan, chat, week, morning)
│   │   ├── scheduler.js     # generateWeek() — bulk day generation
│   │   ├── conflictDetector.js
│   │   ├── learningService.js  # Record + surface productivity insights
│   │   ├── gcalService.js   # Google Calendar OAuth2 sync
│   │   ├── notificationService.js
│   │   └── activityMonitor.js  # Inactivity detection + nudges
│   └── prompts/             # Markdown prompt templates with {{VARIABLES}}
│       ├── chat.md
│       ├── replan_day.md
│       ├── plan_week.md
│       └── morning_briefing.md
├── preload/
│   └── preload.js           # contextBridge — exposes window.api + window.electronAPI
└── renderer/                # React app (Vite)
    ├── main.jsx             # Root, routing, keyboard shortcuts, morning briefing
    ├── index.css            # Design tokens (:root CSS variables)
    ├── pages/
    │   ├── DayView.jsx      # Timeline with current-time indicator
    │   ├── WeekView.jsx     # 5-column Mon–Fri grid
    │   ├── Dashboard.jsx    # Completion stats, streak, 4-week dot grid
    │   └── Settings.jsx     # Toggles, AI mode, data export
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx  # Nav + Ctrl+/ hint
    │   │   └── TopBar.jsx   # Date nav + progress bar
    │   ├── schedule/
    │   │   ├── TimelineBlock.jsx
    │   │   ├── BlockModal.jsx
    │   │   └── AddMeetingModal.jsx  # Conflict detection flow
    │   ├── ChatPanel.jsx    # 3-mode: Chat / Replan / Plan Week
    │   ├── MorningBriefing.jsx
    │   └── Onboarding.jsx   # 8-step wizard
    ├── store/
    │   └── useScheduleStore.js  # Zustand — blocks, date nav
    ├── hooks/
    │   └── useBlocks.js
    └── utils/
        ├── time.js          # timeToMinutes, getMondayOfWeek, etc.
        └── colors.js        # CATEGORY_COLORS, getCategoryColor
```

### IPC Contract

All renderer→main communication goes through `window.api.<namespace>.<method>()` (new) or `window.electronAPI.invoke(channel, args)` (legacy store).

Every IPC handler returns `{ data: result }` on success or `{ success: false, error: message }` on failure via the `wrap()` helper.

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `schedule_templates` | The repeating weekly template (Mon–Fri blocks) |
| `daily_blocks` | Generated instances from templates, per date |
| `meetings` | One-off meetings (local or GCal-synced) |
| `completion_stats` | Daily category completion counts |
| `settings` | Key/value app settings + user profile JSON |
| `learning_events` | Raw telemetry for AI learning layer |

---

## Color Palette (Logo-derived)

| Token | Hex | Use |
|-------|-----|-----|
| `--teal` | `#4CB8CC` | Primary accent, "Forged" text, teal category |
| `--copper` | `#C87941` | Meetings, compass rose, active nav border |
| `--gold` | `#D4A857` | Flex blocks, needle glow, warnings |
| `--steel` | `#6B9CC4` | Deep focus / code blocks |
| `--bg-primary` | `#0A1628` | Main background |
| `--bg-card` | `#112038` | Card backgrounds |

---

## Feature Phases

### ✅ Phase 1 — Core Scheduler
- Electron + React + SQLite foundation
- Daily block timeline (9am–9pm)
- Schedule templates (Mon–Fri)
- Block status cycling (pending → done / partial / skipped)
- Block editing modal

### ✅ Phase 2 — Week View & Meetings
- 5-column week grid
- Meetings CRUD with conflict detection
- Google Calendar OAuth2 sync (read-only)
- GCal all-day event handling

### ✅ Phase 3 — AI Chat Panel
- Claude Haiku integration (chat, replan day, plan week)
- Apply AI changes directly to schedule
- Morning briefing flow (focus → AI plan → Start Day)

### ✅ Phase 4 — Notifications & Polish
- Block transition notifications (2 min before + end)
- Inactivity detection (90 min default) → replan nudge
- Completion dashboard (weekly stats, streak, 4-week dot grid)
- Settings page (notifications, AI mode, data export)
- Error boundary + keyboard shortcuts

### ✅ Phase 5 — AI Learning Layer
- `learning_events` telemetry — block completions, skips, AI suggestions
- `getLearningContext()` — surfaces insights into every AI call
- Productivity by hour, skip patterns, time overrun detection

### ✅ Phase 6 — Onboarding & Personalization
- 8-step wizard: name, morning routine, pets, meals, exercise, home life, work style, evening
- `toPromptContext()` — converts profile to plain-English paragraph injected into all AI prompts
- Profile stored in settings table as JSON

---

## Roadmap

### Next — UI Polish Pass
- [ ] Research Linear / Cron / Raycast UI patterns
- [ ] Drag-to-reschedule blocks on timeline
- [ ] Command palette (`Ctrl+K`) for quick actions
- [ ] Completion micro-animations
- [ ] Right-click context menus on blocks
- [ ] Collapsed vs expanded block detail levels

### Later
- [ ] Pomodoro / focus timer per block
- [ ] Weekly review email/export
- [ ] Mobile companion (read-only day view)
- [ ] Local AI mode (Ollama backend)
- [ ] Multi-week planning horizon
- [ ] Recurring meetings support

---

## Development

```bash
# Install
npm install

# Run (Vite dev server + Electron)
npm run dev

# Tests (96 tests, Node built-in runner)
npm test

# Build distributable
npm run build
```

### Environment Variables (`.env` at project root)
```
ANTHROPIC_API_KEY=sk-ant-...
GCAL_CLIENT_ID=          # optional — Google Calendar sync
GCAL_CLIENT_SECRET=      # optional
GCAL_REDIRECT_URI=http://localhost:3000/oauth2callback
```

### Test Architecture
Tests run without Electron via `test/helpers/testDb.js` which injects an in-memory SQLite DB into Node's require cache, bypassing `app.getPath()` entirely.

```
test/
├── helpers/testDb.js           # In-memory DB injection
├── conflictDetector.test.js
├── db.blocks.test.js
├── db.meetings.test.js
├── db.completionStats.test.js
├── db.settings.test.js
├── db.userProfile.test.js
├── services.aiService.test.js
├── services.learningService.test.js
├── services.scheduler.test.js
├── utils.colors.test.mjs
└── utils.time.test.mjs
```

---

## Key Design Decisions

**Why Electron + SQLite?**
Offline-first, no subscription, user owns their data. SQLite is synchronous (better-sqlite3) which simplifies IPC — no async DB layer needed.

**Why Zustand over Redux?**
Minimal boilerplate for a single-window app. The store is a thin wrapper around IPC calls.

**Why Claude Haiku?**
Fast enough for interactive replanning (< 2s). Cheap enough to use on every block status change. Smart enough with a good prompt.

**Why Node test runner over Jest/Vitest?**
Zero config, no dependencies, ships with Node 22. Sufficient for pure unit tests of DB and service logic.
