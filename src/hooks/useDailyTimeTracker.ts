import { useEffect, useRef, useContext } from 'react';
import { UserContext } from '../App';

export const useDailyTimeTracker = () => {
    const { user, updateUser } = useContext(UserContext);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const lastPlayed = user.dailyRewards?.lastPlayedDate || '';

        // Reset if it's a new day (more than 24h)
        let currentDay = user.dailyRewards?.currentDay || 1;
        let secondsPlayedToday = user.dailyRewards?.secondsPlayedToday || 0;

        if (lastPlayed !== today) {
            // Check if it's the next day
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastPlayed === yesterdayStr) {
                // It's the next day, continue streak
                currentDay = (currentDay % 30) + 1;
            } else {
                // Reset to day 1
                currentDay = 1;
            }
            secondsPlayedToday = 0;
        }

        timerRef.current = setInterval(() => {
            secondsPlayedToday += 1;
            // Update Firebase every 30 seconds to save quota
            if (secondsPlayedToday % 30 === 0) {
                updateUser({
                    dailyRewards: {
                        currentDay,
                        lastPlayedDate: today,
                        secondsPlayedToday
                    }
                });
            }
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            // Final save on exit
            updateUser({
                dailyRewards: {
                    currentDay,
                    lastPlayedDate: today,
                    secondsPlayedToday
                }
            });
        };
    }, [user?.id]);
};
