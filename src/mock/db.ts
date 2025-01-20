import {
  UserResponse,
  GroupConversationResponse,
  PrivateConversationResponse,
  MessageResponse,
  UserStatus,
  MessageType,
  ReactionType,
  MediaResponse,
  MediaUploadStatus,
  MessageStatus,
  NotificationResponse,
  NotificationType,
  GroupRole,
  GroupSettingsResponse,
  User,
  MessageDeliveryStatusResponse,
} from "./types";

// Helper function to generate a random date in the past
function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to generate a random element from an array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// --- Mock Users ---
const mockUsers: UserResponse[] = [];
const userNames = [
  "john_doe",
  "jane_smith",
  "peter_jones",
  "mary_white",
  "david_brown",
  "sarah_miller",
  "michael_davis",
  "emily_wilson",
  "jessica_moore",
  "kevin_taylor",
  "ashley_anderson",
  "brian_thomas",
  "amanda_jackson",
  "nicholas_martinez",
  "melissa_robinson",
  "christopher_lewis",
  "stephanie_lee",
  "joseph_walker",
  "laura_hall",
  "ryan_allen",
];

const displayNames = [
  "John Doe",
  "Jane Smith",
  "Peter Jones",
  "Mary White",
  "David Brown",
  "Sarah Miller",
  "Michael Davis",
  "Emily Wilson",
  "Jessica Moore",
  "Kevin Taylor",
  "Ashley Anderson",
  "Brian Thomas",
  "Amanda Jackson",
  "Nicholas Martinez",
  "Melissa Robinson",
  "Christopher Lewis",
  "Stephanie Lee",
  "Joseph Walker",
  "Laura Hall",
  "Ryan Allen",
];

const avatars = [
  "https://i.pravatar.cc/150?u=john_doe",
  "https://i.pravatar.cc/150?u=jane_smith",
  "https://i.pravatar.cc/150?u=peter_jones",
  "https://i.pravatar.cc/150?u=mary_white",
  "https://i.pravatar.cc/150?u=david_brown",
  "https://i.pravatar.cc/150?u=sarah_miller",
  "https://i.pravatar.cc/150?u=michael_davis",
  "https://i.pravatar.cc/150?u=emily_wilson",
  "https://i.pravatar.cc/150?u=jessica_moore",
  "https://i.pravatar.cc/150?u=kevin_taylor",
  "https://i.pravatar.cc/150?u=ashley_anderson",
  "https://i.pravatar.cc/150?u=brian_thomas",
  "https://i.pravatar.cc/150?u=amanda_jackson",
  "https://i.pravatar.cc/150?u=nicholas_martinez",
  "https://i.pravatar.cc/150?u=melissa_robinson",
  "https://i.pravatar.cc/150?u=christopher_lewis",
  "https://i.pravatar.cc/150?u=stephanie_lee",
  "https://i.pravatar.cc/150?u=joseph_walker",
  "https://i.pravatar.cc/150?u=laura_hall",
  "https://i.pravatar.cc/150?u=ryan_allen",
];

for (let i = 1; i <= 20; i++) {
  mockUsers.push({
    id: i,
    username: userNames[i - 1],
    displayName: displayNames[i - 1],
    avatar: avatars[i - 1],
    status: randomElement([
      UserStatus.ONLINE,
      UserStatus.OFFLINE,
      UserStatus.BUSY,
      UserStatus.AWAY,
    ]),
    lastSeenAt: randomDate(new Date(2023, 0, 1), new Date()),
    preferences: {
      notificationEnabled: Math.random() < 0.5,
      theme: randomElement(["LIGHT", "DARK"]),
    },
    createdAt: randomDate(new Date(2022, 0, 1), new Date(2023, 0, 1)),
  });
}

// --- Mock Media ---
const mockMedia: MediaResponse[] = [];
const mediaFileNames = [
  "image1.jpg",
  "video1.mp4",
  "audio1.mp3",
  "document1.pdf",
  "image2.png",
  "video2.mov",
  "audio2.wav",
  "document2.docx",
  "image3.jpeg",
  "video3.avi",
];

const mediaTypes = [
  "image/jpeg",
  "video/mp4",
  "audio/mpeg",
  "application/pdf",
  "image/png",
  "video/quicktime",
  "audio/wav",
  "application/msword",
  "image/jpeg",
  "video/x-msvideo",
];

