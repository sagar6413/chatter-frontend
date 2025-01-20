# Chat Application API Documentation

# User Management APIs

Base URL: `/api/v1/users`

### Sign Up

- **Endpoint**: POST `/auth/signup`
- **Request Body**: `SignUpRequest` (username, displayName, password)
- **Response**: `AuthenticationResponse` (refreshToken, accessToken)
- **Detail**: Register new user account

### Sign In

- **Endpoint**: POST `/auth/signin`
- **Request Body**: `SignInRequest` (username, password)
- **Response**: `AuthenticationResponse` (refreshToken, accessToken)
- **Detail**: Authenticate existing user

### sign Out

- **Endpoint**: POST `/auth/signout`
- **Response**: void (no content)
- **Detail**: Sign out user

### Get Logged In User Profile

- **Endpoint**: GET `/user/me`
- **Response**: `UserResponse`
- **Detail**: Fetch logged in user profile information

### Get User Profile

- **Endpoint**: GET `/username/{username}`
- **PathVariable**: username
- **Response**: `UserResponse`
- **Detail**: Fetch user profile information

### Update User

- **Endpoint**: PUT `/user/me`
- **Request Body**: `UserRequest` (username, displayName, preferences)
- **Response**: `UserResponse`
- **Detail**: Update user profile data

### Update Preferences

- **Endpoint**: PUT `/me/preferences`
- **Request Body**: `UserPreferenceRequest` (notificationEnabled, theme)
- **Response**: `UserPreferencesResponse`
- **Detail**: Update user preferences

### Update Status

- **Endpoint**: PUT `/{username}/status`
- **PathVariable**: username
- **Request Body**: `UserStatus` enum
- **Response**: `UserStatus`
- **Detail**: Update user's online status

### Search Users

- **Endpoint**: GET `/search`
- **RequestParam**: query
- **Response**: `Page<UserResponse>`
- **Detail**: Search users by query string

# Chat APIs

Base URL: `/api/chats`

### Get Private Chats

- **Endpoint**: GET `/private-chats`
- **Response**: `Page<PrivateConversationResponse>`
- **Detail**: List user's private conversations

### Get Group Chats

- **Endpoint**: GET `/group-chats`
- **Response**: `Page<GroupConversationResponse>`
- **Detail**: List user's group conversations

### Create Private Chat

- **Endpoint**: POST `/private/{username}`
- **PathVariable**: username
- **Response**: `PrivateConversationResponse`
- **Detail**: Start private conversation

### Create Group

- **Endpoint**: POST `/group`
- **Request Body**: `GroupRequest` (participantUsernames, groupSettings)
- **Response**: `GroupConversationResponse`
- **Detail**: Create new group chat

### Update Group Settings

- **Endpoint**: PUT `/{groupId}/settings`
- **PathVariable**: groupId
- **Request Body**: `GroupSettingsRequest`
- **Response**: `GroupSettingsResponse`
- **Detail**: Modify group settings

### Add Participants

- **Endpoint**: POST `/{groupId}/participants`
- **PathVariable**: groupId
- **Request Body**: `Set<String>` (usernames)
- **Response**: void
- **Detail**: Add users to group

### Remove Participant

- **Endpoint**: DELETE `/{groupId}/participants/{username}`
- **PathVariable**: groupId, username
- **Response**: `Set<UserResponse>`
- **Detail**: Remove user from group

### Get Messages

- **Endpoint**: GET `/{username}/{conversationId}/messages`
- **PathVariable**: username, conversationId
- **Response**: Page of messages
- **Detail**: Get conversation history

### Update Message Status

- **Endpoint**: PUT `/{username}/messages/{messageId}/status`
- **PathVariable**: username, messageId
- **Request Body**: `MessageStatus`
- **Response**: `MessageDeliveryStatusResponse`
- **Detail**: Update message delivery status

# Media APIs

Base URL: `/api/media`

### Initialize Upload

- **Endpoint**: POST `/initialize`
- **Request Body**: `MediaUploadRequest`
- **Response**: Media initialization response
- **Detail**: Initialize media upload

### Upload File

- **Endpoint**: POST `/upload`
- **RequestParam**: file (MultipartFile), messageId
- **Response**: Media
- **Detail**: Upload media file

### Upload File Chunk

- **Endpoint**: POST `/upload/{mediaId}`
- **PathVariable**: mediaId
- **RequestParam**: file (MultipartFile)
- **Response**: Upload status
- **Detail**: Upload media in chunks

### Get Media

- **Endpoint**: GET `/{mediaId}`
- **PathVariable**: mediaId
- **Response**: Media details
- **Detail**: Get media information

### Delete Media

- **Endpoint**: DELETE `/{mediaId}`
- **PathVariable**: mediaId
- **Response**: Deletion status
- **Detail**: Delete media file

# WebSocket Endpoints

### Private Message

- **Endpoint**: `/api/chat.sendPrivateMessage`
- **Message Body**: `MessageRequest`
- **Response Topic**: `/queue/chat/{conversationId}`
- **Detail**: Send private message

### Group Message

- **Endpoint**: `/chat.sendGroupMessage`
- **Message Body**: `MessageRequest`
- **Response Topic**: `/topic/chat/{conversationId}`
- **Detail**: Send group message

### Important Notes

1. **Pagination**:

   - All paginated endpoints accept `page`, `size`, and `sort` parameters
   - Returns `Page<T>` with content and metadata

2. **Authentication**:

   - All endpoints except `/signin` and `/signup` require authentication
   - Use Bearer token in Authorization header

3. **WebSocket Connection**:

   - Maintain single WebSocket connection
   - Subscribe to relevant topics for real-time updates
   - Handle reconnection logic in case of disconnection

4. **Media Handling**:
   - Implement proper error handling for upload failures
   - Consider implementing retry logic for failed uploads
   - Validate file size and type before upload
