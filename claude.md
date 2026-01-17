# Unwind App: System Context & Architecture

## What is Unwind?

Unwind is a mental health productivity app specifically designed for people with anxiety and ADHD who experience racing thoughts and mental clutter.

**Core Problem We Solve:**
People with anxiety/ADHD have 20+ thoughts, worries, and tasks swirling in their head simultaneously. By the time they write something down, they've forgotten half of it. Traditional to-do lists feel sterile and don't match how their brains actually work.

**Core Solution:**
Voice-dump everything unfiltered → AI intelligently organizes → User sees only what matters today → Mental relief + clarity.

---

## How Unwind Works

### Phase 1: Voice Capture

User opens app and does a 2-5 minute voice dump. They can say anything:

- Work tasks ("finish the proposal")
- Worries ("what if I fail")
- Ideas ("learn Python")
- Errands ("buy groceries")
- Health concerns ("chest pain")
- Relationship stuff ("call mom")

**The key:** Unfiltered, messy, stream of consciousness. No pressure to organize.

### Phase 2: AI Processing

The app:

1. **Transcribes** audio to text
2. **Categorizes** each thought into one of 7 fixed categories
3. **Extracts deadlines** ("by Friday", "tomorrow", "asap")
4. **Infers priority** (urgency + importance + emotional weight)
5. **Detects spirals** (worry chains like "what if X → what if Y → what if Z")
6. **Validates** feelings without dismissing them

### Phase 3: Smart Organization

User sees their organized thoughts:

- **Today** (3 items due today)
- **This Week** (7 items due this week)
- **Everything Else** (18 items safely stored)
- **Worries Vault** (anxieties captured, not actionable)

**The magic:** They only see what matters today. Everything else is safe but hidden. Reduces overwhelm instantly.

### Phase 4: Reassurance + Action

The app:

- Provides validation: "Your thoughts are captured. You can stop thinking about them."
- Helps with completion (celebrate wins, track progress)
- Learns patterns (what helps this user specifically)
- Offers gentle reminders (never aggressive)

---

## Core Features (MVP)

### 1. Voice Dump & Transcription

- Record audio (no time limit)
- Auto-transcribe using Whisper or similar
- Works offline (capture locally, transcribe when online)

### 2. AI Categorization (7 Fixed Categories)

- **Tasks**: Work, projects, actionable items with deadlines
- **Ideas**: Creative exploration, learning, someday concepts
- **Errands**: Shopping, appointments, admin
- **Health**: Medical, fitness, nutrition, mental health
- **Relationships**: People, communication, social
- **Worries Vault**: Pure anxiety, intrusive thoughts (NOT actionable)
- **Recurring**: Habits, routines, repeating items

### 3. Deadline Extraction

AI extracts temporal references:

- Explicit: "due Friday" → Friday this week
- Relative: "by end of month" → last day of month
- Vague: "soon" → This week (suggested to user)
- Recurring: "3x a week" → Recurring pattern

### 4. Priority Inference

AI scores based on:

- Urgency: How soon is it due?
- Importance: Impact on life/wellbeing?
- Emotional Weight: How much anxiety is attached?
- Formula: (Urgency × 0.4) + (Importance × 0.4) + (Emotional × 0.2)

### 5. Worry Spiral Detection

AI detects when user spirals ("what if X" → "what if Y" → "what if Z"):

- Separates real threat from catastrophizing
- Breaks down spiral into actionable vs. pure anxiety
- Shows reality check: "This feeling is real, but..."

### 6. Flexible Tags

Users/system can tag items:

- Time: #today, #thisweek, #someday
- Priority: #urgent, #important
- Context: #work, #health, #family
- Emotion: #anxiety, #spiral, #procrastination
- Status: #blocked, #in-progress

### 7. Today View

Shows ONLY:

- 3 things due today
- Count of things due this week
- "X other things safely stored"

Prevents "47 things to do" anxiety spiral.

### 8. Completion & Celebration

- Users mark tasks complete
- Soft celebration (checkmark, sound, animation)
- End-of-day summary: "You did 3 things today"
- Builds evidence against anxiety ("you CAN do things")

### 9. Reassurance Messages

App validates anxiety instead of dismissing it:

