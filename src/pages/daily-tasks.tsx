import React, { useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Trophy, CheckCircle2 } from 'lucide-react';
import { UserContext } from '../App';
import { generateDailyTasks, getDailySeed } from '../utils/tasks';

export const DailyTasks = () => {
  const { user } = useContext(UserContext);

  const seed = getDailySeed();
  const allTasks = useMemo(() => generateDailyTasks(seed), [seed]);

  const missions = allTasks.filter(t => t.type === 'mission');
  const challenges = allTasks.filter(t => t.type === 'challenge');
  const objectives = allTasks.filter(t => t.type === 'objective');

  const getTaskProgress = (taskId: string) => {
    if (!user?.taskProgress) return { progress: 0, completed: false };
    const p = user.taskProgress[taskId];
    if (p && p.date === seed) {
      return p;
    }
    return { progress: 0, completed: false };
  };

  const categories = [
    {
      title: "Missões Diárias",
      icon: <Zap className="h-6 w-6 text-emerald-500" />,
      count: missions.length,
      description: "Missões rápidas para ganhar XP e Créditos.",
      tasks: missions
    },
    {
      title: "Desafios Diários",
      icon: <Trophy className="h-6 w-6 text-emerald-500" />,
      count: challenges.length,
      description: "Desafios de habilidade para os melhores pilotos.",
      tasks: challenges
    },
    {
      title: "Objetivos Diários",
      icon: <Target className="h-6 w-6 text-emerald-500" />,
      count: objectives.length,
      description: "Objetivos estratégicos para dominar a cidade.",
      tasks: objectives
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter md:text-6xl">
            CENTRAL DE <span className="text-emerald-500">OPERAÇÕES</span>
          </h1>
          <p className="mt-4 text-white/40 font-medium uppercase tracking-widest">
            {allTasks.length} Tarefas disponíveis para você hoje
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col rounded-3xl border border-white/10 bg-white/5 overflow-hidden h-[70vh]"
            >
              <div className="p-8 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    {cat.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase italic">{cat.title}</h2>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      {cat.count} Disponíveis
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {cat.tasks.map((task) => {
                  const { progress, completed } = getTaskProgress(task.id);
                  const progressPct = Math.min(100, (progress / task.target) * 100);

                  return (
                    <div
                      key={task.id}
                      className={`flex flex-col p-4 rounded-2xl border transition-all ${completed
                          ? "bg-emerald-500/10 border-emerald-500/30 opacity-60"
                          : "bg-white/5 border-white/5 hover:border-white/20"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-white/20 mt-1" />
                          )}
                          <div>
                            <p className="text-xs font-bold">{task.title}</p>
                            <p className="text-[10px] text-white/50 mt-1">{task.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pl-7">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-emerald-500 uppercase">{task.rewardXP} XP | {task.rewardCoins} Moedas</span>
                          <span className="text-[10px] font-black text-white/40">{progress} / {task.target}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
