"use client";

import { useConversation } from "@elevenlabs/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square, Loader2 } from "lucide-react";
import { createVoiceDump } from "@/lib/actions/voice-dump";
import { processVoiceDump } from "@/lib/actions/process-dump";

interface VoiceAgentProps {
  onComplete?: (voiceDumpId: string) => void;
}

export function VoiceAgent({ onComplete }: VoiceAgentProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize ElevenLabs conversation hook (NO TOOLS - just listening)
  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected to ElevenLabs agent");
      console.log("👤 User ID for this session:", userId);
      setError(null);
      setTranscript(""); // Reset transcript on new connection
    },
    onDisconnect: async () => {
      console.log("📡 Disconnected from ElevenLabs agent");
      console.log("🆔 Conversation ID:", conversationId);
      console.log("✅ Webhook will process the transcript automatically");

      // Webhook will handle the processing automatically!
      // Show success message and refresh after a delay
      setTimeout(() => {
        onComplete?.("");
      }, 3000); // Wait 3 seconds for webhook to process
    },
    onError: (error) => {
      console.error("❌ ElevenLabs error:", error);
      setError(error.message || "An error occurred");
    },
    onMessage: (message: any) => {
      console.log("💬 Full message object:", message);

      // Check if this is a user or agent message
      if (message.message && message.role) {
        if (message.role === "user" || message.source === "user") {
          // USER speech (transcribed by ElevenLabs)
          console.log("👤 User said:", message.message);
          setTranscript((prev) => prev + `\nUser: ${message.message}`);
        } else if (message.role === "agent" || message.source === "ai") {
          // AGENT response
          console.log("🤖 Agent said:", message.message);
          setTranscript((prev) => prev + `\nAgent: ${message.message}`);
        }
      }
    },
    onConversationMetadata: (metadata) => {
      if (metadata.conversation_id) {
        setConversationId(metadata.conversation_id);
        console.log("🆔 Conversation ID:", metadata.conversation_id);
      }
    },
  });

  // Fetch transcript from ElevenLabs API and process it
  const fetchAndProcessTranscript = async () => {
    if (!conversationId) {
      console.error("❌ No conversation ID available");
      return;
    }

    console.log("📥 Fetching transcript from ElevenLabs API...");
    setIsProcessing(true);
    setError(null);

    try {
      // Fetch conversation details from ElevenLabs
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          headers: {
            "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation: ${response.statusText}`);
      }

      const conversationData = await response.json();
      console.log("📦 Conversation data:", conversationData);

      // Extract transcript from conversation data
      let fullTranscript = "";

      // Check if transcript exists in the response
      if (conversationData.transcript) {
        fullTranscript = conversationData.transcript;
      } else if (conversationData.messages && Array.isArray(conversationData.messages)) {
        // Build transcript from messages array
        fullTranscript = conversationData.messages
          .map((msg: any) => {
            const speaker = msg.role === "user" ? "User" : "Agent";
            return `${speaker}: ${msg.message}`;
          })
          .join("\n");
      } else {
        throw new Error("No transcript found in conversation data");
      }

      console.log("📝 Full transcript:", fullTranscript);

      if (!fullTranscript.trim()) {
        throw new Error("Transcript is empty");
      }

      // Now process with your existing pipeline
      await processConversation(fullTranscript);
    } catch (err) {
      console.error("💥 Error fetching transcript:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch transcript"
      );
      setIsProcessing(false);
    }
  };

  // Process conversation using your existing OpenRouter + Claude pipeline
  const processConversation = async (transcriptText: string) => {
    if (!transcriptText.trim()) {
      console.warn("⚠️ No transcript to process");
      setIsProcessing(false);
      return;
    }

    console.log("🧠 Processing conversation with AI extraction...");

    try {
      // Step 1: Save voice dump to database
      console.log("💾 Saving voice dump...");
      const voiceDumpResult = await createVoiceDump({
        transcription: transcriptText.trim(),
        transcriptionConfidence: 0.95, // High confidence from ElevenLabs
      });

      if (voiceDumpResult.error || !voiceDumpResult.data) {
        throw new Error(voiceDumpResult.error || "Failed to save voice dump");
      }

      console.log("✅ Voice dump saved:", voiceDumpResult.data.id);

      // Step 2: Process with your existing AI extraction pipeline
      console.log("🤖 Extracting items with OpenRouter + Claude...");
      const aiResult = await processVoiceDump(voiceDumpResult.data.id);

      if (aiResult.error) {
        console.error("⚠️ AI processing failed:", aiResult.error);
        setError(`Items extraction failed: ${aiResult.error}`);
      } else {
        console.log("✨ AI processing complete:", aiResult);
        console.log(`📦 Extracted ${aiResult.count} items`);
      }

      setIsProcessing(false);
      onComplete?.(voiceDumpResult.data.id);
    } catch (err) {
      console.error("💥 Error processing conversation:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process conversation"
      );
      setIsProcessing(false);
    }
  };

  // Fetch signed URL when component mounts
  const fetchSignedUrl = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/elevenlabs/signed-url", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to get signed URL");
      }

      const data = await response.json();
      setSignedUrl(data.signed_url);
      setUserId(data.user_id);
      console.log("🔑 Signed URL obtained for user:", data.user_id);
    } catch (err) {
      console.error("Error fetching signed URL:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize agent"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Start conversation
  const startConversation = async () => {
    if (!signedUrl || !userId) {
      await fetchSignedUrl();
      // Wait for state update
      setTimeout(async () => {
        if (signedUrl && userId) {
          try {
            console.log("🎙️ Starting conversation session with user:", userId);
            await conversation.startSession({
              signedUrl,
              // Pass user_id as dynamic variable for webhook
              dynamicVariables: {
                user_id: userId,
              },
            });
          } catch (err) {
            console.error("Error starting conversation:", err);
            setError("Failed to start conversation");
          }
        }
      }, 100);
      return;
    }

    try {
      console.log("🎙️ Starting conversation session with user:", userId);
      await conversation.startSession({
        signedUrl,
        // Pass user_id as dynamic variable for webhook
        dynamicVariables: {
          user_id: userId,
        },
      });
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Failed to start conversation");
    }
  };

  // End conversation
  const endConversation = async () => {
    try {
      console.log("🛑 Ending conversation...");
      await conversation.endSession();
    } catch (err) {
      console.error("Error ending conversation:", err);
    }
  };

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Status indicator */}
      <div className="text-sm text-muted-foreground">
        {isProcessing && "Processing your thoughts..."}
        {!isProcessing && isConnecting && "Connecting..."}
        {!isProcessing && isConnected && "Connected - I'm listening"}
        {!isProcessing &&
          !isConnecting &&
          !isConnected &&
          conversation.status === "idle" &&
          "Ready to start"}
        {!isProcessing &&
          conversation.status === "disconnected" &&
          !transcript &&
          "Disconnected"}
      </div>

      {/* Error display */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-md max-w-md text-center">
          {error}
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="text-sm text-primary bg-primary/10 px-4 py-2 rounded-md">
          Organizing your thoughts with AI...
        </div>
      )}

      {/* Control buttons */}
      <div className="flex gap-3">
        {!isConnected && !isProcessing && (
          <Button
            onClick={startConversation}
            disabled={isLoading || isConnecting}
            size="lg"
            className="gap-2"
          >
            {isLoading || isConnecting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Start Voice Dump
              </>
            )}
          </Button>
        )}

        {isConnected && !isProcessing && (
          <Button
            onClick={endConversation}
            variant="destructive"
            size="lg"
            className="gap-2"
          >
            <Square className="h-5 w-5" />
            End & Process
          </Button>
        )}
      </div>

      {/* Visual feedback */}
      {isConnected && !isProcessing && (
        <div className="mt-4 text-center">
          <div className="text-sm text-muted-foreground mb-2">
            {conversation.isSpeaking
              ? "🗣️ Agent is speaking..."
              : "🎤 Listening..."}
          </div>

          {/* Waveform animation */}
          <div className="flex gap-1 justify-center">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-primary rounded-full transition-all ${
                  conversation.isSpeaking
                    ? "h-8 animate-pulse"
                    : "h-4 animate-bounce"
                }`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Processing animation */}
      {isProcessing && (
        <div className="mt-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <div className="text-xs text-muted-foreground">
            Extracting tasks, worries, and ideas...
          </div>
        </div>
      )}
    </div>
  );
}
