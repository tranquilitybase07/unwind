"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  IconAlertTriangle,
  IconArrowUp,
  IconCloud,
  IconFileSpark,
  IconGauge,
  IconPhotoScan,
  IconLoader2,
} from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// SAM Gateway configuration
const SAM_GATEWAY_URL = process.env.NEXT_PUBLIC_SAM_GATEWAY_URL || "http://localhost:8000";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const PROMPTS = [
  {
    icon: IconFileSpark,
    text: "Write documentation",
    prompt:
      "Write comprehensive documentation for this codebase, including setup instructions, API references, and usage examples.",
  },
  {
    icon: IconGauge,
    text: "Optimize performance",
    prompt:
      "Analyze the codebase for performance bottlenecks and suggest optimizations to improve loading times and runtime efficiency.",
  },
  {
    icon: IconAlertTriangle,
    text: "Find and fix 3 bugs",
    prompt:
      "Scan through the codebase to identify and fix 3 critical bugs, providing detailed explanations for each fix.",
  },
];

const MODELS = [
  {
    value: "gpt-5",
    name: "GPT-5",
    description: "Most advanced model",
    max: true,
  },
  {
    value: "gpt-4o",
    name: "GPT-4o",
    description: "Fast and capable",
  },
  {
    value: "gpt-4",
    name: "GPT-4",
    description: "Reliable and accurate",
  },
  {
    value: "claude-3.5",
    name: "Claude 3.5 Sonnet",
    description: "Great for coding tasks",
  },
];

