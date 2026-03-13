export interface Task {
    id: string;
    type: 'mission' | 'challenge' | 'objective';
    title: string;
    description: string;
    target: number;
    rewardXP: number;
    rewardCoins: number;
    actionType: 'collect_coins' | 'reach_score' | 'play_phase';
    phaseId?: number; // If undefined, applies to any phase
}

// Simple seeded random number generator
function mulberry32(a: number) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function getDailySeed() {
    const now = new Date();
    // Adjust to 08:00 AM
    const resetTime = new Date(now);
    resetTime.setHours(8, 0, 0, 0);

    if (now < resetTime) {
        // If before 8 AM, use yesterday's date
        resetTime.setDate(resetTime.getDate() - 1);
    }

    return resetTime.toISOString().split('T')[0];
}

export function generateDailyTasks(seedString: string): Task[] {
    // Convert seed string to a number
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
        seed += seedString.charCodeAt(i);
    }

    const random = mulberry32(seed);
    const tasks: Task[] = [];

    const actionTypes: ('collect_coins' | 'reach_score' | 'play_phase')[] = ['collect_coins', 'reach_score', 'play_phase'];

    // Generate 20 Missions
    for (let i = 0; i < 20; i++) {
        const action = actionTypes[Math.floor(random() * actionTypes.length)];
        const phase = Math.floor(random() * 5) + 1;
        let target = 0;
        let title = '';
        let description = '';

        if (action === 'collect_coins') {
            target = Math.floor(random() * 50) + 10;
            title = `Coletor Iniciante ${i + 1}`;
            description = `Colete ${target} moedas na Fase ${phase}.`;
        } else if (action === 'reach_score') {
            target = Math.floor(random() * 1000) + 500;
            title = `Corredor Rápido ${i + 1}`;
            description = `Alcance ${target} de pontuação na Fase ${phase}.`;
        } else {
            target = Math.floor(random() * 3) + 1;
            title = `Piloto Frequente ${i + 1}`;
            description = `Jogue a Fase ${phase} ${target} vezes.`;
        }

        tasks.push({
            id: `mission_${seedString}_${i}`,
            type: 'mission',
            title,
            description,
            target,
            rewardXP: 100 + Math.floor(random() * 100),
            rewardCoins: 50 + Math.floor(random() * 50),
            actionType: action,
            phaseId: phase
        });
    }

    // Generate 20 Challenges
    for (let i = 0; i < 20; i++) {
        const action = actionTypes[Math.floor(random() * actionTypes.length)];
        const phase = Math.floor(random() * 5) + 1;
        let target = 0;
        let title = '';
        let description = '';

        if (action === 'collect_coins') {
            target = Math.floor(random() * 150) + 50;
            title = `Mestre das Moedas ${i + 1}`;
            description = `Colete ${target} moedas na Fase ${phase} em uma única corrida.`;
        } else if (action === 'reach_score') {
            target = Math.floor(random() * 3000) + 1000;
            title = `Intocável ${i + 1}`;
            description = `Alcance ${target} de pontuação na Fase ${phase}.`;
        } else {
            target = Math.floor(random() * 10) + 5;
            title = `Viciado em Adrenalina ${i + 1}`;
            description = `Jogue a Fase ${phase} ${target} vezes.`;
        }

        tasks.push({
            id: `challenge_${seedString}_${i}`,
            type: 'challenge',
            title,
            description,
            target,
            rewardXP: 300 + Math.floor(random() * 200),
            rewardCoins: 150 + Math.floor(random() * 100),
            actionType: action,
            phaseId: phase
        });
    }

    // Generate 20 Objectives
    for (let i = 0; i < 20; i++) {
        const action = actionTypes[Math.floor(random() * actionTypes.length)];
        let target = 0;
        let title = '';
        let description = '';

        if (action === 'collect_coins') {
            target = Math.floor(random() * 500) + 200;
            title = `Magnata do Neon ${i + 1}`;
            description = `Colete um total de ${target} moedas em qualquer fase.`;
        } else if (action === 'reach_score') {
            target = Math.floor(random() * 10000) + 5000;
            title = `Lenda Viva ${i + 1}`;
            description = `Alcance uma pontuação total de ${target} somando todas as corridas de hoje.`;
        } else {
            target = Math.floor(random() * 20) + 10;
            title = `Maratona Cyberpunk ${i + 1}`;
            description = `Jogue um total de ${target} corridas em qualquer fase.`;
        }

        tasks.push({
            id: `objective_${seedString}_${i}`,
            type: 'objective',
            title,
            description,
            target,
            rewardXP: 500 + Math.floor(random() * 500),
            rewardCoins: 300 + Math.floor(random() * 200),
            actionType: action,
            phaseId: undefined // Any phase
        });
    }

    return tasks;
}
