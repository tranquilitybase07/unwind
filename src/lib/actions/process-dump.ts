'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { extractItemsFromTranscript } from '@/lib/ai/prompts'
import type { Database } from '@/lib/supabase/types'

export async function processVoiceDump(voiceDumpId: string) {
  console.log('🧠 [SERVER] processVoiceDump started for:', voiceDumpId)

  const supabase = await createClient()
  
  // 1. Fetch the voice dump
  const { data: voiceDump, error: dumpError } = await supabase
    .from('voice_dumps')
    .select('transcription, user_id')
    .eq('id', voiceDumpId)
    .single()

  if (dumpError || !voiceDump) {
    console.error('❌ Voice dump not found:', dumpError)
    return { error: 'Voice dump not found' }
  }

  // 2. Fetch all system categories to map names to IDs
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name')
  
  if (catError || !categories) {
    console.error('❌ Failed to fetch categories:', catError)
    return { error: 'Failed to load categories' }
  }

  // Create a map for easy lookup: "Tasks" -> uuid
  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]))

  try {
    // 3. Call AI Extraction
    console.log('🤖 Sending transcript to AI...')
    console.log('📂 Available categories map:', Array.from(categoryMap.entries()))

    const startTime = Date.now()
    const result = await extractItemsFromTranscript(voiceDump.transcription, categories)
    const durationMs = Date.now() - startTime
    
    console.log(`✅ AI Extraction complete in ${durationMs}ms. Found ${result.items.length} items.`)
    console.log('📦 AI Response Items:', JSON.stringify(result.items, null, 2))

    // 4. Save items to database
    // validation: ensure category exists, otherwise fallback to "Tasks" or "Ideas"
    const tasksId = categoryMap.get('tasks') || categories[0].id

    // Iterate and insert
    // We do this sequentially or Promise.all - sequentially is safer for debugging but slower
    const insertedItems = []

    for (const item of result.items) {
      // Find category ID
      // The prompt returns capitalized names usually, but we lowercased the map keys
      const categoryName = item.category ? item.category.toLowerCase() : 'tasks'
      const catId = categoryMap.get(categoryName) || tasksId 
      console.log(`🔹 Mapping item "${item.title}" category: "${item.category}" -> Normalized: "${categoryName}" -> ID: ${catId}`) 

      const itemData = {
        user_id: voiceDump.user_id,
        voice_dump_id: voiceDumpId,
        title: item.title,
        item_type: item.item_type || 'task',
        category_id: catId,
        priority: item.priority || 'medium',
        due_date: item.due_date || null,
        urgency_score: item.urgency_score || 0,
        importance_score: item.importance_score || 0,
        emotional_weight_score: item.emotional_weight_score || 0,
        final_priority_score: 0, // Let trigger handle this or calc it if needed
        is_worry_spiral: item.is_worry_spiral || false,
        description: item.description,
        ai_confidence: item.confidence_score || 0.9,
        status: 'pending' as const
      }

      // Insert item
      const { data: newItem, error: itemInsertError } = await supabase
        .from('items')
        .insert(itemData)
        .select()
        .single()

      if (itemInsertError) {
        console.error('❌ Failed to insert item:', item.title, itemInsertError)
        continue
      }

      insertedItems.push(newItem)

      // Insert tags if any
      if (item.tags && item.tags.length > 0) {
        const tagInserts = item.tags.map(tag => ({
          item_id: newItem.id,
          tag: tag.toLowerCase(),
          tag_type: 'auto' as const
        }))

        await supabase.from('item_tags').insert(tagInserts)
      }
    }

    // 5. Update voice_dump status
    const updatePayload: Database['public']['Tables']['voice_dumps']['Update'] = {
      processing_status: 'processed',
      processed_at: new Date().toISOString(),
      ai_processing_time_ms: durationMs,
      ai_model_version: 'claude-3.5-sonnet'
    }

    await supabase.from('voice_dumps').update(updatePayload).eq('id', voiceDumpId)

    revalidatePath('/dashboard')
    revalidatePath('/dump')

    return { success: true, count: insertedItems.length }

  } catch (err) {
    console.error('💥 AI Processing Failed:', err)
    
    const errorPayload: Database['public']['Tables']['voice_dumps']['Update'] = {
      processing_status: 'failed',
      error_message: err instanceof Error ? err.message : 'Unknown AI error'
    }

    await supabase.from('voice_dumps').update(errorPayload).eq('id', voiceDumpId)

    return { error: 'AI Processing failed' }
  }
}
