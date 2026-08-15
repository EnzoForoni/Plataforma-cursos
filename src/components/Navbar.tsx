import React, { useState, useRef } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Database, 
  Download, 
  Upload, 
  BookOpen, 
  BarChart3, 
  Tv, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { Course } from '../types';

interface NavbarProps {
  currentView: 'welcome' | 'player' | 'library' | 'stats';
  setCurrentView: (view: 'welcome' | 'player' | 'library' | 'stats') => void;
  courses: Course[];
  activeCourse: Course | null;
  onSelectCourse: (courseId: string) => void;
  onOpenAddModal: () => void;
  onExportDB: () => void;
  onImportDB: (file: File) => void;
  completedPercentage: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  courses,
  activeCourse,
  onSelectCourse,
  onOpenAddModal,
  onExportDB,
  onImportDB,
  completedPercentage,
}) => {
  const [dbDropdownOpen, setDbDropdownOpen] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportDB(file);
      setDbDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentView('welcome')} 
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0e0e12] border border-zinc-800 flex items-center justify-center text-white shadow-lg group-hover:border-zinc-700 transition-all">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  CURSO<span className="text-emerald-400 font-extrabold">HUB</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#16161b] text-zinc-400 border border-zinc-800">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Plataforma de Cursos</p>
            </div>
          </button>

          {/* Navigation Views */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0d0d10] p-1 rounded-xl border border-zinc-800/80">
            <button
              onClick={() => setCurrentView('welcome')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'welcome'
                  ? 'bg-zinc-800/90 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
              id="nav-welcome-btn"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Inserir Link
            </button>

            <button
              onClick={() => setCurrentView('library')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'library'
                  ? 'bg-zinc-800/90 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
              id="nav-library-btn"
            >
              <Layers className="w-3.5 h-3.5" />
              Meus Cursos ({courses.length})
            </button>

            {activeCourse && (
              <button
                onClick={() => setCurrentView('player')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentView === 'player'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
                id="nav-player-btn"
              >
                <Tv className="w-3.5 h-3.5" />
                Sala de Aula
              </button>
            )}

            <button
              onClick={() => setCurrentView('stats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'stats'
                  ? 'bg-zinc-800/90 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
              id="nav-stats-btn"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Evolução
            </button>
          </nav>
        </div>

        {/* Center: Active Course Switcher (when available) */}
        {activeCourse && currentView === 'player' && (
          <div className="hidden lg:block relative">
            <button
              onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e0e12] border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-all max-w-xs truncate"
              id="course-switcher-btn"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate font-medium">{activeCourse.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            </button>

            {courseDropdownOpen && (
              <div 
                className="absolute left-0 mt-2 w-72 bg-[#0e0e12] border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setCourseDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Trocar de Curso
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {courses.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCourse(c.id);
                        setCourseDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all ${
                        c.id === activeCourse.id 
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                          : 'text-zinc-300 hover:bg-zinc-800/60'
                      }`}
                    >
                      <span className="truncate">{c.title}</span>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {c.lessons.filter(l => l.completed).length}/{c.lessons.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Active Course Progress Pill */}
          {activeCourse && (
            <div className="hidden sm:flex items-center gap-2 bg-[#0e0e12] border border-zinc-800 px-3 py-1.5 rounded-lg">
              <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completedPercentage}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-zinc-300">{completedPercentage}%</span>
            </div>
          )}

          {/* Database & Backup Options */}
          <div className="relative">
            <button
              onClick={() => setDbDropdownOpen(!dbDropdownOpen)}
              title="Gerenciamento do Banco de Dados Local"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e0e12] hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 text-xs font-medium transition-all"
              id="db-backup-menu-btn"
            >
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Banco de Dados</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {dbDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-[#0e0e12] border border-zinc-800 rounded-xl shadow-2xl p-2 z-50"
                onMouseLeave={() => setDbDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Persistência & Backup
                </div>
                <button
                  onClick={() => {
                    onExportDB();
                    setDbDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors"
                  id="export-db-btn"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <p className="font-semibold">Exportar Backup (.json)</p>
                    <p className="text-[10px] text-zinc-500">Salva seus cursos e progresso</p>
                  </div>
                </button>

                <label 
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors cursor-pointer"
                  id="import-db-label"
                >
                  <Upload className="w-4 h-4 text-sky-400" />
                  <div className="text-left">
                    <p className="font-semibold">Importar Backup</p>
                    <p className="text-[10px] text-zinc-500">Carregar arquivo .json salvo</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Add Course Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md shadow-emerald-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            id="add-course-nav-btn"
          >
            <Plus className="w-4 h-4" />
            <span className="font-semibold">Adicionar Curso</span>
          </button>
        </div>
      </div>
    </header>
  );
};
