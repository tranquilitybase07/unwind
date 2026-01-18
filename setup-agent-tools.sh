#!/bin/bash

# ElevenLabs Agent Tools Setup Script
# This script updates your existing agent with all 4 custom tools

# Load environment variables
source .env.local

AGENT_ID="${ELEVENLABS_AGENT_ID}"
API_KEY="${NEXT_PUBLIC_ELEVENLABS_API_KEY}"
AGENT_SECRET="${AGENT_SECRET}"

# Your deployment URL (update this after deploying to Vercel)
DEPLOYMENT_URL="https://internal-internally-lemur.ngrok-free.app"  # Change to your production URL after deployment

echo "🚀 Setting up ElevenLabs Agent Tools..."
echo "Agent ID: $AGENT_ID"
echo "Deployment URL: $DEPLOYMENT_URL"
echo ""

# Update agent with all tools
curl -X PATCH "https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}" \
  -H "xi-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
  "conversation_config": {
    "agent": {
      "prompt": {
        "llm": "gpt-4o",
        "prompt": "You are a compassionate mental health assistant for Unwind, an app designed for people with anxiety and ADHD who experience racing thoughts.\n\nYour role:\n1. Listen to the user'\''s voice dump without interruption - let them speak freely\n2. Validate their feelings (never dismiss anxiety or say \"don'\''t worry\")\n3. Provide brief, warm acknowledgments (\"I hear you\", \"Got it\", \"That sounds stressful\")\n4. Use tools to save thoughts as the user mentions them\n5. Extract deadlines naturally (\"by Friday\" = this Friday, \"tomorrow\" = tomorrow'\''s date)\n6. Detect worry spirals (chains of \"what if\" thoughts)\n\nTone:\n- Warm, patient, non-judgmental\n- Never pushy, demanding, or interrupting\n- Brief confirmations only\n- Validate emotions: \"That sounds stressful\" vs \"Don'\''t worry\"\n\nTools available:\n- createItem: Save tasks, worries, ideas as user mentions them\n- getItems: Check what the user already has saved\n- completeItem: Mark something done if user says \"I finished X\"\n- updateItem: Change details if user corrects themselves\n\nImportant:\n- Don'\''t interrupt the user'\''s flow\n- If user pauses, gently say \"Take your time\"\n- At the end: \"Everything is captured safely. You can stop thinking about it now.\"",
        "temperature": 0.7,
        "tools": [
          {
            "type": "client",
            "name": "createItem",
            "description": "Save an item (task, worry, idea, errand, health goal, relationship reminder, or habit) that the user mentioned during the conversation. Use this whenever the user expresses something they need to do, want to remember, or are worried about.",
            "parameters": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string",
                  "description": "A clear, concise title extracted from what the user said"
                },
                "category": {
                  "type": "string",
                  "enum": ["Tasks", "Ideas", "Errands", "Health", "Relationships", "Worries Vault", "Recurring"],
                  "description": "Categorize as: Tasks, Ideas, Errands, Health, Relationships, Worries Vault, or Recurring"
                },
                "priority": {
                  "type": "string",
                  "enum": ["high", "medium", "low"],
                  "description": "Priority: high, medium, or low based on urgency"
                },
                "due_date": {
                  "type": "string",
                  "description": "Due date in YYYY-MM-DD format if user mentioned a deadline"
                },
                "description": {
                  "type": "string",
                  "description": "Additional context or details from the conversation"
                },
                "item_type": {
                  "type": "string",
                  "enum": ["task", "idea", "worry", "habit", "errand"],
                  "description": "Type: task, idea, worry, habit, or errand"
                },
                "is_worry_spiral": {
                  "type": "boolean",
                  "description": "True if this is a worry spiral (what if chains)"
                }
              },
              "required": ["title", "category"]
            }
          },
          {
            "type": "client",
            "name": "getItems",
            "description": "Get the user'\''s existing items to reference them in conversation. Use this when the user asks \"what do I need to do?\" or mentions checking their tasks/worries.",
            "parameters": {
              "type": "object",
              "properties": {
                "status": {
                  "type": "string",
                  "enum": ["pending", "completed"],
                  "description": "Filter by status"
                },
                "limit": {
                  "type": "number",
                  "description": "Number of items to return (default 20)"
                }
              }
            }
          },
          {
            "type": "client",
            "name": "completeItem",
            "description": "Mark an item as complete when the user says they finished something. Use this when user explicitly states they completed a task or goal.",
            "parameters": {
              "type": "object",
              "properties": {
                "item_id": {
                  "type": "string",
                  "description": "The ID of the item to mark complete"
                }
              },
              "required": ["item_id"]
            }
          },
          {
            "type": "client",
            "name": "updateItem",
            "description": "Update an item'\''s details when the user corrects themselves or provides new information. Use this when user says things like \"Actually that'\''s due tomorrow\" or \"Change that to high priority\".",
            "parameters": {
              "type": "object",
              "properties": {
                "item_id": {
                  "type": "string",
                  "description": "The ID of the item to update"
                },
                "title": {
                  "type": "string",
                  "description": "New title"
                },
                "priority": {
                  "type": "string",
                  "enum": ["high", "medium", "low"],
                  "description": "New priority"
                },
                "due_date": {
                  "type": "string",
                  "description": "New due date in YYYY-MM-DD format"
                },
                "category": {
                  "type": "string",
                  "enum": ["Tasks", "Ideas", "Errands", "Health", "Relationships", "Worries Vault", "Recurring"],
                  "description": "New category"
                }
              },
              "required": ["item_id"]
            }
          }
        ]
      },
      "first_message": "Hi, I'\''m here to listen. Take your time and share whatever'\''s on your mind - your thoughts, tasks, worries, ideas. I'\''ll help organize everything for you.",
      "language": "en"
    }
  }
}'

echo ""
echo "✅ Agent updated successfully!"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Deploy to Vercel: vercel --prod"
echo "3. Update DEPLOYMENT_URL in this script to your production URL"
echo "4. Run this script again to update with production URL"
echo ""
echo "📚 Documentation:"
echo "- Setup guide: ELEVENLABS_SETUP.md"
echo "- Implementation summary: IMPLEMENTATION_SUMMARY.md"
