# LLM Information Extraction Plan

## Overview
This plan outlines the implementation of an LLM-based extraction pipeline for Unwind. The goal is to process raw voice dump transcriptions, extracting structured actionable items, categorizing them into 7 fixed categories, and saving them to the database.

## Architecture

### 1. New Components
- **`src/lib/ai/openrouter.ts`**: A lightweight client to interact with OpenRouter API.
- **`src/lib/ai/prompts.ts`**: Storage for the system prompt and extraction logic.
- **`src/lib/actions/process-dump.ts`**: A Server Action to orchestrate the fetching of categories, calling the LLM, and saving results.

### 2. Data Flow
1.  **Trigger**: User (or system) triggers processing for a specific `voice_dump_id`.
2.  **Fetch Context**:
    - Retrieve the transcription from `voice_dumps`.
    - Retrieve all `categories` (Name -> UUID map) from the database to ensure correct foreign key linkage.
3.  **LLM Extraction**:
    - Send transcription + category definitions to OpenRouter (Model: `google/gemini-2.0-flash-exp` or `anthropic/claude-3.5-sonnet` recommended for speed/cost balance, user mentioned "use openrouter").
    - **Prompt** will instruct the model to return a JSON object containing an array of items.
4.  **Database Persistence**:
    - Parse the LLM response.
    - **Transaction**:
        - Insert extracted items into `items` table.
        - Insert associated tags into `item_tags` table.
        - Update `voice_dumps.processing_status` to `'processed'`.

## Detailed Implementation Steps

### Step 1: Environment Setup
- Ensure `OPENROUTER_API_KEY` is present in `.env.local`.

### Step 2: Database Helpers
- Create a helper to fetch the "System Categories" so we can map the LLM's string category (e.g., "Health") to the correct UUID from `categories` table.

### Step 3: Prompt Engineering
The prompt will categorize text into these 7 fixed buckets:
1.  **Tasks**: Actionable items.
2.  **Ideas**: Creative concepts.
3.  **Errands**: Shopping/admin.
4.  **Health**: Medical/fitness.
5.  **Relationships**: Social/communication.
6.  **Worries Vault**: Intrusive thoughts (non-actionable).
7.  **Recurring**: Habits/routines.

**Output Schema (JSON):**
```json
{
  "items": [
    {
      "title": "Buy groceries",
      "category": "Errands",
      "item_type": "task",
      "priority": "medium",
      "contain_deadlines": true,
      "due_date": "2023-10-27", 
      "urgency_score": 80,
      "importance_score": 60,
      "emotional_weight_score": 20,
      "is_worry_spiral": false,
      "tags": ["food", "urgent", "home"]
    }
  ]
}
```

### Step 4: Server Action (`processVoiceDump`)
Refactor or create `src/lib/actions/process-dump.ts`.
- **Input**: `voiceDumpId`.
- **Logic**:
    - `supabase.from('categories').select('*')`
    - `supabase.from('voice_dumps').select('transcription').eq('id', voiceDumpId)`
    - Call LLM.
    - Loop through results:
        - Match `item.category` to `category_id`.
        - `supabase.from('items').insert(...)` -> get `id`.
        - `supabase.from('item_tags').insert(...)`.
    - Update `voice_dumps` status.

## Questions / Assumptions
- **Model**: Defaulting to `google/gemini-2.0-flash-exp:free` or `anthropic/claude-3-haiku` via OpenRouter for low latency and cost, unless user has a preference.
- **Trigger**: We will expose this as a server action that can be called immediately after saving the dump or via a "Process" button in the UI.

## Next Steps
1.  Create the file structure.
2.  Implement the OpenRouter client.
3.  Implement the prompt.
4.  Connect to the database.
