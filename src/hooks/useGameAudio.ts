import { useRef, useEffect } from 'react';

export const useGameAudio = (url: string) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(url);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5;
        }
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, [url]);

    const play = () => {
        audioRef.current?.play().catch(e => console.error("Autoplay prevented", e));
    };

    const pause = () => {
        audioRef.current?.pause();
    };

    return { play, pause };
};
