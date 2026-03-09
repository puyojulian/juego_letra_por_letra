import React, { useState, useEffect, useCallback } from 'react';
import { GameConfiguration, GameState, WordData } from '../types/game';
import { getRandomWord } from '../services/wordService';
import { WordDisplay } from './WordDisplay';
import { HangmanVisual } from './HangmanVisual';
import { Keyboard } from './Keyboard';

interface Props {
  config: GameConfiguration;
  onRestart: () => void;
  onChangeDifficulty: () => void;
}

export const GameBoard: React.FC<Props> = ({ config, onRestart, onChangeDifficulty, setConfig }) => {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [gameState, setGameState] = useState<GameState>('playing');

  const initGame = useCallback(() => {
    setGuessedLetters(new Set());
    setGameState('playing');
    const newWordData = getRandomWord(config.difficulty);
    setWordData(newWordData);
  }, [config.difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleGuess = useCallback((letter: string) => {
    if (gameState !== 'playing' || guessedLetters.has(letter) || !wordData) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    const word = wordData.word;
    // Check win/loss
    const failedAttempts = Array.from(newGuessed).filter(l => !word.includes(l)).length;
    const isWin = word.split('').every(l => newGuessed.has(l));
    
    if (isWin) {
      setGameState('won');
    } else if (failedAttempts >= config.maxAttempts) {
      setGameState('lost');
    }
  }, [gameState, guessedLetters, wordData, config.maxAttempts]);

  if (!wordData) return null;

  const word = wordData.word;
  const failedLetters = Array.from(guessedLetters).filter(l => !word.includes(l));

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <button
        onClick={() => setConfig(null)}
        className="self-start px-4 py-2 text-sm font-medium rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
      >
        Atras
      </button>
      <div className="text-center mb-2">
        <span className="text-sm uppercase tracking-widest opacity-70">Categoría</span>
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">{wordData.category}</h3>
      </div>

      <HangmanVisual maxAttempts={config.maxAttempts} failedAttempts={failedLetters.length} />
      
      <WordDisplay word={word} guessedLetters={guessedLetters} isGameOver={gameState !== 'playing'} />
      
      <div className="min-h-[3rem] my-4">
        {failedLetters.length > 0 && (
          <div className="text-center">
            <span className="text-sm opacity-70 mr-2">Letras falladas:</span>
            <span className="text-red-500 dark:text-red-400 font-medium tracking-widest">
              {failedLetters.join(', ')}
            </span>
          </div>
        )}
      </div>

      <Keyboard 
        guessedLetters={guessedLetters} 
        onGuess={handleGuess} 
        disabled={gameState !== 'playing'} 
      />

      {/* Result Modal Overlay */}
      {gameState !== 'playing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center transform animate-in zoom-in-95 duration-300">
            <h2 className={`text-3xl font-bold mb-2 ${gameState === 'won' ? 'text-green-500' : 'text-red-500'}`}>
              {gameState === 'won' ? '¡Has ganado!' : '¡Has perdido!'}
            </h2>
            <p className="text-lg mb-6 opacity-80">
              La palabra era: <strong className="font-bold text-xl">{word}</strong>
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={initGame}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Jugar de nuevo
              </button>
              <button 
                onClick={onChangeDifficulty}
                className="w-full py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-medium transition-colors"
              >
                Cambiar dificultad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
