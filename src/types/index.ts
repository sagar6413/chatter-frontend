// Core enums that define the basic structures of the chat application
export enum ConversationType {
  PRIVATE = "PRIVATE",
  GROUP = "GROUP",
}

export enum GroupRole {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
}

export enum MediaUploadStatus {
  PENDING = "PENDING",
  UPLOADING = "UPLOADING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum MessageStatus {
  NOT_SENT = "NOT_SENT",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
  SYSTEM = "SYSTEM",
}

export type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY";

export enum Theme {
  LIGHT = "LIGHT",
  DARK = "DARK",
  SYSTEM = "SYSTEM",
}

export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  BUSY = "BUSY",
  AWAY = "AWAY",
}

// Authentication related
export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  displayName: string;
  password: string;
}
export interface AuthenticationResponse {
  refreshToken: string;
  accessToken: string;
}

// User related
export interface UserPreferenceRequest {
  notificationEnabled: boolean;
  theme: Theme;
}

export interface UserRequest {
  username: string;
  displayName: string;
  preferences: UserPreferenceRequest;
}
export interface UserPreferenceResponse {
  notificationEnabled: boolean;
  theme: Theme;
  // add more preferences as needed
}

export interface UserResponse {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  status: UserStatus;
  lastSeenAt: Timestamp;
  preferences: UserPreferenceResponse;
  createdAt: Timestamp;
}

// Base User type for internal use
export interface User {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  status: UserStatus;
  preferences: UserPreferences;
}

// Group Chat related
export interface GroupConversationResponse {
  conversationId: number;
  avatar: string;
  participants: Set<UserResponse>;
  participantCount: number;
  lastMessage: MessageResponse;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  groupName: string;
  groupDescription: string;
  creatorName: string;
  creatorAvatarUrl: string;
  creatorUserName: string;
  onlyAdminsCanSend: boolean;
  messageRetentionDays: number;
  maxMembers: number;
  isGroupPublic: boolean;
}

export interface GroupRequest {
  participantUsernames: Set<string>;
  groupSettings: GroupSettingsRequest;
}

export interface GroupSettingsRequest {
  name: string;
  description?: string; // Optional field
  onlyAdminsCanSend: boolean;
  messageRetentionDays: number;
  maxMembers: number;
  isPublic: boolean;
}
export interface GroupSettingsResponse {
  name: string;
  description: string;
  creator: User; // Assuming User type exists
  onlyAdminsCanSend: boolean;
  messageRetentionDays: number;
  maxMembers: number;
  isPublic: boolean;
  admins: Set<User>;
}

// Private Chat related
export interface PrivateConversationResponse {
  conversationId: number;
  avatar: string;
  contact: UserResponse;
  lastMessage: MessageResponse;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Search related
export interface SearchResult {
  users?: UserResponse[];
  privateChats?: PrivateConversationResponse[];
  groupChats?: GroupConversationResponse[];
  messages?: MessageResponse[];
}
// Message related
export interface MessageRequest {
  conversationId: number;
  content: string;
  type: MessageType;
  mediaIds: Set<string>;
}
export interface MessageDeliveryStatusResponse {
  messageDeliveryStatusId: number;
  recipient: UserResponse;
  status: MessageStatus;
  statusTimestamp: Timestamp;
}

export interface MessageResponse {
  id: number;
  content: string;
  type: MessageType;
  senderId: number;
  senderAvatarUrl: string;
  senderUsername: string;
  senderDisplayName: string;
  conversationId: number;
  timestamp: string;
  status: MessageStatus;
  reactions: ReactionResponse[];
  editedAt: string;
  mediaUrls?: string[];
  deliveryStatus: Array<{
    recipient: { username: string };
    status: MessageStatus;
  }>;
}
export interface ReactionResponse {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  type: ReactionType;
}

export interface EmojiClickData {
  activeSkinTone: SkinTones;
  unified: string;
  unifiedWithoutSkinTone: string;
  emoji: string;
  names: string[];
  imageUrl: string;
  getImageUrl: (emojiStyle?: EmojiStyle) => string;
  isCustom: boolean;
}

enum EmojiStyle {
  NATIVE = "native",
  APPLE = "apple",
  TWITTER = "twitter",
  GOOGLE = "google",
  FACEBOOK = "facebook",
}

enum SkinTones {
  NEUTRAL = "neutral",
  LIGHT = "1f3fb",
  MEDIUM_LIGHT = "1f3fc",
  MEDIUM = "1f3fd",
  MEDIUM_DARK = "1f3fe",
  DARK = "1f3ff",
}

// Notification related
export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  timestamp: Timestamp;
  type: NotificationType;
  read: boolean;
}

export type NotificationType = "CONNECTION REQUEST" | "MENTION" | "REACTION";

// Media related
export interface MediaUploadRequest {
  fileName: string;
  fileSize: number;
  fileType: string;
  checksum: string;
}
export interface MediaResponse {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadUrl: string;
  uploadStatus: MediaUploadStatus;
  metadata: string;
}

// Using type alias with Date instead of Instant for frontend timestamp handling
type Timestamp = Date;

// Pagination related
interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
  orders?: Array<{
    property: string;
    direction: "ASC" | "DESC";
    ignoreCase: boolean;
    nullHandling: "NATIVE" | "NULLS_FIRST" | "NULLS_LAST";
  }>;
}

interface Slice<T> {
  content: T[];
  number: number;
  size: number;
  numberOfElements: number;
  hasContent: boolean;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  sort: Sort;
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
}

export interface Page<T> extends Slice<T> {
  totalPages: number;
  totalElements: number;
}

export const MESSAGES_PER_PAGE = 30 as const;

export const defaultReactions: ReactionType[] = [
  "LIKE",
  "LOVE",
  "HAHA",
  "WOW",
  "SAD",
  "ANGRY",
] as const;

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  language: string;
}
