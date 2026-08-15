import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Course } from '../types';

interface DeleteCourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (courseId: string) => void;
}

export const DeleteCourseModal: React.FC<DeleteCourseModalProps> = ({
  course,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !course) return null;

  const totalNotes = course.lessons.reduce((acc, l) => acc + (l.notes?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0e0e12] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Excluir Curso</h3>
              <p className="text-xs text-zinc-400">Esta ação é permanente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
          <p className="text-xs text-zinc-300 font-semibold line-clamp-2">
            {course.title}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span>{course.lessons.length} {course.lessons.length === 1 ? 'aula' : 'aulas'}</span>
            <span>•</span>
            <span>{totalNotes} {totalNotes === 1 ? 'anotação' : 'anotações'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>O curso, o histórico de aulas assistidas e as anotações serão removidos.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(course.id);
              onClose();
            }}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
            id="confirm-delete-course-btn"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sim, Excluir Curso</span>
          </button>
        </div>
      </div>
    </div>
  );
};
