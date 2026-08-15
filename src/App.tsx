import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Tv, 
  Award, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal, 
  Flame, 
  Clock, 
  ArrowRight,
  PlusCircle
} from 'lucide-react';
import { AppDatabase, Course, Lesson, NoteItem } from './types';
import { 
  loadDatabase, 
  saveDatabase, 
  exportDatabaseJSON, 
  calculateCourseProgress, 
  calculateGlobalStats 
} from './services/storage';
import { Navbar } from './components/Navbar';
import { AddCourseModal } from './components/AddCourseModal';
import { CoursePlayer } from './components/CoursePlayer';
import { LessonSidebar } from './components/LessonSidebar';
import { CourseCard } from './components/CourseCard';
import { CertificateModal } from './components/CertificateModal';
import { StatsView } from './components/StatsView';
import { LinkEntryScreen } from './components/LinkEntryScreen';
import { DeleteCourseModal } from './components/DeleteCourseModal';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => loadDatabase());
  const [currentView, setCurrentView] = useState<'welcome' | 'player' | 'library' | 'stats'>('welcome');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [certificateCourse, setCertificateCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [librarySearch, setLibrarySearch] = useState('');

  // Synchronize db changes to localStorage
  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  // Guaranteed active course resolution
  const activeCourse = db.courses.find(c => c.id === db.activeCourseId) || db.courses[0] || null;

  // Guaranteed active lesson resolution
  const activeLesson = activeCourse 
    ? (activeCourse.lessons.find(l => l.id === activeCourse.lastWatchedLessonId) || activeCourse.lessons[0] || null)
    : null;

  const activeCourseProgress = activeCourse ? calculateCourseProgress(activeCourse) : { percentage: 0 };

  // Handlers
  const handleSelectCourse = (courseId: string) => {
    setDb(prev => ({
      ...prev,
      activeCourseId: courseId,
    }));
    setCurrentView('player');
  };

  const handleSelectLesson = (lessonId: string) => {
    if (!activeCourse) return;
    setDb(prev => ({
      ...prev,
      activeCourseId: activeCourse.id,
      courses: prev.courses.map(course => {
        if (course.id === activeCourse.id) {
          return {
            ...course,
            lastWatchedLessonId: lessonId,
            updatedAt: new Date().toISOString(),
          };
        }
        return course;
      }),
    }));
  };

  const handleToggleLessonComplete = (lessonId: string) => {
    if (!activeCourse) return;
    setDb(prev => ({
      ...prev,
      courses: prev.courses.map(course => {
        if (course.id === activeCourse.id) {
          const updatedLessons = course.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              const nextState = !lesson.completed;
              return {
                ...lesson,
                completed: nextState,
                completedAt: nextState ? new Date().toISOString() : undefined,
              };
            }
            return lesson;
          });

          return {
            ...course,
            lessons: updatedLessons,
            updatedAt: new Date().toISOString(),
          };
        }
        return course;
      }),
    }));
  };

  const handleUpdateLessonVideo = (lessonId: string, newVideoId: string, newTitle?: string) => {
    if (!activeCourse) return;
    setDb(prev => ({
      ...prev,
      courses: prev.courses.map(course => {
        if (course.id === activeCourse.id) {
          return {
            ...course,
            lessons: course.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return {
                  ...lesson,
                  videoId: newVideoId,
                  title: newTitle || lesson.title,
                  thumbnail: `https://i.ytimg.com/vi/${newVideoId}/hqdefault.jpg`,
                };
              }
              return lesson;
            }),
            updatedAt: new Date().toISOString(),
          };
        }
        return course;
      }),
    }));
  };

  const handleMarkAllComplete = () => {
    if (!activeCourse) return;
    setDb(prev => ({
      ...prev,
      courses: prev.courses.map(course => {
        if (course.id === activeCourse.id) {
          return {
            ...course,
            lessons: course.lessons.map(l => ({ ...l, completed: true, completedAt: new Date().toISOString() })),
            updatedAt: new Date().toISOString(),
          };
        }
        return course;
      }),
    }));
  };

  const handleResetAllComplete = () => {
    if (!activeCourse) return;
    setDb(prev => ({
      ...prev,
      courses: prev.courses.map(course => {
        if (course.id === activeCourse.id) {
          return {
            ...course,
            lessons: course.lessons.map(l => ({ ...l, completed: false, completedAt: undefined })),
            updatedAt: new Date().toISOString(),
          };
        }
        return course;
      }),
    }));
  };

  const handleAddNote = (lessonId: string, text: string, timestampSeconds: number) => {
    if (!activeCourse) return;
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      timestamp: timestampSeconds,
      formattedTime: '00:00',
      text,
      createdAt: new Date().toISOString(),
    };

    setDb(prev => ({
      ...prev,
      courses: prev.courses.map(course => {
        if (course.id === activeCourse.id) {
          return {
            ...course,
            lessons: course.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return {
                  ...lesson,
                  notes: [newNote, ...(lesson.notes || [])],
                };
              }
              return lesson;
            }),
          };
        }
        return course;
      }),
    }));
  };

  const handleDeleteNote = (lessonId: string, noteId: string) => {
    if (!activeCourse) return;
    setDb(prev => ({
      ...prev,
      courses: prev.courses.map(course => {
        if (course.id === activeCourse.id) {
          return {
            ...course,
            lessons: course.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return {
                  ...lesson,
                  notes: (lesson.notes || []).filter(n => n.id !== noteId),
                };
              }
              return lesson;
            }),
          };
        }
        return course;
      }),
    }));
  };

  const handleCourseCreated = (newCourse: Course) => {
    setDb(prev => ({
      ...prev,
      courses: [newCourse, ...prev.courses],
      activeCourseId: newCourse.id,
    }));
    setCurrentView('player');
  };

  const handleRequestDeleteCourse = (courseId: string) => {
    const target = db.courses.find(c => c.id === courseId);
    if (target) {
      setCourseToDelete(target);
    }
  };

  const handleConfirmDeleteCourse = (courseId: string) => {
    setDb(prev => {
      const remaining = prev.courses.filter(c => c.id !== courseId);
      const nextActiveId = remaining.length > 0 ? remaining[0].id : null;
      return {
        ...prev,
        courses: remaining,
        activeCourseId: nextActiveId,
      };
    });
    setCourseToDelete(null);
    if (db.courses.length <= 1) {
      setCurrentView('welcome');
    }
  };

  const handleExportDB = () => {
    exportDatabaseJSON(db);
  };

  const handleImportDB = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.courses && Array.isArray(parsed.courses)) {
          setDb(parsed);
          alert('Backup restaurado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleUpdateUserName = (newName: string) => {
    setDb(prev => ({
      ...prev,
      userName: newName,
    }));
  };

  const filteredLibraryCourses = db.courses.filter(c => 
    c.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
    c.author.toLowerCase().includes(librarySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        courses={db.courses}
        activeCourse={activeCourse}
        onSelectCourse={handleSelectCourse}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportDB={handleExportDB}
        onImportDB={handleImportDB}
        completedPercentage={activeCourseProgress.percentage}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* VIEW 0: WELCOME / LINK ENTRY SCREEN */}
        {currentView === 'welcome' && (
          <LinkEntryScreen
            onCourseLoaded={handleCourseCreated}
            existingCourses={db.courses}
            activeCourse={activeCourse}
            onOpenExistingCourse={handleSelectCourse}
            onGoToLibrary={() => setCurrentView('library')}
          />
        )}

        {/* VIEW 1: PLAYER (SALA DE AULA ESTILO UDEMY/HOTMART) */}
        {currentView === 'player' && (
          activeCourse && activeLesson ? (
            <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-61px)] overflow-hidden">
              {/* Left Video Stage & Notes */}
              <CoursePlayer
                course={activeCourse}
                activeLesson={activeLesson}
                onSelectLesson={handleSelectLesson}
                onToggleComplete={handleToggleLessonComplete}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onUpdateLessonVideo={handleUpdateLessonVideo}
                onToggleSidebar={() => {}}
                isSidebarOpen={true}
              />

              {/* Right Syllabus / Lessons Checklist Sidebar */}
              <LessonSidebar
                course={activeCourse}
                activeLessonId={activeLesson.id}
                onSelectLesson={handleSelectLesson}
                onToggleComplete={handleToggleLessonComplete}
                onMarkAllComplete={handleMarkAllComplete}
                onResetAllComplete={handleResetAllComplete}
                onOpenCertificate={() => setCertificateCourse(activeCourse)}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center bg-[#050505]">
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0e0e11] border border-zinc-800/80 flex items-center justify-center text-zinc-500 mx-auto shadow-xl">
                  <Tv className="w-8 h-8 text-zinc-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Nenhum curso selecionado</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Adicione uma playlist do YouTube ou escolha um dos cursos em sua biblioteca.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Importar Playlist do YouTube
                </button>
              </div>
            </div>
          )
        )}

        {/* VIEW 2: LIBRARY (MEUS CURSOS) */}
        {currentView === 'library' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full bg-[#050505]">
            
            {/* Header with Search and Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <Layers className="w-7 h-7 text-emerald-400" />
                  Meus Cursos & Playlists
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Gerencie seus cursos importados, controle o progresso e continue seus estudos de onde parou.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Filtrar cursos..."
                    className="w-48 sm:w-64 pl-9 pr-3 py-2 bg-[#0c0c0f] border border-zinc-800/90 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  id="add-playlist-library-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Curso</span>
                </button>
              </div>
            </div>

            {/* Courses Grid */}
            {filteredLibraryCourses.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#0c0c0e] border border-zinc-800/80 text-center space-y-3">
                <p className="text-sm font-semibold text-zinc-300">Nenhum curso encontrado</p>
                <p className="text-xs text-zinc-500">Cole o link de qualquer playlist do YouTube para começar.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Playlist Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLibraryCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onOpenCourse={handleSelectCourse}
                    onDeleteCourse={handleRequestDeleteCourse}
                    onOpenCertificate={(c) => setCertificateCourse(c)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 3: STATS & LEARNING EVOLUTION */}
        {currentView === 'stats' && (
          <StatsView
            courses={db.courses}
            onOpenCourse={handleSelectCourse}
            onOpenAddCourse={() => setIsAddModalOpen(true)}
            userName={db.userName}
          />
        )}

      </main>

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={!!certificateCourse}
        onClose={() => setCertificateCourse(null)}
        course={certificateCourse}
        userName={db.userName}
        onUpdateUserName={handleUpdateUserName}
      />

      {/* Delete Course Confirmation Modal */}
      <DeleteCourseModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        course={courseToDelete}
        onConfirmDelete={handleConfirmDeleteCourse}
      />

    </div>
  );
}
