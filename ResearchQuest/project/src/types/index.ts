export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Student' | 'Researcher' | 'Mentor' | 'Administrator';
  bio: string;
  interests: string[];
  expertise: string[];
  photoURL?: string;
  achievements?: UserAchievement[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface ResearchProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  phase: 'discovery' | 'design' | 'development' | 'evaluation';
  status: 'active' | 'completed' | 'archived';
  progress: number;
  tasks: ResearchTask[];
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignedTo: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  type: 'badge' | 'milestone' | 'reward';
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface UserPoints {
  userId: string;
  total: number;
  history: PointTransaction[];
}

export interface PointTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  description: string;
  timestamp: Date;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'resource' | 'feature' | 'consultation';
  available: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  platform: 'discord' | 'slack' | 'reddit' | 'custom';
  member_count: number;
  activity_level: 'low' | 'medium' | 'high';
  topics: string[];
  created_by: string;
  members: string[];
  searchTerms?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}