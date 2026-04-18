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
  Layers, ChevronRight, ChevronDown, Bot, User, StopCircle,
  PanelRightOpen, PanelRightClose, Search, Hash, Image as ImageIcon,
  Video, Volume2, ExternalLink, MoreHorizontal, LogOut, Folder,
  GraduationCap, FolderSync
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
const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// =====================================
// UTILITY: Auto-resize textarea
// =====================================
const useAutoResize = (ref, value) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value, ref]);
};

// =====================================
// UTILITY: Detect mobile
// =====================================
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
        const imgRegex = /!\[.*?\]\((.*?)\)/g;
        let match;
        while ((match = imgRegex.exec(msg.text)) !== null)
          daftarMedia.push({ type: 'image', url: match[1], title: sesi.title });
        const vidRegex = /\[VIDEO_PLAYER\]\((.*?)\)/g;
        while ((match = vidRegex.exec(msg.text)) !== null)
          daftarMedia.push({ type: 'video', url: match[1], title: sesi.title });
        const audRegex = /\[AUDIO_PLAYER\]\((.*?)\)/g;
        while ((match = audRegex.exec(msg.text)) !== null)
          daftarMedia.push({ type: 'audio', url: match[1], title: sesi.title });
      }
    });
  });
  return daftarMedia.reverse();
};

