import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Heart, Zap, Pause, Play, Star } from 'lucide-react';
import { UserContext } from '../App';
import { cars2D } from './garage';

// --- GAME ENGINE ---
interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speed?: number;
  type?: 'enemy' | 'coin' | 'powerup';
}

export const PhaseGame2D = () => {
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user, updateUser } = useContext(UserContext);

  const getMaxLives = () => {
    switch (user?.plan) {
      case 'extreme': return 8; // 3 + 5
      case 'pro': return 6; // 3 + 3
      case 'basic': return 4; // 3 + 1
      default: return 3;
    }
  };

  const getPlayerCar = () => {
    const selectedCarId = user?.garage?.selectedCar || 'starter';
    return cars2D.find(c => c.id === selectedCarId) || cars2D[0];
  };

  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gainedXP, setGainedXP] = useState(0);
  const [lives, setLives] = useState(getMaxLives());
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem(`highscore_phase_${phaseId}`) || '0'));
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const hasSavedProgress = useRef(false);

  useEffect(() => {
    let completionBonusXP = 20; // Default for free
    let xpPerCoin = 10;

    if (user?.plan === 'basic') {
      completionBonusXP = 50;
      xpPerCoin = 20;
    } else if (user?.plan === 'pro') {
      completionBonusXP = 70;
      xpPerCoin = 30;
    } else if (user?.plan === 'extreme') {
      completionBonusXP = 100;
      xpPerCoin = 50;
    }

    setGainedXP(completionBonusXP + (coins * xpPerCoin));
  }, [coins, user?.plan]);

  // Phase Configuration
  const phaseConfig = {
    1: { name: 'Neon Suburbs', speed: 6, enemyColor: '#ff0055', bgColor: '#0a0a1a', goalScore: 150 },
    2: { name: 'Cyber City', speed: 9, enemyColor: '#ffaa00', bgColor: '#1a0a1a', goalScore: 300 },
    3: { name: 'Wasteland Highway', speed: 13, enemyColor: '#ff0000', bgColor: '#1a0505', goalScore: 450 },
    4: { name: 'Quantum Tunnel', speed: 17, enemyColor: '#00ffff', bgColor: '#001122', goalScore: 600 },
    5: { name: 'Neon Core', speed: 22, enemyColor: '#ffffff', bgColor: '#220022', goalScore: 750 },
  }[Number(phaseId)] || { name: 'Unknown Zone', speed: 6, enemyColor: '#ff0055', bgColor: '#0a0a1a', goalScore: Number(phaseId) * 150 };

  // Game Loop Refs
  const requestRef = useRef<number>(0);
  const playerRef = useRef<GameObject>({ x: 0, y: 0, width: 40, height: 80, color: getPlayerCar().color });
  const enemiesRef = useRef<GameObject[]>([]);
  const coinsRef = useRef<GameObject[]>([]);
  const linesRef = useRef<{ y: number }[]>(Array.from({ length: 10 }).map((_, i) => ({ y: i * 100 })));
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const frameCountRef = useRef(0);

  useEffect(() => {
    playerRef.current.color = getPlayerCar().color;
  }, [user?.garage?.selectedCar]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Escape' || e.code === 'KeyP') {
        setIsPaused(p => !p);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setIsPaused(false);
    setPhaseCompleted(false);
    setScore(0);
    setCoins(0);
    setLives(getMaxLives());
    enemiesRef.current = [];
    coinsRef.current = [];
    frameCountRef.current = 0;
    hasSavedProgress.current = false;

    if (canvasRef.current) {
      playerRef.current.x = canvasRef.current.width / 2 - playerRef.current.width / 2;
      playerRef.current.y = canvasRef.current.height - 120;
      playerRef.current.color = getPlayerCar().color;
    }
  };

  const drawRectWithNeon = (ctx: CanvasRenderingContext2D, obj: GameObject, glowColor: string) => {
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    ctx.shadowBlur = 0; // Reset
  };

  const gameLoop = () => {
    if (!isPlaying || isGameOver || isPaused) {
      if (isPlaying && !isGameOver && isPaused) {
        requestRef.current = requestAnimationFrame(gameLoop);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.fillStyle = phaseConfig.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Road Lines
    ctx.fillStyle = '#ffffff22';
    linesRef.current.forEach(line => {
      line.y += phaseConfig.speed;
      if (line.y > canvas.height) line.y = -100;
      ctx.fillRect(canvas.width / 3 - 5, line.y, 10, 50);
      ctx.fillRect((canvas.width / 3) * 2 - 5, line.y, 10, 50);
    });

    // Player Movement
    const speed = getPlayerCar().handling / 8;
    if ((keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) && playerRef.current.x > 0) {
      playerRef.current.x -= speed;
    }
    if ((keysRef.current['ArrowRight'] || keysRef.current['KeyD']) && playerRef.current.x < canvas.width - playerRef.current.width) {
      playerRef.current.x += speed;
    }

    // Spawn Enemies
    frameCountRef.current++;
    if (frameCountRef.current % (50 - Math.min(35, Number(phaseId) * 5)) === 0) {
      const lane = Math.floor(Math.random() * 3);
      const laneWidth = canvas.width / 3;
      enemiesRef.current.push({
        x: lane * laneWidth + (laneWidth / 2) - 20,
        y: -100,
        width: 40,
        height: 80,
        color: phaseConfig.enemyColor,
        speed: phaseConfig.speed + Math.random() * 6
      });
    }

    // Spawn Coins
    if (frameCountRef.current % 80 === 0) {
      const lane = Math.floor(Math.random() * 3);
      const laneWidth = canvas.width / 3;
      coinsRef.current.push({
        x: lane * laneWidth + (laneWidth / 2) - 15,
        y: -50,
        width: 30,
        height: 30,
        color: '#ffd700',
        speed: phaseConfig.speed
      });
    }

    // Update & Draw Enemies
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const enemy = enemiesRef.current[i];
      enemy.y += enemy.speed!;
      drawRectWithNeon(ctx, enemy, enemy.color);

      // Collision Detection
      if (
        playerRef.current.x < enemy.x + enemy.width &&
        playerRef.current.x + playerRef.current.width > enemy.x &&
        playerRef.current.y < enemy.y + enemy.height &&
        playerRef.current.y + playerRef.current.height > enemy.y
      ) {
        enemiesRef.current.splice(i, 1);
        setLives(l => {
          if (l <= 1) {
            setIsGameOver(true);
            setIsPlaying(false);
            return 0;
          }
          return l - 1;
        });
      } else if (enemy.y > canvas.height) {
        enemiesRef.current.splice(i, 1);
        setScore(s => s + 10);
      }
    }

    // Update & Draw Coins
    for (let i = coinsRef.current.length - 1; i >= 0; i--) {
      const coin = coinsRef.current[i];
      coin.y += coin.speed!;

      ctx.beginPath();
      ctx.arc(coin.x + 15, coin.y + 15, 15, 0, Math.PI * 2);
      ctx.fillStyle = coin.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = coin.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Collision Detection
      if (
        playerRef.current.x < coin.x + coin.width &&
        playerRef.current.x + playerRef.current.width > coin.x &&
        playerRef.current.y < coin.y + coin.height &&
        playerRef.current.y + playerRef.current.height > coin.y
      ) {
        coinsRef.current.splice(i, 1);
        setCoins(c => c + 1);
        setScore(s => {
          const newScore = s + 50;
          if (newScore >= phaseConfig.goalScore && !phaseCompleted) {
            setPhaseCompleted(true);
          }
          return newScore;
        });
      } else if (coin.y > canvas.height) {
        coinsRef.current.splice(i, 1);
      }
    }

    // Draw Player
    drawRectWithNeon(ctx, playerRef.current, playerRef.current.color);

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, isPaused]);

  // Save Progress to Firebase
  const saveProgress = async () => {
    if (!user || hasSavedProgress.current) {
      console.log('saveProgress skipped', { hasSavedProgress: hasSavedProgress.current });
      return;
    }
    hasSavedProgress.current = true;

    // XP based on plan for completing the phase
    let completionBonusXP = 20; // Default for free
    let xpPerCoin = 10;

    if (user.plan === 'basic') {
      completionBonusXP = 50;
      xpPerCoin = 20;
    } else if (user.plan === 'pro') {
      completionBonusXP = 70;
      xpPerCoin = 30;
    } else if (user.plan === 'extreme') {
      completionBonusXP = 100;
      xpPerCoin = 50;
    }

    let gainedXP = completionBonusXP + (coins * xpPerCoin);
    let gainedCredits = coins;

    console.log('XP Calculation Start:', { coins, score, plan: user.plan, gainedXP, completionBonusXP, xpPerCoin });

    // Task Progress Logic
    const { generateDailyTasks, getDailySeed } = await import('../utils/tasks');
    const seed = getDailySeed();
    const allTasks = generateDailyTasks(seed);
    const taskProgress = { ...(user.taskProgress || {}) };

    allTasks.forEach(task => {
      // Only process tasks for this phase or any phase
      if (task.phaseId === undefined || task.phaseId === Number(phaseId)) {
        let currentP = taskProgress[task.id];

        // Reset if it's a new day
        if (!currentP || currentP.date !== seed) {
          currentP = { progress: 0, completed: false, date: seed };
        }

        if (!currentP.completed) {
          if (task.actionType === 'collect_coins') {
            currentP.progress += coins;
          } else if (task.actionType === 'reach_score') {
            // For reach score, we take the max of current progress and new score
            currentP.progress = Math.max(currentP.progress, score);
          } else if (task.actionType === 'play_phase') {
            currentP.progress += 1;
          }

          if (currentP.progress >= task.target) {
            currentP.progress = task.target;
            currentP.completed = true;

            // Use fixed XP based on plan
            let taskXP = 20; // Default for free
            if (user.plan === 'basic') taskXP = 50;
            if (user.plan === 'pro') taskXP = 70;
            if (user.plan === 'extreme') taskXP = 100;

            gainedXP += taskXP;
            gainedCredits += task.rewardCoins;
            console.log('Task Completed:', { taskTitle: task.title, taskXP });
          }

          taskProgress[task.id] = currentP;
        }
      }
    });

    console.log('Total XP Gained:', gainedXP);

    let currentXP = (user.xp || 0) + gainedXP;
    let currentLevel = user.level || 1;
    const maxLevel = 150;

    // Level up logic
    while (currentLevel < maxLevel) {
      const requiredXP = currentLevel * 1000;
      if (currentXP >= requiredXP) {
        currentLevel++;
        if (user.plan !== 'extreme') {
          currentXP -= requiredXP; // Reset XP if not extreme plan, but keep excess
        }
      } else {
        break;
      }
    }

    let newUnlockedPhase = user.unlockedPhase || 1;
    if (phaseCompleted && Number(phaseId) === newUnlockedPhase) {
      newUnlockedPhase++;
    }

    await updateUser({
      xp: currentXP,
      level: currentLevel,
      credits: (user.credits || 0) + gainedCredits,
      unlockedPhase: newUnlockedPhase,
      taskProgress
    });
  };

  useEffect(() => {
    if (isGameOver) {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem(`highscore_phase_${phaseId}`, score.toString());
      }
      saveProgress();
    }
  }, [isGameOver]);

  const handleExit = async () => {
    await saveProgress();
    navigate('/phases');
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          canvasRef.current.width = parent.clientWidth;
          canvasRef.current.height = parent.clientHeight;
          if (!isPlaying) {
            playerRef.current.x = canvasRef.current.width / 2 - 20;
            playerRef.current.y = canvasRef.current.height - 120;
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.fillStyle = phaseConfig.bgColor;
              ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              drawRectWithNeon(ctx, playerRef.current, playerRef.current.color);
            }
          }
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isPlaying]);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-sans">
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
        <div>
          <button
            onClick={handleExit}
            className="pointer-events-auto flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-widest">Sair e Salvar</span>
          </button>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {phaseConfig.name}
          </h1>
          <p className="text-emerald-500 font-black tracking-widest uppercase text-sm">Fase {phaseId}</p>
          <div className="mt-2 text-xs font-bold text-white/60 uppercase tracking-widest">
            Objetivo: {score} / {phaseConfig.goalScore} Pontos
            {phaseCompleted && <span className="ml-2 text-emerald-500">✓ CONCLUÍDO</span>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {isPlaying && !isGameOver && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="pointer-events-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-colors mb-2"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              <span className="text-xs font-bold uppercase tracking-widest">{isPaused ? 'Continuar' : 'Pausar'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Zap className="h-4 w-4 text-emerald-500" />
            <span className="font-mono text-xl font-bold">{score.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Star className="h-4 w-4 text-emerald-500" />
            <span className="font-mono text-xl font-bold text-emerald-500">{gainedXP}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-mono text-xl font-bold text-yellow-500">{coins}</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: Math.max(3, getMaxLives()) }).map((_, i) => (
              <Heart key={i} className={`h-5 w-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-white/20'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="relative w-full max-w-lg h-full border-x border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
          />

          {/* Mobile Controls */}
          {isPlaying && !isGameOver && !isPaused && (
            <div className="absolute bottom-10 left-0 w-full flex justify-between px-4 md:hidden">
              <button
                className="w-24 h-24 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm active:bg-white/30"
                onTouchStart={() => { keysRef.current['ArrowLeft'] = true; }}
                onTouchEnd={() => { keysRef.current['ArrowLeft'] = false; }}
              />
              <button
                className="w-24 h-24 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm active:bg-white/30"
                onTouchStart={() => { keysRef.current['ArrowRight'] = true; }}
                onTouchEnd={() => { keysRef.current['ArrowRight'] = false; }}
              />
            </div>
          )}

          {/* Paused Screen */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-4xl font-black uppercase italic mb-8 text-white">Pausado</h2>
              <button
                onClick={() => setIsPaused(false)}
                className="rounded-full bg-emerald-500 px-12 py-4 text-sm font-black uppercase tracking-widest text-black hover:bg-emerald-400 hover:scale-105 transition-all"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Start Screen */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-4xl font-black uppercase italic mb-2 text-emerald-500">Pronto?</h2>
              <p className="text-white/60 mb-8 text-sm uppercase tracking-widest">Use as setas ou A/D para desviar.</p>
              <button
                onClick={startGame}
                className="rounded-full bg-emerald-500 px-12 py-4 text-sm font-black uppercase tracking-widest text-black hover:bg-emerald-400 hover:scale-105 transition-all"
              >
                Iniciar Corrida
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-5xl font-black uppercase italic mb-2 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">Destruído</h2>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-xs mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/50 uppercase text-xs font-bold tracking-widest">Pontuação</span>
                  <span className="font-mono text-2xl font-bold">{score}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/50 uppercase text-xs font-bold tracking-widest">Moedas</span>
                  <span className="font-mono text-xl font-bold text-yellow-500">+{coins}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/50 uppercase text-xs font-bold tracking-widest">XP Ganho</span>
                  <span className="font-mono text-xl font-bold text-emerald-500">
                    +{coins * (user?.plan === 'extreme' ? 50 : user?.plan === 'pro' ? 30 : user?.plan === 'basic' ? 20 : 10)}
                  </span>
                </div>
                <div className="h-px w-full bg-white/10 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-emerald-500 uppercase text-xs font-bold tracking-widest">Recorde</span>
                  <span className="font-mono text-xl font-bold text-emerald-500">{highScore}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleExit}
                  className="rounded-full bg-white/10 border border-white/20 px-8 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all"
                >
                  Sair
                </button>
                <button
                  onClick={startGame}
                  className="rounded-full bg-emerald-500 px-8 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-emerald-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
