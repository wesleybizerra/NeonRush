import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Trophy, Zap, Target, Flag } from 'lucide-react';
import { UserContext } from '../App';
import { generateDailyTasks, getDailySeed } from '../utils/tasks';

export const Profile = () => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  const seed = getDailySeed();
  const allTasks = useMemo(() => generateDailyTasks(seed), [seed]);

  const completedTasks = useMemo(() => {
    if (!user?.taskProgress) return { missions: 0, challenges: 0, objectives: 0 };
    let missions = 0, challenges = 0, objectives = 0;

    allTasks.forEach(task => {
      const p = user.taskProgress![task.id];
      if (p && p.completed && p.date === seed) {
        if (task.type === 'mission') missions++;
        if (task.type === 'challenge') challenges++;
        if (task.type === 'objective') objectives++;
      }
    });
    return { missions, challenges, objectives };
  }, [user?.taskProgress, allTasks, seed]);

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const nextLevelXp = level * 1000;
  const phasesPlayed = user?.unlockedPhase || 1;

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-6">
            <div className="h-32 w-32 rounded-full border-4 border-emerald-500 p-1 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                <User className="h-16 w-16 text-emerald-500" />
              </div>
            </div>
            <div className="absolute -bottom-2 right-0 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-black">
              LVL {level}
            </div>
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{user?.username || 'Piloto'}</h1>
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Plano: {user?.plan || 'Free'}</p>
        </div>

        {/* XP Bar */}
        <div className="mb-12 rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Progresso de Nível</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{xp} / {nextLevelXp} XP</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (xp / nextLevelXp) * 100)}%` }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Fases", value: phasesPlayed, icon: <Flag className="h-4 w-4" /> },
            { label: "Objetivos", value: completedTasks.objectives, icon: <Target className="h-4 w-4" /> },
            { label: "Missões", value: completedTasks.missions, icon: <Zap className="h-4 w-4" /> },
            { label: "Desafios", value: completedTasks.challenges, icon: <Trophy className="h-4 w-4" /> },
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
      </div>
    </div>
  );
};
