"use client";

import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { ChatHeader } from "./chat-header";

export function ChatInterface() {
  return (
    <>
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </>
  );
}