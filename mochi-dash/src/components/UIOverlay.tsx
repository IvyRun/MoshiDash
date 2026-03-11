import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Play, RotateCcw, Flame, Star, User } from 'lucide-react';
import { MochiType, CharacterCustomization } from '../types';

interface UIOverlayProps {
  status: 'START' | 'CREATOR' | 'PLAYING' | 'GAMEOVER';
  score: number;
  highScore: number;
  onStart: () => void;
  customization: CharacterCustomization;
  hasFlametorch: boolean;
  fuel: number;
  lives: number;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  status, score, highScore, onStart, customization, hasFlametorch, fuel, lives 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
      {/* HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#5D4037]/60 uppercase tracking-widest">Score</span>
            <span className="text-4xl font-display text-[#5D4037]">{Math.floor(score)}</span>
          </div>
          
          {status === 'PLAYING' && (
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1 }}
                  animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.2 }}
                >
                  <Heart size={20} fill={i < lives ? "#FF8A80" : "transparent"} color="#FF8A80" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {status === 'PLAYING' && hasFlametorch && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[#FF7043]">
              <Flame size={20} fill="currentColor" />
              <span className="font-bold text-sm uppercase">Torch Fuel</span>
            </div>
            <div className="w-32 h-3 bg-white/50 rounded-full mt-1 overflow-hidden border-2 border-white">
              <motion.div 
                className="h-full bg-[#FF7043]" 
                initial={{ width: '100%' }}
                animate={{ width: `${fuel}%` }}
              />
            </div>
            <span className="text-[10px] text-[#5D4037]/40 uppercase mt-1">Hold [F] to use</span>
          </div>
        )}

        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-[#5D4037]/60 uppercase tracking-widest flex items-center gap-1">
            <Star size={12} fill="currentColor" /> Best
          </span>
          <span className="text-2xl font-display text-[#5D4037]/80">{highScore}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'START' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-8 pointer-events-auto bg-white/40 backdrop-blur-lg p-10 rounded-[40px] pastel-border"
          >
            <div className="text-center">
              <h1 className="text-7xl font-display text-[#FF8A80] drop-shadow-sm mb-2">
                MOCHI DASH
              </h1>
              <p className="text-sm font-bold text-[#5D4037]/60 uppercase tracking-[0.3em]">The Coziest Adventure</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <p className="text-[#5D4037]/60 font-medium text-center max-w-[250px]">
                Customize your Mochi and dash through the pastel world!
              </p>
            </div>
            
            <button
              onClick={onStart}
              className="group relative px-12 py-4 bg-[#FF8A80] text-white rounded-full transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <span className="relative flex items-center gap-2 font-bold tracking-widest uppercase">
                <User size={20} /> Customize & Play
              </span>
            </button>
            
            <div className="flex flex-col items-center gap-2 opacity-40 text-[10px] font-bold uppercase tracking-widest">
              <span>[SPACE] JUMP • [F] FLAMETORCH</span>
              <span>Jump on green mochis to squish them!</span>
            </div>
          </motion.div>
        )}

        {status === 'GAMEOVER' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6 pointer-events-auto bg-white/80 backdrop-blur-md p-12 rounded-[40px] pastel-border"
          >
            <div className="text-center">
              <h2 className="text-6xl font-display text-[#FF8A80] mb-2">Oh No!</h2>
              <p className="text-sm font-bold text-[#5D4037]/60 uppercase">Your mochi needs a nap.</p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-[#5D4037]/40 uppercase tracking-widest">Final Score</span>
              <span className="text-5xl font-display text-[#5D4037]">{score}</span>
            </div>

            <button
              onClick={onStart}
              className="mt-4 flex items-center gap-2 px-10 py-4 bg-[#FF8A80] text-white rounded-full font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-lg"
            >
              <RotateCcw size={20} /> Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
