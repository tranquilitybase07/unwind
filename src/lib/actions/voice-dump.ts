'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createVoiceDump(params: {
  transcription: string
  audioDurationSeconds?: number
  transcriptionConfidence?: number
}) {
  console.log('🚀 [SERVER] createVoiceDump called with params:', {
    transcriptionLength: params.transcription.length,
    transcriptionPreview: params.transcription.substring(0, 100),
    audioDurationSeconds: params.audioDurationSeconds,
    transcriptionConfidence: params.transcriptionConfidence,
  })

  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log('👤 [SERVER] Auth check:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    authError: authError?.message,
  })

  if (authError || !user) {
    console.error('❌ [SERVER] User not authenticated:', authError)
    return { error: 'User not authenticated', data: null }
  }

  // Prepare insert data
  const insertData = {
    user_id: user.id,
    transcription: params.transcription,
    audio_duration_seconds: params.audioDurationSeconds,
    transcription_confidence: params.transcriptionConfidence,
    processing_status: 'pending' as const,
  }

  console.log('📤 [SERVER] Attempting to insert into voice_dumps:', insertData)

  // Insert voice dump
  const { data, error } = await supabase
    .from('voice_dumps')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('❌ [SERVER] Database error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return { error: error.message, data: null }
  }

  console.log('✅ [SERVER] Voice dump created successfully:', {
    id: data.id,
    created_at: data.created_at,
  })

  revalidatePath('/dashboard')
  return { error: null, data }
}

export async function updateProcessingStatus(params: {
  voiceDumpId: string
  status: 'pending' | 'processed' | 'failed'
  aiProcessingTimeMs?: number
  aiModelVersion?: string
}) {
  const supabase = await createClient()

  const updateData: {
    processing_status: 'pending' | 'processed' | 'failed'
    processed_at?: string
    ai_processing_time_ms?: number
    ai_model_version?: string
  } = {
    processing_status: params.status,
  }

  if (params.status === 'processed') {
    updateData.processed_at = new Date().toISOString()
    updateData.ai_processing_time_ms = params.aiProcessingTimeMs
    updateData.ai_model_version = params.aiModelVersion
  }

  const { data, error } = await supabase
    .from('voice_dumps')
    .update(updateData)
    .eq('id', params.voiceDumpId)
    .select()
    .single()

  if (error) {
    console.error('Error updating processing status:', error)
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard')
  return { error: null, data }
}

export async function getRecentVoiceDumps(limit = 10) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'User not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('voice_dumps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching voice dumps:', error)
    return { error: error.message, data: null }
  }

  return { error: null, data }
}
