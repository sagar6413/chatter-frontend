import {
  AuthenticationResponse,
  GroupConversationResponse,
  GroupRequest,
  GroupSettingsResponse,
  MessageDeliveryStatusResponse,
  MessageResponse,
  MessageStatus,
  NotificationResponse,
  Page,
  PrivateConversationResponse,
  SearchResult,
  SignInRequest,
  SignUpRequest,
  Theme,
  UserPreferenceRequest,
  UserPreferenceResponse,
  UserRequest,
  UserResponse,
  UserStatus,
} from "@/types";
import { AxiosError } from "axios";
import { mockDB } from "./db";

interface MessageQueryParams {
  page?: number;
  size?: number;
  before?: number;
}

const findUserByUsername = (username: string): UserResponse | undefined => {
  return mockDB.users.find((user) => user.username === username);
};

// Mock authentication data
const authenticationResponse: AuthenticationResponse = {
  refreshToken: "mockRefreshToken",
  accessToken: "mockAccessToken",
};
const setCookie = (
  name: string,
  value: string,
  options: Record<string, string | boolean | number | Date>
) => {
  const cookieOptions = Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
  document.cookie = `${name}=${value}; ${cookieOptions}`;
};

export const signIn = async (data: SignInRequest) => {
  try {
    const user = mockDB.users.find(
      (u) => u.username === data.username && data.password === "password"
    );
    if (!user) {
      throw new Error("Invalid credentials");
    }

    setCookie("accessToken", authenticationResponse.accessToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      maxAge: 15 * 60, // 15 minutes
    });

    // Set refresh token with security options
    setCookie("refreshToken", authenticationResponse.refreshToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error signing in:", error.response?.data);
    } else {
      console.error("Error signing in:", error);
    }
    throw new Error("Error signing in");
  }
};
export const signUp = async (data: SignUpRequest) => {
  try {
    const existingUser = mockDB.users.find((u) => u.username === data.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }
    const newUser: UserResponse = {
      id: mockDB.users.length + 1,
      username: data.username,
      displayName: data.displayName,
      avatar: `https://i.pravatar.cc/150?u=${data.username}`,
      status: UserStatus.OFFLINE,
      lastSeenAt: new Date(),
      preferences: {
        notificationEnabled: true,
        theme: Theme.LIGHT,
      },
      createdAt: new Date(),
    };
    mockDB.users.push(newUser);
    setCookie("accessToken", authenticationResponse.accessToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      maxAge: 15 * 60, // 15 minutes
    });

    // Set refresh token with security options
    setCookie("refreshToken", authenticationResponse.refreshToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return newUser;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error signing up:", error.response?.data);
    } else {
      console.error("Error signing up:", error);
    }
    throw new Error("Error signing up");
  }
};
export const signOut = async () => {
  try {
    setCookie("accessToken", "", {
      path: "/",
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
    });

    setCookie("refreshToken", "", {
      path: "/",
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error signing out:", error.response?.data);
    } else {
      console.error("Error signing out:", error);
    }
    throw new Error("Error signing out");
  }
};

export const createGroupChat = async (
  groupRequest: GroupRequest
): Promise<GroupConversationResponse> => {
  try {
    const participants: Set<UserResponse> = new Set();
    groupRequest.participantUsernames.forEach((username) => {
      const user = findUserByUsername(username);
      if (user) {
        participants.add(user);
      }
    });

    if (participants.size === 0) {
      throw new Error("No valid participants found");
    }

    const newGroupConversation: GroupConversationResponse = {
      conversationId: mockDB.groupConversations.length + 1,
      avatar: `https://i.pravatar.cc/150?u=group${
        mockDB.groupConversations.length + 1
      }`,
      participants,
      participantCount: participants.size,
      lastMessage: {} as MessageResponse,
      createdAt: new Date(),
      updatedAt: new Date(),
      groupName: groupRequest.groupSettings.name,
      groupDescription: groupRequest.groupSettings.description || "",
      creatorName: Array.from(participants)[0].displayName,
      creatorAvatarUrl: Array.from(participants)[0].avatar,
      creatorUserName: Array.from(participants)[0].username,
      onlyAdminsCanSend: groupRequest.groupSettings.onlyAdminsCanSend,
      messageRetentionDays: groupRequest.groupSettings.messageRetentionDays,
      maxMembers: groupRequest.groupSettings.maxMembers,
      isGroupPublic: groupRequest.groupSettings.isPublic,
    };

    mockDB.groupConversations.push(newGroupConversation);
    return newGroupConversation;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error creating group chat:", error.response?.data);
    } else {
      console.error("Error creating group chat:", error);
    }
    throw new Error("Error creating group chat");
  }
};

