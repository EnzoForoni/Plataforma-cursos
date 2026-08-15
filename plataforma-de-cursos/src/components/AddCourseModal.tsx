import React, { useState } from 'react';
import { 
  X, 
  Youtube, 
  Sparkles, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Film, 
  PlusCircle,
  Video,
  FilePlus2,
  Play
} from 'lucide-react';
import { Course, Lesson } from '../types';
import { PRESET_PLAYLIST_SUGGESTIONS } from '../data/defaultCourses';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
}) => {
  const [tab, setTab] = useState<'url' | 'presets' | 'custom'>('url');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customLessonsText, setCustomLessonsText] = useState(
    '01. Introdução ao Curso | S9uPNppGsGo\n02. Configurando o Ambiente | 31llNGKWDdo\n03. Primeiros Passos e Prática | hdDGoQC132k'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  if (!isOpen) return null;

  const handleFetchPlaylist = async (urlToFetch?: string) => {
    const targetUrl = urlToFetch || playlistUrl;
    if (!targetUrl.trim()) {
      setError('Por favor, cole um link de playlist ou vídeo do YouTube.');
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewCourse(null);

    try {
      const response = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl.trim(),
          title: customTitle.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.course) {
        throw new Error(data.error || 'Não foi possível carregar a playlist. Verifique se o link é válido e público.');
      }

      const fetchedCourse = data.course;
      const generatedLessons: Lesson[] = (fetchedCourse.videos || []).map((v: any, index: number) => {
        const lessonId = `lesson-${Date.now()}-${index}`;
        const cleanVid = String(v.id || '').trim();
        return {
          id: lessonId,
          videoId: cleanVid || 'S9uPNppGsGo',
          title: v.title || `Aula ${index + 1}`,
          duration: v.duration || '15:00',
          thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${cleanVid}/hqdefault.jpg`,
          description: v.description || '',
          completed: false,
          notes: [],
        };
      });

      const firstLessonId = generatedLessons[0]?.id;

      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: customTitle.trim() || fetchedCourse.title || 'Novo Curso do YouTube',
        author: fetchedCourse.author || 'YouTube Instrutor',
        thumbnail: fetchedCourse.thumbnail || (generatedLessons[0]?.thumbnail) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        description: fetchedCourse.description || `Curso estruturado com ${generatedLessons.length} aulas.`,
        playlistUrl: targetUrl.trim(),
        playlistId: fetchedCourse.playlistId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastWatchedLessonId: firstLessonId,
        lessons: generatedLessons.length > 0 ? generatedLessons : [
          {
            id: `lesson-${Date.now()}-1`,
            videoId: 'S9uPNppGsGo',
            title: '01. Aula Inaugural',
            duration: '15:00',
            thumbnail: 'https://i.ytimg.com/vi/S9uPNppGsGo/hqdefault.jpg',
            completed: false,
            notes: [],
          }
        ],
      };

      setPreviewCourse(newCourse);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar a playlist. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomCourse = () => {
    if (!customTitle.trim()) {
      setError('Por favor, informe o título do curso.');
      return;
    }

    const lines = customLessonsText.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      setError('Por favor, adicione ao menos uma aula.');
      return;
    }

    const lessons: Lesson[] = lines.map((line, idx) => {
      const parts = line.split('|').map(p => p.trim());
      const title = parts[0] || `Aula ${idx + 1}`;
      const videoId = parts[1] || 'S9uPNppGsGo';
      const lessonId = `lesson-${Date.now()}-${idx}`;

      return {
        id: lessonId,
        videoId,
        title,
        duration: '15:00',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        completed: false,
        notes: [],
      };
    });

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: customTitle.trim(),
      author: customAuthor.trim() || 'Instrutor',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      description: `Curso personalizado com ${lessons.length} aulas.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastWatchedLessonId: lessons[0]?.id,
      lessons,
    };

    onCourseCreated(newCourse);
    onClose();
  };

  const handleConfirmAdd = () => {
    if (!previewCourse) return;
    onCourseCreated(previewCourse);
    onClose();
    setPlaylistUrl('');
    setCustomTitle('');
    setPreviewCourse(null);
  };

  const handlePresetSelect = (presetUrl: string, presetTitle: string) => {
    setPlaylistUrl(presetUrl);
    setCustomTitle(presetTitle);
    handleFetchPlaylist(presetUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c0c0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-[#0f0f13]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-sm">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Adicionar Novo Curso
              </h2>
              <p className="text-xs text-zinc-400">
                Importe uma playlist do YouTube, cole vídeos ou crie sua grade de aulas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141418] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            id="close-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-800/80 bg-[#0a0a0d] px-6">
          <button
            onClick={() => { setTab('url'); setError(null); }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              tab === 'url' ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Link do YouTube
          </button>
          <button
            onClick={() => { setTab('presets'); setError(null); }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              tab === 'presets' ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Cursos Prontos (Presets)
          </button>
          <button
            onClick={() => { setTab('custom'); setError(null); }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              tab === 'custom' ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FilePlus2 className="w-3.5 h-3.5 text-sky-400" />
            Criar Manualmente
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0c0c0f]">
          
          {/* TAB 1: YOUTUBE URL EXTRACTION */}
          {tab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Link da Playlist ou Vídeo do YouTube <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchPlaylist()}
                    placeholder="https://www.youtube.com/playlist?list=PL... ou https://youtu.be/..."
                    className="w-full pl-10 pr-24 py-3 bg-[#131318] border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm text-white placeholder-zinc-500 transition-all outline-none"
                    id="playlist-url-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleFetchPlaylist()}
                    disabled={loading || !playlistUrl.trim()}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    id="extract-playlist-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Carregar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Optional Custom Course Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Título Personalizado (Opcional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ex: Formação Fullstack 2026"
                  className="w-full px-3.5 py-2.5 bg-[#131318] border border-zinc-800 focus:border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                  id="custom-course-title-input"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Erro ao carregar conteúdo</p>
                    <p className="text-zinc-400 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Preview extracted course */}
              {previewCourse && (
                <div className="p-4 rounded-xl bg-[#121217] border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="w-20 h-14 rounded-lg bg-zinc-900 overflow-hidden shrink-0 border border-zinc-700">
                        <img 
                          src={previewCourse.thumbnail} 
                          alt={previewCourse.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                            {previewCourse.lessons.length} Aulas Encontradas
                          </span>
                          <span className="text-xs text-zinc-400">{previewCourse.author}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">
                          {previewCourse.title}
                        </h3>
                      </div>
                    </div>

                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  </div>

                  {/* Sample list of lessons */}
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                    {previewCourse.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="flex items-center justify-between p-2 rounded-lg bg-[#0c0c0f] border border-zinc-800/80 text-zinc-300">
                        <div className="flex items-center gap-2 truncate">
                          <Film className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="text-zinc-500 text-[11px] font-mono shrink-0">#{idx + 1}</span>
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleConfirmAdd}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] cursor-pointer"
                    id="confirm-add-course-btn"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Criar Sala de Aula com este Curso
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRESET SUGGESTIONS */}
          {tab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-zinc-400">
                Selecione um dos cursos populares para carregar instantaneamente:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_PLAYLIST_SUGGESTIONS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handlePresetSelect(preset.url, preset.title)}
                    className="p-3.5 rounded-xl bg-[#121217] hover:bg-[#181820] border border-zinc-800/80 hover:border-emerald-500/50 transition-all group shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {preset.category}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {preset.lessonsCount}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-200 group-hover:text-white line-clamp-1">
                      {preset.title}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
                      <Play className="w-3 h-3 fill-current" /> Importar e Abrir
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM MANUAL COURSE CREATOR */}
          {tab === 'custom' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Título do Curso <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ex: Treinamento Avançado de Javascript"
                  className="w-full px-3.5 py-2.5 bg-[#131318] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Instrutor / Autor
                </label>
                <input
                  type="text"
                  value={customAuthor}
                  onChange={(e) => setCustomAuthor(e.target.value)}
                  placeholder="Ex: Minha Empresa / Professor"
                  className="w-full px-3.5 py-2.5 bg-[#131318] border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    Aulas (1 por linha: <span className="font-mono text-zinc-300">Título | ID ou Link do Vídeo</span>)
                  </label>
                </div>
                <textarea
                  rows={5}
                  value={customLessonsText}
                  onChange={(e) => setCustomLessonsText(e.target.value)}
                  className="w-full p-3 bg-[#131318] border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <button
                onClick={handleCreateCustomCourse}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Criar Curso Agora
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-[#0f0f13] border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Seu progresso e anotações ficam salvos localmente.</span>
          <span className="text-zinc-400 font-medium">100% Gratuito & Ilimitado</span>
        </div>
      </div>
    </div>
  );
};
