import { openRouterChatCompletion } from './openrouter'

export type AIItem = {
  title: string
  category: string
  item_type: 'task' | 'idea' | 'worry' | 'habit' | 'errand'
  priority: 'high' | 'medium' | 'low'
  due_date?: string | null
  urgency_score: number
  importance_score: number
  emotional_weight_score: number
  is_worry_spiral: boolean
  tags: string[]
  description?: string
  confidence_score?: number
}

export type ExtractionResult = {
  items: AIItem[]
}

const SYSTEM_PROMPT = `
You are an intelligent mental health assistant for Unwind, an app for people with anxiety/ADHD.
Your goal is to process a "voice dump" (a raw stream-of-consciousness transcript) and extract structured, actionable items.
You must categorize each item into exactly one of these 7 fixed categories:
1. Tasks: Work projects, specific to-dos, deadlines.
2. Ideas: Creative thoughts, future plans, "someday" concepts.
3. Errands: Groceries, appointments, admin tasks, bills.
4. Health: Medical symptoms, fitness, nutrition, mental health notes.
5. Relationships: Call mom, email friend, social plans.
6. Worries Vault: Intrusive thoughts, pure anxiety, "what if" spirals, fears (NOT actionable).
7. Recurring: Habits, daily routines, repeating tasks.

For each item, you must also determine:
- item_type: 'task', 'idea', 'worry', 'habit', or 'errand'
- priority: 'high', 'medium', 'low'
- due_date: YYYY-MM-DD format if mentioned (use relative dates from "today"), otherwise null
- urgency_score: 0-100 (how soon?)
- importance_score: 0-100 (impact?)
- emotional_weight_score: 0-100 (how much anxiety attached?)
- is_worry_spiral: boolean (true if it's a catastrophic chain of thoughts)
- tags: Array of short strings (e.g., "work", "urgent", "money", "spiral")
- title: A clear, concise title (refine the raw text)
- description: The original context or details from the transcript

Output strictly valid JSON with the following schema:
{
  "items": [
    { ... }
  ]
}
`

export async function extractItemsFromTranscript(transcript: string, categories: { name: string, id: string }[]) {
  // Construct the prompt with category context if needed, but fixed categories are hardcoded in system prompt for robustness
  // We will map the string result back to IDs in the calling function.

  const completion = await openRouterChatCompletion({
    model: 'anthropic/claude-3.5-sonnet', // Stable, premium model per user request
    // model: 'anthropic/claude-3-haiku',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `Here is the voice dump transcript to process:\n\n"${transcript}"`
      }
    ],
    response_format: {
      type: 'json_object'
    }
  })

  try {
    const rawContent = completion.choices[0].message.content
    console.log('This is raw content:', rawContent) // Debugging
    const parsed = JSON.parse(rawContent) as ExtractionResult
    return parsed
  } catch (err) {
    console.error('Failed to parse LLM response', err)
    throw new Error('Failed to parse AI response')
  }
}