// =====================================
// SMART CODE BLOCK
// =====================================
const SmartCodeBlock = ({
  inline, className, children, theme,
  setActiveCanvasTab, setIsPreviewOpen, setPreviewCode
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  let language = 'text';

  if (match) {
    language = match[1].toLowerCase();
  } else if (!inline && codeString.includes('\n')) {
    if (codeString.includes('def ') || codeString.includes('import ') || codeString.includes('print('))
      language = 'python';
    else if (codeString.includes('<div') || codeString.includes('<html'))
      language = 'html';
    else language = 'javascript';
  }

  const isBlock = !inline && (codeString.includes('\n') || (className && className.includes('language-')));
  const isRenderable = ['html', 'xml', 'python', 'py'].includes(language);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeString).catch(() => {});
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [codeString]);

  const handlePreview = useCallback(() => {
    let codeToRender = codeString;
    if (language === 'python' || language === 'py') {
      const safeCode = JSON.stringify(codeString).replace(/<\//g, '<\\/');
      codeToRender = `<!DOCTYPE html><html><head><script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"><\/script><style>body{background:${theme === 'dark' ? '#0d1117' : '#fff'};color:${theme === 'dark' ? '#c9d1d9' : '#1f2937'};font-family:monospace;padding:20px;line-height:1.6}#output{white-space:pre-wrap}.ok{color:#3fb950}.err{color:#f85149}</style></head><body><div id="s" style="color:#d29922;font-weight:bold">⏳ Memuat Mesin Python…</div><hr style="border-color:#30363d;margin:16px 0"/><div id="output"></div><script>async function main(){try{let p=await loadPyodide();document.getElementById("s").textContent="⚙️ Menjalankan…";p.setStdout({batched:m=>{document.getElementById("output").textContent+=m+"\\n"}});await p.runPythonAsync(${safeCode});document.getElementById("s").textContent="✅ Selesai";document.getElementById("s").className="ok"}catch(e){document.getElementById("output").textContent+="\\n"+e;document.getElementById("s").textContent="❌ Error";document.getElementById("s").className="err"}}main()<\/script></body></html>`;
    }
    setPreviewCode(codeToRender);
    setIsPreviewOpen(true);
    setActiveCanvasTab("preview");
  }, [codeString, language, theme, setPreviewCode, setIsPreviewOpen, setActiveCanvasTab]);

  if (isBlock) {
    return (
      <div className={`rounded-xl border my-4 overflow-hidden ${
        theme === 'dark'
          ? 'border-[#30363d] bg-[#0d1117]'
          : 'border-gray-200 bg-gray-50'
      }`}>
        <div className={`flex items-center justify-between px-4 py-2 border-b text-xs ${
          theme === 'dark'
            ? 'bg-[#161b22] border-[#30363d] text-gray-400'
            : 'bg-gray-100 border-gray-200 text-gray-500'
        }`}>
          <span className="font-mono font-semibold uppercase tracking-wider text-[10px]">
            {language}
          </span>
          <div className="flex items-center gap-1.5">
            {isRenderable && (
              <button
                onClick={handlePreview}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold
                  bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <Play size={11} fill="currentColor" /> Preview
              </button>
            )}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                isCopied
                  ? 'bg-green-500/15 text-green-400'
                  : 'hover:bg-white/10 text-gray-400 hover:text-gray-200'
              }`}
            >
              {isCopied ? <Check size={11} /> : <Copy size={11} />}
              {isCopied ? "Tersalin" : "Salin"}
            </button>
          </div>
        </div>
        <SyntaxHighlighter
          language={language === 'text' || language === 'code' ? 'javascript' : language}
          style={theme === 'dark' ? vscDarkPlus : oneLight}
          customStyle={{
            margin: 0,
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.6',
            background: 'transparent',
          }}
          wrapLines
          lineProps={(lineNumber) => {
            const line = codeString.split('\n')[lineNumber - 1] || "";
            if (language === 'diff') {
              if (line.startsWith('+'))
                return { style: { backgroundColor: theme === 'dark' ? 'rgba(46,160,67,0.15)' : 'rgba(46,160,67,0.1)', display: 'block' } };
              if (line.startsWith('-'))
                return { style: { backgroundColor: theme === 'dark' ? 'rgba(248,81,73,0.15)' : 'rgba(248,81,73,0.1)', display: 'block' } };
            }
            return {};
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className={`px-1.5 py-0.5 rounded text-[13px] font-mono ${
      theme === 'dark'
        ? 'bg-[#1e1f20] text-[#79c0ff]'
        : 'bg-gray-100 text-pink-600'
    }`}>
      {children}
    </code>
  );
};

// =====================================
// CUSTOM AUDIO PLAYER
// =====================================
const CustomAudioPlayer = ({ src, theme }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  const formatTime = (t) => {
    if (isNaN(t)) return "0:00";
    return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const skip = (amt) => {
    if (audioRef.current) audioRef.current.currentTime += amt;
  };

  return (
    <div className={`w-full max-w-sm flex flex-col gap-2.5 p-3.5 rounded-2xl border my-3 transition-colors ${
      theme === 'dark'
        ? 'bg-[#161b22] border-[#30363d]'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a && a.duration > 0) {
            setProgress((a.currentTime / a.duration) * 100);
            setCurrentTime(formatTime(a.currentTime));
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(formatTime(audioRef.current.duration));
        }}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => skip(-10)}
            className={`p-1.5 rounded-full transition-colors ${
              theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
            }`}>
            <Rewind size={14} />
          </button>
          <button onClick={togglePlay}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 active:scale-95 transition-all shadow-md">
            {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
          </button>
          <button onClick={() => skip(10)}
            className={`p-1.5 rounded-full transition-colors ${
              theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
            }`}>
            <FastForward size={14} />
          </button>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="range" min="0" max="100"
            value={progress || 0}
            onChange={(e) => {
              if (audioRef.current && audioRef.current.duration) {
                audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration;
                setProgress(e.target.value);
              }
            }}
            className="w-full h-1 rounded-full appearance-none cursor-pointer accent-blue-500"
            style={{ background: `linear-gradient(to right, #3b82f6 ${progress}%, ${theme === 'dark' ? '#30363d' : '#e5e7eb'} ${progress}%)` }}
          />
          <div className="flex justify-between">
            <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{currentTime}</span>
            <span className={`text-[10px] font-mono ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================
// MODAL WRAPPER (Reusable)
// =====================================
const Modal = ({ isOpen, onClose, children, theme, maxWidth = "max-w-2xl" }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full ${maxWidth} max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border ${
            theme === 'dark'
              ? 'bg-[#0d1117] border-[#30363d]'
              : 'bg-white border-gray-200'
          }`}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================
// MESSAGE BUBBLE COMPONENT
// =====================================
const MessageBubble = React.memo(({
  chat, idx, isLast, isStreaming, theme,
  setActiveCanvasTab, setIsPreviewOpen, setPreviewCode
}) => {
  const isUser = chat.role === 'user';
  const isAI = chat.role === 'ai';

  return (
    <div className={`group py-5 md:py-6 px-4 md:px-0 transition-colors`}>
      <div className="max-w-3xl mx-auto flex gap-3 md:gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isAI ? (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-600 to-violet-600'
                : 'bg-gradient-to-br from-blue-500 to-violet-500'
            }`}>
              {isStreaming && isLast
                ? <Loader2 className="animate-spin text-white" size={14} />
                : <Sparkles className="text-white" size={14} />
              }
            </div>
          ) : (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-[#1e1f20] border border-[#30363d]'
                : 'bg-gray-100 border border-gray-200'
            }`}>
              <User size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className={`text-xs font-semibold mb-1.5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {isAI ? 'AI Studio' : 'Anda'}
          </div>

          {isAI ? (
            <div className={`prose prose-sm max-w-none break-words leading-relaxed ${
              theme === 'dark' ? 'prose-invert' : 'prose-gray'
            }`}
              style={{
                '--tw-prose-body': theme === 'dark' ? '#c9d1d9' : '#374151',
                '--tw-prose-headings': theme === 'dark' ? '#f0f6fc' : '#111827',
                '--tw-prose-links': '#58a6ff',
              }}
            >
              <ReactMarkdown
                urlTransform={(value) => value}
                components={{
                  code(props) {
                    return (
                      <SmartCodeBlock
                        {...props}
                        theme={theme}
                        setActiveCanvasTab={setActiveCanvasTab}
                        setIsPreviewOpen={setIsPreviewOpen}
                        setPreviewCode={setPreviewCode}
                      />
                    );
                  },
                  a(props) {
                    if (props.children && props.children[0] === 'AUDIO_PLAYER') {
                      return <CustomAudioPlayer src={props.href} theme={theme} />;
                    }
                    return (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 underline-offset-2 hover:decoration-blue-400/60 transition-colors"
                      >
                        {props.children}
                      </a>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-3 last:mb-0 leading-7">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="mb-3 space-y-1.5 list-disc list-outside ml-4">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="mb-3 space-y-1.5 list-decimal list-outside ml-4">{children}</ol>;
                  },
                }}
              >
                {chat.text || (isStreaming && isLast ? '' : '')}
              </ReactMarkdown>

              {/* Streaming cursor */}
              {isStreaming && isLast && !chat.text && (
                <div className="flex gap-1 py-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          ) : (
            <div className={`whitespace-pre-wrap leading-7 ${
              theme === 'dark' ? 'text-[#e6edf3]' : 'text-gray-800'
            }`}>
              {chat.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// =====================================
// MAIN APPLICATION
// =====================================
export default function App() {
  const isMobile = useIsMobile();

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Chat
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);

  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [selectedModel, setSelectedModel] = useState("google/gemma-4-31b-it");
  const [selectedPersona, setSelectedPersona] = useState("default");
  const [attachments, setAttachments] = useState([]);
  
  // ⚡ STATE: Coding Mode, Exam Mode & Local Directory Sync
  const [isCodingMode, setIsCodingMode] = useState(false);
  const [isExamMode, setIsExamMode] = useState(false);
  const [dirHandle, setDirHandle] = useState(null);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);

  // Canvas / Preview
  const [previewCode, setPreviewCode] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeCanvasTab, setActiveCanvasTab] = useState("preview");

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem("andiie_theme") || "dark");

  // Terminal SSH
  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const wsInstance = useRef(null);
  const fitAddonRef = useRef(null);
  const [sshStatus, setSshStatus] = useState("disconnected");
  const [sshCreds, setSshCreds] = useState({ host: "", port: "22", username: "", password: "" });

  // Slash Commands
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [commandFilter, setCommandFilter] = useState("");
  const [slashCommands, setSlashCommands] = useState([]);
  const [isManagePromptOpen, setIsManagePromptOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ command: "", description: "", prompt: "" });

  // Gallery
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState('all');

  // Projects
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [projectsList, setProjectsList] = useState(() => {
    try { const saved = localStorage.getItem("andiie_projects"); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });

  // Sessions
  const [sessions, setSessions] = useState(() => {
    try { const saved = localStorage.getItem("andiie_chat_history"); return saved ? JSON.parse(saved) : []; }
    catch { return []; }
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // ⚡ VARIABEL MODEL AI
  const modelGroups = [
    {
      label: "🧠 Deep Thinking & Research",
      models: [
        { value: "SEARCH_MODE", label: "🌐 Deep Web Research (Internet)" },
        { value: "deepseek/deepseek-r1", label: "💭 DeepSeek R1 (Reasoning)" },
        { value: "openai/o3-mini", label: "🧠 OpenAI o3-mini (Math/Logic)" },
      ]
    },
    {
      label: "📝 Text & General",
      models: [
        { value: "auto", label: "✨ Auto Smart Manager" },
        { value: "google/gemma-4-31b-it", label: "🔵 Google: Gemma 4 31B (Free)" },
      ]
    },
    {
      label: "💻 Coding & Logic",
      models: [
        { value: "auto_coding", label: "⚡ Auto Coding (Lokal/Cloud)" },
        { value: "anthropic/claude-opus-4.6", label: "🧠 Claude Opus 4.6" },
        { value: "anthropic/claude-sonnet-4.6", label: "⚡ Claude Sonnet 4.6" },
        { value: "openai/gpt-5.3-codex", label: "🚀 GPT-5.3 Codex" },
        { value: "qwen/qwen3-coder-next", label: "☁️ Qwen3 Coder Next" },
        { value: "lokal", label: "💻 Qwen 30B (Lokal Ollama)" },
      ]
    },
    {
      label: "🎨 Gambar (Images)",
      models: [
        { value: "sourceful/riverflow-v2-pro", label: "🌊 Riverflow V2 Pro" },
        { value: "google/gemini-3.1-flash-image-preview", label: "🖼️ Gemini 3.1 Flash" },
        { value: "openai/dall-e-3", label: "🎨 DALL-E 3" },
      ]
    },
    {
      label: "🎬 Video Generation",
      models: [
        { value: "bytedance/seedance-2.0", label: "💃 ByteDance: Seedance 2.0" },
        { value: "alibaba/wan-2.7", label: "🎥 Alibaba: Wan 2.7" },
        { value: "openai/sora-2-pro", label: "🌌 OpenAI: Sora 2 Pro" },
        { value: "google/veo-3.1", label: "📽️ Google: Veo 3.1" },
      ]
    },
    {
      label: "🎵 Lagu & Audio",
      models: [
        { value: "google/lyria-3-clip-preview", label: "🎼 Google: Lyria 3" },
        { value: "suno-api-custom", label: "🎸 Suno API" },
      ]
    },
  ];

  const currentModelLabel = modelGroups
    .flatMap(g => g.models)
    .find(m => m.value === selectedModel)?.label || selectedModel;


  useAutoResize(textareaRef, input);

  const generatedMedia = useMemo(() => ekstrakMediaDariRiwayat(sessions), [sessions]);
  const filteredMedia = generatedMedia.filter(m => galleryFilter === 'all' || m.type === galleryFilter);

  const slashCommandsList = useMemo(() => [
    { command: "/fix-diff", description: "Perbaiki bug (Visual Diff)", prompt: "Tolong perbaiki kode ini. Tampilkan perubahannya menggunakan blok kode berformat 'diff' (awali baris yang dihapus dengan '-' dan baris baru dengan '+')." },
    { command: "/review", description: "Cari bug & error", prompt: "Tolong review baris kode ini, cari bug atau potensi error, dan berikan solusinya." },
    { command: "/refactor", description: "Bersihkan kode", prompt: "Tolong tulis ulang kode ini agar lebih bersih, efisien, rapi, dan tambahkan komentar." },
    { command: "/explain", description: "Jelaskan kode", prompt: "Tolong jelaskan cara kerja kode ini baris demi baris." },
  ], []);

  const allPrompts = useMemo(() => [...slashCommandsList, ...slashCommands], [slashCommandsList, slashCommands]);

  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); localStorage.setItem("andiie_theme", theme); }, [theme]);
  useEffect(() => { if (localStorage.getItem("andiie_auth") === "true") setIsLoggedIn(true); }, []);
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase.from('andiie_chats').select('*').order('updated_at', { ascending: false });
      if (data && data.length > 0) { setSessions(data); localStorage.setItem("andiie_chat_history", JSON.stringify(data)); }
    })();
  }, []);
  useEffect(() => { localStorage.setItem("andiie_projects", JSON.stringify(projectsList)); }, [projectsList]);
  
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

  const fetchPrompts = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('andiie_prompts').select('*').order('created_at', { ascending: true });
    if (!error && data) setSlashCommands(data);
  }, []);

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);
  useEffect(() => { if (activeCanvasTab !== "terminal" && xtermInstance.current) { xtermInstance.current.dispose(); xtermInstance.current = null; } }, [activeCanvasTab]);
  useEffect(() => {
    if (!showModelDropdown) return;
    const handler = () => setShowModelDropdown(false);
    window.addEventListener('click', handler); return () => window.removeEventListener('click', handler);
  }, [showModelDropdown]);

  const toggleTheme = () => setTheme(p => p === "dark" ? "light" : "dark");
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === "andiie" && loginData.password === "Arsyad160216") { setIsLoggedIn(true); localStorage.setItem("andiie_auth", "true"); setLoginError(""); }
    else setLoginError("Kredensial tidak valid.");
  };
  const handleLogout = () => { localStorage.removeItem("andiie_auth"); setIsLoggedIn(false); };
  const buatChatBaru = () => { setCurrentSessionId(null); setMessages([]); setActiveRoute(null); setIsPreviewOpen(false); setAttachments([]); if (isMobile) setIsSidebarOpen(false); };
  const muatChatLama = (id) => { if (isStreaming) return; const sesi = sessions.find(s => s.id === id); if (sesi) { setCurrentSessionId(id); setMessages(sesi.messages || []); setActiveRoute(null); setAttachments([]); if (isMobile) setIsSidebarOpen(false); } };
  const hapusChat = async (e, id) => { e.stopPropagation(); const updated = sessions.filter(s => s.id !== id); setSessions(updated); localStorage.setItem("andiie_chat_history", JSON.stringify(updated)); if (currentSessionId === id) buatChatBaru(); if (supabase) await supabase.from('andiie_chats').delete().eq('id', id); };
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({ name: file.name, type: file.type, rawFile: file }));
      setAttachments(prev => [...prev, ...filesArray]);
    }
    e.target.value = null;
  };
  const hapusAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));
  const handleInputChange = (e) => { const val = e.target.value; setInput(val); if (val.startsWith("/")) { setShowSlashCommands(true); setCommandFilter(val.substring(1).toLowerCase()); } else setShowSlashCommands(false); };
  const applySlashCommand = (promptText) => { setInput(promptText); setShowSlashCommands(false); textareaRef.current?.focus(); };

  const savePrompt = async () => {
    if (!newPrompt.command || !newPrompt.prompt) return;
    if (supabase) {
      const cmd = newPrompt.command.startsWith('/') ? newPrompt.command : '/' + newPrompt.command;
      const { error } = await supabase.from('andiie_prompts').upsert({ ...newPrompt, command: cmd });
      if (!error) { fetchPrompts(); setNewPrompt({ command: "", description: "", prompt: "" }); }
    }
  };
  const deletePrompt = async (id) => { if (supabase) { await supabase.from('andiie_prompts').delete().eq('id', id); fetchPrompts(); } };

  const linkFolder = async () => {
    try { const handle = await window.showDirectoryPicker({ mode: 'readwrite' }); setDirHandle(handle); alert("Folder lokal berhasil ditautkan!"); } catch (e) { console.error("Gagal", e); }
  };

  const saveToLocal = async () => {
    if (!dirHandle) return alert("Silakan tautkan folder terlebih dahulu!");
    let savedCount = 0;
    for (const msg of messages) {
      if (msg.role === 'ai') {
        const codeRegex = /```(\w+)?\n([\s\S]*?)```/g; let match;
        while ((match = codeRegex.exec(msg.text)) !== null) {
          const code = match[2]; const fnMatch = code.match(/(?:\/\/|#)\s*FILE:\s*([a-zA-Z0-9._/-]+)/i);
          if (fnMatch) {
            try {
               const fileHandle = await dirHandle.getFileHandle(fnMatch[1], { create: true });
               const writable = await fileHandle.createWritable();
               await writable.write(code); await writable.close(); savedCount++;
            } catch(e) { console.error(e); }
          }
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
          const fnMatch = code.match(/(?:\/\/|#)\s*FILE:\s*([a-zA-Z0-9._/-]+)/i);
          const fileName = fnMatch ? fnMatch[1] : `generated_${idx}_${fileCount}.${lang}`;
          zip.file(fileName, code); fileCount++;
        }
      }
    });
    if (fileCount > 0) { const content = await zip.generateAsync({ type: "blob" }); const url = URL.createObjectURL(content); const a = document.createElement('a'); a.href = url; a.download = `AI_Studio_${Date.now()}.zip`; a.click(); URL.revokeObjectURL(url); } else alert("Tidak ada kode.");
  };

  const generateGitCommit = () => { setInput("Tolong buatkan pesan Git Commit yang profesional berdasarkan seluruh perubahan kode yang kamu berikan."); textareaRef.current?.focus(); };

  const bacaFile = async (file) => {
    if (file.name.endsWith('.zip') || file.type.includes('zip')) {
      try {
        const zip = new JSZip(); const loadedZip = await zip.loadAsync(file); let extractedText = ""; const MAX_CHARS = 150000; let isLimitReached = false;
        const badFolders = ['node_modules/', '.git/', 'venv/', 'dist/', 'build/', '.next/', 'out/', '__pycache__/'];
        const binaryExt = /\.(png|jpg|jpeg|gif|mp4|exe|pdf|ico|svg|lock|map|ttf|woff|woff2|eot|log)$/i;
        for (const relativePath of Object.keys(loadedZip.files)) {
          if (isLimitReached) break;
          const entry = loadedZip.files[relativePath];
          if (entry.dir || badFolders.some(f => relativePath.includes(f)) || binaryExt.test(relativePath)) continue;
          const content = await entry.async('string');
          extractedText += `\n\n--- [FILE: ${relativePath}] ---\n${content}\n`;
          if (extractedText.length > MAX_CHARS) { extractedText += `\n\n[ZIP terpotong otomatis.]`; isLimitReached = true; }
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

  const unduhGambar = async (url) => {
    try { const res = await fetch(url); if (!res.ok) throw new Error("CORS"); const blob = await res.blob(); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "ai-media." + (blob.type.split('/')[1] || 'png'); document.body.appendChild(link); link.click(); document.body.removeChild(link); } catch { window.open(url, '_blank'); }
  };

  const initTerminal = useCallback(() => {
    if (!terminalRef.current) return;
    if (xtermInstance.current) { xtermInstance.current.dispose(); xtermInstance.current = null; }
    const term = new Terminal({ cursorBlink: true, theme: { background: '#0d1117', foreground: '#c9d1d9', cursor: '#58a6ff' }, fontFamily: '"Fira Code", monospace', fontSize: 13, lineHeight: 1.4 });
    const fitAddon = new FitAddon(); term.loadAddon(fitAddon); term.open(terminalRef.current);
    setTimeout(() => fitAddon.fit(), 50); xtermInstance.current = term; fitAddonRef.current = fitAddon;
    const resizeHandler = () => { if (fitAddonRef.current) fitAddonRef.current.fit(); };
    window.addEventListener('resize', resizeHandler); return () => window.removeEventListener('resize', resizeHandler);
  }, []);

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

  // ⚡ PENGELOLA PESAN (SMART ROUTER API)
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
    setMessages(prev => [...prev, { role: "user", text: teksTampilan }, { role: "ai", text: "" }]);

    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_KEY || "";
    let finalModel = selectedModel;
    let instruksiKeBackend = instruksiUser;
    const lowerInput = instruksiUser.toLowerCase();

    // ⚡ STEP 1: LOGIKA SMART ROUTER (CHATGPT API + REGEX)
    let detectedIntent = "GENERAL";

    // 1A. Prioritas Tombol UI (Hardware/Mode Toggles)
    if (isCodingMode) {
      detectedIntent = "CODE";
    } else if (isExamMode) {
      detectedIntent = "EXAM";
    } else if (attachments.some(a => a.type === 'image') && /(apa ini|kegunaan|jelaskan|fungsi)/i.test(lowerInput)) {
      detectedIntent = "VISION";
    } 
    // 1B. Niat Manusiawi via ChatGPT API (Fast)
    else {
      try {
        if (OPENROUTER_API_KEY) {
          const intentRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini", // ChatGPT API
              messages: [
                { role: "system", content: "Kategorikan pesan user ke dalam SATU KATA ini saja: IMAGE (jika meminta membuat/menggambar/bikin gambar/logo), RESEARCH (jika meminta riset, jurnal, cari data mendalam), TRANSLATE (jika meminta terjemahan bahasa), atau GENERAL (selain itu)." },
                { role: "user", content: instruksiUser }
              ],
              temperature: 0.1, max_tokens: 10
            })
          });
          if (intentRes.ok) {
             const intentData = await intentRes.json();
             const apiIntent = intentData.choices?.[0]?.message?.content?.trim().toUpperCase();
             if (["IMAGE", "RESEARCH", "TRANSLATE"].includes(apiIntent)) {
                detectedIntent = apiIntent;
             }
          }
        }
      } catch (e) { console.warn("API Router timeout"); }

      // 1C. Fallback Super Regex jika API gagal/tidak aktif
      if (detectedIntent === "GENERAL") {
         if (/(buat|bikin|generate|lukis|cipta|tolong gambarkan).*(gambar|foto|logo|ilustrasi|karakter|lukisan)/i.test(lowerInput) || lowerInput === "buat gambar" || lowerInput === "bikin gambar") {
           detectedIntent = "IMAGE";
         } else if (/(riset|cari tahu|telusuri|jurnal|search)/i.test(lowerInput)) {
           detectedIntent = "RESEARCH";
         } else if (/(artikan|terjemah|translate)/i.test(lowerInput)) {
           detectedIntent = "TRANSLATE";
         }
      }
    }

    // ⚡ STEP 2: TERAPKAN NIAT & GANTI MODEL OTOMATIS
    if (detectedIntent === "IMAGE") {
      finalModel = "openai/dall-e-3";
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Hasilkan prompt gambar berbahasa Inggris detail untuk DALL-E 3 berdasarkan permintaan ini.]`;
    } else if (detectedIntent === "RESEARCH") {
      finalModel = "SEARCH_MODE";
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Lakukan Deep Research ke web terpercaya. Rangkum menjadi format bacaan jurnal yang komprehensif.]`;
    } else if (detectedIntent === "TRANSLATE") {
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Terjemahkan teks di atas dengan akurat, natural, dan sesuai budaya aslinya sekelas native speaker.]`;
    } else if (detectedIntent === "VISION") {
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Analisis spesifikasi, kegunaan, dan fungsi dari gambar ini secara presisi layaknya Google Lens AI.]`;
    } else if (detectedIntent === "CODE") {
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Mode Koding AKTIF. Bertindaklah sebagai Senior AI Architect (Claude Opus). JANGAN memberikan kode mentah. WAJIB: 1) Jelaskan arsitektur/logika kode. 2) Panduan Step-by-Step deploy/install. 3) Pastikan kode siap produksi. Berbahasa Indonesia profesional.]`;
    } else if (detectedIntent === "EXAM") {
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Mode Ujian AKTIF. Bertindaklah sebagai Sensei penguji. Berikan 1 soal pilihan ganda interaktif. JANGAN berikan jawaban sebelum dijawab. Utamakan penggunaan huruf hiragana dibandingkan kanji rumit jika terkait dengan bahasa Jepang.]`;
    } else {
      // Chat Biasa (Default Gemma)
      if (finalModel === "auto_coding") finalModel = "google/gemma-4-31b-it";
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Mode Chat Biasa. Anda cerdas seperti ChatGPT. Jawablah secara RINGKAS dan to the point untuk menghemat token.]`;
    }

    if (activeProject) {
      instruksiKeBackend += `\n\n[PROJECT CONTEXT: Proyek aktif: "${activeProject.name}". Aturan khusus: ${activeProject.context}. Selalu ikuti aturan ini.]`;
    }

    // ⚡ STEP 3: EKSEKUSI KE BACKEND
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const controller = new AbortController();
      const isMultimedia = ["dall-e", "suno", "sora", "veo", "wan", "seedance", "riverflow", "lyria"].some(m => finalModel.includes(m));
      const timeoutId = setTimeout(() => controller.abort(), isMultimedia ? 600000 : 60000);

      const respon = await fetch(`${BACKEND_URL}/api/chat/stream`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruksi: instruksiKeBackend, history: historyKirim, paksa_model: finalModel,
          kunci_rahasia: "KODE_RAHASIA_ANDIIE_2026", persona: selectedPersona, attachments: fileYangDiproses
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId); if (!respon.ok) throw new Error("Server Lokal Menolak");

      const reader = respon.body.getReader(); const decoder = new TextDecoder("utf-8"); let bufferText = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk.includes("RUTE_AKTIF:")) {
          const ruteMatch = chunk.match(/RUTE_AKTIF:(.*?)\n\n/);
          if (ruteMatch) setActiveRoute(ruteMatch[1]);
          bufferText += chunk.replace(/RUTE_AKTIF:.*\n\n/, "");
        } else bufferText += chunk;
        
        setMessages(prev => {
          const n = [...prev]; n[n.length - 1] = { ...n[n.length - 1], text: bufferText }; return n;
        });
      }
    } catch (error) {
      setActiveRoute("FALLBACK: OpenRouter");
      try {
        if (!OPENROUTER_API_KEY) throw new Error("VITE_OPENROUTER_KEY belum diatur");
        const openRouterMessages = historyKirim.map(msg => ({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text }));
        openRouterMessages.push({ role: "user", content: instruksiKeBackend });
        const fallbackModel = finalModel === "google/gemma-4-31b-it" || finalModel === "auto" ? "google/gemma-4-31b-it" : "qwen/qwen3-coder:30b";

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST", headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: fallbackModel, messages: openRouterMessages, stream: true })
        });
        const reader = res.body.getReader(); const decoder = new TextDecoder("utf-8"); let bufferText = "";
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          const chunk = decoder.decode(value, { stream: true }); const lines = chunk.split('\n').filter(l => l.trim());
          for (const line of lines) {
            if (line.includes('[DONE]')) break;
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6)); const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  bufferText += content;
                  setMessages(prev => { const n = [...prev]; n[n.length - 1] = { ...n[n.length - 1], text: bufferText }; return n; });
                }
              } catch {}
            }
          }
        }
      } catch (fatalError) {
        setMessages(prev => {
          const n = [...prev];
          n[n.length - 1] = { ...n[n.length - 1], text: `⚠️ **Koneksi Gagal**\n\nServer mati.\n\n\`Error: ${fatalError.message}\`` }; return n;
        });
      }
    } finally { setIsStreaming(false); setAttachments([]); }
  };

  if (!isLoggedIn) {
    return (
      <div className={`h-dvh flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-[#0d1117]' : 'bg-gray-50'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-8 rounded-2xl w-full max-w-sm shadow-xl border ${theme === 'dark' ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-center mb-6"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg"><Sparkles className="text-white" size={24} /></div></div>
          <h2 className={`text-xl font-bold text-center mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AI Studio Pro</h2>
          <p className={`text-center text-sm mb-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Masuk untuk melanjutkan</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="text" placeholder="Nama Pengguna" className={`w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-500'}`} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} />
            <input type="password" placeholder="Sandi" className={`w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-500'}`} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
            {loginError && <p className="text-red-500 text-xs text-center">{loginError}</p>}
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98]">Masuk</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex h-dvh overflow-hidden transition-colors ${theme === 'dark' ? 'bg-[#0d1117] text-[#e6edf3]' : 'bg-white text-gray-900'}`}>

      {/* ========== SIDEBAR ========== */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {isMobile && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40" />}
            <motion.aside initial={isMobile ? { x: "-100%" } : { opacity: 1 }} animate={isMobile ? { x: 0 } : { opacity: 1 }} exit={isMobile ? { x: "-100%" } : { opacity: 1 }} transition={{ type: "spring", bounce: 0, duration: 0.3 }} className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} w-[280px] flex flex-col shrink-0 border-r ${theme === 'dark' ? 'bg-[#010409] border-[#30363d]' : 'bg-gray-50 border-gray-200'}`}>
              <div className="p-3 flex items-center gap-2">
                <button onClick={buatChatBaru} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all active:scale-[0.97] ${theme === 'dark' ? 'bg-[#161b22] border-[#30363d] text-white hover:bg-[#1c2128]' : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100 shadow-sm'}`}><Plus size={16} /> Chat Baru</button>
                {isMobile && <button onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-[#161b22] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={18} /></button>}
              </div>

              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1" style={{ scrollbarWidth: 'none' }}>
                <div className="space-y-1 mb-4">
                  <button onClick={() => setIsProjectsOpen(true)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeProject ? (theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600') : (theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22]' : 'text-gray-600 hover:bg-gray-100')}`}>
                    <span className="flex items-center gap-2.5"><Folder size={16} />{activeProject ? activeProject.name : "Proyek"}</span><ChevronRight size={14} className="opacity-40" />
                  </button>
                  <button onClick={() => setIsGalleryOpen(true)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22]' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <ImageIcon size={16} />Galeri Media
                    {generatedMedia.length > 0 && <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md ${theme === 'dark' ? 'bg-[#161b22] text-gray-500' : 'bg-gray-200 text-gray-500'}`}>{generatedMedia.length}</span>}
                  </button>
                  <button onClick={() => setIsManagePromptOpen(true)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22]' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <Settings size={16} />Kelola Prompt
                  </button>
                </div>

                <div className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-2 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>Riwayat Percakapan</div>
                {sessions.length === 0 && <div className={`text-center text-xs py-8 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>Belum ada percakapan</div>}
                {sessions.map(sesi => (
                  <div key={sesi.id} onClick={() => muatChatLama(sesi.id)} className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${currentSessionId === sesi.id ? (theme === 'dark' ? 'bg-[#161b22] text-white' : 'bg-blue-50 text-blue-800') : (theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22] hover:text-gray-200' : 'text-gray-600 hover:bg-gray-100')}`}>
                    <MessageSquare size={14} className="shrink-0 opacity-50" /><span className="flex-1 truncate text-sm">{sesi.title}</span>
                    <button onClick={(e) => hapusChat(e, sesi.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all rounded"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
              <div className={`p-3 border-t ${theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'}`}>
                <button onClick={handleLogout} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/5' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}><LogOut size={14} /> Keluar</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* ===== HEADER ===== */}
        <header className={`sticky top-0 z-30 flex items-center justify-between h-14 px-3 md:px-4 border-b shrink-0 ${theme === 'dark' ? 'bg-[#0d1117]/80 backdrop-blur-xl border-[#30363d]' : 'bg-white/80 backdrop-blur-xl border-gray-200'}`}>
          <div className="flex items-center gap-2">
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-[#161b22] text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}><Menu size={20} /></button>}
            
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowModelDropdown(p => !p); }} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${theme === 'dark' ? 'bg-[#161b22] hover:bg-[#1c2128] border-[#30363d] text-gray-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'}`}>
                <span className="truncate max-w-[120px] md:max-w-[200px]">{currentModelLabel}</span><ChevronDown size={14} className="opacity-50" />
              </button>

              <AnimatePresence>
                {showModelDropdown && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} onClick={(e) => e.stopPropagation()} className={`absolute top-full left-0 mt-2 w-72 rounded-2xl border shadow-xl overflow-hidden z-50 ${theme === 'dark' ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'}`}>
                    <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                      <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="hidden">
                        <optgroup label="🧠 Deep Thinking & Research"><option value="SEARCH_MODE">🌐 Deep Web Research (Internet)</option><option value="deepseek/deepseek-r1">💭 DeepSeek R1 (Reasoning)</option><option value="openai/o3-mini">🧠 OpenAI o3-mini (Math/Logic)</option></optgroup>
                        <optgroup label="📝 Text & General"><option value="auto">✨ Auto Smart Manager</option><option value="google/gemma-4-31b-it">🔵 Google: Gemma 4 31B (Free)</option></optgroup>
                        <optgroup label="💻 Coding & Logic"><option value="auto_coding">⚡ Auto Coding (Lokal/Cloud)</option><option value="anthropic/claude-opus-4.6">🧠 Claude Opus 4.6</option><option value="anthropic/claude-sonnet-4.6">⚡ Claude Sonnet 4.6</option><option value="openai/gpt-5.3-codex">🚀 GPT-5.3 Codex</option><option value="qwen/qwen3-coder-next">☁️ Qwen3 Coder Next</option><option value="lokal">💻 Qwen 30B (Lokal Ollama)</option></optgroup>
                        <optgroup label="🎨 Gambar (Images)"><option value="sourceful/riverflow-v2-pro">🌊 Riverflow V2 Pro</option><option value="google/gemini-3.1-flash-image-preview">🖼️ Gemini 3.1 Flash</option><option value="openai/dall-e-3">🎨 DALL-E 3</option></optgroup>
                        <optgroup label="🎬 Video Generation"><option value="bytedance/seedance-2.0">💃 ByteDance: Seedance 2.0</option><option value="alibaba/wan-2.7">🎥 Alibaba: Wan 2.7</option><option value="openai/sora-2-pro">🌌 OpenAI: Sora 2 Pro</option><option value="google/veo-3.1">📽️ Google: Veo 3.1</option></optgroup>
                        <optgroup label="🎵 Lagu & Audio"><option value="google/lyria-3-clip-preview">🎼 Google: Lyria 3</option><option value="suno-api-custom">🎸 Suno API</option></optgroup>
                      </select>

                      {modelGroups.map((group, gi) => (
                        <div key={gi}>
                          <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider sticky top-0 ${theme === 'dark' ? 'bg-[#0d1117] text-gray-500' : 'bg-gray-50 text-gray-400'}`}>{group.label}</div>
                          {group.models.map(model => (
                            <button key={model.value} onClick={() => { setSelectedModel(model.value); setShowModelDropdown(false); setIsCodingMode(model.value === "auto_coding" || model.value.includes("coder") || model.value.includes("claude")); setIsExamMode(false); }} className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedModel === model.value ? (theme === 'dark' ? 'bg-blue-500/10 text-blue-400 font-semibold' : 'bg-blue-50 text-blue-600 font-semibold') : (theme === 'dark' ? 'text-gray-300 hover:bg-[#1c2128]' : 'text-gray-700 hover:bg-gray-50')}`}>
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

          <div className="flex items-center gap-1 md:gap-2">
            
            {/* ⚡ TOMBOL MODE KODING (Tampil di Mobile juga) */}
            <button onClick={() => { setIsCodingMode(!isCodingMode); setIsExamMode(false); if (!isCodingMode) setSelectedModel("auto_coding"); else setSelectedModel("google/gemma-4-31b-it"); }} className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-xs font-bold transition-all border ${isCodingMode ? (theme === 'dark' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-blue-100 border-blue-300 text-blue-700') : (theme === 'dark' ? 'bg-transparent border-transparent text-gray-500 hover:bg-[#161b22]' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100')}`} title="Mode Koding">
              <Code size={16} /> <span className="hidden md:inline">Mode Koding</span>
            </button>

            {/* ⚡ TOMBOL MODE UJIAN (Tampil di Mobile juga) */}
            <button onClick={() => { setIsExamMode(!isExamMode); setIsCodingMode(false); if (!isExamMode) setSelectedModel("auto"); }} className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg text-xs font-bold transition-all border ${isExamMode ? (theme === 'dark' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-green-100 border-green-300 text-green-700') : (theme === 'dark' ? 'bg-transparent border-transparent text-gray-500 hover:bg-[#161b22]' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100')}`} title="Mode Ujian">
              <GraduationCap size={16} /> <span className="hidden md:inline">Mode Ujian</span>
            </button>

            {messages.length > 0 && (
              <>
                <button onClick={exportChatToZip} title="Export ke ZIP" className={`hidden md:block p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22] hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}><Archive size={18} /></button>
                <button onClick={generateGitCommit} title="Buat Git Commit" className={`hidden md:block p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22] hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}><GitCommit size={18} /></button>
                {/* ⚡ TOMBOL SIMPAN KE LOKAL */}
                <button onClick={saveToLocal} title={dirHandle ? "Simpan Kode ke Folder" : "Tautkan Folder VS Code"} className={`p-2 rounded-lg transition-colors border hidden lg:block ${dirHandle ? (theme === 'dark' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-blue-100 border-blue-300 text-blue-700') : (theme === 'dark' ? 'border-transparent text-gray-400 hover:bg-[#161b22]' : 'border-transparent text-gray-500 hover:bg-gray-100')}`}><FolderSync size={18} /></button>
              </>
            )}
            
            <div className="w-px h-6 bg-gray-300 dark:bg-[#30363d] mx-1 hidden md:block"></div>

            {/* ⚡ TOMBOL TERMINAL DISEMBUNYIKAN DARI MOBILE */}
            <button onClick={() => { setIsPreviewOpen(true); setActiveCanvasTab("terminal"); }} title="Terminal" className={`hidden md:block p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22] hover:text-green-400' : 'text-gray-500 hover:bg-gray-100 hover:text-green-600'}`}><TerminalSquare size={18} /></button>

            {isPreviewOpen ? (
              <button onClick={() => setIsPreviewOpen(false)} title="Tutup Panel" className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-blue-400 bg-[#161b22]' : 'text-blue-600 bg-gray-100'}`}><PanelRightClose size={18} /></button>
            ) : (
              previewCode && <button onClick={() => setIsPreviewOpen(true)} title="Buka Panel" className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22]' : 'text-gray-500 hover:bg-gray-100'}`}><PanelRightOpen size={18} /></button>
            )}

            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22] hover:text-yellow-400' : 'text-gray-500 hover:bg-gray-100'}`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* ===== CONTENT AREA ===== */}
        <div className="flex-1 flex min-h-0">

          {/* ===== CHAT AREA ===== */}
          <div className={`flex-1 flex flex-col min-w-0 ${isPreviewOpen && !isMobile ? 'border-r ' + (theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200') : ''}`}>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: theme === 'dark' ? '#30363d #0d1117' : '#d1d5db #ffffff' }}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-6">
                  <div className="max-w-lg w-full text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg mb-4">
                      <Sparkles className="text-white" size={28} />
                    </div>
                    <h1 className={`text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Siap membantu Anda, Andi.</h1>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {isExamMode ? "Mulai belajar untuk JLPT N2 atau Sertifikasi Kebersihan? Unggah modul PDF Anda." : "Ketik instruksi, unggah file, atau gunakan / untuk perintah cepat."}
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {activeProject && <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${theme === 'dark' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200'}`}><Folder size={12} /> {activeProject.name}</div>}
                      {isCodingMode && <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'}`}><Code size={12} /> Claude Logic ON</div>}
                      {isExamMode && <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${theme === 'dark' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-200'}`}><GraduationCap size={12} /> Ujian ON</div>}
                      {dirHandle && <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${theme === 'dark' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-200'}`}><FolderSync size={12} /> {dirHandle.name} Terhubung</div>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`divide-y ${theme === 'dark' ? 'divide-[#30363d]/50' : 'divide-gray-100'}`}>
                  {messages.map((chat, idx) => (
                    <MessageBubble key={idx} chat={chat} idx={idx} isLast={idx === messages.length - 1} isStreaming={isStreaming} theme={theme} setActiveCanvasTab={setActiveCanvasTab} setIsPreviewOpen={setIsPreviewOpen} setPreviewCode={setPreviewCode} />
                  ))}
                  <div ref={chatEndRef} className="h-1" />
                </div>
              )}
            </div>

            {/* ===== INPUT BAR ===== */}
            <div className={`shrink-0 px-3 md:px-4 pb-4 pt-2 ${theme === 'dark' ? 'bg-[#0d1117]' : 'bg-white'}`}>
              <div className="max-w-3xl mx-auto relative">

                {/* Slash Commands */}
                <AnimatePresence>
                  {showSlashCommands && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className={`absolute bottom-full mb-2 left-0 w-full md:w-80 rounded-2xl border shadow-2xl overflow-hidden z-50 ${theme === 'dark' ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'}`}>
                      <div className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider border-b flex items-center gap-1.5 ${theme === 'dark' ? 'text-gray-500 border-[#30363d] bg-[#0d1117]' : 'text-gray-400 border-gray-100 bg-gray-50'}`}><Zap size={14} className="text-yellow-500" /> Perintah Cepat</div>
                      <div className="max-h-56 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                        {allPrompts.filter(c => c.command.toLowerCase().includes(commandFilter)).map((cmd, i) => (
                          <button key={i} onClick={() => applySlashCommand(cmd.prompt)} className={`w-full text-left px-4 py-3 transition-colors border-b last:border-0 ${theme === 'dark' ? 'hover:bg-[#1c2128] border-[#30363d]/50' : 'hover:bg-gray-50 border-gray-100'}`}>
                            <span className="font-semibold text-sm text-blue-500">{cmd.command}</span>
                            <span className={`block text-xs mt-1 truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{cmd.description}</span>
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
                      <div key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm ${theme === 'dark' ? 'bg-[#161b22] border-[#30363d] text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
                        <Paperclip size={12} className="opacity-50" />
                        <span className="truncate max-w-[120px]">{file.name}</span>
                        <button onClick={() => hapusAttachment(idx)} className="hover:text-red-500 ml-1"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input Container */}
                <div className={`rounded-2xl border shadow-sm transition-colors ${theme === 'dark' ? 'bg-[#161b22] border-[#30363d] focus-within:border-blue-500/50' : 'bg-white border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'}`}>
                  <textarea ref={textareaRef} className={`w-full bg-transparent text-[15px] outline-none resize-none px-4 pt-4 pb-2 leading-relaxed ${theme === 'dark' ? 'text-[#e6edf3] placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`} placeholder={`Ketik pesan Anda di sini...`} rows="1" style={{ maxHeight: '200px' }} value={input} onChange={handleInputChange} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirimPesan(); } }} disabled={isStreaming} />

                  <div className="flex items-center justify-between px-3 pb-3 pt-1">
                    <div className="flex items-center gap-1">
                      <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                      <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#30363d]' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`} title="Lampirkan File"><Paperclip size={18} /></button>
                      
                      {!dirHandle && (
                        <button onClick={linkFolder} className={`p-2 rounded-xl transition-colors hidden md:block ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#30363d]' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`} title="Tautkan Folder VS Code Lokal"><FolderSync size={18} /></button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {activeRoute && <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{activeRoute}</span>}
                      <button onClick={kirimPesan} disabled={isStreaming || (!input.trim() && attachments.length === 0)} className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 ${isStreaming || (!input.trim() && attachments.length === 0) ? (theme === 'dark' ? 'bg-[#30363d] text-gray-500' : 'bg-gray-100 text-gray-400') : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md'}`}>
                        {isStreaming ? <StopCircle size={18} /> : <Send size={18} className="ml-0.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className={`text-center text-[10px] mt-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                  AI dapat berhalusinasi. Mohon periksa kembali informasi penting yang dihasilkan.
                </p>
              </div>
            </div>
          </div>

          {/* ===== CANVAS / PREVIEW PANEL ===== */}
          <AnimatePresence>
            {isPreviewOpen && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: isMobile ? '100%' : '50%', opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.35 }} className={`flex flex-col overflow-hidden shrink-0 ${isMobile ? 'absolute inset-0 z-40' : ''} ${theme === 'dark' ? 'bg-[#0d1117] border-l border-[#30363d]' : 'bg-white border-l border-gray-200'}`}>
                <div className={`flex items-center justify-between h-12 px-3 border-b shrink-0 ${theme === 'dark' ? 'border-[#30363d] bg-[#010409]' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-1">
                    {["preview", "code", "terminal"].map(tab => (
                      <button key={tab} onClick={() => setActiveCanvasTab(tab)} className={`px-4 py-2 text-xs font-bold capitalize transition-all rounded-lg flex items-center gap-1.5 ${activeCanvasTab === tab ? (theme === 'dark' ? 'bg-[#161b22] text-white border border-[#30363d]' : 'bg-white text-blue-600 shadow-sm border border-gray-200') : (theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}>
                        {tab === 'preview' && <Play size={14} />} {tab === 'code' && <Code size={14} />} {tab === 'terminal' && <TerminalSquare size={14} />} {tab}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setIsPreviewOpen(false)} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#161b22]' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}><X size={18} /></button>
                </div>

                <div className="flex-1 relative overflow-hidden">
                  {activeCanvasTab === "code" && (
                    <textarea value={previewCode} onChange={(e) => setPreviewCode(e.target.value)} className={`absolute inset-0 w-full h-full bg-transparent font-mono text-[13px] p-6 outline-none resize-none leading-relaxed ${theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-800'}`} spellCheck="false" />
                  )}

                  {activeCanvasTab === "preview" && (
                    <div className="absolute inset-0 bg-white">
                      <iframe title="Preview" srcDoc={previewCode} className="w-full h-full border-none" sandbox="allow-scripts allow-modals allow-same-origin" />
                    </div>
                  )}

                  {activeCanvasTab === "terminal" && (
                    <div className="absolute inset-0 flex flex-col bg-[#0d1117]">
                      {sshStatus === "disconnected" ? (
                        <div className="flex-1 flex items-center justify-center p-4">
                          <form onSubmit={connectSSH} className={`w-full max-w-xs space-y-4 p-6 rounded-2xl border shadow-xl ${theme === 'dark' ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'}`}>
                            <div className="text-center mb-6">
                              <div className="w-12 h-12 mx-auto rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3"><Server size={24} className="text-green-500" /></div>
                              <h3 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>SSH Terminal Remote</h3>
                            </div>
                            <input required type="text" placeholder="IP Host (misal: 192.168.1.5)" className={`w-full text-sm p-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'}`} value={sshCreds.host} onChange={e => setSshCreds({...sshCreds, host: e.target.value})} />
                            <input required type="text" placeholder="Username" className={`w-full text-sm p-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'}`} value={sshCreds.username} onChange={e => setSshCreds({...sshCreds, username: e.target.value})} />
                            <input required type="password" placeholder="Password" className={`w-full text-sm p-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white focus:border-green-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500'}`} value={sshCreds.password} onChange={e => setSshCreds({...sshCreds, password: e.target.value})} />
                            <button type="submit" className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${sshStatus === "connecting" ? 'bg-yellow-600 text-white' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'}`}>
                              {sshStatus === "connecting" ? "Menghubungi..." : "Hubungkan"}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div className={`text-xs px-4 py-2.5 border-b flex justify-between items-center ${theme === 'dark' ? 'bg-[#010409] border-[#30363d] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                            <span className="font-mono flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {sshCreds.username}@{sshCreds.host}</span>
                            <button onClick={disconnectSSH} className="text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded hover:bg-red-500/10 transition-colors">Putuskan</button>
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

      {/* ========== MODALS ========== */}
      <Modal isOpen={isProjectsOpen} onClose={() => setIsProjectsOpen(false)} theme={theme} maxWidth="max-w-2xl">
        <div className={`p-5 border-b flex justify-between items-center ${theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3"><Layers size={20} className="text-orange-500" /><h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Manajemen Proyek</h2></div>
          <button onClick={() => setIsProjectsOpen(false)} className={`p-2 rounded-xl ${theme === 'dark' ? 'text-gray-500 hover:bg-[#161b22]' : 'text-gray-400 hover:bg-gray-100'}`}><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'none' }}>
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Buat Proyek Baru</h3>
            <input id="projName" placeholder="Nama Proyek (misal: Robot AI Kartos)" className={`w-full p-3.5 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white' : 'bg-gray-50 border-gray-200'}`} />
            <textarea id="projCtx" placeholder="Instruksi khusus proyek (misal: Selalu gunakan Python 3.10...)" rows="3" className={`w-full p-3.5 rounded-xl text-sm border outline-none resize-none ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white' : 'bg-gray-50 border-gray-200'}`} />
            <button onClick={() => { const n = document.getElementById('projName')?.value; const c = document.getElementById('projCtx')?.value; if (n) { setProjectsList([...projectsList, { id: Date.now(), name: n, context: c || '' }]); document.getElementById('projName').value = ''; document.getElementById('projCtx').value = ''; } }} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl text-sm font-bold shadow-md transition-colors">Buat Proyek</button>
          </div>
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Pilih Proyek Aktif</h3>
            <div onClick={() => setActiveProject(null)} className={`p-4 rounded-xl border cursor-pointer transition-all ${!activeProject ? 'ring-2 ring-blue-500 border-transparent bg-blue-500/10' : (theme === 'dark' ? 'border-[#30363d] hover:bg-[#161b22]' : 'border-gray-200 hover:bg-gray-50')}`}>
              <div className={`font-bold text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tanpa Proyek (Chat Umum)</div>
            </div>
            {projectsList.map(proj => (
              <div key={proj.id} onClick={() => setActiveProject(proj)} className={`group p-4 rounded-xl border cursor-pointer transition-all relative ${activeProject?.id === proj.id ? 'ring-2 ring-orange-500 border-transparent bg-orange-500/10' : (theme === 'dark' ? 'border-[#30363d] hover:bg-[#161b22]' : 'border-gray-200 hover:bg-gray-50')}`}>
                <div className="font-bold text-base text-orange-500 mb-1">{proj.name}</div>
                {proj.context && <div className={`text-sm line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{proj.context}</div>}
                <button onClick={(e) => { e.stopPropagation(); setProjectsList(projectsList.filter(p => p.id !== proj.id)); if (activeProject?.id === proj.id) setActiveProject(null); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} theme={theme} maxWidth="max-w-5xl">
        <div className={`p-5 border-b flex justify-between items-center shrink-0 ${theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3"><ImageIcon size={20} className="text-purple-500" /><h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Galeri Media</h2></div>
          <button onClick={() => setIsGalleryOpen(false)} className={`p-2 rounded-xl ${theme === 'dark' ? 'text-gray-500 hover:bg-[#161b22]' : 'text-gray-400 hover:bg-gray-100'}`}><X size={18} /></button>
        </div>
        <div className={`flex gap-2 p-4 border-b overflow-x-auto shrink-0 ${theme === 'dark' ? 'border-[#30363d] bg-[#010409]' : 'border-gray-100 bg-gray-50'}`} style={{ scrollbarWidth: 'none' }}>
          {[{ val: 'all', icon: LayoutGrid, label: 'Semua Media' }, { val: 'image', icon: ImageIcon, label: 'Gambar' }, { val: 'video', icon: Video, label: 'Video' }, { val: 'audio', icon: Volume2, label: 'Audio' }].map(f => (
            <button key={f.val} onClick={() => setGalleryFilter(f.val)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${galleryFilter === f.val ? (theme === 'dark' ? 'bg-purple-500 text-white' : 'bg-purple-600 text-white shadow-md') : (theme === 'dark' ? 'text-gray-400 hover:bg-[#161b22]' : 'text-gray-600 hover:bg-gray-200')}`}><f.icon size={16} /> {f.label}</button>
          ))}
        </div>
        <div className={`flex-1 overflow-y-auto p-6 ${theme === 'dark' ? 'bg-[#0d1117]' : 'bg-gray-50'}`} style={{ scrollbarWidth: 'none' }}>
          {filteredMedia.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-4"><LayoutGrid size={48} className="opacity-20" /><p className="text-base font-medium">Belum ada media yang di-generate</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((media, i) => (
                <div key={i} className={`group relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all ${media.type === 'audio' ? 'p-4 flex flex-col' : 'aspect-square'} ${theme === 'dark' ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'}`}>
                  {media.type === 'image' && <img src={media.url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
                  {media.type === 'video' && <video src={media.url} className="absolute inset-0 w-full h-full object-cover bg-black" controls muted />}
                  {media.type === 'audio' && <><div className="flex-1 flex items-center justify-center"><Music size={40} className="text-purple-500/30" /></div><CustomAudioPlayer src={media.url} theme={theme} /></>}
                  {media.type !== 'audio' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 z-10">
                      <span className="text-xs text-white font-medium truncate pr-3">{media.title}</span>
                      <button onClick={() => unduhGambar(media.url)} className="p-2 bg-white/20 hover:bg-blue-500 rounded-xl text-white backdrop-blur-md transition-colors shrink-0 shadow-lg" title="Unduh"><Download size={16} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={isManagePromptOpen} onClose={() => setIsManagePromptOpen(false)} theme={theme} maxWidth="max-w-lg">
        <div className={`p-5 border-b flex justify-between items-center ${theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3"><Settings size={20} className="text-blue-500" /><h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Kelola Prompt</h2></div>
          <button onClick={() => setIsManagePromptOpen(false)} className={`p-2 rounded-xl ${theme === 'dark' ? 'text-gray-500 hover:bg-[#161b22]' : 'text-gray-400 hover:bg-gray-100'}`}><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ scrollbarWidth: 'none' }}>
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Tambah Prompt Baru</h3>
            <input placeholder="/perintah (misal: /review)" className={`w-full p-3.5 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 placeholder-gray-400'}`} value={newPrompt.command} onChange={e => setNewPrompt({ ...newPrompt, command: e.target.value })} />
            <input placeholder="Deskripsi singkat" className={`w-full p-3.5 rounded-xl text-sm border outline-none ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 placeholder-gray-400'}`} value={newPrompt.description} onChange={e => setNewPrompt({ ...newPrompt, description: e.target.value })} />
            <textarea placeholder="Isi instruksi AI yang lengkap di sini..." rows="4" className={`w-full p-3.5 rounded-xl text-sm border outline-none resize-none ${theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 placeholder-gray-400'}`} value={newPrompt.prompt} onChange={e => setNewPrompt({ ...newPrompt, prompt: e.target.value })} />
            <button onClick={savePrompt} disabled={!newPrompt.command || !newPrompt.prompt} className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-md ${!newPrompt.command || !newPrompt.prompt ? (theme === 'dark' ? 'bg-[#30363d] text-gray-600 shadow-none' : 'bg-gray-200 text-gray-400 shadow-none') : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'}`}><Save size={16} className="inline mr-2 -mt-0.5" /> Simpan ke Supabase</button>
          </div>
          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Prompt Tersimpan ({slashCommands.length})</h3>
            {slashCommands.length === 0 && <div className={`text-center text-sm py-8 border-dashed border-2 rounded-xl ${theme === 'dark' ? 'border-[#30363d] text-gray-600' : 'border-gray-200 text-gray-400'}`}>Belum ada prompt tersimpan</div>}
            {slashCommands.map(cmd => (
              <div key={cmd.id} className={`flex justify-between items-center p-4 rounded-xl border group ${theme === 'dark' ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-50 border-gray-200'}`}>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-blue-500 mb-1">{cmd.command}</div>
                  <div className={`text-xs truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{cmd.description || cmd.prompt?.substring(0, 60)}</div>
                </div>
                <button onClick={() => deletePrompt(cmd.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all shrink-0 ml-3"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}