export default function Ai02() {
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const supabase = createClient();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handlePromptClick = (prompt: string) => {
    if (inputRef.current) {
      inputRef.current.value = prompt;
      setInputValue(prompt);
      inputRef.current.focus();
    }
  };

  const handleModelChange = (value: string) => {
    const model = MODELS.find((m) => m.value === value);
    if (model) {
      setSelectedModel(model);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // Add user message to chat
    const userMessageObj: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessageObj]);

    try {
      // Get JWT token from Supabase
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication failed. Please log in again.");
      }

      if (!session || !session.access_token) {
        console.error("No session or access token found");
        throw new Error("You must be logged in to chat with the agent. Please log in.");
      }

      // Debug: Log session info
      console.log("=== SUPABASE SESSION DEBUG ===");
      console.log("Session exists:", !!session);
      console.log("User ID:", session?.user?.id);
      console.log("Access token exists:", !!session?.access_token);
      console.log("Access token preview:", session?.access_token?.substring(0, 20) + "...");

      const jwtToken = session.access_token;
      const userId = session.user.id;

      // Generate unique IDs
      const requestId = `chat-${Date.now()}`;
      const messageId = `msg-${Date.now()}`;

      // Build metadata with JWT for tool-level validation
      const metadata: Record<string, string> = {
        agent_name: "orchestrator",
        user_id: userId,
        supabase_jwt: jwtToken, // Tools will validate this JWT
      };

      // Debug: Log final metadata
      console.log("=== REQUEST METADATA ===");
      console.log("Metadata being sent:", metadata);

      // Build request payload
      const requestPayload = {
        id: requestId,
        jsonrpc: "2.0",
        method: "message/stream",
        params: {
          message: {
            messageId: messageId,
            role: "user",
            parts: [{ text: userMessage }],
            metadata: metadata,
          },
        },
      };

      // Debug: Log full request
      console.log("=== FULL REQUEST PAYLOAD ===");
      console.log(JSON.stringify(requestPayload, null, 2));

      // Submit message to SAM (no Authorization header needed - JWT is in metadata)
      const response = await fetch(`${SAM_GATEWAY_URL}/api/v1/message:stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Enable session cookies for streaming
        body: JSON.stringify(requestPayload),
      });



      if (!response.ok) {
        throw new Error(`SAM API error: ${response.statusText}`);
      }

      const data = await response.json();
      const taskId = data.result?.id;

      if (!taskId) {
        throw new Error("Failed to get task ID from SAM");
      }

      // Create agent message placeholder
      const agentMessageId = `agent-${Date.now()}`;
      const agentMessage: Message = {
        id: agentMessageId,
        role: "agent",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, agentMessage]);

      // Connect to SSE stream
      const eventSource = new EventSource(
        `${SAM_GATEWAY_URL}/api/v1/sse/subscribe/${taskId}`,
        { withCredentials: true } // Enable session cookies for streaming
      );
      eventSourceRef.current = eventSource;

      // Set timeout for connection (30 seconds)
      const connectionTimeout = setTimeout(() => {
        console.warn("SSE connection timeout - no data received");
        if (eventSource.readyState !== EventSource.CLOSED) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === agentMessageId
                ? {
                  ...msg,
                  content: msg.content || "No response received from agent. Please try again.",
                  isStreaming: false
                }
                : msg
            )
          );
          eventSource.close();
          setIsLoading(false);
        }
      }, 30000);

      eventSource.onmessage = (event) => {
        // Clear timeout since we received data
        clearTimeout(connectionTimeout);

        try {
          const data = JSON.parse(event.data);
          console.log("SSE event received:", data);

          const result = data.result;
          if (!result) {
            console.warn("No result in SSE event:", data);
            return;
          }

          // Check for message parts (streaming content)
          const parts = result.parts;
          const isFinal = result.final;
          const status = result.status?.state || result.status;

          // Handle streaming content from parts
          if (parts && Array.isArray(parts)) {
            parts.forEach((part: any) => {
              const text = part.text || part.content;
              if (text) {
                console.log("Received text chunk:", text);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === agentMessageId
                      ? { ...msg, content: msg.content + text }
                      : msg
                  )
                );
              }
            });
          }

          // Check if message is final (SAM uses "final": true)
          if (isFinal === true || status === "completed" || status === "complete") {
            console.log("Task completed");
            clearTimeout(connectionTimeout);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === agentMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            eventSource.close();
            setIsLoading(false);
          }

          // Handle errors
          if (status === "error" || status === "failed") {
            const errorMsg = result.error?.message || result.error || data.error?.message || "An error occurred";
            console.error("Task error:", errorMsg);
            clearTimeout(connectionTimeout);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === agentMessageId
                  ? { ...msg, content: `Error: ${errorMsg}`, isStreaming: false }
                  : msg
              )
            );
            eventSource.close();
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Error parsing SSE data:", err, "Raw data:", event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        clearTimeout(connectionTimeout);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === agentMessageId
              ? { ...msg, content: msg.content || "Connection error occurred", isStreaming: false }
              : msg
          )
        );
        eventSource.close();
        setIsLoading(false);
      };

    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "agent",
          content: `Error: ${error.message || "Failed to send message"}`,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMaxBadge = () => (
    <div className="flex h-[14px] items-center gap-1.5 rounded border border-border px-1 py-0">
      <span
        className="text-[9px] font-bold uppercase"
        style={{
          background:
            "linear-gradient(to right, rgb(129, 161, 193), rgb(125, 124, 155))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        MAX
      </span>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-semibold mb-2">Welcome to Unwind AI</h2>
            <p className="text-muted-foreground mb-6">
              Ask me anything about your tasks, schedule, or get help planning your day
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {[
                "What should I focus on today?",
                "Show me my pending tasks",
                "Help me plan my week",
              ].map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className="text-sm"
                  onClick={() => {
                    setInputValue(prompt);
                    inputRef.current?.focus();
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "text-xs mt-1 opacity-70",
                      message.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-background">
        <div className="flex min-h-[120px] flex-col rounded-2xl cursor-text bg-card border border-border shadow-lg">
          <div className="flex-1 relative overflow-y-auto max-h-[258px]">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="w-full border-0 p-3 transition-[padding] duration-200 ease-in-out min-h-[48.4px] outline-none text-[16px] text-foreground resize-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent! whitespace-pre-wrap break-words"
            />
          </div>

          <div className="flex min-h-[40px] items-center gap-2 p-2 pb-1">
            <div className="flex aspect-1 items-center gap-1 rounded-full bg-muted p-1.5 text-xs">
              <IconCloud className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="relative flex items-center">
              <Select
                value={selectedModel.value}
                onValueChange={handleModelChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-fit border-none bg-transparent! p-0 text-sm text-muted-foreground hover:text-foreground focus:ring-0 shadow-none">
                  <SelectValue>
                    {selectedModel.max ? (
                      <div className="flex items-center gap-1">
                        <span>{selectedModel.name}</span>
                        {renderMaxBadge()}
                      </div>
                    ) : (
                      <span>{selectedModel.name}</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.max ? (
                        <div className="flex items-center gap-1">
                          <span>{model.name}</span>
                          {renderMaxBadge()}
                        </div>
                      ) : (
                        <span>{model.name}</span>
                      )}
                      <span className="text-muted-foreground block text-xs">
                        {model.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground transition-all duration-100"
                title="Attach images"
                disabled={isLoading}
              >
                <IconPhotoScan className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={sendMessage}
                className={cn(
                  "h-6 w-6 rounded-full transition-all duration-100 cursor-pointer",
                  inputValue && !isLoading
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted"
                )}
                disabled={!inputValue || isLoading}
              >
                {isLoading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconArrowUp className="h-4 w-4 text-primary-foreground" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}