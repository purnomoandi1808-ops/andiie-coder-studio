// FILE: src/App.jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Send, Sparkles, Loader2, Menu, Plus, MessageSquare, Trash2, Lock,
  Play, Pause, Rewind, FastForward, X, Paperclip, Code, Download,
  Music, Sun, Moon, Zap, Copy, Check, TerminalSquare, Server,
  LayoutGrid, Settings, Save, Archive, GitCommit, FolderKanban,
  Layers, ChevronRight, ChevronDown, User, StopCircle,
  PanelRightOpen, PanelRightClose, Image as ImageIcon,
  Video, Volume2, LogOut, Folder, GraduationCap, FolderSync, ThumbsUp, ThumbsDown, RotateCw, Share2, MoreVertical, FileText, Mail, Flag,
  ArrowDown, Palette, Clock, Keyboard, ChevronsLeft, ChevronsRight, Search, Pin
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

// =====================================
// SUPABASE CLIENT
// =====================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// =====================================
// THEME SYSTEM - 5 LUXURY THEMES
// =====================================
const THEMES = {
  dark: {
    id: 'dark',
    name: 'Obsidian Dark',
    icon: '🖤',
    bg: '#0a0a0f',
    bgSecondary: '#12121a',
    bgTertiary: '#1a1a28',
    bgInput: '#16161f',
    border: '#2a2a3d',
    borderFocus: '#6366f1',
    text: '#e4e4ed',
    textSecondary: '#8888a4',
    textMuted: '#55556e',
    accent: '#6366f1',
    accentHover: '#818cf8',
    accentBg: 'rgba(99,102,241,0.12)',
    sidebarBg: '#08080d',
    headerBg: 'rgba(10,10,15,0.85)',
    bubbleUser: '#1e1e30',
    bubbleAI: 'transparent',
    scrollTrack: '#0a0a0f',
    scrollThumb: '#2a2a3d',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    gradient: 'from-indigo-600 to-violet-600',
    gradientText: 'from-indigo-400 to-violet-400',
    codeStyle: vscDarkPlus,
    isDark: true,
  },
  light: {
    id: 'light',
    name: 'Pearl Light',
    icon: '🤍',
    bg: '#f8f9fc',
    bgSecondary: '#ffffff',
    bgTertiary: '#f1f3f9',
    bgInput: '#ffffff',
    border: '#e2e5ef',
    borderFocus: '#6366f1',
    text: '#1a1a2e',
    textSecondary: '#64648c',
    textMuted: '#9898b4',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    accentBg: 'rgba(99,102,241,0.08)',
    sidebarBg: '#f1f3f9',
    headerBg: 'rgba(248,249,252,0.88)',
    bubbleUser: '#f1f3f9',
    bubbleAI: 'transparent',
    scrollTrack: '#f8f9fc',
    scrollThumb: '#d1d5db',
    danger: '#ef4444',
    success: '#16a34a',
    warning: '#d97706',
    gradient: 'from-indigo-500 to-violet-500',
    gradientText: 'from-indigo-600 to-violet-600',
    codeStyle: oneLight,
    isDark: false,
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Blue',
    icon: '🌊',
    bg: '#0b1120',
    bgSecondary: '#111b33',
    bgTertiary: '#162240',
    bgInput: '#111b33',
    border: '#1e3055',
    borderFocus: '#3b82f6',
    text: '#dce6f7',
    textSecondary: '#7a9bc5',
    textMuted: '#4a6a94',
    accent: '#3b82f6',
    accentHover: '#60a5fa',
    accentBg: 'rgba(59,130,246,0.12)',
    sidebarBg: '#080e1b',
    headerBg: 'rgba(11,17,32,0.88)',
    bubbleUser: '#162240',
    bubbleAI: 'transparent',
    scrollTrack: '#0b1120',
    scrollThumb: '#1e3055',
    danger: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    gradient: 'from-blue-600 to-cyan-500',
    gradientText: 'from-blue-400 to-cyan-300',
    codeStyle: vscDarkPlus,
    isDark: true,
  },
  forest: {
    id: 'forest',
    name: 'Emerald Forest',
    icon: '🌲',
    bg: '#0a120e',
    bgSecondary: '#111f18',
    bgTertiary: '#182b20',
    bgInput: '#111f18',
    border: '#1e3a29',
    borderFocus: '#22c55e',
    text: '#d4e8dc',
    textSecondary: '#7aab8e',
    textMuted: '#4a7a5e',
    accent: '#22c55e',
    accentHover: '#4ade80',
    accentBg: 'rgba(34,197,94,0.12)',
    sidebarBg: '#070e0a',
    headerBg: 'rgba(10,18,14,0.88)',
    bubbleUser: '#182b20',
    bubbleAI: 'transparent',
    scrollTrack: '#0a120e',
    scrollThumb: '#1e3a29',
    danger: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
    gradient: 'from-emerald-600 to-teal-500',
    gradientText: 'from-emerald-400 to-teal-300',
    codeStyle: vscDarkPlus,
    isDark: true,
  },
  rose: {
    id: 'rose',
    name: 'Rosé Gold',
    icon: '🌸',
    bg: '#fdf2f4',
    bgSecondary: '#ffffff',
    bgTertiary: '#fce7eb',
    bgInput: '#ffffff',
    border: '#f5d0d8',
    borderFocus: '#e11d48',
    text: '#2a1015',
    textSecondary: '#8a5060',
    textMuted: '#c4899a',
    accent: '#e11d48',
    accentHover: '#be123c',
    accentBg: 'rgba(225,29,72,0.08)',
    sidebarBg: '#fce7eb',
    headerBg: 'rgba(253,242,244,0.88)',
    bubbleUser: '#fce7eb',
    bubbleAI: 'transparent',
    scrollTrack: '#fdf2f4',
    scrollThumb: '#f5d0d8',
    danger: '#e11d48',
    success: '#16a34a',
    warning: '#d97706',
    gradient: 'from-rose-500 to-pink-500',
    gradientText: 'from-rose-600 to-pink-600',
    codeStyle: oneLight,
    isDark: false,
  },
};

// =====================================
// UTILITY: Auto-resize textarea & Mobile
// =====================================
const useAutoResize = (ref, value) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value, ref]);
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

// =====================================
// MEDIA EXTRACTOR
// =====================================
const ekstrakMediaDariRiwayat = (sessions) => {
  const daftarMedia = [];
  sessions.forEach(sesi => {
    (sesi.messages || []).forEach(msg => {
      if (msg.role === 'ai') {
        const imgRegex = /!\[.*?\]\((.*?)\)/g; let match;
        while ((match = imgRegex.exec(msg.text)) !== null) daftarMedia.push({ type: 'image', url: match[1], title: sesi.title });
        const vidRegex = /\[VIDEO_PLAYER\]\((.*?)\)/g;
        while ((match = vidRegex.exec(msg.text)) !== null) daftarMedia.push({ type: 'video', url: match[1], title: sesi.title });
        const audRegex = /\[AUDIO_PLAYER\]\((.*?)\)/g;
        while ((match = audRegex.exec(msg.text)) !== null) daftarMedia.push({ type: 'audio', url: match[1], title: sesi.title });
      }
    });
  });
  return daftarMedia.reverse();
};