export const fetchGroupConversations = async (): Promise<
  GroupConversationResponse[]
> => {
  try {
    return mockDB.groupConversations;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error fetching group conversations:",
        error.response?.data
      );
    } else {
      console.error("Error fetching group conversations:", error);
    }
    throw new Error("Error fetching group conversations");
  }
};

export const updateGroupSettings = async (
  groupId: number,
  settings: GroupSettingsResponse
): Promise<GroupSettingsResponse> => {
  try {
    const groupIndex = mockDB.groupConversations.findIndex(
      (group) => group.conversationId === groupId
    );
    if (groupIndex === -1) {
      throw new Error("Group not found");
    }

    const groupConversation = mockDB.groupConversations[groupIndex];
    const updatedGroupSettings: GroupSettingsResponse = {
      ...mockDB.groupSettings[groupIndex],
      ...settings,
      name: settings.name,
      description: settings.description,
      onlyAdminsCanSend: settings.onlyAdminsCanSend,
      messageRetentionDays: settings.messageRetentionDays,
      maxMembers: settings.maxMembers,
      isPublic: settings.isPublic,
      admins: settings.admins,
    };

    mockDB.groupSettings[groupIndex] = updatedGroupSettings;
    mockDB.groupConversations[groupIndex] = {
      ...groupConversation,
      groupName: updatedGroupSettings.name,
      groupDescription: updatedGroupSettings.description,
      onlyAdminsCanSend: updatedGroupSettings.onlyAdminsCanSend,
      messageRetentionDays: updatedGroupSettings.messageRetentionDays,
      maxMembers: updatedGroupSettings.maxMembers,
      isGroupPublic: updatedGroupSettings.isPublic,
    };

    return updatedGroupSettings;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error updating group settings:", error.response?.data);
    } else {
      console.error("Error updating group settings:", error);
    }
    throw new Error("Error updating group settings");
  }
};

export const addParticipants = async (
  groupId: number,
  usernames: Set<string>
): Promise<Set<UserResponse>> => {
  try {
    const groupIndex = mockDB.groupConversations.findIndex(
      (group) => group.conversationId === groupId
    );
    if (groupIndex === -1) {
      throw new Error("Group not found");
    }

    const newParticipants: Set<UserResponse> = new Set();
    usernames.forEach((username) => {
      const user = findUserByUsername(username);
      if (user) {
        newParticipants.add(user);
        mockDB.groupConversations[groupIndex].participants.add(user);
        mockDB.groupConversations[groupIndex].participantCount++;
      }
    });

    return newParticipants;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error adding participants:", error.response?.data);
    } else {
      console.error("Error adding participants:", error);
    }
    throw new Error("Error adding participants");
  }
};

export const removeParticipant = async (
  groupId: number,
  username: string
): Promise<void> => {
  try {
    const groupIndex = mockDB.groupConversations.findIndex(
      (group) => group.conversationId === groupId
    );
    if (groupIndex === -1) {
      throw new Error("Group not found");
    }

    const userToRemove = findUserByUsername(username);
    if (userToRemove) {
      mockDB.groupConversations[groupIndex].participants.delete(userToRemove);
      mockDB.groupConversations[groupIndex].participantCount--;
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error removing participant:", error.response?.data);
    } else {
      console.error("Error removing participant:", error);
    }
    throw new Error("Error removing participant");
  }
};

