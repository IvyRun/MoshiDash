import { useState, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { CharacterCreator } from './components/CharacterCreator';
import { GameState, MochiType, CharacterCustomization } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: parseInt(localStorage.getItem('mochi-dash-highscore') || '0'),
    status: 'START',
    speed: 5,
    customization: {
      baseType: 'cat',
      skinTone: '#FFE0B2',
      hairstyle: 'none',
      clothing: 'none'
    },
    hasFlametorch: true, // Earned by default for this version
    torchFuel: 100,
    lives: 3
  });

  const handleStart = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'CREATOR' }));
  }, []);

  const handleCreatorComplete = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'PLAYING', score: 0, torchFuel: 100, lives: 3 }));
  }, []);

  const handleCustomizationUpdate = useCallback((customization: CharacterCustomization) => {
    setGameState(prev => ({ ...prev, customization }));
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState(prev => {
      const newHighScore = Math.max(prev.highScore, finalScore);
      localStorage.setItem('mochi-dash-highscore', newHighScore.toString());
      return {
        ...prev,
        status: 'GAMEOVER',
        score: finalScore,
        highScore: newHighScore
      };
    });
  }, []);

  const handleScoreUpdate = useCallback((score: number) => {
    setGameState(prev => ({ ...prev, score }));
  }, []);

  const handleFuelUpdate = useCallback((fuel: number) => {
    setGameState(prev => ({ ...prev, torchFuel: fuel }));
  }, []);

  const handleLivesUpdate = useCallback((lives: number) => {
    setGameState(prev => ({ ...prev, lives }));
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#FFF5F5] overflow-hidden font-sans selection:bg-[#FF8A80] selection:text-white">
      {/* Background Clouds/Shapes */}
      <div className="absolute top-20 left-[10%] w-64 h-32 bg-white/40 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-[15%] w-48 h-48 bg-[#F8BBD0]/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <main className="relative z-10 w-full h-full max-w-5xl mx-auto flex items-center justify-center p-4">
        <div className="w-full aspect-[2/1] bg-white/30 backdrop-blur-sm relative overflow-hidden rounded-[40px] pastel-border shadow-2xl">
          <GameCanvas 
            status={gameState.status}
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
            onLivesUpdate={handleLivesUpdate}
            customization={gameState.customization}
            hasFlametorch={gameState.hasFlametorch}
            onFuelUpdate={handleFuelUpdate}
            lives={gameState.lives}
          />
          
          {gameState.status === 'CREATOR' && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <CharacterCreator 
                customization={gameState.customization}
                onUpdate={handleCustomizationUpdate}
                onComplete={handleCreatorComplete}
              />
            </div>
          )}

          <UIOverlay 
            status={gameState.status}
            score={gameState.score}
            highScore={gameState.highScore}
            onStart={handleStart}
            customization={gameState.customization}
            hasFlametorch={gameState.hasFlametorch}
            fuel={gameState.torchFuel}
            lives={gameState.lives}
          />
        </div>
      </main>

      {/* Footer Meta */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none opacity-40">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[10px] uppercase tracking-widest text-[#5D4037]">Mochi Dash v2.0</span>
          <span className="font-bold text-[10px] uppercase tracking-widest text-[#5D4037]">Status: Cozy</span>
        </div>
        <div className="font-bold text-[10px] uppercase tracking-widest text-[#5D4037]">
          Press [F] for Flametorch
        </div>
      </div>
    </div>
  );
}
