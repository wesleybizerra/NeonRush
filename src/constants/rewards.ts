export type PlanId = "free" | "basic" | "pro" | "extreme" | "viper" | "midas";

export const REWARDS_CONFIG: Record<PlanId, { timeIncrement: number, xpIncrement: number }> = {
    free: { timeIncrement: 10, xpIncrement: 100 },
    basic: { timeIncrement: 10, xpIncrement: 200 },
    pro: { timeIncrement: 10, xpIncrement: 300 },
    extreme: { timeIncrement: 10, xpIncrement: 400 },
    viper: { timeIncrement: 10, xpIncrement: 500 },
    midas: { timeIncrement: 10, xpIncrement: 600 },
};

export const INITIAL_XP: Record<PlanId, number> = {
    free: 200,
    basic: 300,
    pro: 400,
    extreme: 500,
    viper: 600,
    midas: 700,
};
