
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Archetype } from '../types';
import { GeminiService } from '../services/geminiService';
import { GIcon, Icons } from './Icons';

interface ForgeOracleProps {
  archetypes: Archetype[];
  onInject: (prompt: string) => void;
  onSaveArchetype: (name: string, content: string) => void;
  onDeleteArchetype: (id: string) => void;
  onClose: () => void;
}

export const ForgeOracle: React.FC<ForgeOracleProps> = ({ 
  archetypes, 
  onInject, 
  onSaveArchetype, 
  onDeleteArchetype, 
  onClose 
}) => {
  const [activeView, setActiveView] = useState<'chat' | 'library'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'ORACLE_CORE_ONLINE. Describe el personaje o temática que deseas sintetizar.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [namingId, setNamingId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
       // Pequeno delay para assegurar que o DOM atualizou após renderizar uma mensagem longa
       setTimeout(() => {
         scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
       }, 50);
    }
  }, [messages, activeView, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await GeminiService.getStructuredPrompt([...messages, userMsg]);
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'ERROR: COMMUNICATION_FAILURE', timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const isStructured = (content: string) => content.includes('skin:') && content.includes('[');

  const handleCommitSave = (content: string) => {
    if (!saveName.trim()) return;
    onSaveArchetype(saveName, content);
    setNamingId(null);
    setSaveName('');
  };

  return (
    <div className="absolute inset-0 z-[1000] bg-black/90 backdrop-blur-3xl p-4 sm:p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      
      {/* Header Tabs */}
      <div className="flex justify-between items-center shrink-0 border-b border-white/10 pb-4 sticky top-0 z-50">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <button 
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-2 sm:gap-3 transition-all ${activeView === 'chat' ? 'opacity-100 scale-105' : 'opacity-40 grayscale'}`}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-indigo-500/30">
              <GIcon d={Icons.Crystal} size={16} className="text-indigo-400" />
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white">Assistant</h2>
              <span className="text-[6px] sm:text-[7px] font-bold text-slate-500 uppercase tracking-widest hidden xs:block">Chat_Oracle</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveView('library')}
            className={`flex items-center gap-2 sm:gap-3 transition-all ${activeView === 'library' ? 'opacity-100 scale-105' : 'opacity-40 grayscale'}`}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-emerald-500/30">
              <GIcon d={Icons.Tree} size={16} className="text-emerald-400" />
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white">Vault</h2>
              <span className="text-[6px] sm:text-[7px] font-bold text-slate-500 uppercase tracking-widest hidden xs:block">Archetypes</span>
            </div>
          </button>
        </div>
        
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {activeView === 'chat' ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Interface */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 no-scrollbar pr-2 pb-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[95%] sm:max-w-[90%] p-4 sm:p-5 rounded-3xl border text-[11px] font-mono leading-relaxed transition-all shadow-xl
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300' 
                    : 'bg-white/[0.03] border-white/5 text-slate-300'}`}>
                  <pre className="whitespace-pre-wrap font-mono">{msg.content}</pre>
                  
                  {msg.role === 'assistant' && isStructured(msg.content) && (
                    <div className="mt-6 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => { onInject(msg.content); onClose(); }}
                          className="py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <GIcon d={Icons.Forge} size={14} />
                          Inject
                        </button>
                        <button 
                          onClick={() => setNamingId(msg.id)}
                          className="py-3 bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <GIcon d={Icons.Alchemy} size={14} />
                          Save
                        </button>
                      </div>

                      {namingId === msg.id && (
                        <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-emerald-500/20 flex gap-3 animate-in slide-in-from-top-2">
                          <input 
                            autoFocus
                            type="text" 
                            placeholder="Nombre..." 
                            value={saveName}
                            onChange={e => setSaveName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCommitSave(msg.content)}
                            className="flex-1 bg-transparent border-none outline-none text-[10px] uppercase font-black tracking-widest text-emerald-400 placeholder:text-emerald-900 min-w-0"
                          />
                          <button 
                            onClick={() => handleCommitSave(msg.content)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase"
                          >
                            OK
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-indigo-500/50 italic text-[10px] animate-pulse">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                Oracle is deciphering design DNA...
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 flex gap-3 bg-black/40 p-2 rounded-2xl border border-white/5 mb-20 sm:mb-0">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Concepto: 'Guerrero Ciberpunk'..."
              className="flex-1 bg-transparent border-none outline-none text-[12px] font-mono-tech text-white px-4 py-2 placeholder:text-slate-800"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl active:scale-90 transition-all disabled:opacity-30 shrink-0"
            >
              <GIcon d={Icons.Forge} size={20} />
            </button>
          </div>
        </div>
      ) : (
        /* Library View */
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
           {archetypes.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center gap-6 opacity-20">
                <GIcon d={Icons.Tree} size={64} />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Vault_Empty</span>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {archetypes.map(arc => (
                  <div key={arc.id} className="group p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:border-emerald-500/30 transition-all flex flex-col gap-4">
                     <div className="flex justify-between items-start">
                        <div className="flex flex-col flex-1 min-w-0">
                           <span className="text-[11px] font-black text-white uppercase tracking-widest truncate">{arc.name}</span>
                           <span className="text-[7px] font-mono text-slate-600 mt-1 uppercase">{new Date(arc.timestamp).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={() => onDeleteArchetype(arc.id)}
                          className="w-8 h-8 rounded-lg bg-rose-600/10 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                           <GIcon d={Icons.Trash} size={14} />
                        </button>
                     </div>
                     
                     <div className="flex-1 max-h-32 overflow-hidden relative">
                        <pre className="text-[8px] font-mono text-slate-500 leading-tight">
                           {arc.content}
                        </pre>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                     </div>

                     <button 
                        onClick={() => { onInject(arc.content); onClose(); }}
                        className="w-full py-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                     >
                        Inject DNA
                     </button>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};
