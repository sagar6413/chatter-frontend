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
  RECEIVED = "RECEIVED",
  DELIVERED = "DELIVERED",
  READ = "READ",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
}

export enum ReactionType {
  LIKE = "LIKE",
  LOVE = "LOVE",
  HAHA = "HAHA",
  WOW = "WOW",
  SAD = "SAD",
  ANGRY = "ANGRY",
}

export enum Theme {
  LIGHT = "LIGHT",
  DARK = "DARK",
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
  status: UserStatus;
}

// Group Chat related
export interface GroupConversationResponse {
  conversationId: number;
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
  contact: UserResponse;
  lastMessage: MessageResponse;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Message related
export interface MessageRequest {
  conversationId: number;
  content?: string; // Optional as it might be a media message
  mediaIds?: Set<number>; // Optional media attachments
  type: MessageType;
  replyToMessageId?: number; // Optional for threaded replies
}
export interface MessageDeliveryStatusResponse {
  messageDeliveryStatusId: number;
  recipient: UserResponse;
  status: MessageStatus;
  statusTimestamp: Timestamp;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  senderUsername: string;
  senderAvatarUrl: string;
  senderDisplayName: string;
  content: string;
  mediaItems: Set<MediaResponse>;
  type: MessageType;
  reactions: Set<ReactionResponse>;
  createdAt: Timestamp;
  editedAt: Timestamp;
  deliveryStatus: Set<MessageDeliveryStatusResponse>;
}
export interface ReactionResponse {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  type: ReactionType;
}

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
    direction: 'ASC' | 'DESC';
    ignoreCase: boolean;
    nullHandling: 'NATIVE' | 'NULLS_FIRST' | 'NULLS_LAST';
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