import { useCallback } from 'react'
import { useWebSocketStore } from '@/store/webSocketStore'
import { MessageRequest, MessageResponse, ConversationType } from '@/types/index'

interface UseChatProps {
  conversationId: number;
  conversationType: ConversationType;
}

export const useChat = ({ conversationId, conversationType }: UseChatProps) => {
  const { 
    sendMessage, 
    subscribeToConversation,
    connected 
  } = useWebSocketStore()

  const send = useCallback((message: MessageRequest) => {
    sendMessage(message, conversationType)
  }, [conversationId, conversationType, sendMessage])

  const subscribe = useCallback((callback: (message: MessageResponse) => void) => {
    return subscribeToConversation(conversationId, conversationType, callback)
  }, [conversationId, conversationType, subscribeToConversation])

  return {
    sendMessage: send,
    subscribeToConversation: subscribe,
    connected
  }
}