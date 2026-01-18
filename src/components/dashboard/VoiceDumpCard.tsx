"use client"

import { Card, CardContent } from "@/components/ui/card";
import { VoiceAgent } from "@/components/VoiceAgent";
import { useRouter } from "next/navigation";

export function VoiceDumpCard() {
  const router = useRouter();

  const handleComplete = (voiceDumpId: string) => {
    console.log("✅ Voice conversation complete. Voice dump ID:", voiceDumpId);
    // Refresh the page to show new items (webhook will process in background)
    router.refresh();
  };

  return (
    <Card
      className="relative overflow-hidden border-white/30 shadow-xl bg-cover bg-center"
      style={{ backgroundImage: "url('/images/nature.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs" />

      <CardContent className="relative z-10 flex flex-col items-center justify-center min-h-[300px] p-8">
        <div className="text-center space-y-4 mb-6">
          <h2 className="text-2xl font-bold text-white">
            What's on your mind?
          </h2>
          <p className="text-sm text-white/90">
            Have a conversation with our AI companion. Share your thoughts, tasks, and worries freely.
          </p>
        </div>

        <VoiceAgent onComplete={handleComplete} />
      </CardContent>
    </Card>
  );
}