export const getNotifications = async (): Promise<NotificationResponse[]> => {
  try {
    return mockDB.notifications;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching notifications:", error.response?.data);
    } else {
      console.error("Error fetching notifications:", error);
    }
    throw new Error("Error fetching notifications");
  }
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  try {
    const notificationIndex = mockDB.notifications.findIndex(
      (n) => n.id === id
    );
    if (notificationIndex !== -1) {
      mockDB.notifications[notificationIndex].read = true;
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error marking notification as read:",
        error.response?.data
      );
    } else {
      console.error("Error marking notification as read:", error);
    }
    throw new Error("Error marking notification as read");
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    mockDB.notifications.forEach((n) => (n.read = true));
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error marking all notifications as read:",
        error.response?.data
      );
    } else {
      console.error("Error marking all notifications as read:", error);
    }
    throw new Error("Error marking all notifications as read");
  }
};
export const createPrivateChat = async (
  username: string
): Promise<PrivateConversationResponse> => {
  try {
    const user = findUserByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }

    const existingChat = mockDB.privateConversations.find(
      (chat) => chat.contact.username === username
    );
    if (existingChat) {
      return existingChat;
    }

    const newPrivateChat: PrivateConversationResponse = {
      conversationId: mockDB.privateConversations.length + 1,
      avatar: user.avatar,
      contact: user,
      lastMessage: {} as MessageResponse,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDB.privateConversations.push(newPrivateChat);
    return newPrivateChat;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error creating private chat:", error.response?.data);
    } else {
      console.error("Error creating private chat:", error);
    }
    throw new Error("Error creating private chat");
  }
};

export const getPrivateChats = async (): Promise<
  PrivateConversationResponse[]
> => {
  try {
    return mockDB.privateConversations;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching private chats:", error.response?.data);
    } else {
      console.error("Error fetching private chats:", error);
    }
    throw new Error("Error fetching private chats");
  }
};

export const getMe = async (): Promise<UserResponse> => {
  try {
    // Assuming the first user is the logged-in user for simplicity
    const user = mockDB.users[0];
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching user:", error.response?.data);
    } else {
      console.error("Error fetching user:", error);
    }
    throw new Error("Error fetching user");
  }
};

export const getUser = async (username: string): Promise<UserResponse> => {
  try {
    const user = findUserByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching user:", error.response?.data);
    } else {
      console.error("Error fetching user:", error);
    }
    throw new Error("Error fetching user");
  }
};

export const updateUser = async (user: UserRequest): Promise<UserResponse> => {
  try {
    const userIndex = mockDB.users.findIndex(
      (u) => u.username === user.username
    );
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const updatedUser: UserResponse = {
      ...mockDB.users[userIndex],
      displayName: user.displayName,
      preferences: {
        ...mockDB.users[userIndex].preferences,
        ...user.preferences,
      },
    };

    mockDB.users[userIndex] = updatedUser;
    return updatedUser;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error updating user:", error.response?.data);
    } else {
      console.error("Error updating user:", error);
    }
    throw new Error("Error updating user");
  }
};

export const updatePreferences = async (
  preferences: UserPreferenceRequest
): Promise<UserPreferenceResponse> => {
  try {
    // Assuming the first user is the logged-in user
    const userIndex = 0;
    mockDB.users[userIndex].preferences = {
      ...mockDB.users[userIndex].preferences,
      ...preferences,
    };

    return mockDB.users[userIndex].preferences;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error updating preferences:", error.response?.data);
    } else {
      console.error("Error updating preferences:", error);
    }
    throw new Error("Error updating preferences");
  }
};

export const searchUser = async (query: string): Promise<SearchResult> => {
  try {
    const filteredUsers = mockDB.users.filter(
      (user) =>
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName.toLowerCase().includes(query.toLowerCase())
    );

    const filteredPrivateChats = mockDB.privateConversations.filter((chat) =>
      chat.contact.displayName.toLowerCase().includes(query.toLowerCase())
    );

    const filteredGroupChats = mockDB.groupConversations.filter((group) =>
      group.groupName.toLowerCase().includes(query.toLowerCase())
    );

    const filteredMessages = mockDB.messages.filter(
      (message) =>
        message.content?.toLowerCase().includes(query.toLowerCase()) ||
        message.senderDisplayName.toLowerCase().includes(query.toLowerCase())
    );

    const result: SearchResult = {
      users: filteredUsers,
      privateChats: filteredPrivateChats,
      groupChats: filteredGroupChats,
      messages: filteredMessages,
    };
    return result;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching user:", error.response?.data);
    } else {
      console.error("Error fetching user:", error);
    }
    throw new Error("Error fetching user");
  }
};

