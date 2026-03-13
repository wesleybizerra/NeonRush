import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket, Shield, Zap, Trophy } from 'lucide-react';

export const Home = () => {
  const { t } = useTranslation();
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.imgur.com/NHBK3cl.png" 
            alt="Neon Rush Hero" 
            className="h-full w-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-2 text-[12px] font-black uppercase tracking-[0.4em] text-emerald-400">
            A Experiência Definitiva de Corrida
          </span>
          <h1 className="mb-6 text-7xl font-black uppercase italic leading-[0.85] tracking-tighter md:text-9xl">
            DOMINE A<br />
            <span className="text-emerald-500">VELOCIDADE</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-relaxed text-white/70 md:text-xl">
            Neon Rush não é apenas um jogo, é um estilo de vida. Personalize máquinas lendárias, 
            desafie a gravidade em pistas neon e torne-se o rei das ruas. 
            Você está pronto para deixar sua marca?
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/phases"
              className="group relative overflow-hidden rounded-full bg-emerald-500 px-12 py-5 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95"
            >
              Começar Corrida
            </Link>
            <Link
              to="/plans"
              className="rounded-full border-2 border-white/20 bg-white/5 px-12 py-5 text-sm font-black uppercase tracking-widest backdrop-blur-md transition-all hover:bg-white hover:text-black hover:border-white"
            >
              Ver Planos VIP
            </Link>
          </div>
        </motion.div>

        {/* Floating Features */}
        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8 px-6">
            {[
              { icon: <Zap className="h-5 w-5" />, text: "Física Realista" },
              { icon: <Rocket className="h-5 w-5" />, text: "Nitro Infinito" },
              { icon: <Shield className="h-5 w-5" />, text: "Carros Exclusivos" },
              { icon: <Trophy className="h-5 w-5" />, text: "Ranking Global" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 rounded-full bg-white/5 px-5 py-2 backdrop-blur-sm border border-white/10"
              >
                <span className="text-emerald-500">{feature.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Persuasive Section */}
      <section className="relative bg-zinc-950 py-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-black uppercase italic leading-tight tracking-tighter md:text-7xl mb-8">
                POR QUE SER UM <br />
                <span className="text-emerald-500">PILOTO PRO?</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase mb-2">Acesso Antecipado</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Seja o primeiro a testar novas pistas e carros antes de todo mundo. 
                      A vantagem competitiva começa aqui.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold uppercase mb-2">Prêmios em Dinheiro</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Participe de torneios exclusivos para membros PRO e ganhe prêmios reais 
                      e créditos no jogo para tunar sua garagem.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/plans"
                className="mt-12 inline-block rounded-full bg-white px-10 py-4 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-emerald-500"
              >
                Escolher Meu Plano Agora
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1000" 
                  alt="Gameplay" 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-emerald-500 blur-3xl opacity-20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
