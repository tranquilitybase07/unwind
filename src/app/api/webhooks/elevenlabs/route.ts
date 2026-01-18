import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { processVoiceDumpWithClient } from "@/lib/actions/process-dump";
import type { Database } from "@/lib/supabase/types";
import crypto from "crypto";
import * as Sentry from "@sentry/nextjs";

// Verify HMAC signature from ElevenLabs
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Signature format: "t=timestamp,v0=hash"
    const parts = signature.split(",");
    const timestamp = parts[0].split("=")[1];
    const receivedHash = parts[1].split("=")[1];

    // Validate timestamp (30-minute tolerance)
    const currentTime = Math.floor(Date.now() / 1000);
    const tolerance = 30 * 60; // 30 minutes
    if (parseInt(timestamp) < currentTime - tolerance) {
      console.error("⏰ Webhook timestamp expired");
      return false;
    }

    // Verify HMAC
    const fullPayload = `${timestamp}.${payload}`;
    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(fullPayload)
      .digest("hex");

    const isValid = receivedHash === expectedHash;
    if (!isValid) {
      console.error("❌ HMAC signature mismatch");
    }

    return isValid;
  } catch (error) {
    console.error("💥 Error verifying webhook signature:", error);
    return false;
  }
}

// Helper to create Supabase client with service role
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase configuration missing");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
}

export async function POST(request: NextRequest) {
  console.log("📞 Received ElevenLabs webhook");

  try {
    // 1. Get the raw body as text for signature verification
    const rawBody = await request.text();

    // 2. Verify webhook signature
    const signature = request.headers.get("elevenlabs-signature");
    const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("❌ ELEVENLABS_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error("❌ No signature header found");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("✅ Webhook signature verified");

    // 3. Parse the webhook payload
    const webhook = JSON.parse(rawBody);
    console.log("📦 Webhook type:", webhook.type);

    // 4. Handle different webhook types
    if (webhook.type === "post_call_transcription") {
      await handleTranscriptionWebhook(webhook.data);
    } else if (webhook.type === "post_call_audio") {
      console.log("🎵 Audio webhook received (not processing)");
      // We don't need the audio, just the transcript
    } else {
      console.log("⚠️ Unknown webhook type:", webhook.type);
    }

    // 5. Return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 Error processing webhook:", error);
    // Still return 200 to avoid retries
    return NextResponse.json({ success: false, error: "Processing failed" });
  }
}

async function handleTranscriptionWebhook(data: any) {
  console.log("📝 Processing transcription webhook");
  console.log("🆔 Conversation ID:", data.conversation_id);

  try {
    // Extract the transcript from the webhook data
    let fullTranscript = "";

    // The transcript is in data.transcript array
    if (data.transcript && Array.isArray(data.transcript)) {
      fullTranscript = data.transcript
        .map((turn: any) => {
          const speaker = turn.role === "user" ? "User" : "Agent";
          return `${speaker}: ${turn.message}`;
        })
        .join("\n");
    } else {
      console.error("❌ No transcript found in webhook data");
      return;
    }

    console.log("📝 Full transcript length:", fullTranscript.length);
    console.log("📝 Transcript preview:", fullTranscript.substring(0, 200));

    if (!fullTranscript.trim()) {
      console.warn("⚠️ Empty transcript, skipping processing");
      return;
    }

    // Extract user_id from dynamic variables (ElevenLabs recommended approach)
    const userId = data.conversation_initiation_client_data?.dynamic_variables?.user_id;

    if (!userId) {
      console.error("❌ No user_id found in dynamic variables");
      console.error("Dynamic variables:", data.conversation_initiation_client_data?.dynamic_variables);
      return;
    }

    console.log("👤 User ID from dynamic variables:", userId);

    // Add Sentry context for better error tracking
    Sentry.setContext('webhook_data', {
      conversation_id: data.conversation_id,
      user_id: userId,
      transcript_length: fullTranscript.length,
      has_metadata: !!data.metadata,
      duration_seconds: data.metadata?.duration_seconds || null,
    });

    Sentry.setUser({
      id: userId,
    });

    // Create Supabase client with service role for webhook operations
    const supabase = createServiceClient();

    // Save voice dump to database
    console.log("💾 Saving voice dump to database...");

    // Extract duration from webhook metadata
    const durationSeconds = data.metadata?.duration_seconds || null;

    const insertData: any = {
      user_id: userId,
      transcription: fullTranscript.trim(),
      processing_status: "pending",
      transcription_confidence: 0.95,
      ai_model_version: "elevenlabs-conversational-ai",
    };

    // Only add audio_duration_seconds if we have a valid value (constraint requires > 0)
    if (durationSeconds && durationSeconds > 0) {
      insertData.audio_duration_seconds = Math.round(durationSeconds);
    }

    const { data: voiceDump, error: insertError } = await supabase
      .from("voice_dumps")
      .insert(insertData)
      .select()
      .single();

    if (insertError || !voiceDump) {
      console.error("❌ Failed to save voice dump:", insertError);
      return;
    }

    console.log("✅ Voice dump saved:", voiceDump.id);

    // Process with your existing AI extraction pipeline using service role client
    console.log("🤖 Triggering AI extraction...");
    const aiResult = await processVoiceDumpWithClient(voiceDump.id, supabase);

    if (aiResult.error) {
      console.error("⚠️ AI processing failed:", aiResult.error);
    } else {
      console.log("✨ AI processing complete");
      console.log(`📦 Extracted ${aiResult.count} items`);
    }
  } catch (error) {
    console.error("💥 Error in handleTranscriptionWebhook:", error);
  }
}
