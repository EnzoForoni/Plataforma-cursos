import React, { useState } from 'react';
import { 
  Check, 
  Play, 
  Search, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Circle,
  Filter,
  Sparkles,
  ChevronRight,
  BookCheck,
  RotateCcw
} from 'lucide-react';
import { Course, Lesson } from '../types';
import { calculateCourseProgress } from '../services/storage';

interface LessonSidebarProps {
  course: Course;
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onToggleComplete: (lessonId: string) => void;
  onMarkAllComplete: () => void;
  onResetAllComplete: () => void;
  onOpenCertificate: () => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  course,
  activeLessonId,
  onSelectLesson,
  onToggleComplete,
  onMarkAllComplete,
  onResetAllComplete,
  onOpenCertificate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const { total, completed, percentage, isFinished } = calculateCourseProgress(course);

  const filteredLessons = course.lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'completed') return lesson.completed;
    if (filter === 'pending') return !lesson.completed;
    return true;
  });

  return (
    <aside className="w-full lg:w-80 xl:w-96 bg-[#07070a] border-l border-zinc-800/80 flex flex-col h-full overflow-hidden shrink-0">
      
      {/* Header: Progress summary */}
      <div className="p-4 border-b border-zinc-800/80 bg-[#0c0c0f] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <BookCheck className="w-3.5 h-3.5 text-emerald-400" />
            Conteúdo do Curso
          </h2>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {completed}/{total} concluídas
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-300 font-semibold">{percentage}% concluído</span>
            {isFinished && (
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Curso Finalizado!
              </span>
            )}
          </div>
          <div className="w-full bg-zinc-800/90 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Certificate Callout Button if 100% */}
        {isFinished && (
          <button
            onClick={onOpenCertificate}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 transition-all hover:scale-[1.01] cursor-pointer"
            id="view-certificate-sidebar-btn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ver Certificado de Conclusão
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b border-zinc-800/80 bg-[#09090c] space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar aula pelo título..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#121216] border border-zinc-800 focus:border-zinc-700 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 outline-none"
            id="search-lessons-input"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Todas ({total})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filter === 'pending'
                  ? 'bg-zinc-800 text-amber-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Pendentes ({total - completed})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                filter === 'completed'
                  ? 'bg-zinc-800 text-emerald-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Concluídas ({completed})
            </button>
          </div>

          {/* Batch toggle actions menu */}
          <div className="flex items-center gap-1">
            {completed < total ? (
              <button
                onClick={onMarkAllComplete}
                title="Marcar todas como concluídas"
                className="p-1.5 rounded text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 text-[10px] flex items-center gap-0.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onResetAllComplete}
                title="Desmarcar todas as aulas"
                className="p-1.5 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 text-[10px] flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lesson List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
        {filteredLessons.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            Nenhuma aula encontrada com esses filtros.
          </div>
        ) : (
          filteredLessons.map((lesson) => {
            const isActive = lesson.id === activeLessonId;
            const originalIndex = course.lessons.findIndex(l => l.id === lesson.id);

            return (
              <div
                key={lesson.id}
                className={`group flex items-start gap-3 p-3 transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#131318] border-l-2 border-emerald-500'
                    : 'hover:bg-[#0c0c0f]'
                }`}
                onClick={() => onSelectLesson(lesson.id)}
                id={`lesson-item-${lesson.id}`}
              >
                {/* Interactive Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(lesson.id);
                  }}
                  title={lesson.completed ? 'Marcar como não vista' : 'Marcar como concluída'}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    lesson.completed
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20'
                      : 'border-zinc-700 bg-[#121216] hover:border-zinc-500 text-transparent'
                  }`}
                  id={`checkbox-${lesson.id}`}
                >
                  <Check className={`w-3.5 h-3.5 stroke-[3] ${lesson.completed ? 'opacity-100' : 'opacity-0'}`} />
                </button>

                {/* Lesson info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      Aula {originalIndex >= 0 ? originalIndex + 1 : 1}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">
                        Assistindo
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs mt-0.5 line-clamp-2 leading-snug transition-colors ${
                      isActive
                        ? 'text-white font-semibold'
                        : lesson.completed
                        ? 'text-zinc-400 font-normal line-through opacity-80'
                        : 'text-zinc-200 font-medium'
                    }`}
                  >
                    {lesson.title}
                  </p>

                  <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.duration || '10:00'}
                    </span>

                    {lesson.notes && lesson.notes.length > 0 && (
                      <span className="flex items-center gap-1 text-zinc-400 font-medium">
                        <FileText className="w-3 h-3 text-sky-400" />
                        {lesson.notes.length} {lesson.notes.length === 1 ? 'nota' : 'notas'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right indicator */}
                <div className="shrink-0 pt-1 text-zinc-600 group-hover:text-zinc-400">
                  {isActive ? (
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-pulse" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </aside>
  );
};
