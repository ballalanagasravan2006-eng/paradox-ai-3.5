import { useState } from "react";
import { 
  Code2, 
  Mail, 
  FileText, 
  Share2, 
  CalendarRange, 
  AppWindow, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Loader2, 
  Languages, 
  Undo2,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ToolId = "code" | "email" | "letter" | "social" | "planner" | "app-assistant";

interface ToolItem {
  id: ToolId;
  name: string;
  category: "dev" | "creative" | "strategy";
  description: string;
  icon: any;
  color: string;
  formFields: {
    placeholder: string;
    label: string;
    detailsLabel?: string;
  };
}

export default function AITools() {
  const [activeToolId, setActiveToolId] = useState<ToolId>("code");
  const [promptInput, setPromptInput] = useState("");
  const [customDetails, setCustomDetails] = useState<any>({
    language: "TypeScript",
    tone: "Professional",
    letterType: "Formal",
    letterRecipientCategory: "CEO",
    letterRecipient: "CEO",
    topicLimit: "30s",
    audience: "Business Leaders",
    platform: "All Platforms"
  });

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const TOOLS: ToolItem[] = [
    {
      id: "code",
      name: "Code Synthesizer",
      category: "dev",
      description: "Generates type-safe, optimized structures with high architectural integrity.",
      icon: Code2,
      color: "from-cyan-400 to-blue-500",
      formFields: {
        label: "Specify code requirement",
        placeholder: "e.g. A premium React hook to fetch with retry timeout and abort controller..."
      }
    },
    {
      id: "app-assistant",
      name: "AI App Assistant",
      category: "dev",
      description: "Generates end-to-end layouts, folder paths, and schema designs for standard apps.",
      icon: AppWindow,
      color: "from-blue-500 to-indigo-500",
      formFields: {
        label: "Describe your app idea",
        placeholder: "e.g. A collaborative real-time Kanban board with Firestore synced drag-n-drop..."
      }
    },
    {
      id: "email",
      name: "Email Copywriter",
      category: "creative",
      description: "Generates high-performing emails, subject lines, and professional summaries.",
      icon: Mail,
      color: "from-pink-500 to-rose-500",
      formFields: {
        label: "What is the focus of this email?",
        placeholder: "e.g. Announcing a serverless API upgrade to premium workspace tier developers..."
      }
    },
    {
      id: "letter",
      name: "Executive Letters",
      category: "creative",
      description: "Composes letters of high intellectual depth, academic inquiries, or formal reports.",
      icon: FileText,
      color: "from-amber-400 to-orange-500",
      formFields: {
        label: "What is the subject of this formal letter?",
        placeholder: "e.g. Proposing a technical partnership to integrate quantum-safe cryptography prototypes..."
      }
    },
    {
      id: "social",
      name: "Social Threader",
      category: "creative",
      description: "Synthesizes thread hooks, hashtags, and tailored copy optimized for Twitter and LinkedIn.",
      icon: Share2,
      color: "from-violet-400 to-indigo-600",
      formFields: {
        label: "What shall the social thread post describe?",
        placeholder: "e.g. Explaining why monorepos fail at scale and the advantages of isolated module registries..."
      }
    },
    {
      id: "planner",
      name: "Strategic Planner",
      category: "strategy",
      description: "Deconstructs complex goals into granular, step-by-step topic milestones.",
      icon: CalendarRange,
      color: "from-indigo-400 to-cyan-500",
      formFields: {
        label: "Specify the strategic topic to plan",
        placeholder: "e.g. Migrating a legacy monolith server architecture to high-agency Kubernetes node groups..."
      }
    }
  ];

  const activeTool = TOOLS.find(t => t.id === activeToolId)!;

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSynthesize = async () => {
    if (!promptInput.trim()) return;
    setLoading(true);
    setOutput(null);

    try {
      const res = await fetch(`/api/gemini/tool/${activeToolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptInput,
          details: customDetails
        })
      });

      if (!res.ok) throw new Error("Synthesis bridge error.");
      const data = await res.json();
      setOutput(data.text);
    } catch (err: any) {
      console.error(err);
      setOutput(`[ERROR IN NEURAL PIPELINE]: ${err.message || "Failed to process tool payload"}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format output markdown beautifully on layout
  const renderFormattedResult = (content: string) => {
    if (!content) return null;
    const blocks = content.split("```");
    return blocks.map((block, index) => {
      const isCode = index % 2 === 1;
      if (isCode) {
        const lines = block.split("\n");
        const lang = lines[0].trim() || "typescript";
        const code = lines.slice(1).join("\n");
        return (
          <div key={index} className="my-4 border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase tracking-wider">{lang}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  alert("Snippet copied to copy buffer!");
                }}
                className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
              >
                Copy Snippet
              </button>
            </div>
            <pre className="p-4 bg-slate-950/95 overflow-x-auto text-cyan-200">
              <code>{code}</code>
            </pre>
          </div>
        );
      } else {
        return block.split("\n").map((line, lIdx) => {
          if (line.startsWith("#")) {
            const level = line.match(/^#+/)?.[0].length || 1;
            const text = line.replace(/^#+\s*/, "");
            const sizes: Record<number, string> = {
              1: "text-xl font-bold text-slate-100 border-b border-slate-800/60 pb-1 mt-4 mb-2",
              2: "text-lg font-semibold text-slate-200 mt-3 mb-2",
              3: "text-md font-medium text-slate-300 mt-2 mb-1"
            };
            return <div key={`${index}-${lIdx}`} className={sizes[level] || sizes[2]}>{text}</div>;
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <li key={`${index}-${lIdx}`} className="ml-4 list-disc text-sm text-slate-300 mb-1">
                {line.substring(2)}
              </li>
            );
          }
          const boldParts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={`${index}-${lIdx}`} className="text-sm text-slate-300 leading-relaxed mb-2">
              {boldParts.map((sub, sIdx) => {
                if (sIdx % 2 === 1) {
                  return <strong key={sIdx} className="text-cyan-400 font-semibold">{sub}</strong>;
                }
                return sub;
              })}
            </p>
          );
        });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
      {/* List of Tools */}
      <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto max-h-[100%] pr-2 custom-scrollbar shrink-0">
        <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">
          SUITE SELECTION
        </p>

        {/* Categories */}
        {["dev", "creative", "strategy"].map(cat => (
          <div key={cat} className="flex flex-col gap-2">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest pl-1.5 mt-2.5">
              {cat === "dev" ? "Architect & Synthesizer" : cat === "creative" ? "Copywriting & Vision" : "Core planning"}
            </span>

            {TOOLS.filter(t => t.category === cat).map((tool) => {
              const Icon = tool.icon;
              const isActive = activeToolId === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveToolId(tool.id);
                    setOutput(null);
                  }}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition cursor-pointer select-none group relative overflow-hidden ${
                    isActive
                      ? "bg-slate-900 border-slate-800 text-white shadow-md shadow-cyan-500/5"
                      : "bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-cyan-400 to-indigo-500" />
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 group-hover:text-cyan-400 transition ${
                      isActive ? "text-cyan-400 border-cyan-800/40" : ""
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold tracking-wide">{tool.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug mt-1.5 opacity-70">
                    {tool.description}
                  </p>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* active tool setup + output pane */}
      <div className="lg:col-span-9 flex flex-col gap-6 h-full min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">

          {/* Form setup */}
          <div className="md:col-span-5 flex flex-col gap-4 bg-slate-950/40 border border-slate-900 rounded-3xl p-5 shrink-0 height-fit">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${activeTool.color}`} />
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{activeTool.name}</h3>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {activeTool.formFields.label}
              </label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={activeTool.formFields.placeholder}
                className="w-full bg-slate-950 border border-slate-800/80 p-3.5 rounded-2xl focus:border-cyan-500/30 focus:outline-none font-sans text-xs text-slate-200 leading-relaxed placeholder:text-slate-600 resize-none h-32"
              />
            </div>

            {/* Sub settings based on active tool ID */}
            {activeToolId === "code" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Target Language</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["TypeScript", "Python", "Go"].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCustomDetails({ ...customDetails, language: lang })}
                      className={`py-1.5 px-1 rounded-lg border text-[10px] font-mono text-center cursor-pointer transition ${
                        customDetails.language === lang 
                          ? "bg-cyan-950/30 border-cyan-805/50 text-cyan-400" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeToolId === "email" && (
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Tone Profile</label>
                  <select
                    value={customDetails.tone}
                    onChange={(e) => setCustomDetails({ ...customDetails, tone: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-sans focus:outline-none cursor-pointer"
                  >
                    <option>Professional</option>
                    <option>Direct & Assertive</option>
                    <option>Casual</option>
                    <option>Hype (Sells pitch)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Audience</label>
                  <input
                    value={customDetails.audience}
                    onChange={(e) => setCustomDetails({ ...customDetails, audience: e.target.value })}
                    placeholder="e.g. Enterprise clients"
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-sans focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeToolId === "letter" && (
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Letter Category / Tone</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Formal", "Casual", "Academic"].map(type => (
                      <button
                        key={type}
                        onClick={() => setCustomDetails({ ...customDetails, letterType: type })}
                        className={`py-1.5 px-0.5 rounded-lg border text-[10px] font-mono text-center cursor-pointer transition ${
                          customDetails.letterType === type 
                            ? "bg-amber-950/30 border-amber-800/50 text-amber-400" 
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Target Recipient / Category</label>
                  <select
                    value={customDetails.letterRecipientCategory || "CEO"}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomDetails({ 
                        ...customDetails, 
                        letterRecipientCategory: val,
                        letterRecipient: val === "Custom" ? "" : val
                      });
                    }}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-sans focus:outline-none cursor-pointer"
                  >
                    <option value="CEO">Chief Executive Officer (CEO)</option>
                    <option value="Board of Directors">Board of Directors</option>
                    <option value="Hiring Manager">Hiring Manager</option>
                    <option value="Valued Client / Customer">Valued Client / Customer</option>
                    <option value="Engineering Team">Engineering & Product Team</option>
                    <option value="Academic Committee">Academic Committee</option>
                    <option value="Investor / VC">Investor / Venture Capitalist</option>
                    <option value="Custom">Custom Recipient (Specify name below)</option>
                  </select>
                </div>

                {(customDetails.letterRecipientCategory === "Custom" || !["CEO", "Board of Directors", "Hiring Manager", "Valued Client / Customer", "Engineering Team", "Academic Committee", "Investor / VC"].includes(customDetails.letterRecipientCategory)) && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Specific Recipient Name or Role</label>
                    <input
                      value={customDetails.letterRecipient || ""}
                      onChange={(e) => setCustomDetails({ ...customDetails, letterRecipient: e.target.value })}
                      placeholder="e.g. Dr. Arthur Pendelton or Regional Sales Lead"
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-sans focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {activeToolId === "social" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Platform Hub</label>
                <select
                  value={customDetails.platform}
                  onChange={(e) => setCustomDetails({ ...customDetails, platform: e.target.value })}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option>All Platforms (LinkedIn + Twitter + Threads)</option>
                  <option>LinkedIn Professional Focus</option>
                  <option>Twitter Technical Thread Focus</option>
                </select>
              </div>
            )}

            <button
              onClick={handleSynthesize}
              disabled={loading || !promptInput.trim()}
              className="w-full py-3 px-5 mt-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-medium rounded-xl flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-[0.98] select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono tracking-widest uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Initialize Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </>
              )}
            </button>
          </div>

          {/* Output Visualizer */}
          <div className="md:col-span-7 flex flex-col bg-slate-950/20 border border-slate-900 rounded-3xl min-h-[400px]">
            {/* Top Bar controls */}
            <div className="bg-slate-900/40 border-b border-slate-900 px-5 py-3.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Workspace Output Buffer</span>
              </div>

              {output && (
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-[11px] font-semibold font-mono border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300 hover:text-cyan-400 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Buffer Copied" : "Copy Buffer"}
                </button>
              )}
            </div>

            {/* Output Field */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950/5 relative min-h-0">
              {loading ? (
                <div className="absolute inset-0 flex flex-col justify-center items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
                    <Sparkles className="w-4 h-4 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">Running Neural Inference...</span>
                </div>
              ) : output ? (
                <div className="space-y-4">
                  <div className="prose prose-slate prose-invert max-w-none">
                    {renderFormattedResult(output)}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col justify-center items-center text-center opacity-40 px-6 mt-16 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center text-slate-500 mb-3.5">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Empty FrameBuffer</h4>
                  <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                    Set your visual or technical specifications in the left configuration portal, then trigger synthesis model.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
