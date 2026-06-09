import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, getDocs, updateDoc, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { handleFirestoreError } from "../utils";
import { OperationType, UserProfile, UserRole, SystemConfig } from "../types";
import { 
  ShieldAlert, 
  Users, 
  Sparkles, 
  Settings, 
  Activity, 
  Save, 
  Loader2, 
  Lock, 
  UserCog, 
  CheckCircle2, 
  SlidersHorizontal 
} from "lucide-react";
import { motion } from "motion/react";

export default function AdminPanel() {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Data states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [config, setConfig] = useState<SystemConfig>({
    id: "default-config",
    maintenanceMode: false,
    systemPrompt: "You are Paradox AI, an exceptionally intelligent, human-like, witty, and deeply philosophical AI agent.",
    allowedTools: ["code", "email", "letter", "social", "planner", "app-assistant"]
  });

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // 1. Verify user's administrative permission state on the server/db
    const user = auth.currentUser;
    if (!user) {
      setCheckingAuth(false);
      return;
    }

    // Direct check by bootstrapping email OR fetching profile doc from Firestore
    const isBootstrappedAdmin = user.email === "ballalanagasravan@gmail.com";
    if (isBootstrappedAdmin) {
      setIsAdminUser(true);
      setCheckingAuth(false);
      loadAdminResources();
    } else {
      // Check user profile role in db
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then(snap => {
        if (snap.exists() && snap.data().role === UserRole.ADMIN) {
          setIsAdminUser(true);
          loadAdminResources();
        }
        setCheckingAuth(false);
      }).catch(err => {
        console.error("Failed to fetch admin role auth verification:", err);
        setCheckingAuth(false);
      });
    }
  }, []);

  const loadAdminResources = () => {
    fetchUsersList();
    loadSystemConfig();
  };

  const fetchUsersList = async () => {
    setLoadingUsers(true);
    const path = "users";
    try {
      const snap = await getDocs(collection(db, path));
      const items: UserProfile[] = [];
      snap.forEach(doc => {
        items.push(doc.data() as UserProfile);
      });
      setUsers(items);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadSystemConfig = async () => {
    const path = "configs/default-config";
    try {
      const docRef = doc(db, "configs", "default-config");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setConfig(snap.data() as SystemConfig);
      } else {
        // Create initial default configs matching firestore blueprint
        await setDoc(docRef, config);
      }
    } catch (err) {
      // Handle error cleanly
      handleFirestoreError(err, OperationType.GET, path);
    }
  };

  const handleUpdateRole = async (userUid: string, nextRole: UserRole) => {
    const path = `users/${userUid}`;
    try {
      const userDocRef = doc(db, "users", userUid);
      await updateDoc(userDocRef, { role: nextRole });
      setSuccessMsg(`User role successfully changed to ${nextRole}`);
      fetchUsersList();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    const path = "configs/default-config";
    try {
      const docRef = doc(db, "configs", "default-config");
      const updatedData = {
        ...config,
        updatedBy: auth.currentUser?.email || "unknown_admin",
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, updatedData);
      setSuccessMsg("System configuration successfully saved & broadcasted!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSavingConfig(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="h-full flex flex-col justify-center items-center gap-3 py-16 dark bg-slate-950/20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest leading-none">Verifying Administrator Clearance...</span>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-slate-950/40 border border-slate-900 rounded-3xl min-h-[400px]">
        <div className="text-center max-w-sm bg-slate-900/60 p-8 border border-slate-800/80 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-rose-500 animate-pulse" />
          <div className="w-12 h-12 bg-rose-955 border border-rose-900/40 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4.5">
            <Lock className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-md font-semibold text-slate-100 tracking-wide">Paradox Core Firewall Warning</h3>
          <p className="text-xs text-rose-300 font-mono tracking-widest uppercase mt-1 mb-4">
            [ACCESS DENIED]
          </p>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Your authenticated signature does not meet administrative rules. Attempted violations are logged into our system. Only verified structural administrative operators can write configs or inspect global profiles.
          </p>
          <div className="py-2.5 px-3 bg-slate-950 border border-slate-850 rounded-xl text-left font-mono text-[9px] text-slate-500">
             Clearance Email Required: <span className="text-cyan-400">ballalanagasravan@gmail.com</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full min-h-0">
      
      {/* Users listing viewport */}
      <div className="md:col-span-7 flex flex-col bg-slate-950/40 border border-slate-900 rounded-3xl p-6 min-h-0">
        <div className="flex justify-between items-center mb-5 shrink-0">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400 animate-pulse" /> Registered Node Database ({users.length})
          </span>
          <button
            onClick={fetchUsersList}
            disabled={loadingUsers}
            className="p-1.5 px-3 border border-slate-800 hover:bg-slate-900 rounded-xl text-[10px] font-mono text-slate-400 hover:text-slate-200 transition cursor-pointer select-none"
          >
            {loadingUsers ? "Refreshing..." : "Query Profiles"}
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-900/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 min-h-0">
          {users.map((profile) => (
            <div
              key={profile.uid}
              className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-xs text-cyan-400">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt={profile.displayName} referrerPolicy="no-referrer" className="w-full h-full rounded-full" />
                  ) : (
                    profile.displayName.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-100 truncate">{profile.displayName}</span>
                    <span className={`px-2 py-0.5 border text-[8px] font-mono rounded-full uppercase leading-none tracking-widest ${
                      profile.role === UserRole.ADMIN 
                        ? "bg-rose-950/30 border-rose-800/40 text-rose-400" 
                        : "bg-cyan-950/30 border-cyan-800/40 text-cyan-400"
                    }`}>
                      {profile.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{profile.email}</span>
                </div>
              </div>

              {/* Adjust user roles controllers */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-slate-650 uppercase pl-1 sm:hidden">Modulate Authority:</span>
                {profile.role === UserRole.ADMIN ? (
                  <button
                    onClick={() => handleUpdateRole(profile.uid, UserRole.USER)}
                    className="py-1 px-2.5 border border-slate-800 hover:border-slate-750 bg-slate-950 hover:bg-slate-900 text-[10px] text-slate-400 hover:text-rose-400 font-mono rounded-lg transition cursor-pointer select-none"
                  >
                    Demote Node
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateRole(profile.uid, UserRole.ADMIN)}
                    className="py-1 px-2.5 border border-cyan-950 hover:border-cyan-850 bg-slate-955 hover:bg-slate-900 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono rounded-lg transition cursor-pointer select-none"
                  >
                    Authorize Admin
                  </button>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-16 opacity-30 select-none">
              <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-mono">No nodes registered in Firestore system query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Configurations panel portal */}
      <div className="md:col-span-5 flex flex-col bg-slate-950/40 border border-slate-900 rounded-3xl p-6">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-5">
          <SlidersHorizontal className="w-4 h-4 inline-block mr-1 text-cyan-400" /> Settings Panel Configurations
        </span>

        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Maintenance toggle */}
          <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-2xl flex justify-between items-center gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Lockout Maintenance Mode</span>
              <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">Toggles structural lockdown of operations</span>
            </div>
            <button
              onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
              className={`px-3 py-1.5 border font-mono text-[10px] uppercase rounded-xl transition cursor-pointer ${
                config.maintenanceMode 
                  ? "border-rose-800/60 bg-rose-955 text-rose-450" 
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
              }`}
            >
              {config.maintenanceMode ? "ENABLED" : "DISABLED"}
            </button>
          </div>

          {/* Master system instructions prompt */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Paradox AI Cognitive Directive</span>
            <span className="text-[9px] text-slate-650 block leading-none">Sets system-wide baseline persona config</span>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-cyan-500/20 text-xs text-slate-200 leading-relaxed font-sans mt-1.5 resize-none h-44"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-medium font-mono text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 select-none active:scale-[0.98] hover:opacity-90 transition cursor-pointer"
            >
              {savingConfig ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 stroke-[2.2]" />
              )}
              <span>Commit Changes</span>
            </button>
          </div>

          {config.updatedBy && (
            <div className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl text-[9px] font-mono text-slate-500 leading-normal">
              <span>COMMITTED NODE: {config.updatedBy}</span>
              <span className="block mt-0.5">TIMESTAMP: {new Date(config.updatedAt || "").toLocaleString()}</span>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
