import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Sparkles, Cpu, CloudLightning, Loader2, Code2, Menu, Plus, MessageSquare, Trash2 } from 'lucide-react';

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState("auto");
  
  // Sistem Riwayat Chat
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("andiie_chat_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  const chatEndRef = useRef(null);

  // Simpan ke LocalStorage tiap ada perubahan pesan
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => {
        const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages } : s);
        localStorage.setItem("andiie_chat_history", JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, currentSessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const buatChatBaru = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setActiveRoute(null);
  };

  const muatChatLama = (id) => {
    if (isStreaming) return;
    const sesi = sessions.find(s => s.id === id);
    if (sesi) {
      setCurrentSessionId(id);
      setMessages(sesi.messages);
      setActiveRoute(null);
    }
  };

  const hapusChat = (e, id) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("andiie_chat_history", JSON.stringify(updated));
    if (currentSessionId === id) buatChatBaru();
  };

  const kirimPesan = async () => {
    if (!input.trim() || isStreaming) return;
    
    const instruksiUser = input;
    setInput("");
    setIsStreaming(true);
    setActiveRoute(null);

    // Buat Sesi Baru jika belum ada
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
      const judulBaru = instruksiUser.length > 25 ? instruksiUser.substring(0, 25) + "..." : instruksiUser;
      setSessions(prev => [{ id: sessionId, title: judulBaru, messages: [] }, ...prev]);
    }

    setMessages(prev => [
      ...prev, 
      { role: "user", text: instruksiUser },
      { role: "ai", text: "" } 
    ]);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const respon = await fetch("http://localhost:8000/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          instruksi: instruksiUser, 
          paksa_model: selectedModel,
          kunci_rahasia: "KODE_RAHASIA_ANDIIE_2026" // <-- Kunci Rahasianya masuk di sini
        })
      });

      if (!respon.ok) throw new Error("Gagal terhubung ke mesin");

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
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = { ...newMessages[lastIndex], text: bufferText };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = { ...newMessages[lastIndex], text: "⚠️ Koneksi terputus. Pastikan `uvicorn server:app` menyala." };
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* SIDEBAR GEMINI */}
      <div className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 ease-in-out bg-[#1e1f20] shrink-0 flex flex-col border-r border-white/5 overflow-hidden`}>
        <div className="p-4">
          <button onClick={buatChatBaru} className="flex items-center gap-3 bg-[#131314] hover:bg-[#282a2c] px-4 py-3 rounded-full text-sm font-medium transition-colors border border-gray-700/50 w-full">
            <Plus size={18} className="text-[#a8c7fa]" />
            Chat baru
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-xs text-gray-400 font-medium mb-3 px-2 mt-2">Terbaru</div>
          {sessions.map(sesi => (
            <div key={sesi.id} onClick={() => muatChatLama(sesi.id)} className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${currentSessionId === sesi.id ? 'bg-[#282a2c] text-blue-300' : 'hover:bg-[#282a2c] text-gray-300'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate text-sm">{sesi.title}</span>
              </div>
              <button onClick={(e) => hapusChat(e, sesi.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* HEADER */}
        <header className="flex items-center justify-between p-4 bg-[#131314]/80 backdrop-blur-md z-10 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#282a2c] rounded-full transition-colors text-gray-400">
              <Menu size={20} />
            </button>
            <span className="font-medium text-lg tracking-wide hidden sm:block">AI Coder Studio</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* DROPDOWN MODEL SELECTION */}
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#1e1f20] hover:bg-[#282a2c] border border-gray-700 text-[#a8c7fa] text-sm rounded-lg px-3 py-2 focus:outline-none cursor-pointer transition-colors"
            >
              <optgroup label="Auto Routing">
                <option value="auto">✨ Auto (Manager GPT-4o-mini)</option>
              </optgroup>
              <optgroup label="Lokal (Ollama)">
                <option value="lokal">💻 Qwen 30B GGUF (Lokal)</option>
              </optgroup>
              <optgroup label="Cloud (OpenRouter)">
                <option value="anthropic/claude-3.5-sonnet">🧠 Claude 3.5 Sonnet</option>
                <option value="openai/gpt-4o">⚡ GPT-4o (OpenAI)</option>
                <option value="qwen/qwen-2.5-coder-32b-instruct">☁️ Qwen 32B Coder</option>
                <option value="meta-llama/llama-3.1-70b-instruct">🦙 Llama 3.1 70B</option>
              </optgroup>
            </select>
          </div>
        </header>

        {/* AREA CHAT */}
        <main className="flex-1 overflow-y-auto scroll-smooth pb-32">
          <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-16 md:mt-24 px-2">
                <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-2">
                  <span className="bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent">Halo, Andi.</span>
                </h1>
                <h2 className="text-3xl md:text-5xl font-medium text-[#444746] tracking-tight mb-12">Siap ngoding hari ini?</h2>
              </motion.div>
            )}

            <div className="space-y-8 mt-6">
              {messages.map((chat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {chat.role === 'ai' && (
                    <div className="w-8 h-8 shrink-0 flex items-start justify-center pt-1">
                      {isStreaming && idx === messages.length - 1 ? <Loader2 className="animate-spin text-[#a8c7fa]" size={22} /> : <Sparkles className="text-[#a8c7fa]" size={22} />}
                    </div>
                  )}
                  <div className={`max-w-[85%] md:max-w-[80%] ${chat.role === 'user' ? 'bg-[#282a2c] px-5 py-3.5 rounded-3xl rounded-tr-sm text-[15px]' : 'text-[15px] leading-relaxed w-full'}`}>
                    {chat.role === 'ai' ? (
                      <div className="prose prose-invert max-w-none prose-pre:bg-[#1e1f20] prose-pre:border prose-pre:border-gray-800 prose-p:mb-4">
                        <ReactMarkdown
                          components={{
                            code(props) {
                              const {children, className, node, ...rest} = props;
                              const match = /language-(\w+)/.exec(className || '');
                              return match ? (
                                <div className="overflow-hidden rounded-xl border border-gray-700/50 my-4 bg-[#1e1f20] shadow-xl">
                                  <div className="flex items-center px-4 py-2 bg-[#282a2c] text-xs font-mono text-gray-400 border-b border-gray-800">{match[1]}</div>
                                  <SyntaxHighlighter {...rest} PreTag="div" children={String(children).replace(/\n$/, '')} language={match[1]} style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent', padding: '1rem' }} />
                                </div>
                              ) : <code {...rest} className="bg-[#282a2c] px-1.5 py-0.5 rounded-md text-[#a8c7fa] font-mono text-[0.85em]">{children}</code>;
                            }
                          }}
                        >
                          {chat.text}
                        </ReactMarkdown>
                      </div>
                    ) : ( <div className="whitespace-pre-wrap">{chat.text}</div> )}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} className="h-4" />
            </div>
          </div>
        </main>

        {/* INPUT PILL */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent pt-12 pb-6 px-4 md:px-8">
          <div className="max-w-3xl mx-auto bg-[#1e1f20] rounded-full pl-6 pr-2 py-2 flex items-center gap-3 shadow-2xl focus-within:bg-[#282a2c] transition-colors border border-white/5 focus-within:border-white/10">
            <input 
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] text-[#e3e3e3] placeholder-gray-500 py-3 outline-none"
              placeholder="Tanya AI atau paste instruksi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && kirimPesan()}
              disabled={isStreaming}
            />
            <button 
              onClick={kirimPesan}
              disabled={isStreaming || !input.trim()}
              className="p-3 bg-[#a8c7fa] hover:bg-[#b9d2f6] disabled:bg-[#1e1f20] disabled:text-gray-600 text-[#131314] rounded-full transition-colors flex items-center justify-center shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center text-[11px] text-gray-500 mt-3 font-medium flex justify-center items-center gap-2">
            Status: {activeRoute ? <span className="text-emerald-400">Aktif ({activeRoute})</span> : "Menunggu Tugas"}
          </div>
        </div>
      </div>
    </div>
  );
}