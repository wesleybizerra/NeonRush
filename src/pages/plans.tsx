import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const Plans = ({ userEmail }: { userEmail: string }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  React.useEffect(() => {
    let retries = 0;
    const rawApiUrl = import.meta.env.VITE_API_URL || '';
    const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

    const checkServer = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/health`);
        if (res.ok) {
          setServerStatus('online');
        } else {
          throw new Error();
        }
      } catch (e) {
        if (retries < 3) {
          retries++;
          setTimeout(checkServer, 2000);
        } else {
          setServerStatus('offline');
        }
      }
    };
    // Espera 1 segundo antes do primeiro teste
    const initialTimer = setTimeout(checkServer, 1000);
    return () => clearTimeout(initialTimer);
  }, []);

  const handleSubscribe = async (planId: string) => {
    const rawApiUrl = import.meta.env.VITE_API_URL || '';
    const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

    if (serverStatus === 'offline' && !apiUrl) {
      alert('O servidor interno do jogo não está respondendo. Tente reiniciar o jogo como Administrador ou verifique seu antivírus.');
      return;
    }
    setLoading(true);
    try {
      console.log(`Iniciando checkout para plano: ${planId}`);
      const response = await fetch(`${apiUrl}/api/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || `Erro no servidor: ${response.status}`);
      }

      console.log('Resposta do servidor:', data);

      if (data.init_point) {
        console.log('Abrindo link de pagamento:', data.init_point);
        window.open(data.init_point, '_blank');
      } else {
        alert('Erro: O servidor não retornou um link de pagamento válido.');
      }
    } catch (error: any) {
      console.error('Error creating preference:', error);
      alert(`Falha ao gerar pagamento no Mercado Pago:\n\n${error.message}\n\nVerifique o console (F12) para mais detalhes.`);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Piloto de Rua',
      price: 'R$ 5,00',
      features: [
        "Ganha 2x mais pontos",
        "Carro Exclusivo: Neon Azul",
        "+1 Vida Extra por corrida",
        "Acesso ao Ranking Básico"
      ]
    },
    {
      id: 'pro',
      name: 'Corredor Pro',
      price: 'R$ 10,00',
      features: [
        "Ganha 3x mais pontos",
        "Carro Exclusivo: Cyber Vermelho",
        "+3 Vidas Extras por corrida",
        "Ranking Profissional"
      ]
    },
    {
      id: 'extreme',
      name: 'Lenda do Neon',
      price: 'R$ 15,00',
      features: [
        "Ganha 5x mais pontos",
        "XP NÃO RESETA ao subir de nível",
        "Carro Exclusivo: Dark Matter (Hover)",
        "+5 Vidas Extras por corrida",
        "Sem Anúncios"
      ]
    },
    {
      id: 'viper',
      name: 'Corredor Cyber',
      price: 'R$ 20,00',
      features: [
        "Ganha 7x mais pontos",
        "Carro Exclusivo: Viper Verde",
        "XP NÃO RESETA ao subir de nível",
        "+7 Vidas Extras por corrida"
      ]
    },
    {
      id: 'midas',
      name: 'Lenda Dourada',
      price: 'R$ 25,00',
      features: [
        "Ganha 10x mais pontos",
        "Carro Exclusivo: Midas Dourado",
        "XP NÃO RESETA ao subir de nível",
        "+10 Vidas Extras por corrida"
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-7xl">
            TORNE-SE UMA <span className="text-emerald-500">LENDA</span>
          </h1>
          <p className="mt-4 text-white/50 font-medium uppercase tracking-widest">Escolha o seu plano e domine as ruas de Neon City</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col overflow-hidden rounded-3xl border p-8 transition-all hover:scale-105 ${plan.id === 'pro'
                  ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                  : "border-white/10 bg-white/5"
                }`}
            >
              {plan.id === 'pro' && (
                <div className="absolute top-0 right-0 bg-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                  Mais Popular
                </div>
              )}

              <h2 className="text-2xl font-black uppercase italic mb-2">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-xs font-bold text-white/30 uppercase">/mês</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-white/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className={`w-full rounded-full py-4 text-xs font-black uppercase tracking-widest transition-all ${plan.id === 'pro'
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "bg-white text-black hover:bg-emerald-500"
                  }`}
              >
                {loading ? "Processando..." : t('subscribe')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
