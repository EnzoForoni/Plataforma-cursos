import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Trash2, 
  Clock, 
  FileText, 
  ExternalLink, 
  Bot, 
  HelpCircle, 
  Lightbulb, 
  BookOpen, 
  Share2, 
  Check, 
  Loader2,
  Edit3,
  Video,
  Play,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, Lesson, NoteItem, AINotesResponse } from '../types';

interface CoursePlayerProps {
  course: Course;
  activeLesson: Lesson;
  onSelectLesson: (lessonId: string) => void;
  onToggleComplete: (lessonId: string) => void;
  onAddNote: (lessonId: string, text: string, timestampSeconds: number) => void;
  onDeleteNote: (lessonId: string, noteId: string) => void;
  onUpdateLessonVideo?: (lessonId: string, newVideoId: string, newTitle?: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

// Robust YouTube ID / URL extractor
export function extractCleanYouTubeId(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();
  
  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }
  
  // youtube.com/watch?v=ID or youtu.be/ID or youtube.com/embed/ID
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

// Check if URL is direct video (MP4, WebM, etc.)
export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    clean.startsWith('blob:')
  );
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  course,
  activeLesson,
  onSelectLesson,
  onToggleComplete,
  onAddNote,
  onDeleteNote,
  onUpdateLessonVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'ai' | 'overview'>('notes');
  const [noteText, setNoteText] = useState('');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editVideoInput, setEditVideoInput] = useState('');
  const [editTitleInput, setEditTitleInput] = useState('');
  const [playerKey, setPlayerKey] = useState(0);

  // AI Notes state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<AINotesResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const rawIndex = course.lessons.findIndex((l) => l.id === activeLesson.id);
  const currentIndex = rawIndex >= 0 ? rawIndex : 0;
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

  // Reset AI data & edit inputs when switching lessons
  useEffect(() => {
    setAiData(null);
    setAiError(null);
    setIsEditingVideo(false);
    setEditVideoInput(activeLesson.videoId);
    setEditTitleInput(activeLesson.title);
    setPlayerKey(prev => prev + 1);
  }, [activeLesson.id]);

  const handleToggleCompletion = () => {
    const willBeCompleted = !activeLesson.completed;
    onToggleComplete(activeLesson.id);

    if (willBeCompleted) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#ffffff'],
        });
      } catch (err) {
        console.warn('Confetti trigger skipped:', err);
      }

      // Auto advance if option is enabled and next lesson exists
      if (autoAdvance && nextLesson) {
        setTimeout(() => {
          onSelectLesson(nextLesson.id);
        }, 900);
      }
    }
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote(activeLesson.id, noteText.trim(), 0);
    setNoteText('');
  };

  const handleSaveVideoEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVideoInput.trim()) return;
    if (onUpdateLessonVideo) {
      onUpdateLessonVideo(activeLesson.id, editVideoInput.trim(), editTitleInput.trim() || activeLesson.title);
    }
    setIsEditingVideo(false);
    setPlayerKey(prev => prev + 1);
  };

  const handleFetchAiNotes = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai-lesson-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: activeLesson.title,
          courseTitle: course.title,
          channel: course.author,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Não foi possível gerar anotações no momento.');
      }
      setAiData(json.data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Erro ao comunicar com a inteligência artificial.');
    } finally {
      setAiLoading(false);
    }
  };

  const cleanYouTubeId = extractCleanYouTubeId(activeLesson.videoId);
  const isDirect = isDirectVideoUrl(activeLesson.videoId);
  const directWatchUrl = cleanYouTubeId 
    ? `https://www.youtube.com/watch?v=${cleanYouTubeId}` 
    : (activeLesson.videoId.startsWith('http') ? activeLesson.videoId : `https://www.youtube.com/watch?v=${activeLesson.videoId}`);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(directWatchUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`flex-1 flex flex-col overflow-y-auto bg-[#050505] ${isTheaterMode ? 'p-0' : 'p-4 lg:p-6'}`}>
      
      {/* Video Stage Container */}
      <div className={`w-full ${isTheaterMode ? 'max-w-none px-4 pt-4' : 'max-w-5xl mx-auto'} space-y-4`}>
        
        {/* Video Player Display */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-black shadow-2xl">
          {isDirect ? (
            /* HTML5 Video Player for direct mp4/webm links */
            <div className="video-responsive bg-black">
              <video
                key={playerKey}
                src={activeLesson.videoId}
                controls
                autoPlay
                className="absolute inset-0 w-full h-full object-contain"
              >
                Seu navegador não suporta a tag de vídeo.
              </video>
            </div>
          ) : cleanYouTubeId ? (
            /* YouTube Embed Player (Enhanced with nocookie, JS API and fallback) */
            <div className="video-responsive bg-black">
              <iframe
                key={playerKey}
                src={`https://www.youtube-nocookie.com/embed/${cleanYouTubeId}?autoplay=1&enablejsapi=1&rel=0`}
                title={activeLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          ) : (
            /* Fallback when video ID is unknown or custom */
            <div className="p-12 text-center bg-[#09090c] space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-white">Vídeo não carregado diretamente</h3>
                <p className="text-xs text-zinc-400">
                  O link configurado para esta aula é: <span className="font-mono text-zinc-300 break-all">{activeLesson.videoId}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={directWatchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 transition-all shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir no YouTube / Externa
                </a>
                <button
                  onClick={() => setIsEditingVideo(true)}
                  className="px-4 py-2 bg-[#16161c] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl inline-flex items-center gap-2 transition-all"
                >
                  <Edit3 className="w-4 h-4 text-sky-400" />
                  Editar Link do Vídeo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Edit Video Link Bar (if opened) */}
        {isEditingVideo && (
          <form onSubmit={handleSaveVideoEdit} className="p-4 rounded-xl bg-[#0e0e13] border border-sky-500/30 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" /> Editar Fonte do Vídeo desta Aula
              </span>
              <button
                type="button"
                onClick={() => setIsEditingVideo(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Cancelar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Título da Aula</label>
                <input
                  type="text"
                  value={editTitleInput}
                  onChange={(e) => setEditTitleInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#14141a] border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-sky-500"
                  placeholder="Nome da aula..."
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">ID do YouTube ou Link do Vídeo</label>
                <input
                  type="text"
                  value={editVideoInput}
                  onChange={(e) => setEditVideoInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#14141a] border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-sky-500 font-mono"
                  placeholder="Ex: S9uPNppGsGo ou link do YouTube"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs rounded-lg transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        )}

        {/* Video Control Bar & Mark as Complete Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0a0a0d] border border-zinc-800/80 p-3.5 sm:p-4 rounded-xl shadow-lg">
          
          {/* Complete button & Auto-Advance Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleToggleCompletion}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
                activeLesson.completed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
              }`}
              id="mark-completed-btn"
            >
              <CheckCircle2 className={`w-4 h-4 ${activeLesson.completed ? 'text-emerald-400' : 'text-zinc-950'}`} />
              <span>{activeLesson.completed ? 'Aula Concluída ✓' : 'Marcar como Assistida'}</span>
            </button>

            {/* Auto advance toggle */}
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
              />
              <span>Avançar automático</span>
            </label>
          </div>

          {/* Navigation controls (Previous / Next) */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={() => prevLesson && onSelectLesson(prevLesson.id)}
              disabled={!prevLesson}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#121216] hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-[#121216] border border-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
              id="prev-lesson-btn"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <span className="text-xs text-zinc-400 font-mono px-2 font-medium">
              {currentIndex + 1} / {course.lessons.length}
            </span>

            <button
              onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
              disabled={!nextLesson}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#121216] hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-[#121216] border border-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
              id="next-lesson-btn"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Edit video link */}
            <button
              onClick={() => setIsEditingVideo(!isEditingVideo)}
              title="Trocar ou Corrigir Link do Vídeo"
              className="p-2 bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs transition-colors"
              id="edit-video-btn"
            >
              <Edit3 className="w-4 h-4 text-sky-400" />
            </button>

            {/* Reload Player */}
            <button
              onClick={() => setPlayerKey(prev => prev + 1)}
              title="Recarregar Player"
              className="p-2 bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs transition-colors"
              id="reload-player-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Theater Mode toggle */}
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              title={isTheaterMode ? 'Modo Normal' : 'Modo Cinema'}
              className="p-2 bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs transition-colors"
              id="theater-mode-btn"
            >
              {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Next Lesson Banner (Prominent Callout when available) */}
        {nextLesson && (
          <div 
            onClick={() => onSelectLesson(nextLesson.id)}
            className="p-3.5 rounded-xl bg-[#0a0a0f] border border-zinc-800/80 hover:border-emerald-500/40 hover:bg-[#0f0f16] flex items-center justify-between gap-3 cursor-pointer transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">A Seguir • Aula {currentIndex + 2}</span>
                <p className="text-xs text-zinc-200 font-medium group-hover:text-emerald-400 truncate transition-colors">
                  {nextLesson.title}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 shrink-0">
              <span>Ir para a próxima aula</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        )}

        {/* Lesson Title & Course Details */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                Aula {currentIndex + 1}
              </span>
              <span className="text-xs text-zinc-400 font-medium">{course.author}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareLink}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-[#0e0e12] border border-zinc-800 px-2.5 py-1 rounded-lg transition-colors"
                id="share-lesson-btn"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <a
                href={directWatchUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-[#0e0e12] border border-zinc-800 px-2.5 py-1 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </a>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {activeLesson.title}
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-800/80 pt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
              id="tab-notes-btn"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Minhas Anotações</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#16161b] text-zinc-400 border border-zinc-800 font-mono">
                {activeLesson.notes?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
              id="tab-ai-btn"
            >
              <Bot className="w-4 h-4 text-sky-400" />
              <span>Resumo & IA</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
              id="tab-overview-btn"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Detalhes da Aula</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="py-4">
          
          {/* TAB 1: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Note creator */}
              <form onSubmit={handleSaveNote} className="space-y-2">
                <div className="bg-[#0c0c0f] border border-zinc-800/90 rounded-xl p-3 focus-within:border-zinc-700 transition-all shadow-md">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Escreva um insight, código ou anotação importante sobre esta aula..."
                    rows={3}
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 outline-none resize-none"
                    id="note-textarea"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-[11px] text-zinc-500">
                      Suas anotações são salvas e persistem automaticamente
                    </span>
                    <button
                      type="submit"
                      disabled={!noteText.trim()}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                      id="save-note-btn"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Salvar Nota
                    </button>
                  </div>
                </div>
              </form>

              {/* Saved Notes List */}
              <div className="space-y-2.5">
                {(!activeLesson.notes || activeLesson.notes.length === 0) ? (
                  <div className="p-8 rounded-xl bg-[#0c0c0e] border border-zinc-800/80 text-center text-zinc-500 text-xs space-y-1">
                    <p className="font-medium text-zinc-400">Nenhuma anotação nesta aula ainda</p>
                    <p>Adicione pontos-chave para revisar quando quiser.</p>
                  </div>
                ) : (
                  activeLesson.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl bg-[#0c0c0f] border border-zinc-800/80 flex items-start justify-between gap-3 group shadow-sm"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                          {note.text}
                        </p>
                      </div>

                      <button
                        onClick={() => onDeleteNote(activeLesson.id, note.id)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Excluir nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI STUDY ASSISTANT */}
          {activeTab === 'ai' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {!aiData && !aiLoading && (
                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0f0f14] to-[#070709] border border-zinc-800 text-center space-y-4 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      Assistente Pedagógico com Inteligência Artificial
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Gere instantaneamente um resumo executivo, tópicos-chave e perguntas de autoavaliação desta aula com Gemini.
                    </p>
                  </div>

                  <button
                    onClick={handleFetchAiNotes}
                    className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                    id="generate-ai-summary-btn"
                  >
                    <Sparkles className="w-4 h-4" />
                    Gerar Resumo & Perguntas de Fixação
                  </button>
                </div>
              )}

              {aiLoading && (
                <div className="p-12 rounded-2xl bg-[#0c0c0e] border border-zinc-800/80 text-center space-y-3">
                  <Loader2 className="w-7 h-7 text-sky-400 animate-spin mx-auto" />
                  <p className="text-xs text-zinc-400">Analisando o conteúdo da aula e estruturando material de apoio...</p>
                </div>
              )}

              {aiError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
                  <span>{aiError}</span>
                  <button onClick={handleFetchAiNotes} className="underline font-semibold ml-2 cursor-pointer">Tentar novamente</button>
                </div>
              )}

              {aiData && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-[#0c0c0f] border border-zinc-800/80 space-y-2 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <Bot className="w-4 h-4" /> Resumo Executivo
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                      {aiData.summary}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  {aiData.keyTakeaways && aiData.keyTakeaways.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#0c0c0f] border border-zinc-800/80 space-y-2 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Pontos-Chave & Conceitos
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-300">
                        {aiData.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quiz / Self-assessment */}
                  {aiData.quiz && aiData.quiz.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#0c0c0f] border border-zinc-800/80 space-y-3 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> Perguntas de Fixação
                      </h4>
                      <div className="space-y-2.5">
                        {aiData.quiz.map((q, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-[#141418] border border-zinc-800/80 text-xs space-y-1.5">
                            <p className="font-semibold text-white">Q{idx + 1}: {q.question}</p>
                            <p className="text-zinc-400 leading-relaxed"><span className="text-emerald-400 font-medium">Resposta:</span> {q.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practical Tip */}
                  {aiData.practicalTip && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Lightbulb className="w-4 h-4 text-amber-400" /> Dica de Aplicação Prática
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{aiData.practicalTip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-[#0c0c0f] border border-zinc-800/80 space-y-2 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Descrição da Aula
                </h4>
                <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
                  {activeLesson.description || 'Nenhuma descrição detalhada disponível para este vídeo.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0c0c0f] border border-zinc-800/80 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-500">Canal / Instrutor</span>
                  <p className="font-semibold text-white">{course.author}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0c0c0f] border border-zinc-800/80 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-500">Duração Estimada</span>
                  <p className="font-semibold text-white">{activeLesson.duration || '10:00'}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