- Spiral detected: "You went down a 'what if' chain. That's anxiety, not reality."
- Procrastinating: "Anxiety makes starting harder. You can do this."
- Completed something: "You did that. Your anxiety said you couldn't, but you did."

---

## Database Schema (12 Tables)

### Core Tables (MVP)

1. **users** — Account, preferences, anxiety type
2. **voice_dumps** — Raw transcriptions + processing status
3. **items** — Individual tasks/thoughts (core table)
4. **categories** — 7 fixed categories (system reference)
5. **item_tags** — Flexible tagging for filtering
6. **recurring_items** — Habits and recurring tasks
7. **reminders** — Individual reminder instances

### Analytics Tables (Phase 2)

8. **completions_log** — Track completion patterns + mood
9. **ai_learning_logs** — Track AI decisions for improvement
10. **mood_tracking** — Optional mood tracking over time
11. **user_preferences** — Advanced settings
12. **sample_tags** — Tag suggestions

### Key Fields on Items Table

- `title` — The captured thought
- `category_id` — One of 7 fixed categories
- `priority` — high/medium/low
- `final_priority_score` — 0-100 (calculated)
- `due_date`, `due_time` — Extracted deadline
- `deadline_confidence` — How confident is the AI?
- `status` — pending/completed/archived/deleted
- `is_worry_spiral` — Did AI detect a spiral?
- `spiral_breakdown` — JSON breakdown of the spiral
- `custom_tags` — Array of tags

---

## AI Agent Integration

The app is designed for LLM agents to be able to query and act on data intelligently.

### Key Tools for LLM Agents

1. **get_items_by_tags** — Filter by tags, category, date range
2. **get_items_by_category** — Get all items in a category
3. **get_today_view** — Get today + this week items
4. **search_items** — Complex search with multiple filters
5. **get_worries_vault** — Get anxiety/spiral items
6. **complete_item** — Mark item as complete
7. **create_item** — Add new item programmatically

### Query Pattern

Tags make queries easy and structured:

```
get_items_by_tags(['work', 'urgent'])
→ All items tagged #work AND #urgent
→ Fast (< 50ms), structured, AI-friendly
```

---

## Architecture Principles

### 1. Structure + Flexibility

- **Fixed categories** reduce decision fatigue (7 choices, not infinite)
- **Flexible tags** allow personalization without chaos
- Result: Safe structure for anxious brains + customization for ADHD

### 2. Validation, Not Dismissal

- Never say "don't worry, it's fine" (dismissive)
- Instead say "that feeling is real, here's the truth" (validating)
- Acknowledge emotions while providing perspective

### 3. Less is More (Especially Notifications)

- Default: 1 reminder per item
- Never more than 3 reminders/day
- No reminders 10 PM - 8 AM (sleep protection)
- If user ignores 3x, stop reminding (respect choice)

### 4. Minimal Friction