for (let i = 1; i <= 10; i++) {
  mockMedia.push({
    id: i,
    fileName: mediaFileNames[i - 1],
    fileType: mediaTypes[i - 1],
    fileSize: Math.floor(Math.random() * 10000000), // Random size up to 10MB
    uploadUrl: `https://example.com/uploads/${mediaFileNames[i - 1]}`,
    uploadStatus: randomElement([
      MediaUploadStatus.COMPLETED,
      MediaUploadStatus.FAILED,
      MediaUploadStatus.PENDING,
      MediaUploadStatus.UPLOADING,
    ]),
    metadata: JSON.stringify({
      description: `This is ${mediaFileNames[i - 1]}`,
    }),
  });
}

// --- Mock Messages ---
const mockMessages: MessageResponse[] = [];
const messageContents = [
  "Hello!",
  "How are you?",
  "What's up?",
  "This is a test message.",
  "Did you get my last message?",
  "I'm going to send you a file.",
  "Check out this picture!",
  "Let's have a meeting tomorrow.",
  "Can you call me back?",
  "I'll be there in 10 minutes.",
  "Happy birthday!",
  "Congratulations!",
  "Good luck with your presentation.",
  "Let's catch up soon.",
  "I miss you.",
  "Thank you for your help.",
  "You're welcome.",
  "No problem.",
  "See you later.",
  "Goodbye!",
];

const reactions = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"];
for (let i = 1; i <= 50; i++) {
  const sender = randomElement(mockUsers);
  const numMediaItems =
    Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0; // 30% chance of having media
  const mediaItems =
    numMediaItems > 0
      ? new Set(
          Array.from({ length: numMediaItems }, () => randomElement(mockMedia))
        )
      : new Set();

  const numReactions =
    Math.random() < 0.5 ? Math.floor(Math.random() * 5) + 1 : 0; // 50% chance of having reactions

  const messageReaction: Set<ReactionResponse> = new Set();
  for (let j = 0; j < numReactions; j++) {
    const reactingUser = randomElement(mockUsers);
    messageReaction.add({
      id: j + 1,
      username: reactingUser.username,
      displayName: reactingUser.displayName,
      avatarUrl: reactingUser.avatar,
      type: randomElement(reactions) as ReactionType,
    });
  }

  const messageDeliveryStatus: Set<MessageDeliveryStatusResponse> = new Set();
  mockUsers.forEach((user) => {
    if (user.username !== sender.username) {
      messageDeliveryStatus.add({
        messageDeliveryStatusId: i,
        recipient: user,
        status: randomElement([
          MessageStatus.SENT,
          MessageStatus.DELIVERED,
          MessageStatus.READ,
        ]),
        statusTimestamp: randomDate(new Date(2023, 0, 1), new Date()),
      });
    }
  });

  mockMessages.push({
    id: i,
    conversationId: Math.floor(Math.random() * 10) + 1, // Assuming 10 conversations
    senderUsername: sender.username,
    senderAvatarUrl: sender.avatar,
    senderDisplayName: sender.displayName,
    content: mediaItems.size > 0 ? "" : randomElement(messageContents),
    mediaItems,
    type:
      mediaItems.size > 0
        ? randomElement([
            MessageType.IMAGE,
            MessageType.VIDEO,
            MessageType.AUDIO,
            MessageType.DOCUMENT,
          ])
        : MessageType.TEXT,
    reactions: messageReaction,
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    editedAt: randomDate(new Date(2023, 0, 1), new Date()),
    deliveryStatus: messageDeliveryStatus,
  });
}

// --- Mock Private Conversations ---
const mockPrivateConversations: PrivateConversationResponse[] = [];
for (let i = 1; i <= 10; i++) {
  const user1 = mockUsers[i - 1];
  const user2 = randomElement(mockUsers.filter((user) => user.id !== user1.id)); // Ensure user2 is not the same as user1
  const lastMessage = randomElement(
    mockMessages.filter(
      (msg) =>
        msg.senderUsername === user1.username ||
        msg.senderUsername === user2.username
    )
  );

  mockPrivateConversations.push({
    conversationId: i,
    avatar: user2.avatar,
    contact: user2,
    lastMessage,
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
  });
}

