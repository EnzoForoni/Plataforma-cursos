export interface NoteItem {
  id: string;
  timestamp: number; // in seconds
  formattedTime: string; // e.g. "04:25"
  text: string;
  createdAt: string;
}

export interface Lesson {
  id: string; // unique lesson id
  videoId: string; // youtube 11-char id
  title: string;
  duration?: string; // e.g. "14:20"
  thumbnail?: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  notes?: NoteItem[];
  lastPositionSeconds?: number;
}

export interface Course {
  id: string;
  title: string;
  author: string;
  thumbnail?: string;
  description?: string;
  playlistUrl?: string;
  playlistId?: string;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  lastWatchedLessonId?: string;
  certificateUnlocked?: boolean;
}

export interface AINotesResponse {
  summary: string;
  keyTakeaways: string[];
  quiz: {
    question: string;
    answer: string;
  }[];
  practicalTip: string;
}

export interface AppDatabase {
  version: number;
  userName: string;
  courses: Course[];
  activeCourseId: string | null;
  savedAt: string;
}