const loadInitialMessages = async (
  conversationId: number,
  params: MessageQueryParams = { page: 0, size: 30 }
): Promise<Page<MessageResponse>> => {
  try {
    const isGroup = conversationId > 10;
    const conversation = isGroup
      ? mockDB.groupConversations.find(
          (c) => c.conversationId === conversationId
        )
      : mockDB.privateConversations.find(
          (c) => c.conversationId === conversationId
        );

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const relevantMessages = mockDB.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const start = params.page! * params.size!;
    const end = start + params.size!;
    const paginatedMessages = relevantMessages.slice(start, end);

    return {
      content: paginatedMessages,
      number: params.page!,
      size: params.size!,
      numberOfElements: paginatedMessages.length,
      hasContent: paginatedMessages.length > 0,
      first: params.page! === 0,
      last: end >= relevantMessages.length,
      hasNext: end < relevantMessages.length,
      hasPrevious: params.page! > 0,
      sort: {
        sorted: true,
        unsorted: false,
        empty: false,
      },
      pageable: {
        pageNumber: params.page!,
        pageSize: params.size!,
        sort: {
          sorted: true,
          unsorted: false,
          empty: false,
        },
        offset: start,
        unpaged: false,
        paged: true,
      },
      totalPages: Math.ceil(relevantMessages.length / params.size!),
      totalElements: relevantMessages.length,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching messages:", error.response?.data);
    } else {
      console.error("Error fetching messages:", error);
    }
    throw new Error("Error fetching messages");
  }
};

const loadMoreMessages = async (
  conversationId: number,
  params: MessageQueryParams
): Promise<Page<MessageResponse>> => {
  try {
    const isGroup = conversationId > 10;
    const conversation = isGroup
      ? mockDB.groupConversations.find(
          (c) => c.conversationId === conversationId
        )
      : mockDB.privateConversations.find(
          (c) => c.conversationId === conversationId
        );

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const relevantMessages = mockDB.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const beforeIndex = params.before
      ? relevantMessages.findIndex((m) => m.id === params.before)
      : relevantMessages.length;

    const start = Math.max(0, beforeIndex - params.size!);
    const end = beforeIndex;
    const paginatedMessages = relevantMessages.slice(start, end);

    return {
      content: paginatedMessages,
      number: Math.ceil(start / params.size!),
      size: params.size!,
      numberOfElements: paginatedMessages.length,
      hasContent: paginatedMessages.length > 0,
      first: start === 0,
      last: end >= relevantMessages.length,
      hasNext: start > 0,
      hasPrevious: end < relevantMessages.length,
      sort: {
        sorted: true,
        unsorted: false,
        empty: false,
      },
      pageable: {
        pageNumber: Math.ceil(start / params.size!),
        pageSize: params.size!,
        sort: {
          sorted: true,
          unsorted: false,
          empty: false,
        },
        offset: start,
        unpaged: false,
        paged: true,
      },
      totalPages: Math.ceil(relevantMessages.length / params.size!),
      totalElements: relevantMessages.length,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching more messages:", error.response?.data);
    } else {
      console.error("Error fetching more messages:", error);
    }
    throw new Error("Error fetching more messages");
  }
};
const updateMessageStatus = async (
  conversationId: number,
  username: string,
  messageId: number,
  status: string
): Promise<MessageDeliveryStatusResponse> => {
  try {
    const message = mockDB.messages.find((m) => m.id === messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    message.deliveryStatus.forEach((deliveryStatus) => {
      if (deliveryStatus.recipient.username === username) {
        if (deliveryStatus.status !== MessageStatus.READ) {
          deliveryStatus.status = status as MessageStatus;
          deliveryStatus.statusTimestamp = new Date();
        }
        return deliveryStatus;
      }
    });
    const data = Array.from(message.deliveryStatus).filter(
      (deliveryStatus) => deliveryStatus.recipient.username === username
    );
    return data[0];
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error updating message status:", error.response?.data);
    } else {
      console.error("Error updating message status:", error);
    }
    throw new Error("Error updating message status");
  }
};
export { loadInitialMessages, loadMoreMessages, updateMessageStatus };
