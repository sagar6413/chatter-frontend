"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useState,
  useCallback,
  memo,
  useDeferredValue,
  useTransition,
} from "react";
import dynamic from "next/dynamic";
import {
  FaMicrophone,
  FaPaperclip,
  FaFaceSmileBeam,
  FaPhotoFilm,
  FaPaperPlane,
  FaFileLines,
  FaChartColumn,
} from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";
import { ConversationType } from "@/types";
import { useChat } from "@/hooks/useChat";

// Lazy load emoji picker with SSR disabled
const EmojiPicker = dynamic(
  () => import("@emoji-mart/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <div className="text-purple-200">Loading emojis...</div>,
  }
);

// Memoized attachment menu to prevent unnecessary re-renders
const AttachmentMenu = memo(() => (
  <DropdownMenu>
    <Tooltip>
      <DropdownMenuTrigger asChild>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Attach files">
            <FaPaperclip className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-800 border-purple-500/20 transform translate-x-1 ">
        {[
          { icon: FaPhotoFilm, label: "Photo/Video" },
          { icon: FaFileLines, label: "Document" },
          { icon: FaChartColumn, label: "Poll" },
        ].map(({ icon: Icon, label }) => (
          <DropdownMenuItem
            key={label}
            className="focus:bg-slate-700/50 focus:text-purple-100"
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
      <TooltipContent side="top">Attach files</TooltipContent>
    </Tooltip>
  </DropdownMenu>
));
AttachmentMenu.displayName = "AttachmentMenu";

interface MessageInputProps {
  conversationId: number;
  conversationType: ConversationType;
}

export function MessageInput({
  conversationId,
  conversationType,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, startSending] = useTransition();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const { toast } = useToast();
  const { send } = useChat(conversationId, conversationType);

  // Optimize text input performance with deferred value
  const deferredMessage = useDeferredValue(message);

  // Memoized message handler with proper error handling
  const handleSendMessage = useCallback(async () => {
    if (!deferredMessage.trim()) return;

    try {
      await new Promise((resolve) => {
        startSending(async () => {
          try {
            setMessage("");
            await send(deferredMessage);
          } catch (error) {
            console.error("Error sending message:", error);
            toast({ title: "Message failed to send", variant: "destructive" });
          } finally {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Sending failed", variant: "destructive" });
    }
  }, [deferredMessage, toast, startSending, send]);

  // Memoized keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="border-t p-2 flex items-center gap-4 border-purple-500/20 bg-slate-800/50 backdrop-blur-lg fixed bottom-0 left-0 right-0 md:static">
        <AttachmentMenu />

        <div className="flex-1 relative">
          <Textarea
            placeholder="Type a message..."
            className="w-full min-h-6 max-h-12 p-2 bg-slate-700/50 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/40 text-purple-100 placeholder-purple-400 resize-none pr-12 transition-[border-color] duration-200"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Enter your message"
            spellCheck
            aria-busy={isSending}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-slate-700/50"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                aria-label="Add emoji"
                aria-expanded={isEmojiPickerOpen}
              >
                <FaFaceSmileBeam className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Add emoji</TooltipContent>
          </Tooltip>
        </div>

        {isEmojiPickerOpen && (
          <div className="absolute bottom-14 right-4 animate-in fade-in zoom-in-95">
            <EmojiPicker
              data={async () => {
                const response = await fetch(
                  "https://cdn.jsdelivr.net/npm/@emoji-mart/data"
                );
                return response.json();
              }}
              onEmojiSelect={(emoji: { native: string }) =>
                setMessage((prev) => prev + emoji.native)
              }
              onClickOutside={() => setIsEmojiPickerOpen(false)}
              theme="dark"
              previewPosition="none"
            />
          </div>
        )}
        {message.trim() ? (
          <Button
            variant="ghost"
            size="icon"
            className="bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg p-2 hover:opacity-90 transition-opacity aria-disabled:opacity-50"
            onClick={handleSendMessage}
            aria-disabled={!message.trim() || isSending}
            aria-label={isSending ? "Sending message..." : "Send message"}
          >
            {isSending ? (
              <div className="h-5 w-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaPaperPlane className="h-5 w-5" />
            )}
          </Button>
        ) : (
          //voice message
          <Button
            variant="ghost"
            size="icon"
            className="bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg p-2 hover:opacity-90 transition-opacity aria-disabled:opacity-50"
          >
            <FaMicrophone className="h-5 w-5" />
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}
/**
 // src/components/Chat.tsx
import { useEffect, useRef } from 'react'
import { useChat } from '@/hooks/useChat'
import { useWebSocket } from '@/hooks/useWebSocket'
import { ConversationType } from '@/types/chat'

interface ChatProps {
  conversationId: number
  conversationType: ConversationType
}

export default function Chat({ conversationId, conversationType }: ChatProps) {
  const { connected } = useWebSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { 
    messages, 
    loading, 
    loadingMore, 
    hasMore, 
    error,
    sendMessage,
    loadMoreMessages 
  } = useChat({ 
    conversationId, 
    conversationType 
  })

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle infinite scroll
  const handleScroll = () => {
    const container = containerRef.current
    if (!container || loadingMore || !hasMore) return

    if (container.scrollTop === 0) {
      loadMoreMessages()
    }
  }

  if (!connected) {
    return <div>Connecting...</div>
  }

  if (loading) {
    return <div>Loading messages...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {loadingMore && (
          <div className="text-center p-2">Loading more messages...</div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="p-2">
            <div className="font-bold">{message.senderDisplayName}</div>
            <div>{message.content}</div>
            <div className="text-sm text-gray-500">
              {new Date(message.createdAt).toLocaleTimeString()}
              {message.deliveryStatus.map(status => status.status).join(', ')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <input
          type="text"
          placeholder="Type a message..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  )
}
 */
