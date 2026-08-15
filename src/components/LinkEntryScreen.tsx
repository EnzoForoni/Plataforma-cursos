import React, { useState, useRef } from 'react';
import { 
  Youtube, 
  Sparkles, 
  ArrowRight, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Film, 
  Play, 
  Layers, 
  Clock, 
  BookOpen,
  TrendingUp,
  Check,
  Zap,
  HelpCircle,
  Video,
  Upload,
  FileText,
  Trash2
} from 'lucide-react';
import { Course, Lesson } from '../types';
import { PRESET_PLAYLIST_SUGGESTIONS } from '../data/defaultCourses';

interface LinkEntryScreenProps {
  onCourseLoaded: (course: Course) => void;
  existingCourses: Course[];
  activeCourse: Course | null;
  onOpenExistingCourse: (courseId: string) => void;
  onGoToLibrary: () => void;
}

export const LinkEntryScreen: React.FC<LinkEntryScreenProps> = ({
  onCourseLoaded,
  existingCourses,
  activeCourse,
  onOpenExistingCourse,
  onGoToLibrary,
}) => {
  const [mode, setMode] = useState<'link' | 'file'>('link');
  const [urlInput, setUrlInput] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedCourse, setExtractedCourse] = useState<Course | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetchCourse = async (targetUrl?: string, presetTitle?: string, rawOverride?: string) => {
    const finalUrl = (targetUrl || urlInput).trim();
    const finalRaw = rawOverride || fileContent;

    if (!finalUrl && !finalRaw) {
      setError('Por favor, cole um link de playlist/vídeo do YouTube ou envie um arquivo.');
      return;
    }

    setLoading(true);
    setError(null);
    setExtractedCourse(null);
    setLoadingStep('Buscando e processando todas as aulas...');

    try {
      setTimeout(() => setLoadingStep('Sincronizando títulos, durações reais e miniaturas...'), 500);

      const response = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: finalUrl || undefined,
          rawContent: finalRaw || undefined,
          title: (presetTitle || customTitle).trim() || fileName?.replace(/\.[^/.]+$/, "") || undefined,
        }),
      });

      setLoadingStep('Organizando grade de aulas...');
      const data = await response.json();

      if (!response.ok || !data.success || !data.course) {
        throw new Error(data.error || 'Não foi possível carregar as aulas. Verifique se o link ou arquivo é válido.');
      }

      const raw = data.course;
      const generatedLessons: Lesson[] = (raw.videos || []).map((v: any, index: number) => {
        const cleanId = String(v.id || 'S9uPNppGsGo').trim();
        return {
          id: `lesson-${Date.now()}-${index}`,
          videoId: cleanId,
          title: v.title || `Aula ${index + 1}`,
          duration: v.duration || '15:00',
          thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
          description: v.description || '',
          completed: false,
          notes: [],
        };
      });

      const finalCourse: Course = {
        id: `course-${Date.now()}`,
        title: (presetTitle || customTitle).trim() || raw.title || fileName?.replace(/\.[^/.]+$/, "") || 'Curso Importado do YouTube',
        author: raw.author || 'YouTube Instrutor',
        thumbnail: raw.thumbnail || generatedLessons[0]?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        description: raw.description || `Curso completo organizado com ${generatedLessons.length} aulas interativas.`,
        playlistUrl: finalUrl || undefined,
        playlistId: raw.playlistId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastWatchedLessonId: generatedLessons[0]?.id,
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

      setExtractedCourse(finalCourse);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao carregar o link ou arquivo. Tente novamente.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      setError(null);
      // Auto-trigger fetch with file content
      handleFetchCourse(undefined, undefined, content);
    };
    reader.readAsText(file);
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      setError(null);
      handleFetchCourse(undefined, undefined, content);
    };
    reader.readAsText(file);
  };

  const handleStartCourse = () => {
    if (!extractedCourse) return;
    onCourseLoaded(extractedCourse);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        handleFetchCourse(text);
      }
    } catch (e) {
      // clipboard permission fallback
    }
  };

  // Calculate total course estimated duration
  const totalDurationMinutes = extractedCourse?.lessons.reduce((acc, l) => {
    const parts = (l.duration || '15:00').split(':').map(Number);
    if (parts.length === 3) {
      return acc + (parts[0] * 60) + parts[1] + (parts[2] / 60);
    } else if (parts.length === 2) {
      return acc + parts[0] + (parts[1] / 60);
    }
    return acc + 15;
  }, 0) || 0;

  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = Math.round(totalDurationMinutes % 60);
  const formattedTotalDuration = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;

  return (
    <div className="flex-1 bg-[#050505] text-zinc-100 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-8 py-4 sm:py-8">
        
        {/* Top Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transformador de Playlists em Sala de Aula</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Importe seu curso do YouTube <span className="text-emerald-400">com todas as aulas</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Cole um link de playlist, links individuais de vídeos ou envie um arquivo com mais de 40 aulas. Buscamos todas as durações reais e organizamos sua sala de estudos.
          </p>
        </div>

        {/* Big URL / File Importer Box */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0c0c0f] border border-zinc-800/90 shadow-2xl space-y-4">
          
          {/* Mode Switcher: Link vs File */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <button
              type="button"
              onClick={() => setMode('link')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'link'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Link da Playlist / Vídeos</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('file')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'file'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Enviar Arquivo com Vídeos (.txt / .csv / .json)</span>
            </button>
          </div>

          {mode === 'link' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Link da Playlist ou Vídeo do YouTube
              </label>

              <div className="relative flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-500">
                    <Youtube className="w-5 h-5" />
                  </div>

                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchCourse()}
                    placeholder="Cole aqui o link da playlist (ex: https://www.youtube.com/playlist?list=...)"
                    className="w-full pl-11 pr-20 py-3.5 bg-[#121216] border border-zinc-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
                    id="main-link-input"
                  />

                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="absolute right-2 top-2 bottom-2 px-2.5 bg-[#1a1a22] hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Colar da área de transferência"
                  >
                    <LinkIcon className="w-3 h-3 text-emerald-400" />
                    <span className="hidden sm:inline">Colar</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleFetchCourse()}
                  disabled={loading || !urlInput.trim()}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed shrink-0"
                  id="load-course-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{loadingStep || 'Carregando...'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-zinc-950" />
                      <span>Carregar Todas as Aulas</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Arquivo com Lista de Aulas ou Links (Suporta +40 vídeos)
              </label>

              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropFile}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#121216]/60 hover:bg-[#121216] group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".txt,.csv,.json,.m3u" 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">
                  {fileName ? `Arquivo selecionado: ${fileName}` : 'Clique para selecionar ou arraste o arquivo aqui'}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Formatos aceitos: .txt, .csv, .json (com links ou IDs dos vídeos)
                </p>
              </div>

              {fileName && (
                <div className="flex items-center justify-between p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">{fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFetchCourse(undefined, undefined, fileContent || '')}
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-zinc-950" />}
                    <span>Processar Arquivo</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Optional Title input */}
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800/60">
            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
              <Check className="w-3 h-3 text-emerald-400" /> Suporta playlists públicas com 40+, 80+ vídeos e múltiplos links
            </span>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Nome personalizado (opcional)"
              className="bg-transparent border-b border-zinc-800 focus:border-zinc-500 px-1 py-0.5 text-[11px] text-zinc-300 outline-none w-48 placeholder-zinc-600 text-right"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Não foi possível carregar os vídeos</p>
                <p className="text-zinc-400 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Extracted Course Preview Box */}
          {extractedCourse && (
            <div className="mt-4 p-5 rounded-2xl bg-[#0f0f14] border-2 border-emerald-500/50 space-y-4 shadow-xl animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-20 h-14 rounded-xl bg-zinc-900 overflow-hidden shrink-0 border border-zinc-700 relative">
                    <img 
                      src={extractedCourse.thumbnail} 
                      alt={extractedCourse.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                        {extractedCourse.lessons.length} AULAS CARREGADAS
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {formattedTotalDuration}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 line-clamp-1">
                      {extractedCourse.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartCourse}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer shrink-0"
                  id="enter-classroom-btn"
                >
                  <span>Entrar na Sala de Aula</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Lesson List Preview Scroll */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider">
                    Grade Completa de Aulas ({extractedCourse.lessons.length} aulas):
                  </span>
                  <span className="text-[11px] text-emerald-400">
                    Durações reais sincronizadas
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-800/40">
                  {extractedCourse.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="pt-1.5 first:pt-0 flex items-center justify-between gap-3 text-xs text-zinc-300 py-1"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-5 h-5 rounded bg-zinc-800/80 flex items-center justify-center text-[10px] font-mono text-zinc-400 shrink-0">
                          {idx + 1}
                        </div>
                        <span className="truncate font-medium text-zinc-200">{lesson.title}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                        {lesson.duration || '15:00'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Confirm Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartCourse}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>Acessar Curso e Começar a 1ª Aula ({extractedCourse.lessons[0]?.title})</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Preset 1-Click Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Ou Escolha um Curso Pronto para Testar em 1 Clique
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_PLAYLIST_SUGGESTIONS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setUrlInput(preset.url);
                  handleFetchCourse(preset.url, preset.title);
                }}
                className="p-3.5 rounded-xl bg-[#0c0c0f] hover:bg-[#121217] border border-zinc-800/80 hover:border-emerald-500/40 transition-all group shadow-sm cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                    {preset.category}
                  </span>
                  <h3 className="text-xs font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {preset.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                  <span>{preset.lessonsCount}</span>
                  <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Carregar <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick jump to existing courses / saved library */}
        {existingCourses.length > 0 && (
          <div className="p-4 rounded-xl bg-[#09090c] border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#141418] border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">
                  Você já possui {existingCourses.length} {existingCourses.length === 1 ? 'curso salvo' : 'cursos salvos'}
                </span>
                <p className="text-[11px] text-zinc-400">
                  {activeCourse ? `Último acessado: ${activeCourse.title}` : 'Acesse seus cursos a qualquer momento.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeCourse && (
                <button
                  type="button"
                  onClick={() => onOpenExistingCourse(activeCourse.id)}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Continuar Assistindo</span>
                </button>
              )}
              <button
                type="button"
                onClick={onGoToLibrary}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ver Biblioteca</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Subtle footer credit */}
      <div className="text-center text-[11px] text-zinc-600 pt-6">
        <span>CURSOHUB PRO • Transforme qualquer conteúdo em aprendizado produtivo</span>
      </div>
    </div>
  );
};
