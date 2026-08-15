import { AppDatabase, Course, Lesson, NoteItem } from '../types';
import { DEFAULT_COURSES } from '../data/defaultCourses';

const STORAGE_KEY = 'playcourse_dark_db_v1';

function sanitizeCourse(course: any): Course {
  const lessons: Lesson[] = (course.lessons || []).map((lesson: any, idx: number) => ({
    id: String(lesson.id || `lesson-${idx}-${Date.now()}`),
    videoId: String(lesson.videoId || 'S9uPNppGsGo').trim(),
    title: String(lesson.title || `Aula ${idx + 1}`),
    duration: lesson.duration || '15:00',
    thumbnail: lesson.thumbnail || `https://i.ytimg.com/vi/${lesson.videoId || 'S9uPNppGsGo'}/hqdefault.jpg`,
    description: lesson.description || '',
    completed: Boolean(lesson.completed),
    completedAt: lesson.completedAt,
    notes: Array.isArray(lesson.notes) ? lesson.notes : [],
    lastPositionSeconds: typeof lesson.lastPositionSeconds === 'number' ? lesson.lastPositionSeconds : 0,
  }));

  const validLastWatchedId = lessons.some(l => l.id === course.lastWatchedLessonId)
    ? course.lastWatchedLessonId
    : (lessons[0]?.id || undefined);

  return {
    id: String(course.id || `course-${Date.now()}`),
    title: String(course.title || 'Curso Sem Título'),
    author: String(course.author || 'Instrutor'),
    thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    description: course.description || '',
    playlistUrl: course.playlistUrl,
    playlistId: course.playlistId,
    createdAt: course.createdAt || new Date().toISOString(),
    updatedAt: course.updatedAt || new Date().toISOString(),
    lastWatchedLessonId: validLastWatchedId,
    lessons: lessons.length > 0 ? lessons : DEFAULT_COURSES[0].lessons,
    certificateUnlocked: Boolean(course.certificateUnlocked),
  };
}

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialDb: AppDatabase = {
        version: 1,
        userName: 'Estudante',
        courses: DEFAULT_COURSES.map(sanitizeCourse),
        activeCourseId: DEFAULT_COURSES[0]?.id || null,
        savedAt: new Date().toISOString(),
      };
      saveDatabase(initialDb);
      return initialDb;
    }
    const parsed: AppDatabase = JSON.parse(raw);
    if (!parsed.courses || !Array.isArray(parsed.courses) || parsed.courses.length === 0) {
      parsed.courses = DEFAULT_COURSES.map(sanitizeCourse);
      parsed.activeCourseId = DEFAULT_COURSES[0]?.id || null;
    } else {
      parsed.courses = parsed.courses.map(sanitizeCourse);
      if (!parsed.courses.some(c => c.id === parsed.activeCourseId)) {
        parsed.activeCourseId = parsed.courses[0]?.id || null;
      }
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load database from localStorage:', e);
    return {
      version: 1,
      userName: 'Estudante',
      courses: DEFAULT_COURSES.map(sanitizeCourse),
      activeCourseId: DEFAULT_COURSES[0]?.id || null,
      savedAt: new Date().toISOString(),
    };
  }
}

export function saveDatabase(db: AppDatabase): void {
  try {
    db.savedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save database to localStorage:', e);
  }
}

export function exportDatabaseJSON(db: AppDatabase): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateTag = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('download', `backup_cursos_${dateTag}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function calculateCourseProgress(course: Course): {
  total: number;
  completed: number;
  percentage: number;
  isFinished: boolean;
} {
  const total = course.lessons.length;
  if (total === 0) return { total: 0, completed: 0, percentage: 0, isFinished: false };
  const completed = course.lessons.filter(l => l.completed).length;
  const percentage = Math.round((completed / total) * 100);
  return {
    total,
    completed,
    percentage,
    isFinished: completed === total && total > 0,
  };
}

export function calculateGlobalStats(courses: Course[]) {
  let totalLessons = 0;
  let completedLessons = 0;
  let completedCourses = 0;
  let totalNotes = 0;

  courses.forEach(c => {
    const { total, completed, isFinished } = calculateCourseProgress(c);
    totalLessons += total;
    completedLessons += completed;
    if (isFinished) completedCourses += 1;
    c.lessons.forEach(l => {
      if (l.notes && l.notes.length) totalNotes += l.notes.length;
    });
  });

  const overallPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const estimatedHoursSaved = (completedLessons * 0.4).toFixed(1); // avg 24 min per lesson

  return {
    totalCourses: courses.length,
    completedCourses,
    totalLessons,
    completedLessons,
    overallPercentage,
    totalNotes,
    estimatedHoursSaved,
  };
}
