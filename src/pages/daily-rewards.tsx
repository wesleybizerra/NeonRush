import React, { useContext } from 'react';
import { UserContext } from '../App';
import { REWARDS_CONFIG, INITIAL_XP } from '../constants/rewards';

export const DailyRewards = () => {
    const { user } = useContext(UserContext);
    if (!user) return null;

    const plan = user.plan || 'free';
    const currentDay = user.dailyRewards?.currentDay || 1;
    const secondsPlayedToday = user.dailyRewards?.secondsPlayedToday || 0;
    const minutesPlayedToday = Math.floor(secondsPlayedToday / 60);

    const config = REWARDS_CONFIG[plan];
    const initialXP = INITIAL_XP[plan];

    const getDayGoal = (day: number) => {
        const time = 20 + (day - 1) * config.timeIncrement;
        const xp = initialXP + (day - 1) * config.xpIncrement;
        return { time, xp };
    };

    const currentGoal = getDayGoal(currentDay);
    const progress = Math.min((minutesPlayedToday / currentGoal.time) * 100, 100);

    return (
        <div className="p-6 max-w-4xl mx-auto text-white">
            <h1 className="text-3xl font-black uppercase italic mb-8">Prêmios Diários</h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <h2 className="text-xl font-bold mb-4">Dia {currentDay} de 30</h2>
                <p className="mb-4">Meta de hoje: Jogue {currentGoal.time} minutos para ganhar {currentGoal.xp} XP.</p>

                <div className="w-full bg-white/10 rounded-full h-4 mb-2">
                    <div
                        className="bg-emerald-500 h-4 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-sm text-white/60">{minutesPlayedToday} / {currentGoal.time} minutos jogados</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1;
                    const goal = getDayGoal(day);
                    const isCompleted = day < currentDay;
                    const isCurrent = day === currentDay;

                    return (
                        <div key={day} className={`p-4 rounded-xl border ${isCurrent ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Dia {day}</span>
                                <span className="text-sm text-white/60">{goal.time} min / {goal.xp} XP</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
