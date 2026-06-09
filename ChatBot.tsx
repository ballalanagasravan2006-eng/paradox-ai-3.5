import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Terminal, Cpu, RefreshCw, Layers } from "lucide-react";
import { motion } from "motion/react";
import { ChatMessage } from "../types";

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Greetings, traveler. I am Paradox. I operate at the intersection of clarity and contradiction, human nuance and machine bandwidth. What dimensions shall we explore today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showTuner, setShowTuner] = useState(false);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    if (!textToSend) setInputValue("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          customSystemPrompt: customPrompt.trim() || undefined
        })
      });

      if (!res.ok) {
        throw new Error("Failure on Paradox network bridge.");
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: data.text || "I apologize, but my connection flickered. Please restate.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: `[SYSTEM DIAGNOSTIC: CONNECTION BROKEN] - ${err.message || "Failed to link with Paradox intelligence servers"}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format text with blocks, inline mono and bold text safely
  const formatText = (content: string) => {
    const blocks = content.split("```");
    return blocks.map((block, index) => {
      const isCodeBlock = index % 2 === 1;
      if (isCodeBlock) {
        // Find language label
        const codeLines = block.split("\n");
        const lang = codeLines[0].trim() || "typescript";
        const code = codeLines.slice(1).join("\n");
        return (
          <div key={index} className="my-3 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
            <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800/80 text-slate-400">
              <span className="text-[10px] uppercase tracking-wider">{lang}</span>
              <span className="text-[10px] text-cyan-500 font-bold uppercase">Synthesized Snippet</span>
            </div>
            <pre className="p-4 bg-slate-950/80 overflow-x-auto text-cyan-100">
              <code>{code}</code>
            </pre>
          </div>
        );
      } else {
        // Basic paragraph render with formatting
        const paragraphs = block.split("\n").filter(p => p.trim());
        return paragraphs.map((para, pIdx) => {
          // Parse bold text **bold**
          const boldParts = para.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={`${index}-${pIdx}`} className="mb-2.5 text-[14px]">
              {boldParts.map((part, bIdx) => {
                if (bIdx % 2 === 1) {
                  return <strong key={bIdx} className="text-cyan-400 font-semibold">{part}</strong>;
                }
                // Parse inline mono text `code`
                const inlineParts = part.split(/`(.*?)`/g);
                return inlineParts.map((subPart, iIdx) => {
                  if (iIdx % 2 === 1) {
                    return <code key={iIdx} className="bg-slate-900 border border-slate-800/90 rounded px-1.5 py-0.5 text-xs text-indigo-400 font-mono">{subPart}</code>;
                  }
                  return subPart;
                });
              })}
            </p>
          );
        });
      }
    });
  };

  const cleanHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: "Paradox mental state recycled. History database cleared. I am fully available.",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const PRESETS = [
    { label: "Challenge Paradox", query: "Challenge me with a logical paradox that explains human behavior." },
    { label: "Cosmic Perspective", query: "Describe the aesthetics of a black hole from an artistic standpoint." },
    { label: "Witticism", query: "Give me an smart, human-like observation on modern office habits." },
    { label: "Philosophy of Code", query: "Is simple code better than complex abstractions? Explain philosophically." }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950/25 border border-slate-905/30 rounded-3xl overflow-hidden backdrop-blur-md">
      {/* Header Panel */}
      <div className="bg-slate-900/50 backdrop-blur border-b border-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-1.5">
              PARADOX CORE <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Intellectual Synapse Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTuner(!showTuner)}
            className={`px-3 py-1.5 border rounded-xl text-xs font-mono flex items-center gap-1.5 transition cursor-pointer ${
              showTuner ? "border-cyan-500/50 bg-cyan-950 text-cyan-400" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Persona Tuner
          </button>
          <button
            onClick={cleanHistory}
            className="p-2 border border-slate-800 bg-slate-900/60 rounded-xl text-slate-400 hover:text-rose-400 hover:border-rose-950/50 transition cursor-pointer"
            title="Recycle Mind State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tuner Drawdown */}
      {showTuner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-slate-900/90 border-b border-slate-800/60 px-6 py-4 text-xs shrink-0"
        >
          <p className="font-mono text-cyan-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <Terminal className="w-3 h-3" /> Cognitive Directive (Custom System Prompt)
          </p>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. 'You are a highly intellectual medieval technomancer' or 'Speak as a cautious Quantum Cryptographer...'"
            className="w-full bg-slate-950 border border-slate-800/80 p-3 rounded-xl focus:border-cyan-500/50 focus:outline-none font-mono text-slate-200 leading-relaxed placeholder:text-slate-600 resize-none h-16"
          />
          <div className="flex justify-between items-center mt-2 font-mono text-[9px] text-slate-500">
            <span>MODULATING COGNITION SPEED...</span>
            <button
              onClick={() => { setCustomPrompt(""); setShowTuner(false); }}
              className="text-indigo-400 hover:underline cursor-pointer"
            >
              Reset to Paradox default
            </button>
          </div>
        </motion.div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar min-h-0 bg-slate-950/10">
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border uppercase font-mono text-xs select-none ${
                  isUser
                    ? "bg-slate-900 border-indigo-700/40 text-indigo-400 shadow shadow-indigo-505/10"
                    : "bg-slate-900 border-cyan-700/40 text-cyan-400 shadow shadow-cyan-505/10"
                }`}
              >
                {isUser ? "ME" : "PX"}
              </div>

              {/* Msg Box */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3.5 leading-relaxed relative ${
                  isUser
                    ? "bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-900/40 text-slate-100"
                    : "bg-gradient-to-br from-cyan-950/20 to-slate-900/80 border border-cyan-950/30 text-slate-200 shadow-xl shadow-slate-950/20"
                }`}
              >
                {formatText(msg.text)}
                <span className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-cyan-800/40 text-cyan-400 flex items-center justify-center shrink-0 font-mono text-xs">
              PX
            </div>
            <div className="bg-slate-900/40 border border-slate-900/60 rounded-2xl px-5 py-4 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs font-mono text-slate-400 tracking-wider">Parsing quantum signals...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Preset Queries panel */}
      {messages.length === 1 && !loading && (
        <div className="px-6 py-2 shrink-0">
          <p className="text-[10px] font-mono text-slate-500 tracking-widest mb-2 flex items-center gap-1 uppercase">
            <Layers className="w-3 h-3" /> Quick synaptic entryways:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset.query)}
                className="text-[11px] px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded-xl transition cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Tray */}
      <div className="p-4 bg-slate-900/30 border-t border-slate-900 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            placeholder="Address Paradox AI... (Use natural human speech)"
            className="flex-1 bg-slate-950/80 border border-slate-800/80 p-3 px-4 rounded-xl focus:border-cyan-500/40 focus:outline-none text-sm text-slate-150 leading-relaxed placeholder:text-slate-600 font-sans"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="p-3 bg-cyan-500 select-none text-slate-950 rounded-xl hover:bg-cyan-400 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4 stroke-[2.2]" />
          </button>
        </form>
      </div>
    </div>
  );
}
