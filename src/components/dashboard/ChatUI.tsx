"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import { Response } from "@/components/ui/response";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { IconArrowUp, IconSparkles, IconBrain } from "@tabler/icons-react";

// Message types
type ToolCall = {
  name: string;
  status: "running" | "done";
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
};

export default function ChatUI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Handle simple chat API (no streaming)
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Build conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/agent/chat-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        toolCalls: data.toolCalls?.map((tc: any) => ({
          name: tc.name,
          status: "done" as const,
        })),
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error sending message:", error);

        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format tool name for display
  const formatToolName = (toolName: string): string => {
    return toolName
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const quickActions = [
    { label: "Analyze sleep" },
    { label: "Start meditation" },
    { label: "Daily recap" },
  ]

  return (
    <div className="flex h-full w-full flex-col">
      {/* Conversation Area - This scrolls */}
      <Conversation className="flex-1 overflow-y-auto">
        <ConversationContent>
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-2 py-8 mt-8">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full overflow-hidden mb-6 shadow-lg">
                <img
                  src="/images/2.png"
                  alt="AI Assistant"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Greeting */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Hey, how you<br />feeling today?
              </h2>

              {/* Subtitle */}
              <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed">
                I&apos;m your personal Unwind companion.<br />
                Tell me anything, or just breathe with me.
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  {/* <MessageAvatar
                    src={
                      message.role === "user"
                        ? "/avatar-user.png"
                        : "/avatar-agent.png"
                    }
                    name={message.role === "user" ? "You" : "Agent"}
                  /> */}
                  <MessageContent variant="flat">
                    {message.role === "assistant" ? (
                      <>
                        {message.toolCalls && message.toolCalls.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {message.toolCalls.map((tool, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                              >
                                <IconBrain className="h-3 w-3" />
                                <span>{formatToolName(tool.name)}</span>
                                {tool.status === "running" && (
                                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <Response>{message.content}</Response>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </MessageContent>
                </Message>
              ))}

              {/* Typing indicator when thinking */}
              {isLoading && (
                <Message from="assistant">
                  {/* <MessageAvatar src="/avatar-agent.png" name="Agent" /> */}
                  <MessageContent variant="flat">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0ms]" />
                        <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
                        <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </MessageContent>
                </Message>
              )}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Area - Fixed at bottom */}
      <div className="pr-4 pb-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex min-h-[60px] flex-col rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative flex-1 overflow-y-auto max-h-[200px]">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your patterns, habits, or well-being..."
                disabled={isLoading}
                className="min-h-[48px] w-full resize-none border-0 bg-transparent p-3 text-[16px] outline-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="flex min-h-[40px] items-center gap-2 px-2 pb-1">
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 rounded-full transition-all duration-200",
                    inputValue.trim() && !isLoading
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-muted-foreground"
                  )}
                  disabled={!inputValue.trim() || isLoading}
                  onClick={sendMessage}
                >
                  <IconArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Helper text */}
          {/* <p className="mt-2 text-center text-xs text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1">Enter</kbd> to send,{" "}
            <kbd className="rounded bg-muted px-1">Shift+Enter</kbd> for new line
          </p> */}
        </div>
      </div>
    </div>
  );
}
