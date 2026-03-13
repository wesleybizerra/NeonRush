import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from "uuid";

// Assuming these helper functions exist in App.tsx or need to be moved to a constants/utils file
// For now, I will re-implement the necessary ones here or import them if possible.
// Given the structure, I'll keep them here for now.
const colorOptions = ["#ef4444", "#f97316", "#22c55e", "#38bdf8", "#8b5cf6", "#f8fafc"];
const wingOptions = ["Sem aero", "Street wing", "Carbon wing", "Aero GT"];
const sideskirtOptions = ["Original", "Street line", "Track edge", "Ultra flow"];
const bumperOptions = ["Original", "Sport", "Agressivo", "Legend"];
const windowOptions = ["Cristal", "Fume leve", "Fume escuro", "Cromado"];

function createBaseAccount(input: any) {
  return {
    id: uuidv4(),
    username: input.username,
    email: input.email.toLowerCase(),
    password: input.password,
    plan: "free",
    isAdmin: input.isAdmin,
    createdAt: new Date().toISOString(),
    credits: 10000,
    xp: 0,
    unlockedPhase: 30,
    inventory: { characters: [], cars: [], outfits: [], evolutions: [] },
    garage: {
      carColor: colorOptions[0],
      selectedCar: "",
      selectedCharacter: "",
      selectedOutfit: "",
      bodykit: {
        wing: wingOptions[0],
        sideskirt: sideskirtOptions[0],
        bumper: bumperOptions[0],
        windows: windowOptions[0],
      },
      upgrades: { engine: 0, suspension: 0, nitro: 0, brake: 0, turbo: 0 },
    },
  };
}

export const Auth = ({ onAuthSuccess }: { onAuthSuccess: (email: string) => void }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      // Registration logic
      const baseAccount = createBaseAccount({ username: form.username, email: form.email, password: form.password, isAdmin: false });
      const userRef = doc(collection(db, "users"));
      await setDoc(userRef, { ...baseAccount, id: userRef.id });
      onAuthSuccess(form.email);
    } else {
      // Login logic - needs to check against users in Firestore
      // For now, just trigger success to test navigation
      onAuthSuccess(form.email);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-black uppercase italic text-emerald-500">
          {mode === 'login' ? t('login') : t('register')}
        </h2>
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Username"
            className="w-full rounded bg-white/10 p-3 text-white"
            onChange={(e) => setForm({...form, username: e.target.value})}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded bg-white/10 p-3 text-white"
          onChange={(e) => setForm({...form, email: e.target.value})}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded bg-white/10 p-3 text-white"
          onChange={(e) => setForm({...form, password: e.target.value})}
        />
        <button type="submit" className="w-full rounded bg-emerald-500 p-3 font-black uppercase text-black">
          {mode === 'login' ? t('login') : t('register')}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-xs text-white/50 underline">
          {mode === 'login' ? t('register') : t('login')}
        </button>
      </form>
    </div>
  );
};
