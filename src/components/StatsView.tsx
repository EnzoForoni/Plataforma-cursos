import React from 'react';
import { 
  BarChart3, 
  Flame, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Award, 
  BookOpen, 
  Sparkles, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Course } from '../types';
import { calculateCourseProgress, calculateGlobalStats } from '../services/storage';

interface StatsViewProps {
  courses: Course[];
  onOpenCourse: (courseId: string) => void;
  onOpenAddCourse: () => void;
  userName: string;
}

export const StatsView: React.FC<StatsViewProps> = ({
  courses,
  onOpenCourse,
  onOpenAddCourse,
  userName,
}) => {
  const stats = calculateGlobalStats(courses);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Minha Evolução nos Estudos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Acompanhamento detalhado do seu desempenho, aulas concluídas e métricas de aprendizado.
          </p>
        </div>

        <button
          onClick={onOpenAddCourse}
          className="self-start sm:self-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Adicionar Nova Playlist
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Aulas Concluídas */}
        <div className="p-5 rounded-2xl bg-[#0c0c0f] border border-zinc-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Aulas Concluídas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.completedLessons}
            <span className="text-xs text-zinc-500 font-normal ml-1">/ {stats.totalLessons}</span>
          </div>
          <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Horas Estimadas */}
        <div className="p-5 rounded-2xl bg-[#0c0c0f] border border-zinc-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Horas de Estudo</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            ~{stats.estimatedHoursSaved}h
          </div>
          <p className="text-[11px] text-zinc-500">Estimativa baseada nas aulas assistidas</p>
        </div>

        {/* Metric 3: Cursos Finalizados */}
        <div className="p-5 rounded-2xl bg-[#0c0c0f] border border-zinc-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Cursos Graduados</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.completedCourses}
            <span className="text-xs text-zinc-500 font-normal ml-1">/ {stats.totalCourses}</span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium">100% de aproveitamento</p>
        </div>

        {/* Metric 4: Anotações Criadas */}
        <div className="p-5 rounded-2xl bg-[#0c0c0f] border border-zinc-800/80 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Anotações & Insights</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.totalNotes}
          </div>
          <p className="text-[11px] text-zinc-500">Registros em caderno de aula</p>
        </div>

      </div>

      {/* Courses Breakdown Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          Progresso por Curso
        </h2>

        <div className="space-y-3">
          {courses.map((course) => {
            const { total, completed, percentage, isFinished } = calculateCourseProgress(course);

            return (
              <div
                key={course.id}
                onClick={() => onOpenCourse(course.id)}
                className="p-4 sm:p-5 rounded-2xl bg-[#0c0c0f] border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-12 rounded-xl bg-[#08080a] overflow-hidden shrink-0 border border-zinc-800">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {course.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {course.author} • {total} aulas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Progress indicator */}
                  <div className="space-y-1.5 w-36 sm:w-44 text-right">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-400">{completed}/{total} aulas</span>
                      <span className={isFinished ? 'text-amber-400' : 'text-emerald-400'}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFinished ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges / Conquistas */}
      <div className="p-6 rounded-2xl bg-[#0c0c0f] border border-zinc-800/80 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Conquistas Desbloqueadas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            stats.completedLessons >= 1 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
              : 'bg-[#121216]/60 border-zinc-800/50 text-zinc-500 opacity-50'
          }`}>
            <span className="text-2xl">🚀</span>
            <div>
              <p className="text-xs font-bold">Primeiro Passo</p>
              <p className="text-[10px] text-zinc-400">Completou a 1ª aula</p>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            stats.completedLessons >= 5 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
              : 'bg-[#121216]/60 border-zinc-800/50 text-zinc-500 opacity-50'
          }`}>
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-xs font-bold">Foco Total</p>
              <p className="text-[10px] text-zinc-400">Completou 5+ aulas</p>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            stats.totalNotes >= 3 
              ? 'bg-sky-500/10 border-sky-500/30 text-white' 
              : 'bg-[#121216]/60 border-zinc-800/50 text-zinc-500 opacity-50'
          }`}>
            <span className="text-2xl">✍️</span>
            <div>
              <p className="text-xs font-bold">Mente Atenta</p>
              <p className="text-[10px] text-zinc-400">3 anotações salvas</p>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
            stats.completedCourses >= 1 
              ? 'bg-amber-500/10 border-amber-500/30 text-white' 
              : 'bg-[#121216]/60 border-zinc-800/50 text-zinc-500 opacity-50'
          }`}>
            <span className="text-2xl">🎓</span>
            <div>
              <p className="text-xs font-bold">Graduado</p>
              <p className="text-[10px] text-zinc-400">Finalizou 1 curso 100%</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
