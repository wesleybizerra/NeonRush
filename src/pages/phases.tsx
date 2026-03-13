import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { phases } from '../data';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';
import { UserContext } from '../App';

export const Phases = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);
  const unlockedPhase = user?.unlockedPhase || 1;

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Mapa de <span className="text-emerald-500">Desafios</span>
          </h1>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Progresso</p>
            <p className="text-xl font-black text-emerald-500">{unlockedPhase} / {phases.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {phases.map((phase, i) => {
            const isUnlocked = phase.id <= unlockedPhase;
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i % 20) * 0.02 }}
              >
                <Link
                  to={isUnlocked ? `/phase-2d/${phase.id}` : "#"}
                  className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl border transition-all ${isUnlocked
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black hover:scale-105"
                      : "border-white/5 bg-white/5 text-white/10 cursor-not-allowed"
                    }`}
                >
                  <span className="text-2xl font-black">{phase.id}</span>
                  <div className="absolute bottom-2">
                    {isUnlocked ? (
                      <Play className="h-3 w-3 fill-current" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                  </div>

                  {isUnlocked && (
                    <div className="absolute inset-0 rounded-2xl bg-emerald-500 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
