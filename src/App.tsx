/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { GameConfig } from './components/GameConfig';
import { GameBoard } from './components/GameBoard';
import { GameConfiguration } from './types/game';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [config, setConfig] = useState<GameConfiguration | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-12">
          <button
            onClick={() => setConfig(null)}
            className="text-left"
            aria-label="Go to home"
          >
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 hover:opacity-80 transition-opacity cursor-pointer">
              Hangman App
            </h1>
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </header>

        <main className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 md:p-12 transition-colors duration-300 min-h-[60vh] flex flex-col items-center justify-center">
          {!config ? (
            <GameConfig onSelectDifficulty={setConfig} />
          ) : (
            <GameBoard 
              config={config}
              setConfig={setConfig}
              onRestart={() => setConfig({ ...config })}
              onChangeDifficulty={() => setConfig(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
