export interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  type: 'SHORT' | 'LONG';
  status: 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'FAILED' | 'PRIVATE';
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  shares: number;
  views: number;
  saves: number;
  progress?: number;
  isLiked: boolean;
  tags?: string[];
  createdAt: string;
  community?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  series?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  currentEpisode?: number;
  episodes?: Array<{
    id: number;
    title: string;
    duration: string;
  }>;
} 