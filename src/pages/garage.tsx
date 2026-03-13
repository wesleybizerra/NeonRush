import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock, Star } from 'lucide-react';
import { UserContext } from '../App';

export const cars2D = [
  {
    id: 'starter',
    name: 'Neon Azul',
    details: 'O carro inicial. Ágil e confiável para as ruas de Neon City.',
    specialty: 'Equilíbrio',
    color: '#00ffcc',
    planRequired: 'piloto',
    speed: 30,
    dirigibilidade: 50,
    armor: 0
  },
  {
    id: 'neon_free',
    name: 'NEON',
    details: 'O clássico das ruas, liberado para todos.',
    specialty: 'Equilíbrio',
    color: '#ff00ff',
    planRequired: 'free',
    speed: 30,
    dirigibilidade: 50,
    armor: 0
  },
  {
    id: 'free_1',
    name: 'Street Racer',
    details: 'Um carro ágil para quem está começando.',
    specialty: 'Equilíbrio',
    color: '#ff9900',
    planRequired: 'free',
    speed: 30,
    dirigibilidade: 50,
    armor: 0
  },
  {
    id: 'free_2',
    name: 'Urban Ghost',
    details: 'Silencioso e rápido nas curvas.',
    specialty: 'Equilíbrio',
    color: '#00ccff',
    planRequired: 'free',
    speed: 30,
    dirigibilidade: 50,
    armor: 0
  },
  {
    id: 'basic_starter',
    name: 'Neon Básico',
    details: 'O modelo de entrada para quem está começando agora.',
    specialty: 'Iniciante',
    color: '#808080',
    planRequired: 'free',
    speed: 25,
    dirigibilidade: 50,
    armor: 0
  },
  {
    id: 'pro',
    name: 'Cyber Vermelho',
    details: 'Design aerodinâmico com propulsores duplos. Exclusivo do Plano Pro.',
    specialty: 'Velocidade',
    color: '#ff0055',
    planRequired: 'pro',
    speed: 35,
    dirigibilidade: 70,
    armor: 0
  },
  {
    id: 'extreme',
    name: 'Dark Matter',
    details: 'Tecnologia antigravidade. O ápice da engenharia. Exclusivo do Plano Extreme.',
    specialty: 'Aceleração',
    color: '#aa00ff',
    planRequired: 'extreme',
    speed: 50,
    dirigibilidade: 80,
    armor: 0
  },
  {
    id: 'verde',
    name: 'Viper Verde',
    details: 'Velocidade bruta e proteção. Exclusivo do Plano Corredor Cyber.',
    specialty: 'Blindagem',
    color: '#00ff00',
    planRequired: 'viper',
    speed: 55,
    dirigibilidade: 85,
    armor: 35
  },
  {
    id: 'dourado',
    name: 'Midas Dourado',
    details: 'O auge do luxo e proteção. Exclusivo do Plano Lenda do Neon.',
    specialty: 'Blindagem',
    color: '#ffd700',
    planRequired: 'midas',
    speed: 70,
    dirigibilidade: 90,
    armor: 55
  }
];

export const Garage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useContext(UserContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? cars2D.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === cars2D.length - 1 ? 0 : prev + 1));
  };

  const currentCar = cars2D[currentIndex];

  const handleEquip = () => {
    if (!user) return;

    // Check if user has required plan
    const planLevels = { free: 0, piloto: 1, basic: 2, pro: 3, extreme: 4, viper: 5, midas: 6 };
    const userPlanLevel = planLevels[user.plan as keyof typeof planLevels] || 0;
    const requiredPlanLevel = planLevels[currentCar.planRequired as keyof typeof planLevels] || 0;

    if (userPlanLevel >= requiredPlanLevel) {
      updateUser({
        garage: {
          ...user.garage,
          selectedCar: currentCar.id,
          carColor: currentCar.color,
          selectedCharacter: user.garage?.selectedCharacter || "",
          selectedOutfit: user.garage?.selectedOutfit || "",
          bodykit: user.garage?.bodykit || {
            wing: "Sem aero",
            sideskirt: "Original",
            bumper: "Original",
            windows: "Cristal",
          },
          upgrades: user.garage?.upgrades || { engine: 0, suspension: 0, nitro: 0, brake: 0, turbo: 0 }
        }
      });
      showToast(`Veículo ${currentCar.name} equipado com sucesso!`, 'success');
    } else {
      showToast(`Você precisa do plano ${currentCar.planRequired.toUpperCase()} para equipar este veículo.`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6 relative">
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest shadow-2xl transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'
          }`}>
          {toast.message}
        </div>
      )}
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Sua <span className="text-emerald-500">Garagem</span>
          </h1>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Veículos Disponíveis</p>
            <p className="text-xl font-black text-emerald-500">{cars2D.length}</p>
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-12 py-12">
          <button
            onClick={handlePrev}
            className="group flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-all hover:bg-emerald-500 hover:text-black hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center max-w-2xl w-full"
          >
            {/* 2D Car Representation */}
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a1a] shadow-2xl flex items-center justify-center">

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              {/* Glowing Car Shape */}
              <div
                className="relative w-32 h-64 rounded-t-full rounded-b-xl border-4 transition-all duration-500"
                style={{
                  borderColor: currentCar.color,
                  boxShadow: `0 0 50px ${currentCar.color}88, inset 0 0 20px ${currentCar.color}88`,
                  backgroundColor: `${currentCar.color}22`
                }}
              >
                {/* Windshield */}
                <div className="absolute top-1/4 left-[10%] w-[80%] h-1/4 rounded-t-3xl bg-black/80 border-t-2 border-white/50" />
                {/* Headlights */}
                <div className="absolute top-4 left-2 w-6 h-8 rounded-full bg-white shadow-[0_0_20px_#fff]" />
                <div className="absolute top-4 right-2 w-6 h-8 rounded-full bg-white shadow-[0_0_20px_#fff]" />
                {/* Engine Glow */}
                <div className="absolute -bottom-8 left-1/4 w-1/2 h-16 rounded-full blur-xl" style={{ backgroundColor: currentCar.color }} />
              </div>

              {currentCar.planRequired !== 'free' && (
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    Plano {currentCar.planRequired}
                  </span>
                </div>
              )}
            </div>

            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2" style={{ color: currentCar.color, textShadow: `0 0 20px ${currentCar.color}88` }}>
              {currentCar.name}
            </h2>
            <p className="text-lg text-white/50 mb-6">{currentCar.details}</p>

            <div className="flex gap-4 mb-8">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                {currentCar.specialty}
              </span>
            </div>

            {/* Stats Bars */}
            <div className="w-full max-w-md space-y-4 text-left">
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">
                  <span>Velocidade Máxima</span>
                  <span>{currentCar.speed}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentCar.speed}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: currentCar.color }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">
                  <span>Dirigibilidade</span>
                  <span>{currentCar.dirigibilidade}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentCar.dirigibilidade}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: currentCar.color }}
                  />
                </div>
              </div>
              {currentCar.armor > 0 && (
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">
                    <span>Blindagem</span>
                    <span>{currentCar.armor}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentCar.armor}%` }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <button
            onClick={handleNext}
            className="group flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-all hover:bg-emerald-500 hover:text-black hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleEquip}
            className="group relative overflow-hidden rounded-full bg-emerald-500 px-16 py-5 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            {user?.garage?.selectedCar === currentCar.id ? 'Equipado' : 'Equipar Este Veículo'}
          </button>
        </div>
      </div>
    </div>
  );
};
