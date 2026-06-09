import { useState } from "react";
import { loginWithGoogle } from "../firebase";
import { LogIn, Compass, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface AuthProps {
  onLoginSuccess: (user: any) => void;
}

export default function AuthLanding({ onLoginSuccess }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication aborted. Please ensure popups are enabled and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative overflow-hidden px-4 selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-xl relative shadow-2xl shadow-cyan-500/5"
      >
        <div className="absolute top-0 right-0 p-4">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950 border border-cyan-800/30 rounded-full text-[10px] font-mono text-cyan-400 uppercase tracking-widest leading-none">
            <Compass className="w-3 h-3 animate-spin duration-1000" /> V1.0 - Hybrid
          </span>
        </div>

        <div className="flex flex-col items-center mt-4">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 -z-10 animate-tilt" />
          </div>

          <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight text-center">
            PARADOX <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent font-light">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono text-center tracking-widest mt-2 uppercase">
            Quantized Human-Level Synthesizer
          </p>
          <p className="text-sm text-slate-400 text-center mt-4 opacity-80 max-w-xs leading-relaxed">
            Welcome to the quantum threshold. Enter to access specialized intelligence models, maps, weather forecasting, and autonomous reminders.
          </p>

          {error && (
            <div className="mt-6 p-4 bg-rose-950/40 border border-rose-900/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 leading-normal max-w-sm">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-8 select-none relative group overflow-hidden bg-white hover:bg-slate-100 text-slate-950 font-medium py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 stroke-[2.2]" />
                <span className="tracking-wide">Authorize with Google</span>
              </>
            )}
          </button>

          <div className="mt-8 pt-6 border-t border-slate-800/40 w-full flex justify-between text-[11px] font-mono text-slate-500">
            <span>SECURE PROTOCOL</span>
            <span>END-TO-END QUANTUM KEY</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
