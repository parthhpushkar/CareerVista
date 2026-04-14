"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import api, { ChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  User,
  Bot,
  Trash2,
  Lightbulb,
} from "lucide-react";

export default function ChatPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const history = await api.getChatHistory();
      setMessages(history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const { reply } = await api.sendMessage(userMessage.content, messages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "I apologize, but I encountered an error. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What career paths suit someone with my skills?",
    "How do I prepare for a technical interview?",
    "What skills are most in-demand for 2026?",
    "Help me negotiate a higher salary",
    "How do I transition into product management?",
    "What certifications would boost my career?",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-forest-50/30 to-white">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-forest to-forest-light flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Career Counselor</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online &bull; Powered by AI
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            className="text-muted-foreground gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>

        {/* Chat Area */}
        <Card className="border shadow-lg">
          <CardContent className="p-0">
            <div className="h-[60vh] overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && !loadingHistory ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-forest to-forest-light flex items-center justify-center shadow-xl">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Hi {user?.name?.split(" ")[0]}! 👋</h2>
                    <p className="text-muted-foreground max-w-md">
                      I&apos;m your AI career counselor. Ask me anything about career planning, job search, skill development, or interview preparation.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); textareaRef.current?.focus(); }}
                        className="text-left p-3 rounded-xl border border-border hover:border-forest/30 hover:bg-forest-50/50 text-sm transition-all flex items-start gap-2 group cursor-pointer"
                      >
                        <Lightbulb className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                        <span className="text-muted-foreground group-hover:text-foreground">{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-forest to-forest-light flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                          msg.role === "user"
                            ? "bg-forest text-white rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-forest">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center shrink-0 mt-1">
                          <User className="w-4 h-4 text-forest" />
                        </div>
                      )}
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-forest to-forest-light flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-md px-5 py-4">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-forest animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-forest animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-forest animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-3 items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your career..."
                  className="min-h-12 max-h-30 resize-none"
                  rows={1}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  size="icon"
                  className="h-12 w-12 shrink-0 rounded-xl"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                AI responses are generated suggestions. Always verify key career decisions independently.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
