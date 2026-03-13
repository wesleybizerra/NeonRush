import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { HashRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, onSnapshot, query, where, getDocs, updateDoc } from "firebase/firestore";
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

export const UserContext = React.createContext<{
  user: UserAccount | null;
  updateUser: (data: Partial<UserAccount>) => Promise<void>;
}>({ user: null, updateUser: async () => { } });

// ... (rest of the file remains the same)

type PlanId = "free" | "basic" | "pro" | "extreme" | "viper" | "midas";
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
  extraLives?: number;
  createdAt?: string;
  credits?: number;
  xp?: number;
  level?: number;
  unlockedPhase?: number;
  inventory?: InventoryState;
  garage?: GarageState;
  deviceId?: string;
  ip?: string;
  taskProgress?: Record<string, { progress: number, completed: boolean, date: string }>;
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

  const updateUser = async (data: Partial<UserAccount>) => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, "users"), where("email", "==", currentUser.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, data);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.email === 'wesleybizerra@hotmail.com') {
      if (currentUser.unlockedPhase === 30 || currentUser.credits === 10000 || currentUser.level === undefined || currentUser.plan !== 'midas' || currentUser.extraLives !== 10) {
        updateUser({
          unlockedPhase: 1,
          level: 0,
          xp: 0,
          credits: 0,
          plan: 'midas',
          extraLives: 10,
          taskProgress: {}
        });
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const benefits = {
      free: { extraLives: 0 },
      basic: { extraLives: 1 },
      pro: { extraLives: 3 },
      extreme: { extraLives: 5 },
      viper: { extraLives: 7 },
      midas: { extraLives: 10 },
    };

    const planBenefits = benefits[currentUser.plan as keyof typeof benefits] || benefits.free;

    if (currentUser.extraLives !== planBenefits.extraLives) {
      updateUser({ extraLives: planBenefits.extraLives });
    }
  }, [currentUser?.plan]);


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
    <UserContext.Provider value={{ user: currentUser, updateUser }}>
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
                    <Link to="/" className="text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white">INICIO</Link>
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
                <a href="https://api.whatsapp.com/send/?phone=5571981574664&text=Bom+dia%2C+Boa+tarde%2C+Boa+noites&type=phone_number&app_absent=0" target="_blank" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">
                  <img src="https://i.imgur.com/TTRDtPU.png" alt="WhatsApp" className="h-4 w-4" />
                  WhatsApp
                </a>
                <a href="https://www.instagram.com/wesleybizerraofc/" target="_blank" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">
                  <img src="https://i.imgur.com/zkNfToG.png" alt="Instagram" className="h-4 w-4" />
                  INSTAGRAM
                </a>
                <a href="https://www.youtube.com/@WesleyBizerraYTNovo" target="_blank" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">
                  <img src="https://i.imgur.com/op17Zqw.png" alt="YouTube" className="h-4 w-4" />
                  Canal no Youtube
                </a>
              </div>
            </div>
          </footer>
        </div>
      </HashRouter>
    </UserContext.Provider>
  );
}
