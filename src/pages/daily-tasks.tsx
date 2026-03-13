import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Trophy, CheckCircle2 } from 'lucide-react';

export const DailyTasks = () => {
  const categories = [
    {
      title: "Missões Diárias",
      icon: <Zap className="h-6 w-6 text-emerald-500" />,
      count: 200,
      description: "Missões rápidas para ganhar XP e Créditos.",
      tasks: Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        title: `Missão ${i + 1}: Velocidade Máxima`,
        reward: "150 XP",
        completed: i < 5
      }))
    },
    {
      title: "Desafios Diários",
      icon: <Trophy className="h-6 w-6 text-emerald-500" />,
      count: 200,
      description: "Desafios de habilidade para os melhores pilotos.",
      tasks: Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        title: `Desafio ${i + 1}: Drift Perfeito`,
        reward: "300 XP",
        completed: i < 2
      }))
    },
    {
      title: "Objetivos Diários",
      icon: <Target className="h-6 w-6 text-emerald-500" />,
      count: 200,
      description: "Objetivos estratégicos para dominar a cidade.",
      tasks: Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        title: `Objetivo ${i + 1}: Conquistar Distrito`,
        reward: "500 XP",
        completed: i < 1
      }))
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
            600 Tarefas disponíveis para você hoje
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
                {cat.tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      task.completed 
                        ? "bg-emerald-500/10 border-emerald-500/30 opacity-60" 
                        : "bg-white/5 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-white/20" />
                      )}
                      <div>
                        <p className="text-xs font-bold">{task.title}</p>
                        <p className="text-[10px] text-emerald-500 uppercase font-black">{task.reward}</p>
                      </div>
                    </div>
                    {!task.completed && (
                      <button className="rounded-full bg-white/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                        Iniciar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
