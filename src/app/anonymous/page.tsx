"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IoSend } from "react-icons/io5";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AnonymousChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setMessages([
        {
          id: "welcome",
          content: "You're now connected with a random person. Say hi! 👋",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnecting(false);
    setMessages([]);
    setIsConnected(false);
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

    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "This is a simulated response from the anonymous user.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 1500);
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[100vh] w-full relative overflow-hidden"
        role="main"
        aria-label="Anonymous Chat Landing Page"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="text-center space-y-6 relative z-10 max-w-md mx-auto">
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="relative"
          >
            <div className="mx-auto bg-gradient-to-r from-primary to-purple-500 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <IoSend className="h-10 w-10 md:h-12 md:w-12 text-white transform -rotate-45" />
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping-slow" />
            </div>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-display tracking-tight">
            Anonymous Chat
          </h1>
          <p className="text-base md:text-lg text-muted-foreground/80 font-light max-w-sm mx-auto">
            Connect securely with a random person for private conversations
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 relative z-10">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-xs"
          >
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full h-12 md:h-14 rounded-full text-base md:text-lg gap-3 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              aria-label={isConnecting ? "Connecting..." : "Start Chatting"}
            >
              {isConnecting ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="h-4 w-4 border-2 border-current rounded-full border-t-transparent"
                  />
                  Connecting...
                </>
              ) : (
                <span className="drop-shadow-sm">Start Chatting</span>
              )}
            </Button>
          </motion.div>

          <motion.div whileHover={{ x: -4 }} className="text-center">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium py-2"
            >
              <FaArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="flex flex-col h-[100vh] w-full md:h-[600px] border rounded-xl md:rounded-2xl overflow-hidden bg-background shadow-xl relative group"
      role="main"
      aria-label="Chat Interface"
    >
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(180deg,transparent,rgba(0,0,0,0.8))]" />

      {/* Chat Header */}
      <header className="flex-none p-3 md:p-4 border-b bg-gradient-to-r from-primary/5 to-purple-500/5 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="font-semibold text-lg md:text-xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Anonymous Chat
            </h2>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground/80">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>Connected Securely</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full px-3 md:px-4 gap-2 transition-colors duration-300"
            onClick={handleDisconnect}
            aria-label="Leave Chat"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="hidden sm:inline">Leave Chat</span>
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-3 md:p-4 relative ">
        <AnimatePresence initial={false}>
          <div className="space-y-4 md:space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex items-start gap-2 md:gap-3",
                  message.isUser ? "flex-row-reverse" : ""
                )}
              >
                <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-background shadow-md flex-shrink-0">
                  <AvatarFallback
                    className="bg-gradient-to-r from-primary to-purple-500 text-white text-sm font-medium"
                    aria-label={
                      message.isUser ? "User Avatar" : "Anonymous User Avatar"
                    }
                  >
                    {message.isUser ? "U" : "A"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "relative rounded-2xl p-3 md:p-4 max-w-[85%] md:max-w-[75%] shadow-md",
                    message.isUser
                      ? "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground"
                      : "bg-muted/30 backdrop-blur-sm",
                    !message.isUser &&
                      "before:absolute before:-left-2 before:top-3 before:h-4 before:w-4 before:bg-muted/30 before:clip-triangle before:backdrop-blur-sm"
                  )}
                  role="article"
                  aria-label={`Message from ${
                    message.isUser ? "you" : "anonymous user"
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed break-words mb-2">
                    {message.content}
                  </p>
                  <span className="absolute bottom-1 right-2 text-[10px] md:text-xs opacity-80 bg-black/10 px-1.5 py-0.5 rounded-full">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </ScrollArea>

      {/* Message Input */}
      <footer className="flex-none p-3 md:p-4 border-t bg-background/95 backdrop-blur-sm relative ">
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
            className="rounded-full px-4 md:px-6 h-10 md:h-12 shadow-md focus-visible:ring-primary/50 border-white/20 bg-background/80 placeholder:text-muted-foreground/60"
            aria-label="Message Input"
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSendMessage()
            }
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              size="icon"
              className="rounded-full h-10 w-10 md:h-12 md:w-12 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-md hover:shadow-lg transition-shadow duration-300"
              disabled={!inputMessage.trim()}
              aria-label="Send Message"
            >
              <IoSend className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </motion.div>
        </form>
      </footer>
    </div>
  );
}
