export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed';
  aiSummary?: string;
  createdAt: string;
}

export interface TopicPlan {
  id: string;
  userId: string;
  topic: string;
  targetGoal: string;
  steps: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface SystemConfig {
  id: string;
  maintenanceMode: boolean;
  systemPrompt: string;
  allowedTools: string[];
  updatedBy?: string;
  updatedAt?: string;
}

// Custom error info structure conforming to firestore rules telemetry
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}
