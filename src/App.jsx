import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Sparkles, Loader2, Menu, Plus, MessageSquare, Trash2, Lock, Play, X, LayoutTemplate, Paperclip } from 'lucide-react';
import { createClient } from '@supabase/supabase-js'; 
import JSZip from 'jszip'; // ⚡ IMPORT JSZIP (PEMBONGKAR ZIP DI BROWSER)

// ==========================================
// KONFIGURASI SUPABASE (DATABASE AWAN)
// ==========================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default function App() {
  // --- STATE AUTH ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // --- STATE CHAT & UI ---
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("auto");
  
  // --- STATE PERSONA & ATTACHMENTS ---
  const [selectedPersona, setSelectedPersona] = useState("default");
  const [attachments, setAttachments] = useState([]); 
  const fileInputRef = useRef(null);
  
  // --- STATE CANVAS PREVIEW ---
  const [previewCode, setPreviewCode] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // --- LOGIKA MEMORY (LOKAL + CLOUD) ---
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("andiie_chat_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const chatEndRef = useRef(null);

  // --- EFEK AUTH ---
  useEffect(() => {
    if (localStorage.getItem("andiie_auth") === "true") setIsLoggedIn(true);
  }, []);

  // ⚡ 1. EFEK AMBIL DATA DARI AWAN SAAT WEB DIBUKA
  useEffect(() => {
    const fetchChats = async () => {
      if (supabase) {
        const { data, error } = await supabase.from('andiie_chats').select('*').order('updated_at', { ascending: false });
        if (data && data.length > 0) {
          setSessions(data);
          localStorage.setItem("andiie_chat_history", JSON.stringify(data));
          return;
        }
      }
    };
    fetchChats();
  }, []);

  // ⚡ 2. EFEK SIMPAN DATA KE AWAN (DILENGKAPI ALARM ERROR)
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => {
        const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages } : s);
        localStorage.setItem("andiie_chat_history", JSON.stringify(updated));
        
        // Simpan ke Supabase di latar belakang
        if (supabase) {
          const sesiSaatIni = updated.find(s => s.id === currentSessionId);
          if (sesiSaatIni) {
            supabase.from('andiie_chats').upsert({ 
              id: currentSessionId, 
              title: sesiSaatIni.title, 
              messages: messages,
              updated_at: new Date()
            }).then(({ error }) => {
              if (error) {
                console.error("❌ Gagal upload ke Supabase:", error.message);
                if (!window.hasAlertedSupabase) {
                  alert("Gagal menyimpan ke Awan:\n" + error.message);
                  window.hasAlertedSupabase = true; 
                }
              } else {
                console.log("☁️ Tersimpan otomatis di Supabase");
              }
            });
          }
        } else {
          if (!window.hasAlertedSupabaseKey) {
            console.error("Kunci Supabase belum terdeteksi. Cek VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Vercel.");
            window.hasAlertedSupabaseKey = true;
          }
        }
        return updated;
      });
    }
  }, [messages, currentSessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // --- FUNGSI LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === "andiie" && loginData.password === "Arsyad160216") {
      setIsLoggedIn(true);
      localStorage.setItem("andiie_auth", "true");
    } else {
      alert("Akses Ditolak: Hanya untuk Andi.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("andiie_auth");
    setIsLoggedIn(false);
  };

  // --- FUNGSI MANAJEMEN CHAT ---
  const buatChatBaru = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setActiveRoute(null);
    setIsPreviewOpen(false);
    setAttachments([]);
  };

  const muatChatLama = (id) => {
    if (isStreaming) return;
    const sesi = sessions.find(s => s.id === id);
    if (sesi) {
      setCurrentSessionId(id);
      setMessages(sesi.messages);
      setActiveRoute(null);
      setAttachments([]); 
    }
  };

  const hapusChat = async (e, id) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("andiie_chat_history", JSON.stringify(updated));
    if (currentSessionId === id) buatChatBaru();

    if (supabase) {
      await supabase.from('andiie_chats').delete().eq('id', id);
    }
  };

  // --- LOGIKA UPLOAD UI ---
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        name: file.name,
        type: file.type,
        rawFile: file 
      }));
      setAttachments(prev => [...prev, ...filesArray]);
    }
    e.target.value = null; 
  };

  const hapusAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // ⚡ --- FUNGSI PEMBACA FILE PRO (DILENGKAPI JSZIP & FILTER ANTI 8MB) ---
  const bacaFile = async (file) => {
    return new Promise(async (resolve, reject) => {
      
      // ⚡ JIKA FILE ADALAH ZIP -> Ekstrak Langsung di Browser!
      if (file.name.endsWith('.zip') || file.type.includes('zip')) {
        try {
          const zip = new JSZip();
          const loadedZip = await zip.loadAsync(file);
          let extractedText = "";
          
          // ⛔ REM DARURAT: Batas teks ~150 KB (Sangat aman dari batas 8 MB OpenRouter)
          const MAX_CHARS = 150000; 
          let isLimitReached = false;

          // Baca setiap file di dalam zip satu per satu
          for (const relativePath of Object.keys(loadedZip.files)) {
            if (isLimitReached) break;

            const zipEntry = loadedZip.files[relativePath];
            
            // Abaikan folder
            if (zipEntry.dir) continue;
            
            // ⛔ FILTER 1: Buang folder sampah & hasil build
            const badFolders = ['node_modules/', '.git/', 'venv/', 'dist/', 'build/', '.next/', 'out/', '__pycache__/'];
            if (badFolders.some(folder => relativePath.includes(folder))) continue;
            
            // ⛔ FILTER 2: Buang gambar, binary, dan file teks raksasa (.lock, .map)
            const isImageOrBinary = /\.(png|jpg|jpeg|gif|mp4|exe|pdf|ico|svg|lock|map|ttf|woff|woff2|eot|log)$/i.test(relativePath);
            if (isImageOrBinary) continue;

            // Ekstrak teks kodenya
            const fileContent = await zipEntry.async('string');
            extractedText += `\n\n--- [FILE DARI ZIP: ${relativePath}] ---\n${fileContent}\n`;

            // Cek apakah teks sudah terlalu panjang
            if (extractedText.length > MAX_CHARS) {
              extractedText += `\n\n[PERINGATAN SISTEM: Proyek ZIP terlalu besar. Pemotongan dilakukan otomatis agar API OpenRouter tidak menolak (Limit 8MB).]`;
              isLimitReached = true;
            }
          }

          resolve({ 
            type: 'text', 
            name: file.name + " (Extracted)", 
            content: extractedText 
          });
        } catch (error) {
          resolve({ type: 'text', name: file.name, content: `[Gagal memproses ZIP di browser: ${error.message}]` });
        }
      } 
      // JIKA GAMBAR -> Base64
      else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ type: 'image', name: file.name, content: e.target.result });
        reader.readAsDataURL(file);
      } 
      // JIKA PDF -> Base64
      else if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ type: 'application/pdf', name: file.name, content: e.target.result });
        reader.readAsDataURL(file); 
      }
      // JIKA TEKS BIASA
      else {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ type: 'text', name: file.name, content: e.target.result });
        reader.readAsText(file);
      }
    });
  };

  // --- FUNGSI KIRIM PESAN ---
  const kirimPesan = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (isStreaming) return;
    
    const instruksiUser = input || "Tolong analisis file lampiran ini."; 
    setInput("");
    setIsStreaming(true);
    setActiveRoute(null);

    // Membaca file
    const fileYangDiproses = await Promise.all(attachments.map(a => bacaFile(a.rawFile)));

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
      const judulBaru = instruksiUser.length > 25 ? instruksiUser.substring(0, 25) + "..." : instruksiUser;
      setSessions(prev => [{ id: sessionId, title: judulBaru, messages: [] }, ...prev]);
    }

    const teksTampilan = attachments.length > 0 ? `📎 [MENGIRIM ${attachments.length} FILE]\n${instruksiUser}` : instruksiUser;
    setMessages(prev => [...prev, { role: "user", text: teksTampilan }, { role: "ai", text: "" }]);

    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const targetAPI = `${BACKEND_URL}/api/chat/stream`; 

      const respon = await fetch(targetAPI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          instruksi: instruksiUser, 
          paksa_model: selectedModel,
          kunci_rahasia: "KODE_RAHASIA_ANDIIE_2026",
          persona: selectedPersona, 
          attachments: fileYangDiproses 
        })
      });

      if (!respon.ok) throw new Error("Gagal menghubungi server Python.");

      const reader = respon.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let bufferText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        if (chunk.includes("RUTE_AKTIF:")) {
          const ruteMatch = chunk.match(/RUTE_AKTIF:(.*?)\n\n/);
          if (ruteMatch) setActiveRoute(ruteMatch[1]);
          bufferText += chunk.replace(/RUTE_AKTIF:.*\n\n/, ""); 
        } else {
          bufferText += chunk;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: bufferText };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: `⚠️ Error: ${error.message}` };
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
      setAttachments([]); 
    }
  };

  // --- RENDER HALAMAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-[#131314] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e1f20] p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Lock className="text-white" size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-center text-white mb-2">AI Coder Studio</h2>
          <p className="text-gray-400 text-center text-sm mb-8">Hanya untuk Andiie & Project ABAPE</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" placeholder="Username" 
              className="w-full bg-[#131314] border border-gray-700 rounded-xl p-3.5 outline-none focus:border-blue-500 transition-all text-white"
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
            />
            <input 
              type="password" placeholder="Sandi" 
              className="w-full bg-[#131314] border border-gray-700 rounded-xl p-3.5 outline-none focus:border-blue-500 transition-all text-white"
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg active:scale-95">
              Masuk
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- RENDER DASHBOARD UTAMA ---
  return (
    <div className="flex h-screen bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 ease-in-out bg-[#1e1f20] shrink-0 flex flex-col border-r border-white/5 overflow-hidden z-20`}>
        <div className="p-4">
          <button onClick={buatChatBaru} className="flex items-center gap-3 bg-[#131314] hover:bg-[#282a2c] px-4 py-3 rounded-full text-sm font-medium transition-colors border border-gray-700/50 w-full shadow-sm">
            <Plus size={18} className="text-[#a8c7fa]" /> Chat baru
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-hide">
          <div className="text-xs text-gray-500 font-bold px-2 py-2 uppercase tracking-widest">Riwayat</div>
          {sessions.map(sesi => (
            <div key={sesi.id} onClick={() => muatChatLama(sesi.id)} className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${currentSessionId === sesi.id ? 'bg-[#282a2c] text-blue-300 shadow-inner' : 'hover:bg-[#282a2c]/50 text-gray-400'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate text-sm font-medium">{sesi.title}</span>
              </div>
              <button onClick={(e) => hapusChat(e, sesi.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/5">
           <button onClick={handleLogout} className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors text-left px-2">Log out (Andiie)</button>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex min-w-0 bg-[#131314]">
        
        {/* KOLOM CHAT */}
        <div className={`flex flex-col relative transition-all duration-500 ${isPreviewOpen ? 'w-1/2 border-r border-white/10' : 'w-full'}`}>
          <header className="flex items-center justify-between p-4 bg-[#131314]/80 backdrop-blur-md z-10 border-b border-white/5">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#282a2c] rounded-full transition-colors text-gray-400"><Menu size={20} /></button>
              <span className="font-medium text-lg tracking-tight hidden sm:block">AI Coder Studio <span className="text-blue-500 text-xs font-bold">PRO</span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)} className="bg-[#1e1f20] hover:bg-[#282a2c] border border-gray-700 text-purple-400 text-xs font-semibold rounded-full px-3 py-2 focus:outline-none cursor-pointer transition-all shadow-lg hidden md:block">
                <option value="default">👤 Asisten Umum</option>
                <option value="kartos">🤖 Ahli Robotika</option>
                <option value="seiso">🏨 IT Hotel</option>
                <option value="jlpt">🇯🇵 Sensei JLPT N2</option>
              </select>

              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-[#1e1f20] hover:bg-[#282a2c] border border-gray-700 text-[#a8c7fa] text-xs font-semibold rounded-full px-4 py-2 focus:outline-none cursor-pointer transition-all shadow-lg">
                <optgroup label="Auto Routing">
                  <option value="auto">✨ Auto Smart Manager</option>
                </optgroup>
                <optgroup label="Model Elite 2026 (OpenRouter)">
                  <option value="anthropic/claude-opus-4.6">🧠 Claude Opus 4.6 (Akurasi)</option>
                  <option value="anthropic/claude-sonnet-4.6">⚡ Claude Sonnet 4.6 (Cepat)</option>
                  <option value="openai/gpt-5.3-codex">🚀 GPT-5.3 Codex</option>
                  <option value="qwen/qwen3-coder-next">☁️ Qwen3 Coder Next</option>
                </optgroup>
                <optgroup label="Lokal (Laptop Aero 15)">
                  <option value="lokal">💻 Qwen 30B (Lokal Ollama)</option>
                </optgroup>
              </select>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto scroll-smooth pb-40">
            <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
              {messages.length === 0 && (
                <div className="mt-16 md:mt-24 px-2">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Halo, Andi.</h1>
                  <h2 className="text-3xl md:text-4xl font-medium text-gray-600 tracking-tight">Apa yang kita bangun hari ini?</h2>
                </div>
              )}
              <div className="space-y-10 mt-6">
                {messages.map((chat, idx) => (
                  <div key={idx} className={`flex gap-4 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {chat.role === 'ai' && (
                      <div className="w-8 h-8 shrink-0 flex items-start justify-center pt-1">
                        {isStreaming && idx === messages.length - 1 ? <Loader2 className="animate-spin text-blue-400" size={22} /> : <Sparkles className="text-blue-400" size={22} />}
                      </div>
                    )}
                    <div className={`max-w-[85%] md:max-w-[85%] ${chat.role === 'user' ? 'bg-[#282a2c] px-6 py-4 rounded-3xl rounded-tr-md text-[15px] shadow-sm' : 'text-[15px] leading-relaxed w-full'}`}>
                      {chat.role === 'ai' ? (
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown components={{
                              code(props) {
                                const {children, className, ...rest} = props;
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                
                                const isRenderable = match && (match[1] === 'html' || match[1] === 'xml');

                                return match ? (
                                  <div className="rounded-xl border border-gray-700/50 my-6 bg-[#1e1f20] overflow-hidden shadow-2xl">
                                    <div className="flex items-center justify-between px-4 py-2 bg-[#282a2c] border-b border-gray-800">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{match[1]}</span>
                                      
                                      {isRenderable && (
                                        <button 
                                          onClick={() => { setPreviewCode(codeString); setIsPreviewOpen(true); }}
                                          className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1 rounded-md transition-colors font-medium"
                                        >
                                          <Play size={12} fill="currentColor" /> Preview Canvas
                                        </button>
                                      )}
                                    </div>
                                    <SyntaxHighlighter {...rest} children={codeString} language={match[1]} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9em' }} />
                                  </div>
                                ) : <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">{children}</code>;
                              }
                            }}>
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

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent pt-12 pb-8 px-4 md:px-8 z-20">
            {attachments.length > 0 && (
              <div className="max-w-3xl mx-auto mb-3 flex flex-wrap gap-2 px-4">
                {attachments.map((file, idx) => (
                  <div key={idx} className="bg-[#282a2c] border border-gray-700 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-gray-300 shadow-lg">
                    <span className="truncate max-w-[150px] md:max-w-[200px] font-medium">{file.name}</span>
                    <button onClick={() => hapusAttachment(idx)} className="hover:text-red-400 transition-colors bg-white/5 rounded-full p-0.5"><X size={12}/></button>
                  </div>
                ))}
              </div>
            )}

            <div className="max-w-3xl mx-auto bg-[#1e1f20] rounded-[32px] pl-2 pr-3 py-3 flex items-center gap-2 shadow-2xl border border-white/5 focus-within:border-blue-500/50 transition-all duration-500">
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 shrink-0">
                <Paperclip size={20} />
              </button>

              <input 
                id="chat-input"
                name="chat-input"
                type="text" 
                className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] text-[#e3e3e3] placeholder-gray-500 outline-none" 
                placeholder="Ketik instruksi untuk AI..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && kirimPesan()} 
                disabled={isStreaming} 
              />
              <button onClick={kirimPesan} disabled={isStreaming || !input.trim()} className="p-3.5 bg-white hover:bg-gray-200 disabled:bg-gray-800 text-black rounded-full transition-all flex items-center justify-center shrink-0 shadow-lg active:scale-90"><Send size={20} /></button>
            </div>
            <div className="text-center text-[10px] text-gray-600 mt-4 font-bold tracking-widest uppercase">
              {activeRoute ? `Jalur: ${activeRoute}` : "Sistem Siap"}
            </div>
          </div>
        </div>

        {/* KOLOM CANVAS PREVIEW (LIVE IDE) */}
        {isPreviewOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }} 
            animate={{ width: "50%", opacity: 1 }} 
            exit={{ width: 0, opacity: 0 }} 
            className="flex flex-col bg-[#1e1f20] border-l border-white/10 overflow-hidden shadow-2xl z-30"
          >
            <div className="bg-[#131314] border-b border-white/5 p-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-gray-300 font-semibold text-sm">
                <LayoutTemplate size={18} className="text-blue-500"/>
                <span>Live Canvas IDE</span>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400">
                <X size={18} />
              </button>
            </div>
            
            {/* LINGKUNGAN EDITOR (ATAS) */}
            <div className="h-[45%] border-b border-white/10 flex flex-col relative bg-[#1e1f20] group">
              <div className="text-[10px] text-gray-600 font-mono absolute top-2 right-4 uppercase tracking-widest pointer-events-none group-focus-within:text-blue-500 transition-colors">
                HTML / CSS / JS Editor
              </div>
              <textarea 
                value={previewCode}
                onChange={(e) => setPreviewCode(e.target.value)}
                className="w-full h-full bg-transparent text-[#a8c7fa] font-mono text-[13px] p-5 pt-8 outline-none resize-none selection:bg-blue-500/30"
                spellCheck="false"
                placeholder="Kode HTML akan muncul di sini..."
              />
            </div>

            {/* LINGKUNGAN PREVIEW REAL-TIME (BAWAH) */}
            <div className="h-[55%] bg-white relative">
              <iframe 
                title="CanvasPreview"
                srcDoc={previewCode} 
                className="absolute inset-0 w-full h-full border-none"
                sandbox="allow-scripts allow-modals allow-same-origin"
              />
            </div>
          </motion.div>
        )}