"use client"

import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Orb } from "../ui/orb";
import { useConversation } from "@elevenlabs/react";
import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import type { AgentState } from "../ui/orb";

export function VoiceDumpCard() {
  const router = useRouter();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected to ElevenLabs agent");
      setAgentState("listening");
    },
    onDisconnect: async () => {
      console.log("📡 Disconnected from ElevenLabs agent");
      setAgentState(null);
      // Refresh after a delay for webhook processing
      setTimeout(() => {
        router.refresh();
      }, 3000);
    },
    onError: (error) => {
      console.error("❌ ElevenLabs error:", error);
      setAgentState(null);
    },
    onMessage: (message: any) => {
      // Update agent state based on who is speaking
      if (message.role === "agent" || message.source === "ai") {
        setAgentState("talking");
      } else if (message.role === "user" || message.source === "user") {
        setAgentState("listening");
      }
    },
  });

  // Fetch signed URL when component mounts
  const fetchSignedUrl = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Handle button click - start or end conversation
  const handleButtonClick = async () => {
    if (isConnected) {
      // End the conversation
      try {
        console.log("🛑 Ending conversation...");
        await conversation.endSession();
      } catch (err) {
        console.error("Error ending conversation:", err);
      }
      return;
    }

    // Start conversation
    if (!signedUrl || !userId) {
      await fetchSignedUrl();
      // Wait for state update then start
      setTimeout(async () => {
        if (signedUrl && userId) {
          try {
            console.log("🎙️ Starting conversation session");
            await conversation.startSession({
              signedUrl,
              dynamicVariables: {
                user_id: userId,
              },
            });
          } catch (err) {
            console.error("Error starting conversation:", err);
          }
        }
      }, 100);
      return;
    }

    try {
      console.log("🎙️ Starting conversation session");
      await conversation.startSession({
        signedUrl,
        dynamicVariables: {
          user_id: userId,
        },
      });
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";

  return (
    <Card className="bg-white flex flex-col shadow-lg  items-center  relative overflow-hidden border-none rounded-xl" >
      <CardContent className="relative w-[280px] h-[280px] flex items-center justify-center ">
        {/* Orb Background */}
        <div className="absolute inset-0">
          <Orb
            colors={["#10B981", "#10B981"]}
            agentState={agentState}
            className="w-[280px] h-[280px] mt-2"
            
          />
        </div>

        {/* Centered Button */}
        <button
          onClick={handleButtonClick}
          disabled={isLoading || isConnecting}
          className="relative z-10 flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-black pr-2">
            {isConnected
              ? "End Call"
              : isConnecting
              ? "Connecting..."
              : "Call AI agent"}
          </span>
        </button>
      </CardContent>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold text-black mb-1">
                What is in your mind?
              </h2>
              <p className="text-sm text-black/90">
                Let&apos;s take a deep breath and relax your mind.
              </p>
      </div>
    </Card>
  );
}
