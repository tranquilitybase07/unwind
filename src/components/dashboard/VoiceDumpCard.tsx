"use client"

import { Mic, Square, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createVoiceDump } from "@/lib/actions/voice-dump";
import { processVoiceDump } from "@/lib/actions/process-dump";

export function VoiceDumpCard() {
  const [transcription, setTranscription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...');
      setError(null);
      setTranscription("");
      setSaveSuccess(false);
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        }
      });
      streamRef.current = stream;

      console.log('✅ Microphone access granted');

      // Try to use the best available audio format
      let mimeType = 'audio/webm';
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          mimeTypeRef.current = type;
          console.log('✅ Using MIME type:', type);
          break;
        }
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('📼 Audio chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, processing audio...');
        await processAudio();
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        setError('Recording error occurred');
        setIsRecording(false);
      };

      mediaRecorder.start(1000); // Capture in 1-second chunks
      setIsRecording(true);
      console.log('🔴 Recording started');

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      setError('Microphone access denied. Please allow microphone access.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log('⏹️ Stopping recording...');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) {
      console.warn('⚠️ No audio chunks to process');
      setError('No audio recorded. Please try again.');
      return;
    }

    console.log('🔄 Processing', audioChunksRef.current.length, 'audio chunks');

    // Combine all audio chunks
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    console.log('📦 Combined audio blob size:', audioBlob.size, 'bytes');

    // Convert to base64 for sending to API
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      const base64Data = base64Audio.split(',')[1]; // Remove data:audio/webm;base64, prefix

      console.log('📡 Sending audio to ElevenLabs for transcription...');

      try {
        // Call our API route that will handle ElevenLabs transcription
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio: base64Data,
            mimeType: mimeTypeRef.current,
          }),
        });

        const result = await response.json();
        console.log('📝 Transcription result:', result);

        if (result.error) {
          console.error('❌ Transcription error:', result.error);
          setError(`Transcription failed: ${result.error}`);
        } else if (result.transcription) {
          console.log('✅ Transcription received:', result.transcription);
          setTranscription(result.transcription);
        } else {
          setError('No transcription received');
        }
      } catch (error) {
        console.error('💥 Error during transcription:', error);
        setError('Failed to transcribe audio. Please try again.');
      }
    };

    reader.onerror = () => {
      console.error('❌ Failed to read audio blob');
      setError('Failed to process audio');
    };
  };

  const handleRecordClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleDoneClick = async () => {
    console.log('💾 Attempting to save transcription:', transcription);

    if (!transcription.trim()) {
      console.warn('⚠️ No transcription to save');
      setError("No transcription to save. Please speak something first.");
      return;
    }

    // Save to database
    setIsSaving(true);
    setError(null);

    try {
      console.log('🔄 Calling createVoiceDump server action...');
      const result = await createVoiceDump({
        transcription: transcription.trim(),
        transcriptionConfidence: 0.9,
      });

      console.log('📡 Server action result:', result);

      if (result.error || !result.data) {
        console.error('❌ Failed to save voice dump:', result.error);
        setError(`Failed to save: ${result.error}`);
        setIsSaving(false);
      } else {
        console.log('✅ Voice dump saved successfully:', result.data);

        // Trigger AI Processing immediately
        console.log('🧠 Triggering AI processing...');
        setIsProcessing(true); // Add this state

        // Don't await this if you don't want to block the user, 
        // BUT user wanted "show proper loading states", so we should probably await it or show a secondary loading state.
        // Let's do it in the same flow for the best experience.

        const aiResult = await processVoiceDump(result.data.id);

        if (aiResult.error) {
          console.error('⚠️ AI processing failed, but dump saved:', aiResult.error);
          // We still count this as a partial success?
          // The dump is saved, but not processed.
        } else {
          console.log('✨ AI processing complete:', aiResult);
        }

        setIsProcessing(false);
        setSaveSuccess(true);
        setTranscription("");
        audioChunksRef.current = [];
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsSaving(false);
      }
    } catch (error) {
      console.error('💥 Exception while saving voice dump:', error);
      setError("An error occurred while saving. Please try again.");
      setIsSaving(false);
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card
      className="relative overflow-hidden border-white/30 shadow-xl bg-cover bg-center"
      style={{ backgroundImage: "url('/images/nature.jpg')" }}
    >
      <div className={cn(
        "absolute inset-0 transition-all duration-300",
        isRecording ? "bg-black/30 backdrop-blur-sm" : "bg-black/20 backdrop-blur-xs"
      )} />

      <CardContent className="relative z-10 flex flex-col items-center justify-center min-h-[300px] p-8">
        {/* Recording State */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Recording
          </div>
        )}

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/90 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            ✓ Saved successfully
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium max-w-md text-center">
            {error}
          </div>
        )}

        {/* Mic Button */}
        <Button
          onClick={handleRecordClick}
          disabled={isSaving}
          size="icon"
          variant={isRecording ? "destructive" : "outline"}
          className={cn(
            "w-20 h-20 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 mb-6",
            isRecording
              ? "animate-pulse bg-red-500 hover:bg-red-600 border-red-400"
              : "bg-white/90 hover:bg-white border-white/50",
            isSaving && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-10 h-10 text-gray-800 animate-spin" />
          ) : (
            <Mic className={cn(
              "w-10 h-10",
              isRecording ? "text-white" : "text-gray-800"
            )} />
          )}
        </Button>

        {/* Stop & Transcribe Button (shown during recording) */}
        {isRecording && (
          <Button
            onClick={stopRecording}
            className="mb-4 bg-white/90 hover:bg-white text-gray-900 font-semibold"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop & Transcribe
          </Button>
        )}

        {/* Done Button (shown when transcription is ready) */}
        {!isRecording && transcription.trim() && (
          <Button
            onClick={handleDoneClick}
            disabled={isSaving}
            className="mb-4 bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            Save to Database
          </Button>
        )}

        {/* Text Content */}
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-white">
            {isSaving
              ? isProcessing ? "Extracting insights..." : "Saving your thoughts..."
              : isRecording
                ? "Recording..."
                : transcription
                  ? "Review your transcription"
                  : saveSuccess
                    ? "Thoughts captured!"
                    : "What is in your mind?"}
          </h2>

          {transcription ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-h-32 overflow-y-auto">
              <p className="text-sm text-white leading-relaxed">
                {transcription}
              </p>
            </div>
          ) : (
            <p className="text-sm text-white/90">
              {isSaving
                ? isProcessing ? "AI is organizing everything into categories..." : "We're organizing your thoughts..."
                : isRecording
                  ? "Speak freely, I'm here to help organize your thoughts."
                  : error
                    ? "Click to try again"
                    : "Let's take a deep breath and relax your mind."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
