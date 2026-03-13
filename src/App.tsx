import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { HashRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { Home } from "./pages/home";
import { Garage } from "./pages/garage";
import { Plans } from "./pages/plans";
import { Profile } from "./pages/profile";
import { Auth } from "./pages/auth";
import { PhaseGame } from "./pages/phase-game";
import { PhaseGame2D } from "./pages/phase-game-2d";
import { Phases } from "./pages/phases";
import { DailyTasks } from "./pages/daily-tasks";

// ... (rest of the file remains the same)

type PlanId = "free" | "basic" | "pro" | "extreme";
type UpgradeKey = "engine" | "suspension" | "nitro" | "brake" | "turbo";

type GarageState = {
  carColor: string;
  selectedCar: string;
  selectedCharacter: string;
  selectedOutfit: string;
  bodykit: {
    wing: string;
    sideskirt: string;
    bumper: string;
    windows: string;
  };
  upgrades: Record<UpgradeKey, number>;
};

type InventoryState = {
  characters: string[];
  cars: string[];
  outfits: string[];
  evolutions: string[];
};

type UserAccount = {
  id: string;
  username: string;
  email: string;
  password?: string;
  plan: PlanId;
  isAdmin: boolean;
  createdAt?: string;
  credits?: number;
  xp?: number;
  unlockedPhase?: number;
  inventory?: InventoryState;
  garage?: GarageState;
  deviceId?: string;
  ip?: string;
};

const STORAGE_SESSION = "neon-rush-session";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-black p-12 text-center">
          <h1 className="text-4xl font-black uppercase italic text-red-500 mb-4">Erro de Sistema</h1>
          <p className="text-white/60 mb-8 max-w-md">Ocorreu um erro inesperado ao carregar esta área. Verifique se os arquivos 3D estão nas pastas corretas.</p>
          <pre className="bg-white/5 p-4 rounded-xl text-[10px] text-red-400 text-left overflow-auto max-w-full mb-8">
            {this.state.error?.message || "Erro desconhecido"}
          </pre>
          <button 
            onClick={() => window.location.href = '/'}
            className="rounded-full bg-emerald-500 px-8 py-3 text-xs font-black uppercase tracking-widest text-black"
          >
            Voltar ao Início
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentEmail, setCurrentEmail] = useState(window.localStorage.getItem(STORAGE_SESSION) || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const fetchedUsers = snapshot.docs.map(doc => doc.data() as UserAccount);
        setUsers(fetchedUsers);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firestore sync error:", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const currentUser = useMemo(() => {
    return users.find((u) => u.email === currentEmail.toLowerCase()) || null;
  }, [users, currentEmail]);

  const handleAuthSuccess = (email: string) => {
    setCurrentEmail(email);
    window.localStorage.setItem(STORAGE_SESSION, email);
  };

  const handleLogout = () => {
    setCurrentEmail("");
    window.localStorage.removeItem(STORAGE_SESSION);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
          <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-200">
        {!currentUser ? (
          <Auth onAuthSuccess={handleAuthSuccess} />
        ) : (
          <>
            <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-md">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <span className="text-xl font-black italic">NR</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                    Neon<span className="text-emerald-500">Rush</span>
                  </h1>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                  <Link to="/" className="text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white">{t('home')}</Link>
                  <Link to="/garage" className="text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white">{t('garage')}</Link>
                  <Link to="/plans" className="text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white">{t('plans')}</Link>
                  <Link to="/profile" className="text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white">{t('profile')}</Link>
                  <Link to="/tasks" className="text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white">Missões</Link>
                  <Link to="/phases" className="text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white">Fases</Link>
                </nav>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:text-black"
                  >
                    {t('logout')}
                  </button>
                </div>
              </div>
            </header>

            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/garage" element={<Garage />} />
                <Route path="/plans" element={<Plans userEmail={currentEmail} />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tasks" element={<DailyTasks />} />
                <Route path="/phases" element={<Phases />} />
                <Route path="/phase/:phaseId" element={<PhaseGame2D />} />
                <Route path="/phase-3d/:phaseId" element={<PhaseGame2D />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ErrorBoundary>
          </>
        )}
        <footer className="border-t border-white/5 bg-black px-6 py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-black">
                <span className="text-sm font-black italic">NR</span>
              </div>
              <span className="text-lg font-black tracking-tighter uppercase italic">
                Neon<span className="text-emerald-500">Rush</span>
              </span>
            </div>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              © 2025 Neon Rush Street Racing • v2.0.1 • Desenvolvido para a Elite
            </p>

            <div className="flex gap-6">
              <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">Termos</a>
              <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">Suporte</a>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}