- Voice capture is one tap
- Recording has no time limit
- Editing is optional (doesn't require immediate refinement)
- All interactions are "skip-friendly"

### 5. AI Should Learn

- Track when AI is right/wrong (ai_learning_logs)
- Learn user patterns (when do they act on reminders?)
- Optimize over time (better suggestions, better timing)

### 6. Privacy First

- All audio/data stays local when possible
- Row-Level Security (RLS) prevents data leaks
- Users control what data is tracked
- No selling data or building user profiles for ads

---

## What This App is NOT

❌ **Not a productivity gamifier**

- No streaks ("14 days in a row!")
- No badges or points
- No leaderboards or social pressure

❌ **Not pushy**

- No aggressive notifications
- No "you're behind" messages
- No shame-based design

❌ **Not clinical**

- Not a replacement for therapy
- But supports therapeutic goals
- Compassionate, not sterile

❌ **Not for everyone**

- Specifically for anxiety/ADHD brains
- Others might find it too focused

---

## User Journey

### Day 1: First Use

1. Open app
2. Hit record
3. Talk for 2-5 minutes (unfiltered)
4. Hit done
5. See chaos organized into categories
6. Get reassurance message: "Your thoughts are safe. You can stop holding them."
7. See "Today" view: only 3 items
8. Feel relief

### Week 1: Building Habit

- Morning: 1-min voice dump before coffee
- Throughout day: Quick captures when thoughts pop up
- Evening: Optional review of the week

### Week 2+: Patterns Emerge

- AI learns when user acts on reminders
- Tags become personalized
- Weekly review becomes ritual
- User feels less anxious overall

---

## Development Priorities

### Phase 1 (MVP): Prove Core Concept

✅ Voice dump + transcription
✅ AI categorization (7 fixed categories)
✅ Deadline extraction
✅ Today view
✅ Completion tracking
✅ Reassurance messages
**Goal**: Users feel relief and mental clarity

### Phase 2: Enhanced Intelligence

✅ Priority inference
✅ Spiral detection + breakdown
✅ Automatic task breakdown
✅ Time-based reminders
✅ Weekly review ritual
✅ Basic mood tracking
**Goal**: Users build self-knowledge + confidence

### Phase 3: Long-term Engagement

✅ Behavioral learning (optimize reminders)
✅ AI coach (contextual nudges)
✅ Burnout detection
✅ Content library (anxiety management tips)
✅ Optional therapist integration
**Goal**: App becomes trusted mental health tool

---

## Success Metrics

### MVP Success

- 40%+ 2-week retention
- Users report "feeling relief" after dumping
- NPS > 40
- < 3 minutes from dump to organized view

### Phase 2 Success

- 50%+ 30-day retention
- Users complete 50%+ of captured items
- Users engage with spiral detection
- NPS > 50

### Phase 3 Success

- 60%+ monthly active users
- Therapists recommend the app
- Users report improved anxiety management
- Partnership opportunities with mental health organizations

---

## Key Files & Structure

### Frontend (React/Web)

- `/pages/dump.tsx` — Voice recording interface
- `/pages/today.tsx` — Today view
- `/pages/categories.tsx` — Category views
- `/pages/worries-vault.tsx` — Worries vault view
- `/components/VoiceRecorder.tsx` — Audio capture
- `/components/ReassuranceMessage.tsx` — Validation messages

### Backend (Node/Supabase)

- `/api/process-dump.ts` — Audio transcription + AI processing
- `/api/categorize.ts` — AI categorization logic
- `/api/extract-deadline.ts` — Deadline extraction
- `/api/detect-spiral.ts` — Spiral detection
- `/db/schema.sql` — 12-table database schema
- `/db/rls-policies.sql` — Row-level security

### AI Integration

- Claude Sonnet 4 for categorization + priority
- Whisper for transcription
- Custom prompts for spiral detection
- LLM tools for agent integration

---

## Design Principles (for all code)

1. **Anxiety-first thinking** — How does this feature affect anxious users?
2. **Accessibility** — Works for keyboard, voice, mobile
3. **Performance** — Fast queries (< 100ms), instant UI feedback
4. **Privacy** — Local-first when possible, RLS always
5. **Simplicity** — Minimal options, sensible defaults
6. **Compassion** — Warm tone, never judgmental

---

## What You're Building

You're not building another productivity app. You're building a **digital compassionate friend** that:

1. Listens without judgment
2. Organizes your chaos
3. Gives perspective on anxiety
4. Celebrates your wins
5. Learns what helps you specifically
6. Protects your mental health

For people with anxiety/ADHD, this is a profound shift from traditional productivity tools that assume linear, neurotypical brains.

The app succeeds when users say: "Finally, something that gets how my brain actually works."

---

## Quick Reference

**7 Fixed Categories:**
Tasks | Ideas | Errands | Health | Relationships | Worries Vault | Recurring

**Core Features:**
Voice dump → Transcribe → Categorize → Extract deadline → Infer priority → Detect spirals → Show today view → Celebrate completion

**12 Database Tables:**
users | voice_dumps | items | categories | item_tags | recurring_items | reminders | completions_log | ai_learning_logs | mood_tracking | user_preferences | sample_tags

**LLM Tools:**
get_items_by_tags | get_today_view | search_items | complete_item | (+ 3 more)

**Key Principle:**
Structure (fixed categories) + Flexibility (tags) + Validation (reassurance) + Learning (behavioral AI) = Mental relief for anxious brains
