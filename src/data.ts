import { Car, Character, Outfit, Phase, DailyTask } from "./types";

const prefixes = ["Neon", "Cyber", "Turbo", "Street", "Velocity", "Night", "Shadow", "Thunder", "Hyper", "Apex", "Zenith", "Phantom", "Rogue", "Viper", "Cobalt", "Ignite", "Velocity", "Sonic", "Eclipse", "Solar"];
const suffixes = ["Racer", "Drifter", "Bolt", "Pulse", "Ghost", "Storm", "Strike", "Fury", "Blade", "Zenith", "Titan", "Vortex", "Slayer", "Runner", "Hunter", "Shift", "Drift", "Flow", "Wave", "Spark"];

export const cars: Car[] = Array.from({ length: 200 }, (_, i) => {
  const name = `${prefixes[i % prefixes.length]} ${suffixes[Math.floor(i / prefixes.length) % suffixes.length]} ${i + 1}`;
  return {
    id: `car-${i}`,
    name: name,
    color: i % 2 === 0 ? "Neon Blue" : "Neon Red",
    details: `Detalhes do carro ${name}`,
    specialty: i % 3 === 0 ? "Velocidade" : "Aceleração",
    benefits: `Benefício do carro ${name}`,
    // Tenta carregar imagem local. Se não existir, o navegador mostra o alt.
    image: `images/cars/car-${i}.png`,
  };
});

export const characters: Character[] = Array.from({ length: 200 }, (_, i) => ({
  id: `char-${i}`,
  name: `Personagem ${i + 1}`,
  gender: i < 100 ? "male" : "female",
  details: `Detalhes do personagem ${i + 1}`,
}));

export const outfits: Outfit[] = Array.from({ length: 200 }, (_, i) => ({
  id: `outfit-${i}`,
  name: `Roupa ${i + 1}`,
  details: `Detalhes da roupa ${i + 1}`,
}));

export const phases: Phase[] = Array.from({ length: 200 }, (_, i) => ({
  id: i + 1,
  name: `Fase ${i + 1}`,
  description: `Descrição da fase ${i + 1}`,
}));

export const dailyTasks: DailyTask[] = Array.from({ length: 600 }, (_, i) => ({
  id: `task-${i}`,
  title: `Tarefa ${i + 1}`,
  description: `Como completar a tarefa ${i + 1}`,
  type: i < 200 ? "challenge" : i < 400 ? "objective" : "mission",
}));
