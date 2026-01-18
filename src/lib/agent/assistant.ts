/**
 * OpenAI Assistant Configuration
 *
 * Creates and configures the Unwind AI Assistant
 * Run this once to create the assistant, then store the ID in .env.local
 */

import { openai } from './client';
import { SYSTEM_PROMPT } from './prompts/system-prompt';
import { ALL_TOOLS } from './prompts/tool-descriptions';

/**
 * Create the Unwind AI Assistant
 *
 * This should be run once during setup.
 * The returned assistant ID should be stored in OPENAI_ASSISTANT_ID env variable.
 */
export async function createAssistant() {
  try {
    const assistant = await openai.beta.assistants.create({
      name: 'Unwind AI Agent',
      description: 'Compassionate mental health companion for people with anxiety and ADHD',
      model: 'gpt-4o',
      instructions: SYSTEM_PROMPT,
      tools: ALL_TOOLS,
      temperature: 0.7, // Slightly warm for more empathetic responses
    });

    console.log('✅ Assistant created successfully!');
    console.log('📋 Assistant ID:', assistant.id);
    console.log('\n🔧 Add this to your .env.local file:');
    console.log(`OPENAI_ASSISTANT_ID=${assistant.id}`);

    return assistant;
  } catch (error) {
    console.error('❌ Failed to create assistant:', error);
    throw error;
  }
}

/**
 * Update existing assistant configuration
 *
 * Use this to update the assistant's instructions or tools without creating a new one
 */
export async function updateAssistant(assistantId: string) {
  try {
    const assistant = await openai.beta.assistants.update(assistantId, {
      instructions: SYSTEM_PROMPT,
      tools: ALL_TOOLS,
      temperature: 0.7,
    });

    console.log('✅ Assistant updated successfully!');
    console.log('📋 Assistant ID:', assistant.id);

    return assistant;
  } catch (error) {
    console.error('❌ Failed to update assistant:', error);
    throw error;
  }
}

/**
 * Get assistant details
 */
export async function getAssistant(assistantId: string) {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    return assistant;
  } catch (error) {
    console.error('❌ Failed to retrieve assistant:', error);
    throw error;
  }
}

/**
 * Delete assistant
 */
export async function deleteAssistant(assistantId: string) {
  try {
    await openai.beta.assistants.delete(assistantId);
    console.log('✅ Assistant deleted successfully!');
  } catch (error) {
    console.error('❌ Failed to delete assistant:', error);
    throw error;
  }
}

/**
 * CLI script to create assistant
 * Run: npx tsx src/lib/agent/assistant.ts
 */
// if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
//   createAssistant()
//     .then(() => process.exit(0))
//     .catch(() => process.exit(1));
// }
