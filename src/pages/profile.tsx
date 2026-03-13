import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Trophy, Zap, Target, Flag } from 'lucide-react';

export const Profile = () => {
  const { t } = useTranslation();
  
  // Mock stats
  const stats = {
    phasesPlayed: 15,
    objectivesCompleted: 45,
    missionsCompleted: 30,
    challengesCompleted: 10,
    level: 24,
    xp: 2450,
    nextLevelXp: 3000
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-6">
            <div className="h-32 w-32 rounded-full border-4 border-emerald-500 p-1 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                <User className="h-16 w-16 text-emerald-500" />
              </div>
            </div>
            <div className="absolute -bottom-2 right-0 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-black">
              LVL {stats.level}
            </div>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Wesley Bizerra</h1>
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Membro desde Março 2026</p>
        </div>

        {/* XP Bar */}
        <div className="mb-12 rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Progresso de Nível</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{stats.xp} / {stats.nextLevelXp} XP</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Fases", value: stats.phasesPlayed, icon: <Flag className="h-4 w-4" /> },
            { label: "Objetivos", value: stats.objectivesCompleted, icon: <Target className="h-4 w-4" /> },
            { label: "Missões", value: stats.missionsCompleted, icon: <Zap className="h-4 w-4" /> },
            { label: "Desafios", value: stats.challengesCompleted, icon: <Trophy className="h-4 w-4" /> },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
            >
              <div className="mb-3 text-emerald-500">{stat.icon}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
              <p className="text-3xl font-black italic">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity Mock */}
        <div className="mt-12">
          <h2 className="text-xl font-black uppercase italic mb-6">Atividade Recente</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 p-4 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Flag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Completou a Fase {10 - i}</p>
                    <p className="text-[10px] text-white/30 uppercase">Há {i + 1} horas atrás</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-500">+150 XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