// =====================================
// FORMAT TIMESTAMP
// =====================================
const formatTimestamp = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin}m lalu`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}j lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// =====================================
// SMART CODE BLOCK
// =====================================
const SmartCodeBlock = ({ inline, className, children, t, setActiveCanvasTab, setIsPreviewOpen, setPreviewCode }) => {
  const [isCopied, setIsCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  let language = 'text';

  if (match) language = match[1].toLowerCase();
  else if (!inline && codeString.includes('\n')) {
    if (codeString.includes('def ') || codeString.includes('import ') || codeString.includes('print(')) language = 'python';
    else if (codeString.includes('<div') || codeString.includes('<html')) language = 'html';
    else language = 'javascript';
  }

  const isBlock = !inline && (codeString.includes('\n') || (className && className.includes('language-')));
  const isRenderable = ['html', 'xml', 'python', 'py'].includes(language);

  const handleCopy = useCallback(() => { navigator.clipboard.writeText(codeString).catch(() => {}); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }, [codeString]);

  const handlePreview = useCallback(() => {
    let codeToRender = codeString;
    if (language === 'python' || language === 'py') {
      const safeCode = JSON.stringify(codeString).replace(/<\//g, '<\\/');
      codeToRender = `<!DOCTYPE html><html><head><script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"><\/script><style>body{background:${t.isDark ? '#0d1117' : '#fff'};color:${t.isDark ? '#c9d1d9' : '#1f2937'};font-family:monospace;padding:20px;line-height:1.6}#output{white-space:pre-wrap}.ok{color:#3fb950}.err{color:#f85149}</style></head><body><div id="s" style="color:#d29922;font-weight:bold">⏳ Memuat Mesin Python…</div><hr style="border-color:#30363d;margin:16px 0"/><div id="output"></div><script>async function main(){try{let p=await loadPyodide();document.getElementById("s").textContent="⚙️ Menjalankan…";p.setStdout({batched:m=>{document.getElementById("output").textContent+=m+"\\n"}});await p.runPythonAsync(${safeCode});document.getElementById("s").textContent="✅ Selesai";document.getElementById("s").className="ok"}catch(e){document.getElementById("output").textContent+="\\n"+e;document.getElementById("s").textContent="❌ Error";document.getElementById("s").className="err"}}main()<\/script></body></html>`;
    }
    setPreviewCode(codeToRender); setIsPreviewOpen(true); setActiveCanvasTab("preview");
  }, [codeString, language, t, setPreviewCode, setIsPreviewOpen, setActiveCanvasTab]);

  if (isBlock) {
    return (
      <div className="rounded-xl border my-4 overflow-hidden" style={{ borderColor: t.border, background: t.isDark ? t.bg : t.bgTertiary }}>
        <div className="flex items-center justify-between px-4 py-2 border-b text-xs" style={{ background: t.bgSecondary, borderColor: t.border, color: t.textMuted }}>
          <span className="font-mono font-semibold uppercase tracking-wider text-[10px]">{language}</span>
          <div className="flex items-center gap-1.5">
            {isRenderable && <button onClick={handlePreview} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors" style={{ background: t.accentBg, color: t.accent }}><Play size={11} fill="currentColor" /> Preview</button>}
            <button onClick={handleCopy} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors" style={{ color: isCopied ? t.success : t.textMuted }}>
              {isCopied ? <Check size={11} /> : <Copy size={11} />} {isCopied ? "Tersalin" : "Salin"}
            </button>
          </div>
        </div>
        <SyntaxHighlighter language={language === 'text' || language === 'code' ? 'javascript' : language} style={t.codeStyle} customStyle={{ margin: 0, padding: '16px', fontSize: '13px', lineHeight: '1.6', background: 'transparent' }} wrapLines lineProps={(lineNumber) => { const line = codeString.split('\n')[lineNumber - 1] || ""; if (language === 'diff') { if (line.startsWith('+')) return { style: { backgroundColor: 'rgba(46,160,67,0.15)', display: 'block' } }; if (line.startsWith('-')) return { style: { backgroundColor: 'rgba(248,81,73,0.15)', display: 'block' } }; } return {}; }}>
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }
  return <code className="px-1.5 py-0.5 rounded text-[13px] font-mono" style={{ background: t.bgTertiary, color: t.accent }}>{children}</code>;
};

// =====================================
// CUSTOM AUDIO PLAYER
// =====================================
const CustomAudioPlayer = ({ src, t }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  const formatTime = (time) => { if (isNaN(time)) return "0:00"; return `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`; };
  const togglePlay = () => { if (!audioRef.current) return; if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => {}); setIsPlaying(!isPlaying); };
  const skip = (amt) => { if (audioRef.current) audioRef.current.currentTime += amt; };

  return (
    <div className="w-full max-w-sm flex flex-col gap-2.5 p-3.5 rounded-2xl border my-3 transition-colors" style={{ background: t.bgSecondary, borderColor: t.border }}>
      <audio ref={audioRef} src={src} onTimeUpdate={() => { const a = audioRef.current; if (a && a.duration > 0) { setProgress((a.currentTime / a.duration) * 100); setCurrentTime(formatTime(a.currentTime)); } }} onLoadedMetadata={() => { if (audioRef.current) setDuration(formatTime(audioRef.current.duration)); }} onEnded={() => setIsPlaying(false)} className="hidden" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => skip(-10)} className="p-1.5 rounded-full transition-colors" style={{ color: t.textMuted }}><Rewind size={14} /></button>
          <button onClick={togglePlay} className={`p-2.5 text-white rounded-full active:scale-95 transition-all shadow-md bg-gradient-to-r ${t.gradient}`}>{isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}</button>
          <button onClick={() => skip(10)} className="p-1.5 rounded-full transition-colors" style={{ color: t.textMuted }}><FastForward size={14} /></button>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <input type="range" min="0" max="100" value={progress || 0} onChange={(e) => { if (audioRef.current && audioRef.current.duration) { audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration; setProgress(e.target.value); } }} className="w-full h-1 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, ${t.accent} ${progress}%, ${t.border} ${progress}%)`, accentColor: t.accent }} />
          <div className="flex justify-between"><span className="text-[10px] font-mono" style={{ color: t.textMuted }}>{currentTime}</span><span className="text-[10px] font-mono" style={{ color: t.textMuted }}>{duration}</span></div>
        </div>
      </div>
    </div>
  );
};

// =====================================
// MODAL WRAPPER
// =====================================
const Modal = ({ isOpen, onClose, children, t, maxWidth = "max-w-2xl" }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} onClick={(e) => e.stopPropagation()} className={`relative w-full ${maxWidth} max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border`} style={{ background: t.bg, borderColor: t.border }}>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================
// THEME PICKER MODAL
// =====================================
const ThemePicker = ({ isOpen, onClose, currentTheme, onSelect, t }) => (
  <Modal isOpen={isOpen} onClose={onClose} t={t} maxWidth="max-w-md">
    <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: t.border }}>
      <div className="flex items-center gap-3">
        <Palette size={20} style={{ color: t.accent }} />
        <h2 className="text-lg font-bold" style={{ color: t.text }}>Pilih Tema</h2>
      </div>
      <button onClick={onClose} className="p-2 rounded-xl transition-colors" style={{ color: t.textMuted }}><X size={18} /></button>
    </div>
    <div className="p-5 grid grid-cols-1 gap-3">
      {Object.values(THEMES).map(theme => (
        <button
          key={theme.id}
          onClick={() => { onSelect(theme.id); onClose(); }}
          className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
          style={{
            borderColor: currentTheme === theme.id ? t.accent : t.border,
            background: currentTheme === theme.id ? t.accentBg : 'transparent',
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border" style={{ background: theme.bg, borderColor: theme.border }}>
            {theme.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm" style={{ color: t.text }}>{theme.name}</div>
            <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>{theme.isDark ? 'Tema Gelap' : 'Tema Terang'}</div>
          </div>
          {currentTheme === theme.id && (
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: t.accent }}>
              <Check size={14} className="text-white" />
            </div>
          )}
          <div className="flex gap-1">
            {[theme.bg, theme.bgSecondary, theme.accent, theme.border].map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full border" style={{ background: c, borderColor: theme.border }} />
            ))}
          </div>
        </button>
      ))}
    </div>
  </Modal>
);

