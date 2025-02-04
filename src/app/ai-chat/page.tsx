"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { IoSend } from "react-icons/io5";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RiChatDeleteLine, RiArrowGoBackLine } from "react-icons/ri";
import { useRouter } from "next/navigation";

// Type definitions remain the same
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

type AiMood = "friendly" | "professional" | "funny" | "sarcastic" | "poetic";

const AI_MOODS: Record<
  AiMood,
  { name: string; emoji: string; avatar: string }
> = {
  friendly: {
    name: "Friendly",
    emoji: "😊",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=friendly",
  },
  professional: {
    name: "Professional",
    emoji: "👔",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=professional",
  },
  funny: {
    name: "Funny",
    emoji: "😄",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=funny",
  },
  sarcastic: {
    name: "Sarcastic",
    emoji: "😏",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sarcastic",
  },
  poetic: {
    name: "Poetic",
    emoji: "🎭",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=poetic",
  },
};

const MOOD_RESPONSES: Record<AiMood, string[]> = {
  friendly: [
    "Hey there! How can I help you today? 😊",
    "That's interesting! Tell me more about it!",
    "I'm here to chat and help however I can!",
  ],
  professional: [
    "Good day. How may I assist you?",
    "I understand your query. Let me help you with that.",
    "Thank you for your question. Here's my professional assessment.",
  ],
  funny: [
    "Hey there! Ready to add some humor to your day? 😄",
    "Why did the chatbot go to therapy? It had too many processing issues! 😂",
    "Let's keep this conversation light and fun!",
  ],
  sarcastic: [
    "Oh great, another human wanting to chat... 😏",
    "Wow, that's totally the most original thing I've heard today...",
    "No way, tell me more about this absolutely fascinating topic...",
  ],
  poetic: [
    "In digital realms of ones and zeros, I await your words to flow...",
    "Through circuits and silicon, our conversation weaves a tapestry of thought...",
    "Let our dialogue dance like electrons in the cosmic dance of computation...",
  ],
};

export default function AiChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState<AiMood>("friendly");
  const [isStarted, setIsStarted] = useState(false);

  // Core functionality remains the same
  const handleStart = () => {
    setIsStarted(true);
    const welcomeMessage = {
      id: "welcome",
      content: MOOD_RESPONSES[selectedMood][0],
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const responses = MOOD_RESPONSES[selectedMood];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsStarted(false);
    setMessages([]);
    setSelectedMood("friendly");
  };

  return (
    // Enhanced root container with improved responsive design
    <div className="flex flex-col h-[100vh] w-full mx-auto bg-background/95 backdrop-blur-sm rounded-none md:rounded-xl shadow-xl overflow-hidden border md:border-2 border-primary/10">
      {!isStarted ? (
        // Enhanced welcome screen with improved visual hierarchy
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-full p-4 md:p-8 space-y-6 md:space-y-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5"
        >
          <div className="space-y-3 text-center max-w-md">
            <motion.h2
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              AI Companion
            </motion.h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Choose a personality to begin your conversation
            </p>
          </div>

          {/* Enhanced mood selector with improved interaction states */}
          <motion.div
            className="w-full max-w-sm mx-auto"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <Select
              value={selectedMood}
              onValueChange={(value) => setSelectedMood(value as AiMood)}
            >
              <SelectTrigger className="h-14 md:h-16 rounded-xl shadow-sm border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl md:text-2xl">
                    {AI_MOODS[selectedMood].emoji}
                  </span>
                  <span className="text-base md:text-lg font-medium">
                    {AI_MOODS[selectedMood].name}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(AI_MOODS).map(([mood, { name, emoji }]) => (
                  <SelectItem
                    key={mood}
                    value={mood}
                    className="h-12 md:h-14 hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl md:text-2xl">{emoji}</span>
                      <span className="text-base md:text-lg">{name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Enhanced action buttons with improved visual feedback */}
          <motion.div
            className="flex flex-col items-center gap-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleStart}
              className="h-11 md:h-12 px-6 md:px-8 text-base md:text-lg rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-200"
            >
              Start Conversation
            </Button>
            <Button
              variant="ghost"
              className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors gap-2"
              onClick={() => router.push("/signin")}
            >
              <RiArrowGoBackLine className="h-4 w-4" />
              Back to Sign In
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        // Enhanced chat interface with improved layout and responsiveness
        <div className="flex flex-col h-full">
          {/* Enhanced header with improved visual hierarchy */}
          <div className="px-4 py-3 md:p-4 border-b bg-gradient-to-r from-primary/5 via-background to-secondary/5 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-primary/20 ring-2 ring-background">
                <AvatarImage src={AI_MOODS[selectedMood].avatar} />
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-semibold truncate">
                  {AI_MOODS[selectedMood].name} AI
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  {AI_MOODS[selectedMood].emoji} Online
                </p>
              </div>
            </div>

            {/* Enhanced controls with improved layout */}
            <div className="flex items-center gap-2">
              <Select
                value={selectedMood}
                onValueChange={(value) => setSelectedMood(value as AiMood)}
              >
                <SelectTrigger className="w-[120px] md:w-[140px] h-9 md:h-10 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(AI_MOODS).map(([mood, { name, emoji }]) => (
                    <SelectItem
                      key={mood}
                      value={mood}
                      className="h-10 md:h-12 hover:bg-muted/50 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-xl">{emoji}</span>
                        <span className="text-sm md:text-base">{name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleDisconnect}
                variant="ghost"
                className="h-9 md:h-10 w-9 md:w-10 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                title="End conversation"
              >
                <RiChatDeleteLine className="h-4 md:h-5 w-4 md:w-5" />
              </Button>
            </div>
          </div>

          {/* Enhanced message area with improved spacing and visual design */}
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background to-muted/5">
            <div className="space-y-4 md:space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-start gap-3 max-w-[85%] md:max-w-[75%]",
                    message.isUser ? "ml-auto" : "mr-auto"
                  )}
                >
                  {!message.isUser && (
                    <Avatar className="h-8 w-8 mt-1 border-2 border-primary/20 ring-2 ring-background shrink-0">
                      <AvatarImage src={AI_MOODS[selectedMood].avatar} />
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl p-3 md:p-4 shadow-sm transition-colors",
                      message.isUser
                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                        : "bg-muted/50 backdrop-blur-sm",
                      index === messages.length - 1 ? "animate-pulse" : ""
                    )}
                  >
                    <p className="text-sm md:text-base leading-relaxed">
                      {message.content}
                    </p>
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Enhanced input area with improved interaction states */}
          <div className="p-3 md:p-4 border-t bg-gradient-to-b from-background/50 to-muted/5 backdrop-blur-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2 items-center max-w-4xl mx-auto"
            >
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl h-11 md:h-12 px-4 shadow-sm border-2 border-primary/20 hover:border-primary/30 focus:border-primary/50 transition-colors"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputMessage.trim()}
                className={cn(
                  "h-11 md:h-12 w-11 md:w-12 rounded-xl",
                  "bg-gradient-to-r from-primary to-secondary",
                  "hover:from-primary/90 hover:to-secondary/90",
                  "shadow-md transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <IoSend className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
