import React from 'react';
import { CharacterCustomization, MochiType } from '../types';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CharacterCreatorProps {
  customization: CharacterCustomization;
  onUpdate: (customization: CharacterCustomization) => void;
  onComplete: () => void;
}

const BASE_TYPES: { type: MochiType; label: string }[] = [
  { type: 'cat', label: 'Cat' },
  { type: 'bunny', label: 'Bunny' },
  { type: 'panda', label: 'Panda' },
  { type: 'frog', label: 'Frog' },
];

const SKIN_TONES = [
  '#FFE0B2', // Peach
  '#F8BBD0', // Pink
  '#E0E0E0', // Grey
  '#C8E6C9', // Green
  '#FFF9C4', // Yellow
  '#E1F5FE', // Blue
  '#FFFFFF', // White
];

const HAIRSTYLES: { type: CharacterCustomization['hairstyle']; label: string }[] = [
  { type: 'none', label: 'None' },
  { type: 'bow', label: 'Pink Bow' },
  { type: 'hat', label: 'Top Hat' },
  { type: 'flower', label: 'Flower' },
  { type: 'sprout', label: 'Sprout' },
];

const CLOTHING: { type: CharacterCustomization['clothing']; label: string }[] = [
  { type: 'none', label: 'None' },
  { type: 'scarf', label: 'Red Scarf' },
  { type: 'glasses', label: 'Glasses' },
  { type: 'ribbon', label: 'Ribbon' },
  { type: 'cape', label: 'Purple Cape' },
];

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ customization, onUpdate, onComplete }) => {
  const updateField = <K extends keyof CharacterCustomization>(field: K, value: CharacterCustomization[K]) => {
    onUpdate({ ...customization, [field]: value });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-4 border-[#5D4037]/10 w-full max-w-2xl pointer-events-auto"
    >
      <h2 className="text-3xl font-display text-[#5D4037] mb-6 text-center">Create Your Mochi</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Preview (handled by GameCanvas in background, but we can add a small one here if needed) */}
        <div className="flex flex-col gap-6">
          <section>
            <label className="text-xs font-bold text-[#5D4037]/60 uppercase tracking-widest mb-3 block">Base Mochi</label>
            <div className="grid grid-cols-2 gap-2">
              {BASE_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => updateField('baseType', bt.type)}
                  className={`py-2 px-4 rounded-xl border-2 transition-all ${
                    customization.baseType === bt.type 
                      ? 'bg-[#FF8A80] text-white border-[#FF8A80] shadow-md' 
                      : 'bg-white text-[#5D4037] border-[#5D4037]/10 hover:border-[#FF8A80]/50'
                  }`}
                >
                  {bt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-xs font-bold text-[#5D4037]/60 uppercase tracking-widest mb-3 block">Skin Tone</label>
            <div className="flex flex-wrap gap-2">
              {SKIN_TONES.map((color) => (
                <button
                  key={color}
                  onClick={() => updateField('skinTone', color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    customization.skinTone === color ? 'border-[#5D4037] scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Accessories */}
        <div className="flex flex-col gap-6">
          <section>
            <label className="text-xs font-bold text-[#5D4037]/60 uppercase tracking-widest mb-3 block">Hairstyle (Hat)</label>
            <div className="grid grid-cols-2 gap-2">
              {HAIRSTYLES.map((h) => (
                <button
                  key={h.type}
                  onClick={() => updateField('hairstyle', h.type)}
                  className={`py-2 px-4 rounded-xl border-2 transition-all text-sm ${
                    customization.hairstyle === h.type 
                      ? 'bg-[#FF8A80] text-white border-[#FF8A80] shadow-md' 
                      : 'bg-white text-[#5D4037] border-[#5D4037]/10 hover:border-[#FF8A80]/50'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-xs font-bold text-[#5D4037]/60 uppercase tracking-widest mb-3 block">Clothing</label>
            <div className="grid grid-cols-2 gap-2">
              {CLOTHING.map((c) => (
                <button
                  key={c.type}
                  onClick={() => updateField('clothing', c.type)}
                  className={`py-2 px-4 rounded-xl border-2 transition-all text-sm ${
                    customization.clothing === c.type 
                      ? 'bg-[#FF8A80] text-white border-[#FF8A80] shadow-md' 
                      : 'bg-white text-[#5D4037] border-[#5D4037]/10 hover:border-[#FF8A80]/50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onComplete}
          className="bg-[#FF8A80] text-white px-12 py-4 rounded-2xl font-display text-xl shadow-lg hover:bg-[#FF7060] transition-all flex items-center gap-2 group"
        >
          Ready to Dash!
          <Check className="group-hover:scale-125 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
