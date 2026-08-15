import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { Course } from '../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  userName: string;
  onUpdateUserName: (name: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  course,
  userName,
  onUpdateUserName,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName || 'Estudante');

  if (!isOpen || !course) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
      setEditingName(false);
    }
  };

  const certificateCode = `CERT-${course.id.slice(-6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const issueDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0c0c0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Modal Controls Bar */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-[#0f0f13] print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Certificado Oficial de Conclusão</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#181820] hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
              id="print-certificate-btn"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#141418] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#050505] flex flex-col items-center">
          
          {/* Change Name Bar */}
          <div className="w-full max-w-2xl bg-[#0e0e12] border border-zinc-800/90 p-3 rounded-xl flex items-center justify-between gap-3 text-xs print:hidden shadow-sm">
            <span className="text-zinc-400">Nome no certificado:</span>
            {editingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-2.5 py-1 bg-[#060608] border border-zinc-700 rounded-lg text-white text-xs outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-500 text-zinc-950 font-bold rounded-lg text-xs"
                >
                  Salvar
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{userName || 'Estudante'}</span>
                <button
                  onClick={() => {
                    setTempName(userName || 'Estudante');
                    setEditingName(true);
                  }}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Alterar Nome
                </button>
              </div>
            )}
          </div>

          {/* THE PRINTABLE CERTIFICATE CANVAS */}
          <div 
            id="certificate-print-area"
            className="w-full max-w-3xl bg-[#0a0a0e] border-4 border-amber-500/40 rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-2xl text-center space-y-6"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.06) 0%, rgba(10, 10, 14, 0.98) 100%)',
            }}
          >
            {/* Corner Decorative Borders */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400" />

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                <Award className="w-8 h-8" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-extrabold text-amber-400">
                Certificado de Conclusão
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                PlayCourse Learning Academy
              </h2>
            </div>

            {/* Body text */}
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <p className="text-xs sm:text-sm text-zinc-400">
                Certificamos para os devidos fins que
              </p>
              
              <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300 border-b border-zinc-700/80 pb-2">
                {userName || 'Estudante'}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                concluiu com êxito todas as aulas e atividades práticas do curso:
              </p>

              <div className="p-3.5 bg-[#050507]/90 border border-zinc-800 rounded-xl">
                <h3 className="text-base sm:text-lg font-bold text-emerald-400">
                  {course.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Instrutor: <span className="text-zinc-300 font-medium">{course.author}</span> • {course.lessons.length} Aulas Concluídas (100%)
                </p>
              </div>
            </div>

            {/* Footer Signatures & Metadata */}
            <div className="pt-6 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-4 items-center text-left text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Data de Emissão</span>
                <span className="text-zinc-300 font-semibold">{issueDate}</span>
              </div>

              <div className="text-center hidden sm:block">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verificado & Autenticado
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Código de Validação</span>
                <span className="font-mono text-amber-400 font-bold">{certificateCode}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
