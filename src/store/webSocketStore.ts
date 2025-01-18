import { create } from 'zustand'
import { Client, Frame, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { MessageResponse, MessageRequest, ConversationType } from '@/types/index'

interface WebSocketStore {
  client: Client | null
  connected: boolean
  subscriptions: Map<number, StompSubscription>
  connectionError: string | null
  connect: (token: string) => void
  disconnect: () => void
  sendMessage: (message: MessageRequest, conversationType:ConversationType) => void
  subscribeToConversation: (
    conversationId: number, 
    conversationType: ConversationType,
    callback: (message: MessageResponse) => void
  ) => () => void
  retryCount: number
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:8080/ws'
const RECONNECT_DELAY = 5000
const MAX_RETRIES = 5

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  client: null,
  connected: false,
  subscriptions: new Map(),
  connectionError: null,
  retryCount: 0,

  connect: (token: string) => {
    const { client } = get()
    
    if (client) {
      client.deactivate()
    }

    const newClient = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.debug('STOMP: ' + str)
      },
      reconnectDelay: RECONNECT_DELAY,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        set({ connected: true, connectionError: null, retryCount: 0 })
        console.log('WebSocket Connected')
      },

      onDisconnect: () => {
        set({ connected: false })
        console.log('WebSocket Disconnected')
      },

      onStompError: (frame: Frame) => {
        const retryCount = get().retryCount
        if (retryCount < MAX_RETRIES) {
          set({ retryCount: retryCount + 1 })
          setTimeout(() => get().connect(token), RECONNECT_DELAY)
        } else {
          set({ 
            connectionError: `Connection error: ${frame.headers['message']}`,
            connected: false 
          })
        }
      }
    })

    newClient.activate()
    set({ client: newClient })
  },

  disconnect: () => {
    const { client } = get()
    if (client) {
      client.deactivate()
      set({ client: null, connected: false, subscriptions: new Map() })
    }
  },

  sendMessage: (message: MessageRequest, conversationType: ConversationType) => {
    const { client, connected } = get()
    if (!client || !connected) {
      console.error('WebSocket not connected')
      return
    }
    const destination = conversationType === 'PRIVATE' 
      ? '/app/chat.sendPrivateMessage'
      : '/app/chat.sendGroupMessage'

    client.publish({
      destination,
      body: JSON.stringify(message)
    })
  },

  subscribeToConversation: (conversationId: number,
    conversationType: ConversationType, callback: (message: MessageResponse) => void) => {
    const { client, subscriptions } = get()
    if (!client) {
      console.error('WebSocket not connected')
      return () => {}
    }

    // Determine if this is a private or group conversation
    const destination = conversationType === 'PRIVATE'
      ? `/queue/chat/${conversationId}`
      : `/topic/chat/${conversationId}`

    // Unsubscribe from existing subscription if any
    const existingSub = subscriptions.get(conversationId)
    if (existingSub) {
      existingSub.unsubscribe()
    }

    // Create new subscription
    const subscription = client.subscribe(destination, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body) as MessageResponse
        callback(parsedMessage)
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    })

    // Store the subscription
    const newSubscriptions = new Map(subscriptions)
    newSubscriptions.set(conversationId, subscription)
    set({ subscriptions: newSubscriptions })

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe()
      const currentSubs = get().subscriptions
      currentSubs.delete(conversationId)
      set({ subscriptions: currentSubs })
    }
  }
}))