// --- Mock Group Conversations ---
const mockGroupConversations: GroupConversationResponse[] = [];
const groupNames = [
  "Family Chat",
  "Friends Forever",
  "Project Team",
  "Book Club",
  "Gaming Squad",
  "Travel Buddies",
  "Study Group",
  "Fitness Freaks",
  "Tech Enthusiasts",
  "Food Lovers",
];

const groupDescriptions = [
  "Keeping up with family",
  "Friends from college",
  "Team working on Project X",
  "Discussing our favorite books",
  "For all gaming related discussions",
  "Planning our next trip",
  "Helping each other with studies",
  "Motivating each other to stay fit",
  "Latest tech news and discussions",
  "Sharing delicious recipes",
];
for (let i = 1; i <= 10; i++) {
  const numParticipants = Math.floor(Math.random() * 10) + 2; // 2 to 11 participants
  const participants = new Set<UserResponse>();
  const selectedUsers = new Set<number>();

  for (let j = 0; j < numParticipants; j++) {
    let user: UserResponse;
    do {
      user = randomElement(mockUsers);
    } while (selectedUsers.has(user.id));
    selectedUsers.add(user.id);
    participants.add(user);
  }
  const participantArray = Array.from(participants);
  const creator = participantArray[0];

  const lastMessage = randomElement(
    mockMessages.filter((msg) =>
      participantArray.some((user) => user.username === msg.senderUsername)
    )
  );

  mockGroupConversations.push({
    conversationId: i + 10, // Offset by 10 to avoid conflict with private conversations
    avatar: `https://i.pravatar.cc/150?u=group${i}`,
    participants: new Set(participantArray),
    participantCount: numParticipants,
    lastMessage,
    createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    updatedAt: randomDate(new Date(2023, 0, 1), new Date()),
    groupName: groupNames[i - 1],
    groupDescription: groupDescriptions[i - 1],
    creatorName: creator.displayName,
    creatorAvatarUrl: creator.avatar,
    creatorUserName: creator.username,
    onlyAdminsCanSend: Math.random() < 0.5,
    messageRetentionDays: randomElement([1, 7, 30, 90]),
    maxMembers: randomElement([50, 100, 250]),
    isGroupPublic: Math.random() < 0.5,
  });
}

// --- Mock Notifications ---
const mockNotifications: NotificationResponse[] = [];
const notificationMessages = [
  "You have a new connection request.",
  "You were mentioned in a message.",
  "Someone reacted to your message.",
  "New message in Family Chat.",
  "started following you.",
  "liked your photo.",
  "commented on your post.",
  "invited you to join a group.",
  "sent you a friend request.",
  "accepted your friend request.",
];

for (let i = 1; i <= 30; i++) {
  mockNotifications.push({
    id: i,
    title: "Notification",
    message: randomElement(notificationMessages),
    timestamp: randomDate(new Date(2023, 0, 1), new Date()),
    type: randomElement([
      "CONNECTION REQUEST",
      "MENTION",
      "REACTION",
    ] as NotificationType[]),
    read: Math.random() < 0.5,
  });
}

// --- Mock Group Settings ---
const mockGroupSettings: GroupSettingsResponse[] = [];

for (let i = 1; i <= 10; i++) {
  const groupConversation = mockGroupConversations[i - 1];
  const adminUsers = Array.from(groupConversation.participants).slice(
    0,
    Math.floor(groupConversation.participants.size / 2)
  ); // Half of the participants are admins

  mockGroupSettings.push({
    name: groupConversation.groupName,
    description: groupConversation.groupDescription,
    creator: {
      id: mockUsers.find(
        (u) => u.username === groupConversation.creatorUserName
      )?.id!,
      username: groupConversation.creatorUserName,
      displayName: groupConversation.creatorName,
      status: UserStatus.ONLINE, // Or any other status you deem appropriate
    },
    onlyAdminsCanSend: groupConversation.onlyAdminsCanSend,
    messageRetentionDays: groupConversation.messageRetentionDays,
    maxMembers: groupConversation.maxMembers,
    isPublic: groupConversation.isGroupPublic,
    admins: new Set(adminUsers),
  });
}

export const mockDB = {
  users: mockUsers,
  media: mockMedia,
  messages: mockMessages,
  privateConversations: mockPrivateConversations,
  groupConversations: mockGroupConversations,
  notifications: mockNotifications,
  groupSettings: mockGroupSettings,
};
