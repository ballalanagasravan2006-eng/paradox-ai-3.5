/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, logoutUser } from "./firebase";
import { UserProfile, UserRole } from "./types";
import { handleFirestoreError } from "./utils";
import { OperationType } from "./types";

// Import modular panels
import AuthLanding from "./components/AuthLanding";
import ChatBot from "./components/ChatBot";
import AITools from "./components/AITools";
import AdminPanel from "./components/AdminPanel";

// Icons
import { 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  LogOut, 
  Wrench, 
  MessageCircle, 
  Cpu,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type TabId = "chat" | "tools" | "admin";

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setLoading(true);
        // Synchronize and load profile from Firestore
        const path = `users/${user.uid}`;
        try {
          const docRef = doc(db, "users", user.uid);
          const snap = await getDoc(docRef);

          let userProfile: UserProfile;

          if (snap.exists()) {
            userProfile = snap.data() as UserProfile;
            // Update lastLogin metric
            userProfile.lastLogin = new Date().toISOString();
            await setDoc(docRef, userProfile);
          } else {
            // New register - auto promote ballalanagasravan@gmail.com to admin
            const isEmailAdmin = user.email === "ballalanagasravan@gmail.com";
            userProfile = {
              uid: user.uid,
              email: user.email || "",
              displayName: user.displayName || "Unknown Node",
              photoURL: user.photoURL || undefined,
              role: isEmailAdmin ? UserRole.ADMIN : UserRole.USER,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            await setDoc(docRef, userProfile);
          }
          setProfile(userProfile);
        } catch (err) {
          console.error("Firestore loading error:", err);
          // Fallback state if firestore rules prevent listing temporarily or network issue
          setProfile({
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "Unknown Node",
            photoURL: user.photoURL || undefined,
            role: user.email === "ballalanagasravan@gmail.com" ? UserRole.ADMIN : UserRole.USER,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center gap-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
          <Cpu className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Synchronizing quantum mainframe...</span>
      </div>
    );
  }

  if (!firebaseUser || !profile) {
    return <AuthLanding onLoginSuccess={() => {}} />;
  }

  const isAdmin = profile.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative selection:bg-cyan-500 selection:text-black font-sans">
      
      {/* Visual background nodes */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/3 w-[600px] h-[600px] bg-indigo-505/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header Panel */}
      <header className="bg-slate-900/40 border-b border-slate-905 px-6 py-4 flex justify-between items-center z-10 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/15">
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white flex items-center gap-1">
              PARADOX <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent font-light">AI</span>
            </h1>
            <p className="text-[8px] text-slate-500 font-mono tracking-widest uppercase leading-none">Mainframe Interface Control</p>
          </div>
        </div>

        {/* User Info & logouts */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{profile.displayName}</span>
            <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 justify-end mt-0.5">
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400">System Administrator</span>
                </>
              ) : (
                <span>Operator Node</span>
              )}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center p-0.5 select-none hover:border-slate-750 transition duration-300">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" className="w-full h-full rounded-full" />
            ) : (
              <span className="text-xs font-mono text-cyan-400 uppercase">{profile.displayName.substring(0, 2)}</span>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Disconnect Mainframe"
            className="p-2 border border-slate-800 bg-slate-900/40 hover:text-rose-400 hover:border-rose-950/40 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10 min-h-0">
        
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-60 bg-slate-950/20 md:border-r border-slate-905 p-4 flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-x-visible md:overflow-y-auto custom-scrollbar">
          <span className="hidden md:block text-[9px] font-mono text-slate-600 uppercase tracking-widest pl-2 mb-2">
            Workspace Hubs
          </span>

          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full py-3 px-3.5 rounded-xl text-left text-xs font-medium focus:outline-none flex items-center gap-3 cursor-pointer select-none transition ${
              activeTab === "chat" 
                ? "bg-slate-900 text-cyan-400 border border-slate-800" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="tracking-wide">Paradox Core Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("tools")}
            className={`w-full py-3 px-3.5 rounded-xl text-left text-xs font-medium focus:outline-none flex items-center gap-3 cursor-pointer select-none transition ${
              activeTab === "tools" 
                ? "bg-slate-900 text-cyan-400 border border-slate-800" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="tracking-wide">Special AI Suite</span>
          </button>

          {/* Admin gate */}
          {isAdmin && (
            <>
              <span className="hidden md:block text-[9px] font-mono text-slate-600 uppercase tracking-widest pl-2 mt-4 mb-2">
                Operator Settings
              </span>
              <button
                onClick={() => setActiveTab("admin")}
                className={`w-full py-3 px-3.5 rounded-xl text-left text-xs font-medium focus:outline-none flex items-center gap-3 cursor-pointer select-none transition ${
                  activeTab === "admin" 
                    ? "bg-slate-900 text-rose-450 border border-slate-800/60" 
                    : "text-slate-400 hover:text-rose-450/80 border border-transparent"
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span className="tracking-wide">Admin Command Panel</span>
              </button>
            </>
          )}

          {/* Clock metric */}
          <div className="hidden md:block mt-auto p-4 bg-slate-900/20 border border-slate-900 rounded-2xl">
            <span className="text-[9px] text-slate-600 font-mono block">QUANTUM REALTIME UTC</span>
            <span className="text-[11px] text-cyan-400 font-mono block mt-1">2026-05-27 10:09</span>
            <span className="text-[8px] text-slate-500 font-mono block mt-0.5">LATENCY: G-REGIONAL CLOUD</span>
          </div>
        </nav>

        {/* Content viewport */}
        <main className="flex-1 p-6 overflow-hidden min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99, y: 3 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -3 }}
              transition={{ duration: 0.3 }}
              className="h-full min-h-0"
            >
              {activeTab === "chat" && <ChatBot />}
              {activeTab === "tools" && <AITools />}
              {activeTab === "admin" && isAdmin && <AdminPanel />}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}
