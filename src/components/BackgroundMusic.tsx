import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const BackgroundMusic = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const location = useLocation();

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio('https://res.cloudinary.com/dwno3zfg6/video/upload/v1773387335/Toque_de_Fase_Final_dd5yqg.mp3');
            audioRef.current.loop = true;
            audioRef.current.volume = 0.5; // Ajuste o volume conforme necessário
        }

        const isPhase = location.pathname.startsWith('/phase/') || location.pathname.startsWith('/phase-3d/');

        if (isPhase) {
            audioRef.current.play().catch(e => console.error("Autoplay prevented", e));
        } else {
            audioRef.current.pause();
        }
    }, [location.pathname]);

    return null;
};
