import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { audio, mimeType } = body

    console.log('🎙️ [API] Transcription request received')
    console.log('📊 [API] Audio size:', audio.length, 'characters (base64)')
    console.log('🎵 [API] MIME type:', mimeType)

    if (!audio) {
      console.error('❌ [API] No audio data provided')
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

    if (!apiKey) {
      console.error('❌ [API] ElevenLabs API key not configured')
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    console.log('✅ [API] ElevenLabs API key found')

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio, 'base64')
    console.log('📦 [API] Audio buffer size:', audioBuffer.length, 'bytes')

    // Determine file extension based on MIME type
    let fileName = 'recording.webm'
    if (mimeType.includes('mp4')) {
      fileName = 'recording.mp4'
    } else if (mimeType.includes('mpeg')) {
      fileName = 'recording.mp3'
    } else if (mimeType.includes('wav')) {
      fileName = 'recording.wav'
    }

    console.log('📄 [API] File name:', fileName)

    // Create FormData for ElevenLabs API
    const formData = new FormData()
    const blob = new Blob([audioBuffer], { type: mimeType })
    formData.append('file', blob, fileName)  // FIXED: 'file' not 'audio'
    formData.append('model_id', 'scribe_v1')  // FIXED: Use STT model, not TTS
    formData.append('language_code', 'en')  // Optional: Better accuracy for English

    console.log('📡 [API] Sending request to ElevenLabs...')

    // Call ElevenLabs Speech-to-Text API
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData,
    })

    console.log('📥 [API] ElevenLabs response status:', response.status)
    console.log('📥 [API] ElevenLabs response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [API] ElevenLabs API error:', response.status, errorText)

      let errorMessage = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.detail || errorJson.message || errorText
        console.error('❌ [API] Parsed error:', errorJson)
      } catch (e) {
        console.error('❌ [API] Raw error text:', errorText)
      }

      return NextResponse.json(
        { error: `ElevenLabs error: ${errorMessage}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ [API] Transcription successful')
    console.log('📝 [API] Result:', result)

    return NextResponse.json({
      transcription: result.text || result.transcription,
      confidence: result.confidence,
    })
  } catch (error: any) {
    console.error('💥 [API] Exception during transcription:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
