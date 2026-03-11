export type MochiType = 'cat' | 'bunny' | 'panda' | 'frog';

export interface CharacterCustomization {
  baseType: MochiType;
  skinTone: string;
  hairstyle: 'none' | 'bow' | 'hat' | 'flower' | 'sprout';
  clothing: 'none' | 'scarf' | 'ribbon' | 'glasses' | 'cape';
}

export interface GameState {
  score: number;
  highScore: number;
  status: 'START' | 'CREATOR' | 'PLAYING' | 'GAMEOVER';
  speed: number;
  customization: CharacterCustomization;
  hasFlametorch: boolean;
  torchFuel: number;
  lives: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

export interface Player extends Entity {
  vy: number;
  isJumping: boolean;
  jumpCount: number;
  rotation: number;
  customization: CharacterCustomization;
  isInvincible: boolean;
  invincibleTime: number;
  multiplier: number;
  multiplierTime: number;
}

export type ObstacleType = 'grumpy_mochi' | 'dango_missile' | 'squishable_mochi' | 'gas_bottle' | 'star_invincibility' | 'cookie_multiplier';

export interface Obstacle extends Entity {
  type: ObstacleType;
  isSquished?: boolean;
  vx?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}
