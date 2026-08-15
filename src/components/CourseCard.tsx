import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Award,
  Sparkles,
  Layers
} from 'lucide-react';
import { Course } from '../types';
import { calculateCourseProgress } from '../services/storage';

interface CourseCardProps {
  course: Course;
  onOpenCourse: (courseId: string) => void;
  onDeleteCourse: (courseId: string) => void;
  onOpenCertificate: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onOpenCourse,
  onDeleteCourse,
  onOpenCertificate,
}) => {
  const { total, completed, percentage, isFinished } = calculateCourseProgress(course);

  return (
    <div className="group relative bg-[#0c0c0f] border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-black/60">
      
      {/* Thumbnail Banner */}
      <div className="relative aspect-video w-full bg-[#08080a] overflow-hidden cursor-pointer" onClick={() => onOpenCourse(course.id)}>
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f] via-transparent to-transparent opacity-90" />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-zinc-950 ml-0.5" />
          </div>
        </div>

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-zinc-200 border border-white/10 flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            {total} {total === 1 ? 'aula' : 'aulas'}
          </span>

          {isFinished && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/90 text-zinc-950 shadow-md flex items-center gap-1 font-bold">
              <Award className="w-3 h-3" /> 100% Concluído
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Info */}
        <div className="space-y-1.5 cursor-pointer" onClick={() => onOpenCourse(course.id)}>
          <div className="text-[11px] font-medium text-zinc-400 truncate">
            {course.author}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>
        </div>

        {/* Progress Bar & Stats */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Progresso</span>
            <span className={`font-bold ${isFinished ? 'text-amber-400' : 'text-emerald-400'}`}>
              {percentage}% ({completed}/{total})
            </span>
          </div>

          <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFinished ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => onOpenCourse(course.id)}
            className="flex-1 py-2 px-3 bg-[#16161c] hover:bg-emerald-500 hover:text-zinc-950 text-zinc-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-zinc-800/80 hover:border-emerald-500"
            id={`open-course-btn-${course.id}`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{completed > 0 ? 'Continuar Curso' : 'Iniciar Curso'}</span>
          </button>

          {isFinished && (
            <button
              onClick={() => onOpenCertificate(course)}
              title="Visualizar Certificado"
              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs transition-colors"
            >
              <Award className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onDeleteCourse(course.id)}
            title="Excluir curso"
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/60 rounded-xl text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