// =====================================
// SEARCH MODAL
// =====================================
const SearchModal = ({ isOpen, onClose, sessions, onSelect, t }) => {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return sessions.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      (s.messages || []).some(m => m.text?.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [query, sessions]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} t={t} maxWidth="max-w-lg">
      <div className="p-4 border-b" style={{ borderColor: t.border }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl border" style={{ borderColor: t.border, background: t.bgTertiary }}>
          <Search size={18} style={{ color: t.textMuted }} />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari percakapan..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: t.text }}
          />
          {query && <button onClick={() => setQuery('')}><X size={14} style={{ color: t.textMuted }} /></button>}
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto p-2" style={{ scrollbarWidth: 'none' }}>
        {query && results.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: t.textMuted }}>Tidak ditemukan</div>
        )}
        {results.map(s => (
          <button
            key={s.id}
            onClick={() => { onSelect(s.id); onClose(); setQuery(''); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
            style={{ color: t.text }}
            onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <MessageSquare size={16} style={{ color: t.textMuted }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{s.title}</div>
              <div className="text-xs truncate mt-0.5" style={{ color: t.textMuted }}>
                {(s.messages || []).length} pesan
              </div>
            </div>
          </button>
        ))}
        {!query && (
          <div className="py-12 text-center text-sm" style={{ color: t.textMuted }}>
            Ketik untuk mencari percakapan...
          </div>
        )}
      </div>
    </Modal>
  );
};

// =====================================
// MESSAGE BUBBLE COMPONENT
// =====================================
const MessageBubble = React.memo(({
  chat, idx, isLast, isStreaming, t,
  setActiveCanvasTab, setIsPreviewOpen, setPreviewCode
}) => {
  const isUser = chat.role === 'user';
  const isAI = chat.role === 'ai';
  const [showOptions, setShowOptions] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyText = () => {
    if (!chat.text) return;
    navigator.clipboard.writeText(chat.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExportTxt = () => {
    if (!chat.text) return;
    const element = document.createElement("a");
    const file = new Blob([chat.text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Dokumen_AI_Studio.txt";
    document.body.appendChild(element);
    element.click();
    setShowOptions(false);
  };

  const handleDraftEmail = () => {
    if (!chat.text) return;
    const subject = encodeURIComponent("Draf dari AI Studio Pro");
    const body = encodeURIComponent(chat.text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowOptions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: isLast ? 0 : 0 }}
      className="group py-4 md:py-5 px-3 md:px-0 transition-colors"
    >
      <div className="max-w-3xl mx-auto flex gap-3 md:gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isAI ? (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br ${t.gradient} shadow-sm`}>
              {isStreaming && isLast
                ? <Loader2 className="animate-spin text-white" size={14} />
                : <Sparkles className="text-white" size={14} />
              }
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ background: t.bgTertiary, borderColor: t.border }}>
              <User size={14} style={{ color: t.textSecondary }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-visible relative">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold" style={{ color: t.textSecondary }}>
              {isAI ? 'AI Studio Pro' : 'Anda'}
            </span>
            {chat.timestamp && (
              <span className="text-[10px]" style={{ color: t.textMuted }}>
                {formatTimestamp(chat.timestamp)}
              </span>
            )}
          </div>

          {isAI ? (
            <>
              <div className="prose prose-sm max-w-none break-words leading-relaxed mb-3" style={{ '--tw-prose-body': t.text, '--tw-prose-headings': t.text, '--tw-prose-links': t.accent, color: t.text }}>
                <ReactMarkdown
                  urlTransform={(value) => value}
                  components={{
                    code(props) {
                      return (
                        <SmartCodeBlock
                          {...props}
                          t={t}
                          setActiveCanvasTab={setActiveCanvasTab}
                          setIsPreviewOpen={setIsPreviewOpen}
                          setPreviewCode={setPreviewCode}
                        />
                      );
                    },
                    a(props) {
                      if (props.children && props.children[0] === 'AUDIO_PLAYER') {
                        return <CustomAudioPlayer src={props.href} t={t} />;
                      }
                      return (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors" style={{ color: t.accent }}>
                          {props.children}
                        </a>
                      );
                    },
                    p({ children }) { return <p className="mb-3 last:mb-0 leading-7">{children}</p>; },
                    ul({ children }) { return <ul className="mb-3 space-y-1.5 list-disc list-outside ml-4">{children}</ul>; },
                    ol({ children }) { return <ol className="mb-3 space-y-1.5 list-decimal list-outside ml-4">{children}</ol>; },
                  }}
                >
                  {chat.text || (isStreaming && isLast ? '' : '')}
                </ReactMarkdown>

                {isStreaming && isLast && !chat.text && (
                  <div className="flex gap-1.5 py-2">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-2 h-2 rounded-full animate-bounce" style={{ background: t.accent, animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION BAR */}
              {!isStreaming && chat.text && (
                <div className="flex items-center gap-0.5 mt-2 relative opacity-0 group-hover:opacity-100 transition-opacity">
                  {[
                    { icon: ThumbsUp, title: 'Bagus' },
                    { icon: ThumbsDown, title: 'Kurang' },
                    { icon: RotateCw, title: 'Muat Ulang' },
                  ].map((btn, i) => (
                    <button key={i} className="p-2 rounded-lg transition-colors" style={{ color: t.textMuted }} title={btn.title}
                      onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.text; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}
                    >
                      <btn.icon size={15} />
                    </button>
                  ))}

                  <div className="w-px h-4 mx-1" style={{ background: t.border }} />

                  <button onClick={handleCopyText} className="p-2 rounded-lg transition-colors" style={{ color: isCopied ? t.success : t.textMuted }} title="Salin"
                    onMouseEnter={e => { if (!isCopied) { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.text; }}}
                    onMouseLeave={e => { if (!isCopied) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}}
                  >
                    {isCopied ? <Check size={15} /> : <Copy size={15} />}
                  </button>

                  <div className="relative">
                    <button onClick={() => setShowOptions(!showOptions)} className="p-2 rounded-lg transition-colors" style={{ color: showOptions ? t.accent : t.textMuted, background: showOptions ? t.accentBg : 'transparent' }} title="Lainnya">
                      <MoreVertical size={15} />
                    </button>
                    <AnimatePresence>
                      {showOptions && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 mb-2 w-56 rounded-xl shadow-2xl border z-20 overflow-hidden"
                            style={{ background: t.bgSecondary, borderColor: t.border }}
                          >
                            <div className="py-1">
                              {[
                                { icon: FileText, label: 'Ekspor ke Dokumen (.txt)', action: handleExportTxt },
                                { icon: Mail, label: 'Jadikan draf di Email', action: handleDraftEmail },
                              ].map((item, i) => (
                                <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left" style={{ color: t.textSecondary }}
                                  onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <item.icon size={16} className="opacity-70" /> {item.label}
                                </button>
                              ))}
                              <div className="my-1 border-t" style={{ borderColor: t.border }} />
                              <button onClick={() => setShowOptions(false)} className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left" style={{ color: t.danger }}
                                onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <Flag size={16} className="opacity-70" /> Laporkan masalah
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="whitespace-pre-wrap leading-7" style={{ color: t.text }}>
              {chat.text}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// =====================================
// MAIN APPLICATION
// =====================================
export default function App() {
  const isMobile = useIsMobile();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [selectedModel, setSelectedModel] = useState("auto");
  const [selectedPersona, setSelectedPersona] = useState("default");
  const [attachments, setAttachments] = useState([]);

  const [isCodingMode, setIsCodingMode] = useState(false);
  const [isExamMode, setIsExamMode] = useState(false);
  const [dirHandle, setDirHandle] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);

  const [previewCode, setPreviewCode] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeCanvasTab, setActiveCanvasTab] = useState("preview");
  const [themeId, setThemeId] = useState(() => localStorage.getItem("andiie_theme") || "dark");
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const t = THEMES[themeId] || THEMES.dark;

  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const wsInstance = useRef(null);
  const fitAddonRef = useRef(null);
  const [sshStatus, setSshStatus] = useState("disconnected");
  const [sshCreds, setSshCreds] = useState({ host: "", port: "22", username: "", password: "" });

  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [commandFilter, setCommandFilter] = useState("");
  const [slashCommands, setSlashCommands] = useState([]);
  const [isManagePromptOpen, setIsManagePromptOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ command: "", description: "", prompt: "" });

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState('all');

  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [projectsList, setProjectsList] = useState(() => { try { const saved = localStorage.getItem("andiie_projects"); return saved ? JSON.parse(saved) : []; } catch { return []; } });
  const [sessions, setSessions] = useState(() => { try { const saved = localStorage.getItem("andiie_chat_history"); return saved ? JSON.parse(saved) : []; } catch { return []; } });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Pinned chats
  const [pinnedChats, setPinnedChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("andiie_pinned") || "[]"); } catch { return []; }
  });

  const modelGroups = [
    { label: "🧠 Deep Thinking & Research", models: [ { value: "SEARCH_MODE", label: "🌐 Deep Web Research (Internet)" }, { value: "deepseek/deepseek-r1", label: "💭 DeepSeek R1 (Reasoning)" }, { value: "openai/o3-mini", label: "🧠 OpenAI o3-mini (Math/Logic)" } ] },
    { label: "📝 Text & General", models: [ { value: "auto", label: "✨ Auto Smart Manager" }, { value: "google/gemma-4-31b-it", label: "🔵 Google: Gemma 4 31B (Free)" } ] },
    { label: "💻 Coding & Logic", models: [ { value: "auto_coding", label: "⚡ Auto Coding (Lokal/Cloud)" }, { value: "anthropic/claude-opus-4.6", label: "🧠 Claude Opus 4.6" }, { value: "anthropic/claude-sonnet-4.6", label: "⚡ Claude Sonnet 4.6" }, { value: "openai/gpt-5.3-codex", label: "🚀 GPT-5.3 Codex" }, { value: "qwen/qwen3-coder-next", label: "☁️ Qwen3 Coder Next" }, { value: "lokal", label: "💻 Qwen 30B (Lokal Ollama)" } ] },
    { label: "🎨 Gambar (Images)", models: [ { value: "sourceful/riverflow-v2-pro", label: "🌊 Riverflow V2 Pro" }, { value: "google/gemini-3.1-flash-image-preview", label: "🖼️ Gemini 3.1 Flash" }, { value: "openai/dall-e-3", label: "🎨 DALL-E 3" } ] },
    { label: "🎬 Video Generation", models: [ { value: "bytedance/seedance-2.0", label: "💃 ByteDance: Seedance 2.0" }, { value: "alibaba/wan-2.7", label: "🎥 Alibaba: Wan 2.7" }, { value: "openai/sora-2-pro", label: "🌌 OpenAI: Sora 2 Pro" }, { value: "google/veo-3.1", label: "📽️ Google: Veo 3.1" } ] },
    { label: "🎵 Lagu & Audio", models: [ { value: "google/lyria-3-clip-preview", label: "🎼 Google: Lyria 3" }, { value: "suno-api-custom", label: "🎸 Suno API" } ] },
  ];
  const currentModelLabel = modelGroups.flatMap(g => g.models).find(m => m.value === selectedModel)?.label || selectedModel;

  useAutoResize(textareaRef, input);
  const generatedMedia = useMemo(() => ekstrakMediaDariRiwayat(sessions), [sessions]);
  const filteredMedia = generatedMedia.filter(m => galleryFilter === 'all' || m.type === galleryFilter);
  const slashCommandsList = useMemo(() => [
    { command: "/fix-diff", description: "Perbaiki bug (Visual Diff)", prompt: "Tolong perbaiki kode ini. Tampilkan perubahannya menggunakan blok kode berformat 'diff'." },
    { command: "/review", description: "Cari bug & error", prompt: "Tolong review baris kode ini, cari bug atau potensi error, dan berikan solusinya." },
    { command: "/refactor", description: "Bersihkan kode", prompt: "Tolong tulis ulang kode ini agar lebih bersih, efisien, rapi, dan tambahkan komentar." },
    { command: "/explain", description: "Jelaskan kode", prompt: "Tolong jelaskan cara kerja kode ini baris demi baris." },
  ], []);
  const allPrompts = useMemo(() => [...slashCommandsList, ...slashCommands], [slashCommandsList, slashCommands]);

  // Character count
  const charCount = input.length;
  const MAX_CHARS = 10000;

  useEffect(() => { localStorage.setItem("andiie_theme", themeId); }, [themeId]);
  useEffect(() => { if (localStorage.getItem("andiie_auth") === "true") setIsLoggedIn(true); }, []);
  useEffect(() => { if (!supabase) return; (async () => { const { data } = await supabase.from('andiie_chats').select('*').order('updated_at', { ascending: false }); if (data && data.length > 0) { setSessions(data); localStorage.setItem("andiie_chat_history", JSON.stringify(data)); } })(); }, []);
  useEffect(() => { localStorage.setItem("andiie_projects", JSON.stringify(projectsList)); }, [projectsList]);
  useEffect(() => { localStorage.setItem("andiie_pinned", JSON.stringify(pinnedChats)); }, [pinnedChats]);

  useEffect(() => {
    if (isStreaming || !currentSessionId || messages.length === 0) return;
    const timer = setTimeout(() => {
      setSessions(prev => {
        const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages } : s);
        localStorage.setItem("andiie_chat_history", JSON.stringify(updated));
        if (supabase) {
          const sesi = updated.find(s => s.id === currentSessionId);
          if (sesi) supabase.from('andiie_chats').upsert({ id: currentSessionId, title: sesi.title, messages, updated_at: new Date() }).then(({ error }) => { if (error) console.error("Supabase error:", error.message); });
        }
        return updated;
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [messages, currentSessionId, isStreaming]);

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" }); }, [messages, isStreaming]);
  useEffect(() => { if (!isMobile) setIsSidebarOpen(true); else setIsSidebarOpen(false); }, [isMobile]);

  // Scroll FAB visibility
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const handler = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShowScrollBottom(!atBottom && messages.length > 3);
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [messages.length]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); setIsSidebarOpen(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const fetchPrompts = useCallback(async () => { if (!supabase) return; const { data, error } = await supabase.from('andiie_prompts').select('*').order('created_at', { ascending: true }); if (!error && data) setSlashCommands(data); }, []);
  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);
  useEffect(() => { if (activeCanvasTab !== "terminal" && xtermInstance.current) { xtermInstance.current.dispose(); xtermInstance.current = null; } }, [activeCanvasTab]);
  useEffect(() => { if (!showModelDropdown) return; const handler = () => setShowModelDropdown(false); window.addEventListener('click', handler); return () => window.removeEventListener('click', handler); }, [showModelDropdown]);

  const handleLogin = (e) => { e.preventDefault(); if (loginData.username === "andiie" && loginData.password === "Arsyad160216") { setIsLoggedIn(true); localStorage.setItem("andiie_auth", "true"); setLoginError(""); } else setLoginError("Kredensial tidak valid."); };
  const handleLogout = () => { localStorage.removeItem("andiie_auth"); setIsLoggedIn(false); };
  const buatChatBaru = () => { setCurrentSessionId(null); setMessages([]); setActiveRoute(null); setIsPreviewOpen(false); setAttachments([]); if (isMobile) setIsSidebarOpen(false); };
  const muatChatLama = (id) => { if (isStreaming) return; const sesi = sessions.find(s => s.id === id); if (sesi) { setCurrentSessionId(id); setMessages(sesi.messages || []); setActiveRoute(null); setAttachments([]); if (isMobile) setIsSidebarOpen(false); } };
  const hapusChat = async (e, id) => { e.stopPropagation(); const updated = sessions.filter(s => s.id !== id); setSessions(updated); localStorage.setItem("andiie_chat_history", JSON.stringify(updated)); if (currentSessionId === id) buatChatBaru(); if (supabase) await supabase.from('andiie_chats').delete().eq('id', id); setPinnedChats(p => p.filter(pid => pid !== id)); };
  const togglePin = (e, id) => { e.stopPropagation(); setPinnedChats(p => p.includes(id) ? p.filter(pid => pid !== id) : [...p, id]); };
  const handleFileChange = (e) => { if (e.target.files) { const filesArray = Array.from(e.target.files).map(file => ({ name: file.name, type: file.type, rawFile: file })); setAttachments(prev => [...prev, ...filesArray]); } e.target.value = null; };
  const hapusAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));
  const handleInputChange = (e) => { const val = e.target.value; if (val.length <= MAX_CHARS) setInput(val); if (val.startsWith("/")) { setShowSlashCommands(true); setCommandFilter(val.substring(1).toLowerCase()); } else setShowSlashCommands(false); };
  const applySlashCommand = (promptText) => { setInput(promptText); setShowSlashCommands(false); textareaRef.current?.focus(); };
  const savePrompt = async () => { if (!newPrompt.command || !newPrompt.prompt) return; if (supabase) { const cmd = newPrompt.command.startsWith('/') ? newPrompt.command : '/' + newPrompt.command; const { error } = await supabase.from('andiie_prompts').upsert({ ...newPrompt, command: cmd }); if (!error) { fetchPrompts(); setNewPrompt({ command: "", description: "", prompt: "" }); } } };
  const deletePrompt = async (id) => { if (supabase) { await supabase.from('andiie_prompts').delete().eq('id', id); fetchPrompts(); } };

  const linkFolder = async () => { try { const handle = await window.showDirectoryPicker({ mode: 'readwrite' }); setDirHandle(handle); alert("Folder lokal berhasil ditautkan!"); } catch (e) { console.error("Gagal", e); } };
  const saveToLocal = async () => {
    if (!dirHandle) return alert("Silakan tautkan folder terlebih dahulu!");
    let savedCount = 0;
    for (const msg of messages) {
      if (msg.role === 'ai') {
        const codeRegex = /```(\w+)?\n([\s\S]*?)```/g; let match;
        while ((match = codeRegex.exec(msg.text)) !== null) {
          const code = match[2]; const fnMatch = code.match(/(?:\/\/|#)\s*FILE:\s*([a-zA-Z0-9._/-]+)/i);
          if (fnMatch) { try { const fileHandle = await dirHandle.getFileHandle(fnMatch[1], { create: true }); const writable = await fileHandle.createWritable(); await writable.write(code); await writable.close(); savedCount++; } catch(e) { console.error(e); } }
        }
      }
    }
    if (savedCount > 0) alert(`Berhasil menimpa ${savedCount} file ke lokal!`); else alert("Tidak ada file ditemukan.");
  };

  const exportChatToZip = async () => {
    const zip = new JSZip(); let fileCount = 0;
    messages.forEach((msg, idx) => {
      if (msg.role === 'ai') {
        const codeRegex = /```(\w+)?\n([\s\S]*?)```/g; let match;
        while ((match = codeRegex.exec(msg.text)) !== null) {
          const lang = match[1] || 'txt'; const code = match[2];
          const fnMatch = code.match(/(?:\/\/|#)\s*FILE:\s*([a-zA-Z0-9._/-]+)/i); const fileName = fnMatch ? fnMatch[1] : `generated_${idx}_${fileCount}.${lang}`; zip.file(fileName, code); fileCount++;
        }
      }
    });
    if (fileCount > 0) { const content = await zip.generateAsync({ type: "blob" }); const url = URL.createObjectURL(content); const a = document.createElement('a'); a.href = url; a.download = `AI_Studio_${Date.now()}.zip`; a.click(); URL.revokeObjectURL(url); } else alert("Tidak ada kode.");
  };
  const generateGitCommit = () => { setInput("Tolong buatkan pesan Git Commit yang profesional berdasarkan seluruh perubahan kode yang kamu berikan."); textareaRef.current?.focus(); };

  const bacaFile = async (file) => {
    if (file.name.endsWith('.zip') || file.type.includes('zip')) {
      try {
        const zip = new JSZip(); const loadedZip = await zip.loadAsync(file); let extractedText = ""; const MAX_CHARS_ZIP = 150000; let isLimitReached = false;
        const badFolders = ['node_modules/', '.git/', 'venv/', 'dist/', 'build/', '.next/', 'out/', '__pycache__/']; const binaryExt = /\.(png|jpg|jpeg|gif|mp4|exe|pdf|ico|svg|lock|map|ttf|woff|woff2|eot|log)$/i;
        for (const relativePath of Object.keys(loadedZip.files)) {
          if (isLimitReached) break; const entry = loadedZip.files[relativePath]; if (entry.dir || badFolders.some(f => relativePath.includes(f)) || binaryExt.test(relativePath)) continue;
          const content = await entry.async('string'); extractedText += `\n\n--- [FILE: ${relativePath}] ---\n${content}\n`; if (extractedText.length > MAX_CHARS_ZIP) { extractedText += `\n\n[ZIP terpotong otomatis.]`; isLimitReached = true; }
        }
        return { type: 'text', name: file.name + " (Extracted)", content: extractedText };
      } catch (error) { return { type: 'text', name: file.name, content: `[Gagal ZIP: ${error.message}]` }; }
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) { reader.onload = (e) => resolve({ type: 'image', name: file.name, content: e.target.result }); reader.readAsDataURL(file); }
      else if (file.type === 'application/pdf') { reader.onload = (e) => resolve({ type: 'application/pdf', name: file.name, content: e.target.result }); reader.readAsDataURL(file); }
      else { reader.onload = (e) => resolve({ type: 'text', name: file.name, content: e.target.result }); reader.readAsText(file); }
    });
  };

  const unduhGambar = async (url) => { try { const res = await fetch(url); if (!res.ok) throw new Error("CORS"); const blob = await res.blob(); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "ai-media." + (blob.type.split('/')[1] || 'png'); document.body.appendChild(link); link.click(); document.body.removeChild(link); } catch { window.open(url, '_blank'); } };

  const initTerminal = useCallback(() => {
    if (!terminalRef.current) return; if (xtermInstance.current) { xtermInstance.current.dispose(); xtermInstance.current = null; }
    const term = new Terminal({ cursorBlink: true, theme: { background: t.bg, foreground: t.text, cursor: t.accent }, fontFamily: '"Fira Code", monospace', fontSize: 13, lineHeight: 1.4 });
    const fitAddon = new FitAddon(); term.loadAddon(fitAddon); term.open(terminalRef.current); setTimeout(() => fitAddon.fit(), 50); xtermInstance.current = term; fitAddonRef.current = fitAddon;
    const resizeHandler = () => { if (fitAddonRef.current) fitAddonRef.current.fit(); }; window.addEventListener('resize', resizeHandler); return () => window.removeEventListener('resize', resizeHandler);
  }, [t]);

  const connectSSH = async (e) => {
    e.preventDefault(); setSshStatus("connecting"); initTerminal();
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"; const wsUrl = BACKEND_URL.replace(/^http/, 'ws') + '/api/terminal/ws';
    const ws = new WebSocket(wsUrl); wsInstance.current = ws;
    ws.onopen = () => { ws.send(JSON.stringify(sshCreds)); setSshStatus("connected"); };
    ws.onmessage = (event) => { if (xtermInstance.current) xtermInstance.current.write(event.data); };
    ws.onclose = () => { setSshStatus("disconnected"); if (xtermInstance.current) xtermInstance.current.write('\r\n\x1b[31m[Koneksi Ditutup]\x1b[0m\r\n'); };
    ws.onerror = () => { setSshStatus("disconnected"); };
    if (xtermInstance.current) { xtermInstance.current.onData((data) => { if (ws.readyState === WebSocket.OPEN) ws.send(data); }); }
  };
  const disconnectSSH = () => { if (wsInstance.current) wsInstance.current.close(); setSshStatus("disconnected"); };

  const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  // Sorted sessions: pinned first
  const sortedSessions = useMemo(() => {
    const pinned = sessions.filter(s => pinnedChats.includes(s.id));
    const unpinned = sessions.filter(s => !pinnedChats.includes(s.id));
    return { pinned, unpinned };
  }, [sessions, pinnedChats]);

  // ==============================================
  // KIRIM PESAN
  // ==============================================
  const kirimPesan = async () => {
    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;
    if (isStreaming) return;

    const instruksiUser = trimmed || "Tolong analisis file lampiran ini.";
    setInput(""); setShowSlashCommands(false); setIsStreaming(true); setActiveRoute(null);

    const fileYangDiproses = await Promise.all(attachments.map(a => bacaFile(a.rawFile)));
    const historyKirim = [...messages];

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString(); setCurrentSessionId(sessionId);
      const judulBaru = instruksiUser.length > 30 ? instruksiUser.substring(0, 30) + "…" : instruksiUser;
      setSessions(prev => [{ id: sessionId, title: judulBaru, messages: [] }, ...prev]);
    }

    const teksTampilan = attachments.length > 0 ? `📎 ${attachments.map(a => a.name).join(', ')}\n\n${instruksiUser}` : instruksiUser;
    const timestamp = Date.now();
    setMessages(prev => [...prev, { role: "user", text: teksTampilan, timestamp }, { role: "ai", text: "", timestamp: Date.now() }]);

    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
    let finalModel = selectedModel;
    let instruksiKeBackend = instruksiUser;
    const lowerInput = instruksiUser.toLowerCase();

    let detectedIntent = "GENERAL";

    if (isCodingMode) {
      detectedIntent = "CODE";
    } else if (isExamMode) {
      detectedIntent = "EXAM";
    } else if (attachments.some(a => a.type === 'image') && /(apa ini|kegunaan|jelaskan|fungsi)/i.test(lowerInput)) {
      detectedIntent = "VISION";
    } else {
      let apiSukses = false;
      try {
        if (OPENAI_API_KEY) {
          const intentRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST", headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [ { role: "system", content: "Kategorikan pesan user ke dalam SATU KATA ini saja: IMAGE, AUDIO, RESEARCH, TRANSLATE, atau GENERAL." }, { role: "user", content: instruksiUser } ],
              temperature: 0.1, max_tokens: 10
            })
          });
          if (intentRes.ok) {
             const intentData = await intentRes.json();
             const apiIntent = intentData.choices?.[0]?.message?.content?.trim().toUpperCase();
             if (["IMAGE", "AUDIO", "RESEARCH", "TRANSLATE"].includes(apiIntent)) {
                 detectedIntent = apiIntent;
                 apiSukses = true;
             }
          }
        }
      } catch (e) { console.warn("API Manager timeout, berpindah ke sistem mandiri (Regex)"); }

      if (!apiSukses && detectedIntent === "GENERAL") {
         if (/(buat|bikin|generate|lukis|cipta|tolong gambarkan).*(gambar|foto|logo|ilustrasi|karakter|lukisan)/i.test(lowerInput) || lowerInput === "buat gambar" || lowerInput === "bikin gambar") {
           detectedIntent = "IMAGE";
         } else if (/(buat|bikin|generate|cipta|nyanyi).*(lagu|musik|nada|audio|mp3|nyanyian)/i.test(lowerInput)) {
           detectedIntent = "AUDIO";
         } else if (/(riset|cari tahu|telusuri|jurnal|search)/i.test(lowerInput)) {
           detectedIntent = "RESEARCH";
         } else if (/(artikan|terjemah|translate)/i.test(lowerInput)) {
           detectedIntent = "TRANSLATE";
         }
      }
    }

    if (detectedIntent === "IMAGE") {
      finalModel = "openai/dall-e-3"; instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Hasilkan prompt gambar berbahasa Inggris detail untuk DALL-E 3.]`;
    } else if (detectedIntent === "AUDIO") {
      finalModel = "suno-api-custom"; instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Buatkan lirik lagu yang bagus berdasarkan permintaan ini.]`;
    } else if (detectedIntent === "RESEARCH") {
      finalModel = "SEARCH_MODE"; instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Lakukan Deep Research ke web terpercaya. Rangkum menjadi format jurnal.]`;
    } else if (detectedIntent === "TRANSLATE") {
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Terjemahkan teks dengan akurat, natural, sekelas native speaker.]`;
    } else if (detectedIntent === "VISION") {
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Analisis spesifikasi, kegunaan gambar ini secara presisi layaknya Google Lens AI.]`;
    } else if (detectedIntent === "CODE") {
      if (finalModel === "auto_coding" || finalModel === "auto") finalModel = "lokal";
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Mode Koding AKTIF. Bertindaklah sebagai Senior AI Architect. JANGAN memberikan kode mentah. WAJIB: 1) Jelaskan arsitektur. 2) Panduan instalasi. 3) Pastikan kode produksi.]`;
    } else if (detectedIntent === "EXAM") {
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Mode Ujian AKTIF. Bertindaklah sebagai Sensei penguji. Berikan 1 soal pilihan ganda interaktif. JANGAN berikan jawaban sebelum dijawab.]`;
    } else {
      if (finalModel === "auto_coding" || finalModel === "auto") finalModel = "google/gemma-4-31b-it";
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Mode Chat Biasa. Anda cerdas seperti ChatGPT. Jawablah secara RINGKAS dan to the point untuk menghemat token.]`;
    }

    if (activeProject) instruksiKeBackend += `\n\n[PROJECT CONTEXT: Proyek aktif: "${activeProject.name}". Aturan khusus: ${activeProject.context}. Selalu ikuti aturan ini.]`;

    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

      let respon = await fetch(`${BACKEND_URL}/api/chat/stream`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruksi: instruksiKeBackend, history: historyKirim, paksa_model: finalModel, kunci_rahasia: "KODE_RAHASIA_ANDIIE_2026", persona: selectedPersona, attachments: fileYangDiproses })
      });

      let bufferText = "";
      let isLocalDead = false;
      const reader = respon.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        if (finalModel === "lokal" && (chunk.includes("Error sistem lokal") || chunk.includes("Failed to fetch") || chunk.includes("Connection refused"))) {
            isLocalDead = true;
            break;
        }

        if (chunk.includes("RUTE_AKTIF:")) {
          const ruteMatch = chunk.match(/RUTE_AKTIF:(.*?)\n\n/); if (ruteMatch) setActiveRoute(ruteMatch[1]); bufferText += chunk.replace(/RUTE_AKTIF:.*\n\n/, "");
        } else {
          bufferText += chunk;
        }
        setMessages(prev => { const n = [...prev]; n[n.length - 1] = { ...n[n.length - 1], text: bufferText }; return n; });
      }

      if (isLocalDead && (selectedModel === "auto_coding" || detectedIntent === "CODE")) {
         setMessages(prev => { const n = [...prev]; n[n.length - 1] = { ...n[n.length - 1], text: "🔄 *[Mesin Lokal Offline. Mengalihkan ke Cloud AI (Qwen Coder)...]*\n\n" }; return n; });

         finalModel = "qwen/qwen3-coder-next";
         const respon2 = await fetch(`${BACKEND_URL}/api/chat/stream`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ instruksi: instruksiKeBackend, history: historyKirim, paksa_model: finalModel, kunci_rahasia: "KODE_RAHASIA_ANDIIE_2026", persona: selectedPersona, attachments: fileYangDiproses })
         });

         let bufferCloud = "🔄 *[Mesin Lokal Offline. Mengalihkan ke Cloud AI (Qwen Coder)...]*\n\n";
         const reader2 = respon2.body.getReader();

         while (true) {
             const { done, value } = await reader2.read();
             if (done) break;
             bufferCloud += decoder.decode(value, { stream: true });
             setMessages(prev => { const n = [...prev]; n[n.length - 1] = { ...n[n.length - 1], text: bufferCloud }; return n; });
         }
      }

    } catch (error) {
      setMessages(prev => { const n = [...prev]; n[n.length - 1] = { ...n[n.length - 1], text: `⚠️ **Koneksi Backend Gagal**\n\nServer Google Cloud Run Anda tidak merespons.\n\n\`Error: ${error.message}\`` }; return n; });
    } finally { setIsStreaming(false); setAttachments([]); }
  };

  // =====================================
  // LOGIN SCREEN
  // =====================================
  if (!isLoggedIn) {
    return (
      <div className="h-dvh flex items-center justify-center p-4" style={{ background: t.bg }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl w-full max-w-sm shadow-2xl border" style={{ background: t.bgSecondary, borderColor: t.border }}>
          <div className="flex justify-center mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg`}>
              <Sparkles className="text-white" size={28} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-1" style={{ color: t.text }}>AI Studio Pro</h2>
          <p className="text-center text-sm mb-6" style={{ color: t.textMuted }}>Masuk untuk melanjutkan</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="text" placeholder="Nama Pengguna" className="w-full rounded-xl px-4 py-3.5 text-sm outline-none border transition-colors" style={{ background: t.bgTertiary, borderColor: t.border, color: t.text }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} />
            <input type="password" placeholder="Sandi" className="w-full rounded-xl px-4 py-3.5 text-sm outline-none border transition-colors" style={{ background: t.bgTertiary, borderColor: t.border, color: t.text }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
            {loginError && <p className="text-xs text-center" style={{ color: t.danger }}>{loginError}</p>}
            <button className={`w-full bg-gradient-to-r ${t.gradient} text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg`}>Masuk</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // =====================================
  // MAIN UI
  // =====================================
  return (
    <div className="flex h-dvh overflow-hidden transition-colors" style={{ background: t.bg, color: t.text }}>

      {/* ========== SIDEBAR ========== */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {isMobile && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />}
            <motion.aside
              initial={isMobile ? { x: "-100%" } : { width: 0, opacity: 0 }}
              animate={isMobile ? { x: 0 } : { width: 280, opacity: 1 }}
              exit={isMobile ? { x: "-100%" } : { width: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 w-[280px]' : 'relative'} flex flex-col shrink-0 border-r overflow-hidden`}
              style={{ background: t.sidebarBg, borderColor: t.border }}
            >
              {/* Sidebar Header */}
              <div className="p-3 flex items-center gap-2 shrink-0">
                <button onClick={buatChatBaru} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all active:scale-[0.97]" style={{ background: t.bgSecondary, borderColor: t.border, color: t.text }}
                  onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                  onMouseLeave={e => e.currentTarget.style.background = t.bgSecondary}
                >
                  <Plus size={16} /> Chat Baru
                </button>
                {isMobile ? (
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl" style={{ color: t.textMuted }}><X size={18} /></button>
                ) : (
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl transition-colors" style={{ color: t.textMuted }} title="Tutup Sidebar (⌘B)"
                    onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <ChevronsLeft size={18} />
                  </button>
                )}
              </div>

              {/* Search Button */}
              <div className="px-3 pb-2 shrink-0">
                <button onClick={() => setIsSearchOpen(true)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm border transition-colors" style={{ borderColor: t.border, color: t.textMuted }}
                  onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Search size={14} /> <span className="flex-1 text-left">Cari...</span>
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: t.border, color: t.textMuted }}>⌘K</kbd>
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1" style={{ scrollbarWidth: 'none' }}>
                {/* Quick Access */}
                <div className="space-y-0.5 mb-3">
                  <button onClick={() => setIsProjectsOpen(true)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ color: activeProject ? t.warning : t.textSecondary }}
                    onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="flex items-center gap-2.5"><Folder size={15} />{activeProject ? activeProject.name : "Proyek"}</span><ChevronRight size={14} className="opacity-40" />
                  </button>
                  <button onClick={() => setIsGalleryOpen(true)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ color: t.textSecondary }}
                    onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <ImageIcon size={15} />Galeri Media
                    {generatedMedia.length > 0 && <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: t.bgTertiary, color: t.textMuted }}>{generatedMedia.length}</span>}
                  </button>
                  <button onClick={() => setIsManagePromptOpen(true)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ color: t.textSecondary }}
                    onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={15} />Kelola Prompt
                  </button>
                </div>

                {/* Pinned Chats */}
                {sortedSessions.pinned.length > 0 && (
                  <>
                    <div className="text-[10px] font-semibold uppercase tracking-wider px-3 py-2 flex items-center gap-1.5" style={{ color: t.textMuted }}>
                      <Pin size={10} /> Disematkan
                    </div>
                    {sortedSessions.pinned.map(sesi => (
                      <div key={sesi.id} onClick={() => muatChatLama(sesi.id)} className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors" style={{ background: currentSessionId === sesi.id ? t.accentBg : 'transparent', color: currentSessionId === sesi.id ? t.accent : t.textSecondary }}
                        onMouseEnter={e => { if (currentSessionId !== sesi.id) e.currentTarget.style.background = t.bgTertiary; }}
                        onMouseLeave={e => { if (currentSessionId !== sesi.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Pin size={12} className="shrink-0 opacity-50" style={{ color: t.warning }} />
                        <span className="flex-1 truncate text-sm">{sesi.title}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
                          <button onClick={(e) => togglePin(e, sesi.id)} className="p-1 rounded" style={{ color: t.warning }}><Pin size={12} /></button>
                          <button onClick={(e) => hapusChat(e, sesi.id)} className="p-1 hover:text-red-400 rounded"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* All Chats */}
                <div className="text-[10px] font-semibold uppercase tracking-wider px-3 py-2" style={{ color: t.textMuted }}>Riwayat</div>
                {sortedSessions.unpinned.length === 0 && sortedSessions.pinned.length === 0 && (
                  <div className="text-center text-xs py-8" style={{ color: t.textMuted }}>Belum ada percakapan</div>
                )}
                {sortedSessions.unpinned.map(sesi => (
                  <div key={sesi.id} onClick={() => muatChatLama(sesi.id)} className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors" style={{ background: currentSessionId === sesi.id ? t.accentBg : 'transparent', color: currentSessionId === sesi.id ? t.accent : t.textSecondary }}
                    onMouseEnter={e => { if (currentSessionId !== sesi.id) e.currentTarget.style.background = t.bgTertiary; }}
                    onMouseLeave={e => { if (currentSessionId !== sesi.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <MessageSquare size={13} className="shrink-0 opacity-50" />
                    <span className="flex-1 truncate text-sm">{sesi.title}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
                      <button onClick={(e) => togglePin(e, sesi.id)} className="p-1 rounded" style={{ color: t.textMuted }}><Pin size={12} /></button>
                      <button onClick={(e) => hapusChat(e, sesi.id)} className="p-1 hover:text-red-400 rounded"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar Footer */}
              <div className="p-3 border-t shrink-0 space-y-1" style={{ borderColor: t.border }}>
                <button onClick={() => setIsThemePickerOpen(true)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors" style={{ color: t.textSecondary }}
                  onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Palette size={14} /> Tema: {t.name}
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors" style={{ color: t.textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.danger; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}
                >
                  <LogOut size={14} /> Keluar
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* ===== HEADER ===== */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-12 md:h-14 px-2 md:px-4 border-b shrink-0 backdrop-blur-xl" style={{ background: t.headerBg, borderColor: t.border }}>
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg transition-colors shrink-0" style={{ color: t.textSecondary }} title="Buka Sidebar (⌘B)"
                onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {isMobile ? <Menu size={20} /> : <ChevronsRight size={20} />}
              </button>
            )}

            {/* Model Dropdown */}
            <div className="relative min-w-0">
              <button onClick={(e) => { e.stopPropagation(); setShowModelDropdown(p => !p); }} className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors border" style={{ background: t.bgSecondary, borderColor: t.border, color: t.textSecondary }}>
                <span className="truncate max-w-[100px] md:max-w-[200px]">{currentModelLabel}</span><ChevronDown size={14} className="opacity-50 shrink-0" />
              </button>

              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-2 w-72 rounded-2xl border shadow-2xl overflow-hidden z-50" style={{ background: t.bgSecondary, borderColor: t.border }}>
                    <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                      {modelGroups.map((group, gi) => (
                        <div key={gi}>
                          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider sticky top-0" style={{ background: t.bg, color: t.textMuted }}>{group.label}</div>
                          {group.models.map(model => (
                            <button key={model.value} onClick={() => { setSelectedModel(model.value); setShowModelDropdown(false); setIsCodingMode(model.value === "auto_coding" || model.value.includes("coder") || model.value.includes("claude")); setIsExamMode(false); }} className="w-full text-left px-4 py-2.5 text-sm transition-colors" style={{ color: selectedModel === model.value ? t.accent : t.textSecondary, background: selectedModel === model.value ? t.accentBg : 'transparent', fontWeight: selectedModel === model.value ? 600 : 400 }}
                              onMouseEnter={e => { if (selectedModel !== model.value) e.currentTarget.style.background = t.bgTertiary; }}
                              onMouseLeave={e => { if (selectedModel !== model.value) e.currentTarget.style.background = 'transparent'; }}
                            >
                              {model.label}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
            {/* Mode Buttons */}
            <button onClick={() => { const nm = !isCodingMode; setIsCodingMode(nm); setIsExamMode(false); setSelectedModel(nm ? "auto_coding" : "auto"); }} className="flex items-center gap-1 px-2 md:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border" style={{ borderColor: isCodingMode ? t.accent + '80' : 'transparent', background: isCodingMode ? t.accentBg : 'transparent', color: isCodingMode ? t.accent : t.textMuted }} title="Mode Koding">
              <Code size={14} /> <span className="hidden lg:inline">Koding</span>
            </button>

            <button onClick={() => { const nm = !isExamMode; setIsExamMode(nm); setIsCodingMode(false); setSelectedModel(nm ? "auto" : "auto"); }} className="flex items-center gap-1 px-2 md:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border" style={{ borderColor: isExamMode ? t.success + '80' : 'transparent', background: isExamMode ? 'rgba(34,197,94,0.12)' : 'transparent', color: isExamMode ? t.success : t.textMuted }} title="Mode Ujian">
              <GraduationCap size={14} /> <span className="hidden lg:inline">Ujian</span>
            </button>

            {/* Desktop-only tools */}
            {messages.length > 0 && !isMobile && (
              <>
                <div className="w-px h-5 mx-1" style={{ background: t.border }} />
                <button onClick={exportChatToZip} title="Export ZIP" className="p-2 rounded-lg transition-colors" style={{ color: t.textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.text; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}
                ><Archive size={17} /></button>
                <button onClick={generateGitCommit} title="Git Commit" className="p-2 rounded-lg transition-colors" style={{ color: t.textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.text; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}
                ><GitCommit size={17} /></button>
// FILE: src/App.jsx (LANJUTAN - gabungkan dengan bagian 1)
// Mulai dari baris setelah <button onClick={generateGitCommit}...>

                <button onClick={saveToLocal} title={dirHandle ? "Simpan ke Folder" : "Tautkan Folder"} className="p-2 rounded-lg transition-colors border" style={{ borderColor: dirHandle ? t.accent + '50' : 'transparent', background: dirHandle ? t.accentBg : 'transparent', color: dirHandle ? t.accent : t.textMuted }}
                  onMouseEnter={e => { if (!dirHandle) { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.text; }}}
                  onMouseLeave={e => { if (!dirHandle) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}}
                ><FolderSync size={17} /></button>
              </>
            )}

            {!isMobile && (
              <>
                <div className="w-px h-5 mx-1" style={{ background: t.border }} />
                <button onClick={() => { setIsPreviewOpen(true); setActiveCanvasTab("terminal"); }} title="Terminal" className="p-2 rounded-lg transition-colors" style={{ color: t.textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.success; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}
                ><TerminalSquare size={17} /></button>

                {isPreviewOpen ? (
                  <button onClick={() => setIsPreviewOpen(false)} title="Tutup Panel" className="p-2 rounded-lg" style={{ color: t.accent, background: t.accentBg }}><PanelRightClose size={17} /></button>
                ) : (
                  previewCode && <button onClick={() => setIsPreviewOpen(true)} title="Buka Panel" className="p-2 rounded-lg transition-colors" style={{ color: t.textMuted }}
                    onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  ><PanelRightOpen size={17} /></button>
                )}
              </>
            )}

            <button onClick={() => setIsThemePickerOpen(true)} className="p-2 rounded-lg transition-colors" style={{ color: t.textMuted }} title="Ganti Tema"
              onMouseEnter={e => { e.currentTarget.style.background = t.accentBg; e.currentTarget.style.color = t.accent; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}
            >
              <Palette size={17} />
            </button>
          </div>
        </header>

        {/* ===== CONTENT AREA ===== */}
        <div className="flex-1 flex min-h-0">

          {/* ===== CHAT AREA ===== */}
          <div className={`flex-1 flex flex-col min-w-0 ${isPreviewOpen && !isMobile ? 'border-r' : ''}`} style={{ borderColor: t.border }}>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth: 'thin', scrollbarColor: `${t.scrollThumb} ${t.scrollTrack}` }}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-4 md:px-6">
                  <div className="max-w-lg w-full text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                      className={`w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-xl mb-5`}
                    >
                      <Sparkles className="text-white" size={32} />
                    </motion.div>
                    <motion.h1
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: t.text }}
                    >
                      Siap membantu Anda, Andi.
                    </motion.h1>
                    <motion.p
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm leading-relaxed"
                      style={{ color: t.textMuted }}
                    >
                      {isExamMode ? "Mulai belajar untuk JLPT N2 atau Sertifikasi Kebersihan? Unggah modul PDF Anda." : "Ketik instruksi, unggah file, atau gunakan / untuk perintah cepat."}
                    </motion.p>

                    {/* Status Badges */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap justify-center gap-2 mt-4"
                    >
                      {activeProject && <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ background: 'rgba(245,158,11,0.1)', color: t.warning, borderColor: 'rgba(245,158,11,0.2)' }}><Folder size={12} /> {activeProject.name}</div>}
                      {isCodingMode && <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ background: t.accentBg, color: t.accent, borderColor: t.accent + '30' }}><Code size={12} /> Mode Koding</div>}
                      {isExamMode && <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ background: 'rgba(34,197,94,0.1)', color: t.success, borderColor: 'rgba(34,197,94,0.2)' }}><GraduationCap size={12} /> Mode Ujian</div>}
                      {dirHandle && <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ background: 'rgba(34,197,94,0.1)', color: t.success, borderColor: 'rgba(34,197,94,0.2)' }}><FolderSync size={12} /> {dirHandle.name}</div>}
                    </motion.div>

                    {/* Quick Suggestions */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-md mx-auto"
                    >
                      {[
                        { icon: Code, text: "Buatkan landing page", color: t.accent },
                        { icon: ImageIcon, text: "Buat gambar kucing lucu", color: '#ec4899' },
                        { icon: FileText, text: "Ringkas dokumen ini", color: t.warning },
                        { icon: Music, text: "Buat lagu tentang kopi", color: t.success },
                      ].map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => { setInput(sug.text); textareaRef.current?.focus(); }}
                          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-left border transition-all"
                          style={{ borderColor: t.border, color: t.textSecondary }}
                          onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.borderColor = sug.color + '40'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = t.border; }}
                        >
                          <sug.icon size={16} style={{ color: sug.color }} />
                          <span className="truncate">{sug.text}</span>
                        </button>
                      ))}
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div>
                  {messages.map((chat, idx) => (
                    <MessageBubble
                      key={idx}
                      chat={chat}
                      idx={idx}
                      isLast={idx === messages.length - 1}
                      isStreaming={isStreaming}
                      t={t}
                      setActiveCanvasTab={setActiveCanvasTab}
                      setIsPreviewOpen={setIsPreviewOpen}
                      setPreviewCode={setPreviewCode}
                    />
                  ))}
                  <div ref={chatEndRef} className="h-4" />
                </div>
              )}

              {/* Scroll to Bottom FAB */}
              <AnimatePresence>
                {showScrollBottom && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 p-2.5 rounded-full shadow-xl border transition-all active:scale-90"
                    style={{ background: t.bgSecondary, borderColor: t.border, color: t.textSecondary }}
                  >
                    <ArrowDown size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ===== INPUT BAR ===== */}
            <div className="shrink-0 px-2 md:px-4 pb-[env(safe-area-inset-bottom,8px)] pt-2" style={{ paddingBottom: `max(env(safe-area-inset-bottom, 8px), 8px)`, background: t.bg }}>
              <div className="max-w-3xl mx-auto relative">

                {/* Slash Commands */}
                <AnimatePresence>
                  {showSlashCommands && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-full mb-2 left-0 w-full md:w-80 rounded-2xl border shadow-2xl overflow-hidden z-50" style={{ background: t.bgSecondary, borderColor: t.border }}>
                      <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider border-b flex items-center gap-1.5" style={{ color: t.textMuted, borderColor: t.border, background: t.bg }}>
                        <Zap size={14} style={{ color: t.warning }} /> Perintah Cepat
                      </div>
                      <div className="max-h-56 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        {allPrompts.filter(c => c.command.toLowerCase().includes(commandFilter)).map((cmd, i) => (
                          <button key={i} onClick={() => applySlashCommand(cmd.prompt)} className="w-full text-left px-4 py-3 transition-colors border-b last:border-0" style={{ borderColor: t.border + '50' }}
                            onMouseEnter={e => e.currentTarget.style.background = t.bgTertiary}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span className="font-semibold text-sm" style={{ color: t.accent }}>{cmd.command}</span>
                            <span className="block text-xs mt-1 truncate" style={{ color: t.textMuted }}>{cmd.description}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attachments.map((file, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm"
                        style={{ background: t.bgSecondary, borderColor: t.border, color: t.textSecondary }}
                      >
                        <Paperclip size={12} className="opacity-50" />
                        <span className="truncate max-w-[100px] md:max-w-[120px]">{file.name}</span>
                        <button onClick={() => hapusAttachment(idx)} className="ml-1 transition-colors" style={{ color: t.textMuted }}
                          onMouseEnter={e => e.currentTarget.style.color = t.danger}
                          onMouseLeave={e => e.currentTarget.style.color = t.textMuted}
                        ><X size={12} /></button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Input Container */}
                <div className="rounded-2xl border shadow-sm transition-all" style={{ background: t.bgInput, borderColor: t.border }}
                  onFocus={() => {}}
                >
                  <textarea
                    ref={textareaRef}
                    className="w-full bg-transparent text-[15px] outline-none resize-none px-3 md:px-4 pt-3 md:pt-4 pb-1 md:pb-2 leading-relaxed"
                    style={{ color: t.text, maxHeight: '200px', caretColor: t.accent }}
                    placeholder="Ketik pesan Anda di sini..."
                    rows="1"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirimPesan(); } }}
                    disabled={isStreaming}
                    onFocus={e => e.target.closest('.rounded-2xl').style.borderColor = t.borderFocus}
                    onBlur={e => e.target.closest('.rounded-2xl').style.borderColor = t.border}
                  />

                  <div className="flex items-center justify-between px-2 md:px-3 pb-2 md:pb-3 pt-0 md:pt-1">
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl transition-colors" style={{ color: t.textMuted }} title="Lampirkan File"
                        onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}
                      ><Paperclip size={18} /></button>

                      {!dirHandle && !isMobile && (
                        <button onClick={linkFolder} className="p-2 rounded-xl transition-colors" style={{ color: t.textMuted }} title="Tautkan Folder"
                          onMouseEnter={e => { e.currentTarget.style.background = t.bgTertiary; e.currentTarget.style.color = t.success; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; }}
                        ><FolderSync size={18} /></button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                      {/* Character Counter */}
                      {charCount > 0 && (
                        <span className="text-[10px] font-mono tabular-nums hidden md:block" style={{ color: charCount > MAX_CHARS * 0.9 ? t.danger : t.textMuted }}>
                          {charCount.toLocaleString()}/{MAX_CHARS.toLocaleString()}
                        </span>
                      )}

                      {/* Active Route */}
                      {activeRoute && <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block" style={{ color: t.textMuted }}>{activeRoute}</span>}

                      {/* Keyboard Hint (Desktop) */}
                      {!isMobile && !isStreaming && input.trim() && (
                        <span className="text-[10px] hidden md:flex items-center gap-1" style={{ color: t.textMuted }}>
                          <kbd className="px-1.5 py-0.5 rounded border font-mono text-[9px]" style={{ borderColor: t.border }}>Enter</kbd> kirim
                        </span>
                      )}

                      <button
                        onClick={kirimPesan}
                        disabled={isStreaming || (!input.trim() && attachments.length === 0)}
                        className={`p-2 md:p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 ${isStreaming || (!input.trim() && attachments.length === 0) ? '' : `bg-gradient-to-r ${t.gradient} shadow-lg`}`}
                        style={isStreaming || (!input.trim() && attachments.length === 0) ? { background: t.bgTertiary, color: t.textMuted } : { color: 'white' }}
                      >
                        {isStreaming ? <StopCircle size={18} /> : <Send size={18} className="ml-0.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-center text-[10px] mt-2 md:mt-3" style={{ color: t.textMuted }}>
                  AI dapat berhalusinasi. Mohon periksa kembali informasi penting.
                </p>
              </div>
            </div>
          </div>

          {/* ===== CANVAS / PREVIEW PANEL ===== */}
          <AnimatePresence>
            {isPreviewOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: isMobile ? '100%' : '50%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                className={`flex flex-col overflow-hidden shrink-0 ${isMobile ? 'absolute inset-0 z-40' : ''} border-l`}
                style={{ background: t.bg, borderColor: t.border }}
              >
                {/* Canvas Header */}
                <div className="flex items-center justify-between h-12 px-3 border-b shrink-0" style={{ borderColor: t.border, background: t.sidebarBg }}>
                  <div className="flex items-center gap-1">
                    {["preview", "code", "terminal"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveCanvasTab(tab)}
                        className="px-3 md:px-4 py-2 text-xs font-bold capitalize transition-all rounded-lg flex items-center gap-1.5"
                        style={{
                          color: activeCanvasTab === tab ? t.text : t.textMuted,
                          background: activeCanvasTab === tab ? t.bgTertiary : 'transparent',
                          borderWidth: activeCanvasTab === tab ? 1 : 0,
                          borderColor: activeCanvasTab === tab ? t.border : 'transparent',
                        }}
                      >
                        {tab === 'preview' && <Play size={13} />}
                        {tab === 'code' && <Code size={13} />}
                        {tab === 'terminal' && <TerminalSquare size={13} />}
                        <span className="hidden md:inline">{tab}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setIsPreviewOpen(false)} className="p-2 rounded-lg transition-colors" style={{ color: t.textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.color = t.danger; e.currentTarget.style.background = t.bgTertiary; }}
                    onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.background = 'transparent'; }}
                  ><X size={18} /></button>
                </div>

                {/* Canvas Body */}
                <div className="flex-1 relative overflow-hidden">
                  {activeCanvasTab === "code" && (
                    <textarea
                      value={previewCode}
                      onChange={(e) => setPreviewCode(e.target.value)}
                      className="absolute inset-0 w-full h-full bg-transparent font-mono text-[13px] p-4 md:p-6 outline-none resize-none leading-relaxed"
                      style={{ color: t.textSecondary, caretColor: t.accent }}
                      spellCheck="false"
                    />
                  )}

                  {activeCanvasTab === "preview" && (
                    <div className="absolute inset-0 bg-white">
                      <iframe title="Preview" srcDoc={previewCode} className="w-full h-full border-none" sandbox="allow-scripts allow-modals allow-same-origin" />
                    </div>
                  )}

                  {activeCanvasTab === "terminal" && (
                    <div className="absolute inset-0 flex flex-col" style={{ background: t.bg }}>
                      {sshStatus === "disconnected" ? (
                        <div className="flex-1 flex items-center justify-center p-4">
                          <form onSubmit={connectSSH} className="w-full max-w-xs space-y-4 p-6 rounded-2xl border shadow-xl" style={{ background: t.bgSecondary, borderColor: t.border }}>
                            <div className="text-center mb-6">
                              <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 border" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)' }}>
                                <Server size={24} style={{ color: t.success }} />
                              </div>
                              <h3 className="font-bold text-base" style={{ color: t.text }}>SSH Terminal Remote</h3>
                            </div>
                            {['host', 'username', 'password'].map((field) => (
                              <input
                                key={field}
                                required
                                type={field === 'password' ? 'password' : 'text'}
                                placeholder={field === 'host' ? 'IP Host (misal: 192.168.1.5)' : field === 'username' ? 'Username' : 'Password'}
                                className="w-full text-sm p-3 rounded-xl border outline-none transition-colors"
                                style={{ background: t.bg, borderColor: t.border, color: t.text }}
                                onFocus={e => e.target.style.borderColor = t.success}
                                onBlur={e => e.target.style.borderColor = t.border}
                                value={sshCreds[field]}
                                onChange={e => setSshCreds({...sshCreds, [field]: e.target.value})}
                              />
                            ))}
                            <button
                              type="submit"
                              className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 text-white shadow-lg"
                              style={{ background: sshStatus === "connecting" ? t.warning : t.success }}
                            >
                              {sshStatus === "connecting" ? "Menghubungi..." : "Hubungkan"}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div className="text-xs px-4 py-2.5 border-b flex justify-between items-center" style={{ background: t.sidebarBg, borderColor: t.border, color: t.textSecondary }}>
                            <span className="font-mono flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.success }} />
                              {sshCreds.username}@{sshCreds.host}
                            </span>
                            <button onClick={disconnectSSH} className="font-bold px-2 py-1 rounded transition-colors" style={{ color: t.danger }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >Putuskan</button>
                          </div>
                          <div ref={terminalRef} className="flex-1 p-2 overflow-hidden" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========== ALL MODALS ========== */}

      {/* Theme Picker */}
      <ThemePicker isOpen={isThemePickerOpen} onClose={() => setIsThemePickerOpen(false)} currentTheme={themeId} onSelect={setThemeId} t={t} />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} sessions={sessions} onSelect={muatChatLama} t={t} />

      {/* Projects Modal */}
      <Modal isOpen={isProjectsOpen} onClose={() => setIsProjectsOpen(false)} t={t} maxWidth="max-w-2xl">
        <div className="p-5 border-b flex justify-between items-center shrink-0" style={{ borderColor: t.border }}>
          <div className="flex items-center gap-3"><Layers size={20} style={{ color: t.warning }} /><h2 className="text-xl font-bold" style={{ color: t.text }}>Manajemen Proyek</h2></div>
          <button onClick={() => setIsProjectsOpen(false)} className="p-2 rounded-xl" style={{ color: t.textMuted }}><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6" style={{ scrollbarWidth: 'none' }}>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Buat Proyek Baru</h3>
            <input id="projName" placeholder="Nama Proyek (misal: Robot AI Kartos)" className="w-full p-3.5 rounded-xl text-sm border outline-none transition-colors" style={{ background: t.bgTertiary, borderColor: t.border, color: t.text }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
            <textarea id="projCtx" placeholder="Instruksi khusus proyek..." rows="3" className="w-full p-3.5 rounded-xl text-sm border outline-none resize-none transition-colors" style={{ background: t.bgTertiary, borderColor: t.border, color: t.text }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} />
            <button onClick={() => { const n = document.getElementById('projName')?.value; const c = document.getElementById('projCtx')?.value; if (n) { setProjectsList([...projectsList, { id: Date.now(), name: n, context: c || '' }]); document.getElementById('projName').value = ''; document.getElementById('projCtx').value = ''; } }} className={`w-full text-white py-3 rounded-xl text-sm font-bold shadow-lg transition-colors bg-gradient-to-r ${t.gradient}`}>Buat Proyek</button>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Pilih Proyek Aktif</h3>
            <div onClick={() => setActiveProject(null)} className="p-4 rounded-xl border-2 cursor-pointer transition-all" style={{ borderColor: !activeProject ? t.accent : t.border, background: !activeProject ? t.accentBg : 'transparent' }}>
              <div className="font-bold text-sm" style={{ color: t.textSecondary }}>Tanpa Proyek (Chat Umum)</div>
            </div>
            {projectsList.map(proj => (
              <div key={proj.id} onClick={() => setActiveProject(proj)} className="group p-4 rounded-xl border-2 cursor-pointer transition-all relative" style={{ borderColor: activeProject?.id === proj.id ? t.warning : t.border, background: activeProject?.id === proj.id ? 'rgba(245,158,11,0.08)' : 'transparent' }}>
                <div className="font-bold text-base mb-1" style={{ color: t.warning }}>{proj.name}</div>
                {proj.context && <div className="text-sm line-clamp-2" style={{ color: t.textMuted }}>{proj.context}</div>}
                <button onClick={(e) => { e.stopPropagation(); setProjectsList(projectsList.filter(p => p.id !== proj.id)); if (activeProject?.id === proj.id) setActiveProject(null); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all" style={{ color: t.danger }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                ><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Gallery Modal */}
      <Modal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} t={t} maxWidth="max-w-5xl">
        <div className="p-5 border-b flex justify-between items-center shrink-0" style={{ borderColor: t.border }}>
          <div className="flex items-center gap-3"><ImageIcon size={20} className="text-purple-500" /><h2 className="text-xl font-bold" style={{ color: t.text }}>Galeri Media</h2></div>
          <button onClick={() => setIsGalleryOpen(false)} className="p-2 rounded-xl" style={{ color: t.textMuted }}><X size={18} /></button>
        </div>
        <div className="flex gap-2 p-3 md:p-4 border-b overflow-x-auto shrink-0" style={{ borderColor: t.border, background: t.sidebarBg, scrollbarWidth: 'none' }}>
          {[{ val: 'all', icon: LayoutGrid, label: 'Semua' }, { val: 'image', icon: ImageIcon, label: 'Gambar' }, { val: 'video', icon: Video, label: 'Video' }, { val: 'audio', icon: Volume2, label: 'Audio' }].map(f => (
            <button key={f.val} onClick={() => setGalleryFilter(f.val)} className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all" style={{ background: galleryFilter === f.val ? t.accent : 'transparent', color: galleryFilter === f.val ? 'white' : t.textMuted }}>
              <f.icon size={15} /> {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6" style={{ background: t.bg, scrollbarWidth: 'none' }}>
          {filteredMedia.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4" style={{ color: t.textMuted }}><LayoutGrid size={48} className="opacity-20" /><p className="text-base font-medium">Belum ada media</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {filteredMedia.map((media, i) => (
                <div key={i} className={`group relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-all ${media.type === 'audio' ? 'p-3 md:p-4 flex flex-col' : 'aspect-square'}`} style={{ background: t.bgSecondary, borderColor: t.border }}>
                  {media.type === 'image' && <img src={media.url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
                  {media.type === 'video' && <video src={media.url} className="absolute inset-0 w-full h-full object-cover bg-black" controls muted />}
                  {media.type === 'audio' && <><div className="flex-1 flex items-center justify-center"><Music size={36} className="opacity-20" style={{ color: t.accent }} /></div><CustomAudioPlayer src={media.url} t={t} /></>}
                  {media.type !== 'audio' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 md:p-4 z-10">
                      <span className="text-xs text-white font-medium truncate pr-3">{media.title}</span>
                      <button onClick={() => unduhGambar(media.url)} className="p-2 bg-white/20 hover:bg-blue-500 rounded-xl text-white backdrop-blur-md transition-colors shrink-0 shadow-lg" title="Unduh"><Download size={15} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Manage Prompt Modal */}
      <Modal isOpen={isManagePromptOpen} onClose={() => setIsManagePromptOpen(false)} t={t} maxWidth="max-w-lg">
        <div className="p-5 border-b flex justify-between items-center shrink-0" style={{ borderColor: t.border }}>
          <div className="flex items-center gap-3"><Settings size={20} style={{ color: t.accent }} /><h2 className="text-xl font-bold" style={{ color: t.text }}>Kelola Prompt</h2></div>
          <button onClick={() => setIsManagePromptOpen(false)} className="p-2 rounded-xl" style={{ color: t.textMuted }}><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6" style={{ scrollbarWidth: 'none' }}>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Tambah Prompt Baru</h3>
            <input placeholder="/perintah (misal: /review)" className="w-full p-3.5 rounded-xl text-sm border outline-none transition-colors" style={{ background: t.bgTertiary, borderColor: t.border, color: t.text }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} value={newPrompt.command} onChange={e => setNewPrompt({ ...newPrompt, command: e.target.value })} />
            <input placeholder="Deskripsi singkat" className="w-full p-3.5 rounded-xl text-sm border outline-none transition-colors" style={{ background: t.bgTertiary, borderColor: t.border, color: t.text }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} value={newPrompt.description} onChange={e => setNewPrompt({ ...newPrompt, description: e.target.value })} />
            <textarea placeholder="Isi instruksi AI yang lengkap..." rows="4" className="w-full p-3.5 rounded-xl text-sm border outline-none resize-none transition-colors" style={{ background: t.bgTertiary, borderColor: t.border, color: t.text }} onFocus={e => e.target.style.borderColor = t.accent} onBlur={e => e.target.style.borderColor = t.border} value={newPrompt.prompt} onChange={e => setNewPrompt({ ...newPrompt, prompt: e.target.value })} />
            <button onClick={savePrompt} disabled={!newPrompt.command || !newPrompt.prompt} className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-lg text-white bg-gradient-to-r ${t.gradient}`} style={!newPrompt.command || !newPrompt.prompt ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
              <Save size={16} className="inline mr-2 -mt-0.5" /> Simpan ke Supabase
            </button>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Prompt Tersimpan ({slashCommands.length})</h3>
            {slashCommands.length === 0 && <div className="text-center text-sm py-8 border-dashed border-2 rounded-xl" style={{ borderColor: t.border, color: t.textMuted }}>Belum ada prompt tersimpan</div>}
            {slashCommands.map(cmd => (
              <div key={cmd.id} className="flex justify-between items-center p-4 rounded-xl border group" style={{ background: t.bgTertiary, borderColor: t.border }}>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm mb-1" style={{ color: t.accent }}>{cmd.command}</div>
                  <div className="text-xs truncate" style={{ color: t.textMuted }}>{cmd.description || cmd.prompt?.substring(0, 60)}</div>
                </div>
                <button onClick={() => deletePrompt(cmd.id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all shrink-0 ml-3" style={{ color: t.danger }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                ><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}