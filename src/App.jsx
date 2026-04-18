import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
// ⚡ IMPORT LENGKAP: Workspace + Audio Player + Vercel Fix (GitCommit)
import { Send, Sparkles, Loader2, Menu, Plus, MessageSquare, Trash2, Lock, Play, Pause, Rewind, FastForward, X, Paperclip, Code, Download, Music, Sun, Moon, Zap, Copy, Check, TerminalSquare, Server, LayoutGrid, Settings, Save, Archive, GitCommit, FolderKanban, Layers, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js'; 
import JSZip from 'jszip'; 

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// =====================================
// ⚡ FUNGSI EKSTRAK MEDIA
// =====================================
const ekstrakMediaDariRiwayat = (sessions) => {
  const daftarMedia = [];
  sessions.forEach(sesi => {
    sesi.messages.forEach(msg => {
      if (msg.role === 'ai') {
        const imgRegex = /!\[.*?\]\((.*?)\)/g;
        let match;
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
// BLOK KODE PINTAR 
// =====================================
const SmartCodeBlock = ({ inline, className, children, theme, setActiveCanvasTab, setIsPreviewOpen, setPreviewCode }) => {
  const [isCopied, setIsCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  let language = 'text'; const match = /language-(\w+)/.exec(className || '');
  if (match) language = match[1].toLowerCase();
  else if (!inline || codeString.includes('\n')) {
    if (codeString.includes('def ') || codeString.includes('import ') || codeString.includes('print(')) language = 'python';
    else if (codeString.includes('<div') || codeString.includes('<html')) language = 'html';
    else language = 'code';
  }
  const isBlock = !inline || codeString.includes('\n');
  const isRenderable = ['html', 'xml', 'python', 'py'].includes(language);
  const handleCopy = () => { navigator.clipboard.writeText(codeString); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
  const handlePreview = () => {
    let codeToRender = codeString;
    if (language === 'python' || language === 'py') {
      const safeCode = JSON.stringify(codeString).replace(/<\//g, '<\\/');
      codeToRender = `<!DOCTYPE html><html><head><script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script><style>body { background: ${theme === 'dark' ? '#131314' : '#ffffff'}; color: ${theme === 'dark' ? '#a8c7fa' : '#1f2937'}; font-family: monospace; padding: 20px; line-height: 1.5; } #output { white-space: pre-wrap; word-wrap: break-word; } .success { color: #10b981; } .error { color: #ef4444; }</style></head><body><div id="status" style="color:#f59e0b;font-weight:bold;">⏳ Memuat Mesin Python...</div><hr style="border-color:#333;margin:15px 0;"/><div id="output"></div><script>async function main(){ try{ let pyodide = await loadPyodide(); document.getElementById("status").innerText = "⚙️ Mengeksekusi..."; pyodide.setStdout({ batched: (msg) => { document.getElementById("output").innerText += msg + "\\n"; }}); await pyodide.runPythonAsync(${safeCode}); document.getElementById("status").innerText = "✅ Selesai"; document.getElementById("status").className = "success"; } catch(err){ document.getElementById("output").innerText += "\\n" + err; document.getElementById("status").innerText = "❌ Error"; document.getElementById("status").className = "error"; }} main();</script></body></html>`;
    }
    setPreviewCode(codeToRender); setIsPreviewOpen(true); setActiveCanvasTab("preview");
  };

  if (isBlock) {
    return (
      <div className={`rounded-2xl border my-6 overflow-hidden shadow-sm ${theme === 'dark' ? 'border-white/10 bg-[#1e1f20]' : 'border-gray-200 bg-[#f8f9fa]'}`}>
        <div className={`flex items-center justify-between px-4 py-2 border-b ${theme === 'dark' ? 'bg-[#282a2c] border-white/5' : 'bg-gray-100 border-gray-200'}`}>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{language}</span>
          <div className="flex items-center gap-2">
            {isRenderable && (<button onClick={handlePreview} className="flex items-center gap-1.5 text-xs bg-blue-600/10 text-blue-500 px-3 py-1.5 rounded-full font-bold hover:bg-blue-600/20"><Play size={12} fill="currentColor" /> Preview</button>)}
            <button onClick={handleCopy} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold transition-all ${isCopied ? 'bg-green-500/20 text-green-500' : (theme === 'dark' ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-black/5 text-gray-600 hover:text-black')}`}>{isCopied ? <Check size={14} /> : <Copy size={14} />} {isCopied ? "Tersalin!" : "Copy"}</button>
          </div>
        </div>
        <SyntaxHighlighter children={codeString} language={language === 'text' || language === 'code' ? 'javascript' : language} style={theme === 'dark' ? vscDarkPlus : coy} customStyle={{ margin: 0, padding: '1.2rem', fontSize: '0.85em', background: 'transparent' }} wrapLines={true} lineProps={(lineNumber) => { const line = codeString.split('\n')[lineNumber - 1] || ""; if (language === 'diff') { if (line.startsWith('+')) return { style: { backgroundColor: theme === 'dark' ? 'rgba(46, 160, 67, 0.2)' : 'rgba(46, 160, 67, 0.15)', display: 'block', width: '100%' } }; else if (line.startsWith('-')) return { style: { backgroundColor: theme === 'dark' ? 'rgba(248, 81, 73, 0.2)' : 'rgba(248, 81, 73, 0.15)', display: 'block', width: '100%' } }; } return {}; }} />
      </div>
    );
  }
  return <code className={`px-1.5 py-0.5 rounded-md font-mono text-sm ${theme === 'dark' ? 'bg-white/10 text-blue-300' : 'bg-black/5 text-blue-600'}`}>{children}</code>;
};

// =====================================
// ⚡ CUSTOM AUDIO PLAYER COMPONENT
// =====================================
const CustomAudioPlayer = ({ src, theme }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause(); 
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const skip = (amount) => {
    if(audioRef.current) audioRef.current.currentTime += amount;
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    if (dur > 0) setProgress((current / dur) * 100);
    setCurrentTime(formatTime(current));
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  return (
    <div className={`w-full max-w-sm flex flex-col gap-3 p-4 rounded-2xl border shadow-lg transition-all my-3 ${theme === 'dark' ? 'bg-[#1e1f20]/90 backdrop-blur-md border-white/10' : 'bg-white/90 backdrop-blur-md border-gray-200'}`}>
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} className="hidden" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button onClick={() => skip(-10)} className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400 hover:bg-white/5' : 'text-gray-500 hover:text-blue-600 hover:bg-black/5'}`}><Rewind size={16}/></button>
          <button onClick={togglePlay} className="p-3 bg-gradient-to-tr from-blue-600 to-blue-400 text-white rounded-full shadow-md hover:scale-105 active:scale-95 transition-all">
            {isPlaying ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
          </button>
          <button onClick={() => skip(10)} className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400 hover:bg-white/5' : 'text-gray-500 hover:text-blue-600 hover:bg-black/5'}`}><FastForward size={16}/></button>
        </div>
        
        <div className="flex items-end gap-[3px] h-8 flex-1 mx-4 justify-center overflow-hidden">
          {[...Array(14)].map((_, i) => (
            <motion.div key={i} animate={{ height: isPlaying ? ['20%', '100%', '30%', '80%', '40%'] : '10%' }} transition={{ repeat: Infinity, duration: 0.5 + (i % 3) * 0.2, ease: "easeInOut", delay: i * 0.05 }} className={`w-1.5 rounded-full ${theme === 'dark' ? 'bg-blue-500/80' : 'bg-blue-600/80'}`} />
          ))}
        </div>
        <div className={`text-xs font-mono font-medium min-w-[35px] text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{currentTime}</div>
      </div>
      <input type="range" min="0" max="100" value={progress || 0} onChange={handleProgressChange} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none accent-blue-500 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
    </div>
  );
};

// =====================================
// APLIKASI UTAMA
// =====================================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768); 
  const [selectedModel, setSelectedModel] = useState("auto");
  const [selectedPersona, setSelectedPersona] = useState("default");
  const [attachments, setAttachments] = useState([]); 
  const fileInputRef = useRef(null);
  
  const [previewCode, setPreviewCode] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeCanvasTab, setActiveCanvasTab] = useState("preview"); 
  const [theme, setTheme] = useState(() => localStorage.getItem("andiie_theme") || "dark");

  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const wsInstance = useRef(null);
  const [sshStatus, setSshStatus] = useState("disconnected");
  const [sshCreds, setSshCreds] = useState({ host: "", port: "22", username: "", password: "" });

  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [commandFilter, setCommandFilter] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState('all');

  const [slashCommands, setSlashCommands] = useState([]);
  const [isManagePromptOpen, setIsManagePromptOpen] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ command: "", description: "", prompt: "" });

  // ⚡ STATE UNTUK PROJECT WORKSPACE
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [projectsList, setProjectsList] = useState(() => { const saved = localStorage.getItem("andiie_projects"); return saved ? JSON.parse(saved) : []; });

  useEffect(() => { localStorage.setItem("andiie_projects", JSON.stringify(projectsList)); }, [projectsList]);

  const slashCommandsList = [
    { command: "/fix-diff", description: "Perbaiki bug (Visual Warna Diff)", prompt: "Tolong perbaiki kode ini. Tampilkan perubahannya menggunakan blok kode berformat 'diff' (awali baris yang dihapus dengan '-' dan baris baru dengan '+')." },
    { command: "/review", description: "Cari bug & error", prompt: "Tolong review baris kode ini, cari bug atau potensi error, dan berikan solusinya." },
    { command: "/refactor", description: "Bersihkan kode", prompt: "Tolong tulis ulang kode ini agar lebih bersih, efisien, rapi, dan tambahkan komentar." },
    { command: "/explain", description: "Jelaskan kode", prompt: "Tolong jelaskan cara kerja kode ini baris demi baris." },
  ];

  const allPrompts = [...slashCommandsList, ...slashCommands];

  const handleInputChange = (e) => { const val = e.target.value; setInput(val); if (val.startsWith("/")) { setShowSlashCommands(true); setCommandFilter(val.substring(1).toLowerCase()); } else { setShowSlashCommands(false); } };
  const applySlashCommand = (promptText) => { setInput(promptText); setShowSlashCommands(false); };

  const [sessions, setSessions] = useState(() => { const saved = localStorage.getItem("andiie_chat_history"); return saved ? JSON.parse(saved) : []; });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const chatEndRef = useRef(null);

  const generatedMedia = useMemo(() => ekstrakMediaDariRiwayat(sessions), [sessions]);
  const filteredMedia = generatedMedia.filter(m => galleryFilter === 'all' || m.type === galleryFilter);

  const fetchPrompts = async () => { if (supabase) { const { data, error } = await supabase.from('andiie_prompts').select('*').order('created_at', { ascending: true }); if (!error && data) setSlashCommands(data); } };
  const savePrompt = async () => { if (!newPrompt.command || !newPrompt.prompt) return; if (supabase) { const cmd = newPrompt.command.startsWith('/') ? newPrompt.command : '/' + newPrompt.command; const { error } = await supabase.from('andiie_prompts').upsert({ ...newPrompt, command: cmd }); if (!error) { fetchPrompts(); setNewPrompt({ command: "", description: "", prompt: "" }); } } };
  const deletePrompt = async (id) => { if (supabase) { await supabase.from('andiie_prompts').delete().eq('id', id); fetchPrompts(); } };
  useEffect(() => { fetchPrompts(); }, []);

  const exportChatToZip = async () => {
    const zip = new JSZip(); let fileCount = 0;
    messages.forEach((msg, idx) => {
      if (msg.role === 'ai') {
        const codeRegex = /```(\w+)?\n([\s\S]*?)```/g; let match;
        while ((match = codeRegex.exec(msg.text)) !== null) {
          const lang = match[1] || 'txt'; const code = match[2];
          const fileNameMatch = code.match(/(?:\/\/|#)\s*FILE:\s*([a-zA-Z0-9._-]+)/i);
          const fileName = fileNameMatch ? fileNameMatch[1] : `ai_generated_${idx}_${fileCount}.${lang}`;
          zip.file(fileName, code); fileCount++;
        }
      }
    });
    if (fileCount > 0) { const content = await zip.generateAsync({ type: "blob" }); const url = window.URL.createObjectURL(content); const a = document.createElement('a'); a.href = url; a.download = `Project_Andiie_${Date.now()}.zip`; a.click(); window.URL.revokeObjectURL(url); } else { alert("Tidak ada blok kode yang ditemukan di obrolan ini."); }
  };

  const generateGitCommit = () => { setInput("Tolong buatkan pesan Git Commit yang profesional (Conventional Commits) berdasarkan seluruh perubahan kode yang kamu berikan di obrolan ini."); };

  useEffect(() => { if (theme === "dark") document.documentElement.classList.add("dark"); else document.documentElement.classList.remove("dark"); localStorage.setItem("andiie_theme", theme); }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");
  useEffect(() => { const handleResize = () => { if(window.innerWidth > 768) setIsSidebarOpen(true); else setIsSidebarOpen(false); }; window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);
  useEffect(() => { if (localStorage.getItem("andiie_auth") === "true") setIsLoggedIn(true); const fetchChats = async () => { if (supabase) { const { data } = await supabase.from('andiie_chats').select('*').order('updated_at', { ascending: false }); if (data && data.length > 0) { setSessions(data); localStorage.setItem("andiie_chat_history", JSON.stringify(data)); } } }; fetchChats(); }, []);
  useEffect(() => { if (isStreaming) return; if (currentSessionId && messages.length > 0) { const pengirimOtomatis = setTimeout(() => { setSessions(prev => { const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages } : s); localStorage.setItem("andiie_chat_history", JSON.stringify(updated)); if (supabase) { const sesiSaatIni = updated.find(s => s.id === currentSessionId); if (sesiSaatIni) { supabase.from('andiie_chats').upsert({ id: currentSessionId, title: sesiSaatIni.title, messages: messages, updated_at: new Date() }).then(({ error }) => { if (error) console.error("Supabase Error:", error.message); }); } } return updated; }); }, 2000); return () => clearTimeout(pengirimOtomatis); } }, [messages, currentSessionId, isStreaming]); 
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isStreaming]);

  const initTerminal = () => { if (!terminalRef.current) return; if (xtermInstance.current) xtermInstance.current.dispose(); const term = new Terminal({ cursorBlink: true, theme: { background: '#1e1f20', foreground: '#a8c7fa', cursor: '#3b82f6' }, fontFamily: 'monospace', fontSize: 14 }); const fitAddon = new FitAddon(); term.loadAddon(fitAddon); term.open(terminalRef.current); fitAddon.fit(); xtermInstance.current = term; window.addEventListener('resize', () => fitAddon.fit()); };
  const connectSSH = async (e) => { e.preventDefault(); setSshStatus("connecting"); initTerminal(); const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"; const wsUrl = BACKEND_URL.replace(/^http/, 'ws') + '/api/terminal/ws'; const ws = new WebSocket(wsUrl); wsInstance.current = ws; ws.onopen = () => { ws.send(JSON.stringify(sshCreds)); setSshStatus("connected"); }; ws.onmessage = (event) => { if (xtermInstance.current) xtermInstance.current.write(event.data); }; ws.onclose = () => { setSshStatus("disconnected"); if (xtermInstance.current) xtermInstance.current.write('\r\n\x1b[31m[Koneksi Terputus]\x1b[0m\r\n'); }; if (xtermInstance.current) { xtermInstance.current.onData((data) => { if (ws.readyState === WebSocket.OPEN) ws.send(data); }); } };
  const disconnectSSH = () => { if (wsInstance.current) wsInstance.current.close(); setSshStatus("disconnected"); };
  useEffect(() => { if (activeCanvasTab !== "terminal" && xtermInstance.current) { xtermInstance.current.dispose(); xtermInstance.current = null; } if (activeCanvasTab === "terminal" && sshStatus === "connected") { setTimeout(() => initTerminal(), 100); } }, [activeCanvasTab]);

  const handleLogin = (e) => { e.preventDefault(); if (loginData.username === "andiie" && loginData.password === "Arsyad160216") { setIsLoggedIn(true); localStorage.setItem("andiie_auth", "true"); } else { alert("Akses Ditolak: Hanya untuk Andi."); } };
  const handleLogout = () => { localStorage.removeItem("andiie_auth"); setIsLoggedIn(false); };
  const buatChatBaru = () => { setCurrentSessionId(null); setMessages([]); setActiveRoute(null); setIsPreviewOpen(false); setAttachments([]); if(window.innerWidth < 768) setIsSidebarOpen(false); };
  const muatChatLama = (id) => { if (isStreaming) return; const sesi = sessions.find(s => s.id === id); if (sesi) { setCurrentSessionId(id); setMessages(sesi.messages); setActiveRoute(null); setAttachments([]); if(window.innerWidth < 768) setIsSidebarOpen(false); } };
  const hapusChat = async (e, id) => { e.stopPropagation(); const updated = sessions.filter(s => s.id !== id); setSessions(updated); localStorage.setItem("andiie_chat_history", JSON.stringify(updated)); if (currentSessionId === id) buatChatBaru(); if (supabase) await supabase.from('andiie_chats').delete().eq('id', id); };
  const handleFileChange = (e) => { if (e.target.files) { const filesArray = Array.from(e.target.files).map(file => ({ name: file.name, type: file.type, rawFile: file })); setAttachments(prev => [...prev, ...filesArray]); } e.target.value = null; };
  const hapusAttachment = (idx) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  const bacaFile = async (file) => {
    if (file.name.endsWith('.zip') || file.type.includes('zip')) {
      try {
        const zip = new JSZip(); const loadedZip = await zip.loadAsync(file); let extractedText = ""; const MAX_CHARS = 150000; let isLimitReached = false;
        for (const relativePath of Object.keys(loadedZip.files)) {
          if (isLimitReached) break;
          const zipEntry = loadedZip.files[relativePath]; if (zipEntry.dir) continue;
          const badFolders = ['node_modules/', '.git/', 'venv/', 'dist/', 'build/', '.next/', 'out/', '__pycache__/'];
          if (badFolders.some(folder => relativePath.includes(folder))) continue;
          const isImageOrBinary = /\.(png|jpg|jpeg|gif|mp4|exe|pdf|ico|svg|lock|map|ttf|woff|woff2|eot|log)$/i.test(relativePath); if (isImageOrBinary) continue;
          const fileContent = await zipEntry.async('string'); extractedText += `\n\n--- [FILE DARI ZIP: ${relativePath}] ---\n${fileContent}\n`;
          if (extractedText.length > MAX_CHARS) { extractedText += `\n\n[PERINGATAN SISTEM: Proyek ZIP terlalu besar. Pemotongan otomatis dilakukan.]`; isLimitReached = true; }
        } return { type: 'text', name: file.name + " (Extracted)", content: extractedText };
      } catch (error) { return { type: 'text', name: file.name, content: `[Gagal memproses ZIP: ${error.message}]` }; }
    } 
    return new Promise((resolve) => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) { reader.onload = (e) => resolve({ type: 'image', name: file.name, content: e.target.result }); reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') { reader.onload = (e) => resolve({ type: 'application/pdf', name: file.name, content: e.target.result }); reader.readAsDataURL(file); 
      } else { reader.onload = (e) => resolve({ type: 'text', name: file.name, content: e.target.result }); reader.readAsText(file); }
    });
  };

  const unduhGambar = async (url) => { try { const respon = await fetch(url); if (!respon.ok) throw new Error("Diblokir CORS"); const blob = await respon.blob(); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "media-ai-studio.png"; document.body.appendChild(link); link.click(); document.body.removeChild(link); } catch (err) { window.open(url, '_blank'); } };

  const kirimPesan = async () => {
    if (!input.trim() && attachments.length === 0) return; if (isStreaming) return;
    const instruksiUser = input || "Tolong analisis file lampiran ini."; 
    setInput(""); setShowSlashCommands(false); setIsStreaming(true); setActiveRoute(null);
    const fileYangDiproses = await Promise.all(attachments.map(a => bacaFile(a.rawFile))); const historyKirim = [...messages]; 
    let sessionId = currentSessionId;
    if (!sessionId) { sessionId = Date.now().toString(); setCurrentSessionId(sessionId); const judulBaru = instruksiUser.length > 25 ? instruksiUser.substring(0, 25) + "..." : instruksiUser; setSessions(prev => [{ id: sessionId, title: judulBaru, messages: [] }, ...prev]); }
    
    const teksTampilan = attachments.length > 0 ? `📎 [MENGIRIM ${attachments.length} FILE]\n${instruksiUser}` : instruksiUser;
    setMessages(prev => [...prev, { role: "user", text: teksTampilan }, { role: "ai", text: "" }]);

    // ⚡ INJEKSI CLAUDE-STYLE & KONTEKS PROYEK
    let instruksiKeBackend = instruksiUser;
    const isCodingRequest = instruksiUser.toLowerCase().includes('kode') || instruksiUser.toLowerCase().includes('code') || instruksiUser.toLowerCase().includes('script') || instruksiUser.toLowerCase().includes('buatkan');
    if (isCodingRequest) {
      instruksiKeBackend += `\n\n[SYSTEM DIRECTIVE: Bertindaklah sebagai Senior AI Architect (sekelas Claude Opus). Jika Anda memberikan kode pemrograman, ANDA DILARANG KERAS hanya memberikan kode mentah. ANDA WAJIB: 1) Menjelaskan arsitektur dan logika kode tersebut. 2) Memberikan panduan Step-by-Step cara deploy, install, atau menjalankannya. 3) Memastikan kode siap produksi.]`;
    }
    if (activeProject) {
       instruksiKeBackend += `\n\n[PROJECT CONTEXT: Pengguna saat ini sedang bekerja pada proyek "${activeProject.name}". Aturan khusus proyek ini: ${activeProject.context}. Selalu ikuti aturan ini dalam setiap jawaban Anda.]`;
    }

    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_KEY || ""; 
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"; const controller = new AbortController();
      const isMultimediaModel = ["openai/dall-e-3", "suno-api-custom", "sora", "veo", "wan", "seedance", "riverflow"].some(m => selectedModel.includes(m));
      const timeoutId = setTimeout(() => controller.abort(), isMultimediaModel ? 600000 : 60000); 
      const respon = await fetch(`${BACKEND_URL}/api/chat/stream`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instruksi: instruksiKeBackend, history: historyKirim, paksa_model: selectedModel, kunci_rahasia: "KODE_RAHASIA_ANDIIE_2026", persona: selectedPersona, attachments: fileYangDiproses }), signal: controller.signal });
      clearTimeout(timeoutId); if (!respon.ok) throw new Error("Server Lokal Menolak");
      const reader = respon.body.getReader(); const decoder = new TextDecoder("utf-8"); let bufferText = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break; const chunk = decoder.decode(value, { stream: true });
        if (chunk.includes("RUTE_AKTIF:")) { const ruteMatch = chunk.match(/RUTE_AKTIF:(.*?)\n\n/); if (ruteMatch) setActiveRoute(ruteMatch[1]); bufferText += chunk.replace(/RUTE_AKTIF:.*\n\n/, ""); } else { bufferText += chunk; }
        setMessages(prev => { const newMessages = [...prev]; newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: bufferText }; return newMessages; });
      }
    } catch (error) {
      setActiveRoute("OPENROUTER DARURAT (LAPTOP MATI)");
      try {
        if(!OPENROUTER_API_KEY) throw new Error("VITE_OPENROUTER_KEY belum diisi di Vercel!");
        const openRouterMessages = historyKirim.map(msg => ({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text })); openRouterMessages.push({ role: "user", content: instruksiKeBackend });
        const fallbackModel = selectedModel === "google/gemma-4-31b-it" ? "google/gemma-4-31b-it" : "qwen/qwen3-coder:30b";
        const responOpenRouter = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: fallbackModel, messages: openRouterMessages, stream: true }) });
        const reader = responOpenRouter.body.getReader(); const decoder = new TextDecoder("utf-8"); let bufferText = "";
        while (true) {
          const { done, value } = await reader.read(); if (done) break; const chunk = decoder.decode(value, { stream: true }); const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) { if (line.includes('[DONE]')) break; if (line.startsWith('data: ')) { try { const data = JSON.parse(line.replace('data: ', '')); if (data.choices[0].delta.content) { bufferText += data.choices[0].delta.content; setMessages(prev => { const newMsg = [...prev]; newMsg[newMsg.length - 1].text = bufferText; return newMsg; }); } } catch (e) {} } }
        }
      } catch (fatalError) { setMessages(prev => { const newMessages = [...prev]; newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: `❌ Sistem Gagal: Laptop Mati & API tidak merespons. Error: ${fatalError.message}` }; return newMessages; }); }
    } finally { setIsStreaming(false); setAttachments([]); }
  };

  if (!isLoggedIn) { return ( <div className={`h-screen flex items-center justify-center p-4 transition-colors ${theme === 'dark' ? 'bg-[#131314]' : 'bg-[#f0f4f9]'}`}> <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-8 rounded-[32px] w-full max-w-md shadow-2xl transition-colors ${theme === 'dark' ? 'bg-[#1e1f20]/80 backdrop-blur-xl border border-white/5' : 'bg-white/80 backdrop-blur-xl border border-gray-200'}`}> <div className="flex justify-center mb-6"> <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><Lock className="text-white" size={28} /></div> </div> <h2 className={`text-2xl font-semibold text-center mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>AI Studio Pro</h2> <p className="text-gray-400 text-center text-sm mb-8">Secure Login (Andiie)</p> <form onSubmit={handleLogin} className="space-y-4"> <input type="text" placeholder="Username" className={`w-full rounded-xl p-3.5 outline-none transition-colors border ${theme === 'dark' ? 'bg-[#131314] border-gray-700 text-white focus:border-blue-500' : 'bg-[#f0f4f9] border-gray-200 text-gray-800 focus:border-blue-500'}`} onChange={(e) => setLoginData({...loginData, username: e.target.value})} /> <input type="password" placeholder="Sandi" className={`w-full rounded-xl p-3.5 outline-none transition-colors border ${theme === 'dark' ? 'bg-[#131314] border-gray-700 text-white focus:border-blue-500' : 'bg-[#f0f4f9] border-gray-200 text-gray-800 focus:border-blue-500'}`} onChange={(e) => setLoginData({...loginData, password: e.target.value})} /> <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg active:scale-95">Masuk</button> </form> </motion.div> </div> ); }

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors selection:bg-blue-500/30 relative ${theme === 'dark' ? 'bg-[#131314] text-[#e3e3e3]' : 'bg-[#f8f9fa] text-gray-800'}`}>
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.3 }} className={`fixed md:relative inset-y-0 left-0 w-72 flex flex-col shadow-2xl z-50 shrink-0 transition-colors ${theme === 'dark' ? 'bg-[#1e1f20]/95 backdrop-blur-xl border-r border-white/5' : 'bg-white/95 backdrop-blur-xl border-r border-gray-200'}`}>
              <div className="p-4 flex justify-between items-center">
                <button onClick={buatChatBaru} className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-colors shadow-sm ${theme === 'dark' ? 'bg-[#131314] hover:bg-[#282a2c] text-white border border-gray-700/50' : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200'}`}><Plus size={18} className="text-blue-500" /> Chat baru</button>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-2 p-2 text-gray-400 hover:text-blue-500"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
                
                {/* ⚡ TOMBOL PROJECT WORKSPACE */}
                <button onClick={() => setIsProjectsOpen(true)} className={`w-full flex items-center justify-between px-4 py-3 mb-2 rounded-2xl text-sm font-bold transition-all shadow-sm border ${activeProject ? (theme === 'dark' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200') : (theme === 'dark' ? 'bg-white/5 text-gray-300 border-white/5 hover:bg-white/10' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}`}>
                  <div className="flex items-center gap-3"><FolderKanban size={18} /> {activeProject ? activeProject.name : "Projects Workspace"}</div>
                  <ChevronRight size={16} className="opacity-50"/>
                </button>

                <button onClick={() => setIsGalleryOpen(true)} className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-2xl text-sm font-bold transition-all shadow-sm border ${theme === 'dark' ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' : 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 border-purple-200 hover:bg-purple-100'}`}>
                  <Sparkles size={18} /> Item Buatan Saya ({generatedMedia.length})
                </button>

                <button onClick={() => setIsManagePromptOpen(true)} className={`w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-2xl text-sm font-bold transition-all shadow-sm border ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>
                  <Settings size={18} /> Kelola Prompt Dinamis
                </button>

                <div className="text-xs text-gray-500 font-bold px-2 py-2 uppercase tracking-widest mt-4 mb-2">Riwayat Percakapan</div>
                {sessions.map(sesi => (
                  <div key={sesi.id} onClick={() => muatChatLama(sesi.id)} className={`group flex items-center justify-between px-3 py-2.5 rounded-full cursor-pointer transition-all ${currentSessionId === sesi.id ? (theme === 'dark' ? 'bg-[#282a2c] text-blue-300' : 'bg-blue-100 text-blue-800') : (theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-600')}`}>
                    <div className="flex items-center gap-3 overflow-hidden"><MessageSquare size={16} className="shrink-0" /><span className="truncate text-sm font-medium">{sesi.title}</span></div>
                    <button onClick={(e) => hapusChat(e, sesi.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}><button onClick={handleLogout} className="w-full text-xs text-gray-500 hover:text-red-500 transition-colors text-left px-2">Log out (Andiie)</button></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col min-w-0 relative transition-colors ${theme === 'dark' ? 'bg-[#131314]' : 'bg-[#f8f9fa]'}`}>
        
        {/* ⚡ HEADER NATIVE STYLE (Glassmorphism) */}
        <header className={`sticky top-0 z-30 flex items-center justify-between p-2 md:p-3 w-full overflow-hidden transition-all ${theme === 'dark' ? 'bg-[#131314]/70 backdrop-blur-xl border-b border-white/5' : 'bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm'}`}>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setIsSidebarOpen(prev => !prev)} className={`p-1.5 md:p-2 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'hover:bg-[#282a2c] text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`} title="Menu">
              <Menu size={20} />
            </button>
            <span className="font-semibold text-base md:text-lg tracking-tight hidden sm:block truncate">
              AI Studio <span className="text-blue-500 text-[10px] md:text-xs font-bold bg-blue-500/10 px-1.5 py-0.5 rounded-md ml-1">PRO</span>
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {messages.length > 0 && (
              <>
                <button onClick={exportChatToZip} className={`p-1.5 md:p-2 rounded-full transition-all shrink-0 ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} title="Export Kode ke ZIP"><Archive size={16} className="md:w-[18px] md:h-[18px]" /></button>
                <button onClick={generateGitCommit} className={`p-1.5 md:p-2 rounded-full transition-all shrink-0 ${theme === 'dark' ? 'bg-gray-700/50 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} title="Buat Git Commit Message"><GitCommit size={16} className="md:w-[18px] md:h-[18px]" /></button>
              </>
            )}

            <button onClick={toggleTheme} className={`p-1.5 md:p-2 rounded-full transition-all shrink-0 ${theme === 'dark' ? 'bg-[#1e1f20] text-yellow-400 hover:bg-[#282a2c]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {theme === 'dark' ? <Sun size={16} className="md:w-[18px] md:h-[18px]" /> : <Moon size={16} className="md:w-[18px] md:h-[18px]" />}
            </button>

            <button onClick={() => { setIsPreviewOpen(true); setActiveCanvasTab("terminal"); }} className={`flex items-center justify-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${theme === 'dark' ? 'bg-[#1e1f20] border-gray-700 text-green-400 hover:bg-[#282a2c]' : 'bg-white border-gray-300 text-green-600 hover:bg-gray-50'}`} title="Buka SSH Terminal">
              <TerminalSquare size={16} className="md:w-[14px] md:h-[14px]" /> 
              <span className="hidden md:inline">SSH Terminal</span>
            </button>

            <button onClick={() => setSelectedModel(prev => prev === "auto_coding" ? "auto" : "auto_coding")} className={`flex items-center justify-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${selectedModel === "auto_coding" ? (theme === 'dark' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-blue-100 border-blue-500 text-blue-700") : (theme === 'dark' ? "bg-[#1e1f20] border-gray-700 text-gray-400 hover:text-white" : "bg-white border-gray-300 text-gray-600 hover:text-gray-900")}`}>
              <Code size={16} className="md:w-[14px] md:h-[14px]" /> 
              <span className="hidden md:inline">Mode Coding</span>
            </button>
            
            <select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)} className={`text-xs font-semibold rounded-full px-3 py-1.5 outline-none hidden lg:block border transition-colors shrink-0 ${theme === 'dark' ? 'bg-[#1e1f20] border-gray-700 text-purple-400' : 'bg-white border-gray-300 text-purple-600'}`}>
              <option value="default">👤 Asisten Umum</option><option value="kartos">🤖 Ahli Robotika</option><option value="seiso">🏨 IT Hotel</option>
            </select>
            
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className={`text-[10px] md:text-xs font-semibold rounded-full px-2 md:px-3 py-1.5 outline-none w-[90px] sm:w-[110px] md:w-auto md:max-w-xs truncate border shrink-0 transition-colors ${theme === 'dark' ? 'bg-[#1e1f20] border-gray-700 text-[#a8c7fa]' : 'bg-white border-gray-300 text-blue-700'}`}>
              <optgroup label="🧠 Deep Thinking & Research"><option value="SEARCH_MODE">🌐 Deep Web Research (Internet)</option><option value="deepseek/deepseek-r1">💭 DeepSeek R1 (Reasoning)</option><option value="openai/o3-mini">🧠 OpenAI o3-mini (Math/Logic)</option></optgroup>
              <optgroup label="📝 Text & General"><option value="auto">✨ Auto Smart Manager</option><option value="google/gemma-4-31b-it">🔵 Google: Gemma 4 31B (Free)</option></optgroup>
              <optgroup label="💻 Coding & Logic"><option value="auto_coding">⚡ Auto Coding (Lokal/Cloud)</option><option value="anthropic/claude-opus-4.6">🧠 Claude Opus 4.6</option><option value="anthropic/claude-sonnet-4.6">⚡ Claude Sonnet 4.6</option><option value="openai/gpt-5.3-codex">🚀 GPT-5.3 Codex</option><option value="qwen/qwen3-coder-next">☁️ Qwen3 Coder Next</option><option value="lokal">💻 Qwen 30B (Lokal Ollama)</option></optgroup>
              <optgroup label="🎨 Gambar (Images)"><option value="sourceful/riverflow-v2-pro">🌊 Riverflow V2 Pro</option><option value="google/gemini-3.1-flash-image-preview">🖼️ Gemini 3.1 Flash</option><option value="openai/dall-e-3">🎨 DALL-E 3</option></optgroup>
              <optgroup label="🎬 Video Generation"><option value="bytedance/seedance-2.0">💃 ByteDance: Seedance 2.0</option><option value="alibaba/wan-2.7">🎥 Alibaba: Wan 2.7</option><option value="openai/sora-2-pro">🌌 OpenAI: Sora 2 Pro</option><option value="google/veo-3.1">📽️ Google: Veo 3.1</option></optgroup>
              <optgroup label="🎵 Lagu & Audio"><option value="google/lyria-3-clip-preview">🎼 Google: Lyria 3</option><option value="suno-api-custom">🎸 Suno API</option></optgroup>
            </select>
          </div>
        </header>

        {/* ⚡ MODAL PROJECT WORKSPACE */}
        <AnimatePresence>
          {isProjectsOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`w-full max-w-2xl rounded-[32px] p-6 shadow-2xl border flex flex-col max-h-[85vh] ${theme === 'dark' ? 'bg-[#1e1f20] border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><div className="p-2 bg-orange-500/20 text-orange-500 rounded-xl"><Layers size={20}/></div><h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Projects Workspace</h2></div><button onClick={() => setIsProjectsOpen(false)} className="text-gray-400 hover:text-gray-600"><X/></button></div>
                
                <div className="grid md:grid-cols-2 gap-6 overflow-y-auto pr-2 scrollbar-hide">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Buat Project Baru</h3>
                    <input id="projName" placeholder="Nama Project (misal: Aplikasi Hotel)" className={`w-full p-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-[#131314] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`} />
                    <textarea id="projCtx" placeholder="Instruksi Khusus (misal: Gunakan framework React Tailwind...)" rows="5" className={`w-full p-3 rounded-xl border outline-none resize-none ${theme === 'dark' ? 'bg-[#131314] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`} />
                    <button onClick={() => {
                        const n = document.getElementById('projName').value; const c = document.getElementById('projCtx').value;
                        if(n) { setProjectsList([...projectsList, { id: Date.now(), name: n, context: c }]); document.getElementById('projName').value=''; document.getElementById('projCtx').value=''; }
                    }} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><Plus size={18}/> Simpan Project</button>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Daftar Project</h3>
                    <div className={`p-4 rounded-2xl border cursor-pointer transition-all ${!activeProject ? 'ring-2 ring-blue-500 border-transparent bg-blue-500/10' : (theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50')}`} onClick={() => setActiveProject(null)}>
                        <div className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Tidak Ada (Chat Umum)</div>
                    </div>
                    {projectsList.map(proj => (
                      <div key={proj.id} className={`p-4 rounded-2xl border cursor-pointer transition-all relative group ${activeProject?.id === proj.id ? 'ring-2 ring-orange-500 border-transparent bg-orange-500/10' : (theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50')}`} onClick={() => setActiveProject(proj)}>
                        <div className="font-bold text-sm text-orange-500">{proj.name}</div>
                        <div className="text-xs text-gray-500 truncate mt-1">{proj.context}</div>
                        <button onClick={(e) => { e.stopPropagation(); setProjectsList(projectsList.filter(p => p.id !== proj.id)); if(activeProject?.id === proj.id) setActiveProject(null); }} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ⚡ MODAL GALERI DENGAN CUSTOM AUDIO PLAYER */}
        <AnimatePresence>
          {isGalleryOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`w-full max-w-5xl h-full max-h-[85vh] rounded-[32px] flex flex-col overflow-hidden shadow-2xl border ${theme === 'dark' ? 'bg-[#1e1f20] border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 md:p-5 border-b flex justify-between items-center shrink-0 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg"><Sparkles className="text-white" size={20}/></div>
                    <h2 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Item Buatan Saya</h2>
                  </div>
                  <button onClick={() => setIsGalleryOpen(false)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}><X size={20}/></button>
                </div>
                <div className={`flex gap-2 p-4 shrink-0 border-b overflow-x-auto scrollbar-hide ${theme === 'dark' ? 'border-white/5 bg-[#131314]' : 'border-gray-100 bg-gray-50'}`}>
                  {['all', 'image', 'video', 'audio'].map(filter => (
                     <button key={filter} onClick={() => setGalleryFilter(filter)} className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors border ${galleryFilter === filter ? (theme === 'dark' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-300') : (theme === 'dark' ? 'bg-[#1e1f20] text-gray-400 border-gray-700 hover:text-white' : 'bg-white text-gray-600 border-gray-300 hover:text-gray-900')}`}>
                        {filter === 'all' ? 'Semua Media' : filter === 'image' ? '🖼️ Gambar' : filter === 'video' ? '🎬 Video' : '🎵 Audio'}
                     </button>
                  ))}
                </div>
                <div className={`flex-1 overflow-y-auto p-4 md:p-6 ${theme === 'dark' ? 'bg-[#131314]/50' : 'bg-gray-50'}`}>
                   {filteredMedia.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                         <LayoutGrid size={48} className="opacity-20" />
                         <p>Belum ada media yang di-generate.</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                         {filteredMedia.map((media, i) => (
                            <div key={i} className={`relative group rounded-3xl overflow-hidden border shadow-md flex flex-col items-center justify-center transition-all ${media.type === 'audio' ? 'p-4 aspect-auto' : 'aspect-square'} ${theme === 'dark' ? 'bg-[#1e1f20] border-white/10' : 'bg-white border-gray-200'}`}>
                               {media.type === 'image' && <img src={media.url} alt="Gen" className="absolute inset-0 w-full h-full object-cover" />}
                               {media.type === 'video' && <video src={media.url} className="absolute inset-0 w-full h-full object-cover bg-black" controls muted />}
                               
                               {/* RENDER CUSTOM AUDIO PLAYER DI GALERI */}
                               {media.type === 'audio' && (
                                  <div className="w-full flex flex-col items-center">
                                    <Music size={32} className="text-purple-500 opacity-50 mb-2" />
                                    <CustomAudioPlayer src={media.url} theme={theme} />
                                  </div>
                               )}
                               
                               <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between z-20 pointer-events-none">
                                  <span className="text-[10px] text-white/90 font-medium truncate pr-2 pt-1.5">{media.title}</span>
                                  <button onClick={() => unduhGambar(media.url)} className="p-1.5 bg-white/20 hover:bg-blue-500 rounded-lg text-white backdrop-blur-sm transition-colors shrink-0 pointer-events-auto" title="Download"><Download size={14}/></button>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL KELOLA PROMPT DINAMIS */}
        <AnimatePresence>
          {isManagePromptOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`w-full max-w-xl rounded-[32px] p-6 shadow-2xl border ${theme === 'dark' ? 'bg-[#1e1f20] border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Kelola Prompt Dinamis</h2>
                  <button onClick={() => setIsManagePromptOpen(false)} className="text-gray-400 hover:text-gray-600"><X/></button>
                </div>
                <div className="space-y-4 mb-8">
                  <input placeholder="/perintah (misal: /review)" className={`w-full p-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-[#131314] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`} value={newPrompt.command} onChange={e => setNewPrompt({...newPrompt, command: e.target.value})} />
                  <input placeholder="Deskripsi singkat" className={`w-full p-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-[#131314] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`} value={newPrompt.description} onChange={e => setNewPrompt({...newPrompt, description: e.target.value})} />
                  <textarea placeholder="Isi Prompt panjang..." rows="3" className={`w-full p-3 rounded-xl border outline-none resize-none ${theme === 'dark' ? 'bg-[#131314] border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`} value={newPrompt.prompt} onChange={e => setNewPrompt({...newPrompt, prompt: e.target.value})} />
                  <button onClick={savePrompt} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><Save size={18}/> Simpan ke Supabase</button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-hide">
                  {slashCommands.map(cmd => (
                    <div key={cmd.id} className={`flex justify-between items-center p-3 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <div>
                        <div className="font-bold text-blue-500">{cmd.command}</div>
                        <div className="text-xs text-gray-500">{cmd.description}</div>
                      </div>
                      <button onClick={() => deletePrompt(cmd.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  {slashCommands.length === 0 && <div className="text-center text-sm text-gray-500 italic py-4">Belum ada prompt tersimpan.</div>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-row overflow-hidden relative">
          <main className={`flex-1 overflow-y-auto scroll-smooth pb-40 transition-all ${isPreviewOpen && window.innerWidth > 768 ? (theme === 'dark' ? 'w-1/2 border-r border-white/10' : 'w-1/2 border-r border-gray-200') : 'w-full'}`}>
            <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
              {messages.length === 0 && (
                <div className="mt-16 md:mt-24 px-2 text-center md:text-left">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Halo, Andi.</h1>
                  <h2 className={`text-2xl md:text-4xl font-medium tracking-tight ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Apa yang kita bangun hari ini?</h2>
                  {activeProject && (<div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full text-sm font-bold"><FolderKanban size={16}/> Project Aktif: {activeProject.name}</div>)}
                </div>
              )}
              <div className="space-y-8 mt-6">
                {messages.map((chat, idx) => (
                  <div key={idx} className={`flex gap-4 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {chat.role === 'ai' && (
                      <div className="w-8 h-8 shrink-0 flex items-start justify-center pt-1 hidden md:flex">
                        {isStreaming && idx === messages.length - 1 ? <Loader2 className="animate-spin text-blue-500" size={22} /> : <Sparkles className="text-blue-500" size={22} />}
                      </div>
                    )}
                    <div className={`max-w-[90%] md:max-w-[85%] ${chat.role === 'user' ? (theme === 'dark' ? 'bg-[#282a2c] text-[#e3e3e3] shadow-md' : 'bg-blue-600 text-white shadow-md') + ' px-5 py-3 md:px-6 md:py-4 rounded-[28px] rounded-br-sm text-[15px]' : 'text-[15px] leading-relaxed w-full overflow-hidden'}`}>
                      {chat.role === 'ai' ? (
                        <div className={`prose prose-sm md:prose-base max-w-none break-words ${theme === 'dark' ? 'prose-invert' : 'prose-gray'}`}>
                          
                          {/* ⚡ RENDER AUDIO PLAYER DI CHAT MARKDOWN */}
                          <ReactMarkdown 
                            urlTransform={(value) => value} 
                            components={{ 
                              code(props) { return <SmartCodeBlock {...props} theme={theme} setActiveCanvasTab={setActiveCanvasTab} setIsPreviewOpen={setIsPreviewOpen} setPreviewCode={setPreviewCode} />; },
                              a(props) {
                                if (props.children && props.children[0] === 'AUDIO_PLAYER') {
                                  return <CustomAudioPlayer src={props.href} theme={theme} />;
                                }
                                return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{props.children}</a>;
                              }
                            }}
                          >
                            {chat.text}
                          </ReactMarkdown>

                        </div>
                      ) : <div className="whitespace-pre-wrap">{chat.text}</div>}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          </main>

          <AnimatePresence>
            {isPreviewOpen && (
              <motion.div initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className={`flex flex-col shadow-2xl z-40 ${window.innerWidth <= 768 ? 'absolute inset-0 w-full' : 'w-1/2 relative border-l'} ${theme === 'dark' ? 'bg-[#1e1f20]/95 backdrop-blur-xl border-white/10' : 'bg-gray-50/95 backdrop-blur-xl border-gray-200'}`}>
                
                {/* ⚡ HEADER TAB PANEL KANAN */}
                <div className={`p-2 flex justify-between items-center shrink-0 border-b ${theme === 'dark' ? 'bg-[#131314]/50 border-white/5' : 'bg-white/50 border-gray-200'}`}>
                  <div className={`flex p-1 rounded-full ${theme === 'dark' ? 'bg-[#1e1f20]' : 'bg-gray-100'}`}>
                    <button onClick={() => setActiveCanvasTab("preview")} className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5 transition-colors ${activeCanvasTab === "preview" ? (theme === 'dark' ? "bg-blue-600/20 text-blue-400" : "bg-white text-blue-600 shadow-sm") : "text-gray-500 hover:text-gray-700"}`}><Play size={14} /> Preview</button>
                    <button onClick={() => setActiveCanvasTab("code")} className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5 transition-colors ${activeCanvasTab === "code" ? (theme === 'dark' ? "bg-[#282a2c] text-white" : "bg-white text-gray-800 shadow-sm") : "text-gray-500 hover:text-gray-700"}`}><Code size={14} /> Code</button>
                    <button onClick={() => setActiveCanvasTab("terminal")} className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5 transition-colors ${activeCanvasTab === "terminal" ? (theme === 'dark' ? "bg-green-600/20 text-green-400" : "bg-white text-green-600 shadow-sm") : "text-gray-500 hover:text-gray-700"}`}><TerminalSquare size={14} /> Terminal</button>
                  </div>
                  <button onClick={() => setIsPreviewOpen(false)} className="p-1.5 hover:bg-gray-200/50 rounded-full text-gray-400 mr-1"><X size={18} /></button>
                </div>

                {/* ⚡ ISI PANEL KANAN */}
                <div className={`flex-1 relative ${theme === 'dark' ? 'bg-[#1e1f20]/50' : 'bg-transparent'}`}>
                  {activeCanvasTab === "code" && (<textarea value={previewCode} onChange={(e) => setPreviewCode(e.target.value)} className={`absolute inset-0 w-full h-full bg-transparent font-mono text-[13px] p-5 outline-none resize-none ${theme === 'dark' ? 'text-[#a8c7fa]' : 'text-blue-800'}`} spellCheck="false" />)}
                  {activeCanvasTab === "preview" && (<div className="absolute inset-0 bg-white"><iframe title="CanvasPreview" srcDoc={previewCode} className="w-full h-full border-none" sandbox="allow-scripts allow-modals allow-same-origin" /></div>)}
                  
                  {/* UI TERMINAL SSH */}
                  {activeCanvasTab === "terminal" && (
                    <div className="absolute inset-0 flex flex-col h-full bg-[#1e1f20]">
                      {sshStatus === "disconnected" ? (
                        <div className="flex-1 flex items-center justify-center p-6">
                          <form onSubmit={connectSSH} className="bg-[#282a2c] p-6 rounded-3xl w-full max-w-sm border border-gray-700 shadow-2xl">
                            <div className="flex justify-center mb-4"><Server size={32} className="text-green-500" /></div>
                            <h3 className="text-white text-center font-bold mb-4">Remote SSH Terminal</h3>
                            <div className="space-y-3">
                              <input required type="text" placeholder="IP Address (contoh: 192.168.1.5)" className="w-full bg-[#131314] text-white p-3 rounded-xl text-sm border border-gray-700 outline-none focus:border-green-500" value={sshCreds.host} onChange={e => setSshCreds({...sshCreds, host: e.target.value})} />
                              <input required type="text" placeholder="Username (contoh: pi)" className="w-full bg-[#131314] text-white p-3 rounded-xl text-sm border border-gray-700 outline-none focus:border-green-500" value={sshCreds.username} onChange={e => setSshCreds({...sshCreds, username: e.target.value})} />
                              <input required type="password" placeholder="Password" className="w-full bg-[#131314] text-white p-3 rounded-xl text-sm border border-gray-700 outline-none focus:border-green-500" value={sshCreds.password} onChange={e => setSshCreds({...sshCreds, password: e.target.value})} />
                              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold p-3 rounded-xl transition-colors mt-2">Connect to Server</button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div className="bg-[#131314] text-xs px-4 py-2 border-b border-gray-800 flex justify-between items-center text-gray-400">
                            <span>📡 Connected to: <span className="text-green-400 font-mono">{sshCreds.username}@{sshCreds.host}</span></span>
                            <button onClick={disconnectSSH} className="text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded hover:bg-white/5">Disconnect</button>
                          </div>
                          <div ref={terminalRef} className="flex-1 w-full p-2 bg-[#1e1f20] overflow-hidden" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ⚡ INPUT BAWAH NATIVE STYLE (Glassmorphism) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 pb-6 md:pb-8 bg-gradient-to-t from-black/20 to-transparent z-20 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto relative">
            
            <AnimatePresence>
              {showSlashCommands && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`absolute bottom-[calc(100%+15px)] left-0 w-full md:w-2/3 rounded-3xl shadow-2xl border overflow-hidden z-50 ${theme === 'dark' ? 'bg-[#1e1f20]/95 backdrop-blur-xl border-gray-700' : 'bg-white/95 backdrop-blur-xl border-gray-200'}`}>
                  <div className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-b flex items-center gap-1.5 ${theme === 'dark' ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-100'}`}><Zap size={14} className="text-yellow-500" /> Prompt Cepat</div>
                  <div className="max-h-60 overflow-y-auto scrollbar-hide">
                    {allPrompts.filter(c => c.command.toLowerCase().includes(commandFilter)).length === 0 ? (
                      <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Perintah tidak ditemukan</div>
                    ) : (
                      allPrompts.filter(c => c.command.toLowerCase().includes(commandFilter)).map((cmd, i) => (
                        <button key={i} onClick={() => applySlashCommand(cmd.prompt)} className={`w-full text-left px-5 py-4 flex flex-col transition-colors border-b last:border-0 ${theme === 'dark' ? 'hover:bg-[#282a2c] border-white/5 text-gray-200' : 'hover:bg-gray-50 border-gray-50 text-gray-800'}`}>
                          <span className="font-bold text-sm text-blue-500">{cmd.command}</span><span className={`text-xs mt-1 truncate w-full ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{cmd.description}</span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((file, idx) => ( <div key={idx} className={`border rounded-full px-4 py-1.5 flex items-center gap-2 text-xs shadow-sm ${theme === 'dark' ? 'bg-[#282a2c]/90 backdrop-blur-md border-gray-700 text-gray-300' : 'bg-white/90 backdrop-blur-md border-gray-200 text-gray-700'}`}><span className="truncate max-w-[120px] font-medium">{file.name}</span><button onClick={() => hapusAttachment(idx)} className="hover:text-red-500 bg-black/5 rounded-full p-0.5"><X size={12}/></button></div> ))}
              </div>
            )}
            
            <div className={`rounded-[32px] p-2 flex items-end gap-2 shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-[#1e1f20]/80 backdrop-blur-xl border border-white/10 focus-within:border-white/30' : 'bg-white/80 backdrop-blur-xl border border-gray-200 focus-within:border-blue-300 focus-within:shadow-blue-500/10'}`}>
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} className={`p-3 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}><Paperclip size={24} /></button>
              <textarea className={`flex-1 bg-transparent border-none focus:ring-0 text-[16px] py-3.5 px-2 outline-none resize-none max-h-32 min-h-[50px] ${theme === 'dark' ? 'text-[#e3e3e3] placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`} placeholder="Ketik '/' untuk prompt cepat..." rows="1" value={input} onChange={handleInputChange} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirimPesan(); } }} disabled={isStreaming} />
              <button onClick={kirimPesan} disabled={isStreaming || !input.trim()} className={`p-3.5 rounded-full transition-all active:scale-90 shadow-md ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200 disabled:bg-[#282a2c] disabled:text-gray-600 disabled:shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none'}`}>{isStreaming ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}</button>
            </div>
            <div className={`text-center text-[10px] mt-3 font-bold tracking-widest uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{activeRoute ? `JALUR: ${activeRoute}` : "SISTEM SIAP"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}