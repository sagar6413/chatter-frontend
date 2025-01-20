"use client";

import {
  Paperclip,
  Smile,
  Send,
  FileText,
  BarChart2,
  ImageIcon,
} from "lucide-react";
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

export function MessageInput() {
  return (
    <div className="border-t p-2 flex items-center gap-4 border-purple-500/20 bg-slate-800/50 backdrop-blur-lg">
      <div className="flex gap-1">
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Photo/Video
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Document
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Poll
                </DropdownMenuItem>
              </DropdownMenuContent>
              <TooltipContent>Attach files</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenu>
      </div>
      <div className="flex-1 relative">
        <Textarea
          placeholder="Type a message..."
          className="w-full min-h-8 max-h-12 p-2 bg-slate-700/50 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/40 text-purple-100 placeholder-purple-400 resize-none pr-12 py-3"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add emoji</TooltipContent>
        </Tooltip>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg p-2 hover:opacity-90 transition-opacity"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
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
