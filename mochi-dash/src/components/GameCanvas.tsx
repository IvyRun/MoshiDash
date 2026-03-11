import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Player, Obstacle, Particle, MochiType, ObstacleType, CharacterCustomization } from '../types';
import { useGameLoop } from '../hooks/useGameLoop';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  status: 'START' | 'CREATOR' | 'PLAYING' | 'GAMEOVER';
  customization: CharacterCustomization;
  hasFlametorch: boolean;
  onFuelUpdate: (fuel: number) => void;
  lives: number;
}

const GRAVITY = 0.5;
const JUMP_FORCE = -11;
const INITIAL_SPEED = 5;
const SPEED_INCREMENT = 0.0003;
const MAX_SPEED = 12;

const COLORS = {
  cat: '#FFE0B2',
  bunny: '#F8BBD0',
  panda: '#E0E0E0',
  frog: '#C8E6C9',
  grumpy: '#FF8A80',
  dango: ['#FFCDD2', '#F8BBD0', '#C8E6C9'],
  flame: '#FF7043',
  star: '#FFF176',
  cookie: '#A1887F'
};

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onGameOver, 
  onScoreUpdate, 
  onLivesUpdate,
  status, 
  customization,
  hasFlametorch,
  onFuelUpdate,
  lives
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  
  const playerRef = useRef<Player>({
    id: 'player',
    x: 100,
    y: 300,
    width: 60,
    height: 50,
    vy: 0,
    isJumping: false,
    jumpCount: 0,
    rotation: 0,
    customization,
    isInvincible: false,
    invincibleTime: 0,
    multiplier: 1,
    multiplierTime: 0
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const speedRef = useRef(INITIAL_SPEED);
  const scoreRef = useRef(0);
  const lastObstacleTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const fuelRef = useRef(100);
  const isUsingTorchRef = useRef(false);

  const resetGame = useCallback(() => {
    playerRef.current = {
      id: 'player',
      x: 100,
      y: dimensions.height - 150,
      width: 60,
      height: 50,
      vy: 0,
      isJumping: false,
      jumpCount: 0,
      rotation: 0,
      customization,
      isInvincible: false,
      invincibleTime: 0,
      multiplier: 1,
      multiplierTime: 0
    };
    obstaclesRef.current = [];
    particlesRef.current = [];
    speedRef.current = INITIAL_SPEED;
    scoreRef.current = 0;
    lastObstacleTimeRef.current = 0;
    frameCountRef.current = 0;
    fuelRef.current = 100;
    onFuelUpdate(100);
    onLivesUpdate(3);
  }, [dimensions.height, customization, onFuelUpdate, onLivesUpdate]);

  useEffect(() => {
    if (status === 'PLAYING') {
      resetGame();
    }
  }, [status, resetGame]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    handleResize();
    return () => observer.disconnect();
  }, []);

  const spawnObstacle = () => {
    const types: ObstacleType[] = ['grumpy_mochi', 'dango_missile', 'squishable_mochi', 'gas_bottle', 'star_invincibility', 'cookie_multiplier'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let width = 50;
    let height = 40;
    let y = dimensions.height - 100 - height;
    let vx = -speedRef.current;

    if (type === 'dango_missile') {
      width = 80;
      height = 30;
      y = dimensions.height - 150 - Math.random() * 100;
      vx = -speedRef.current * 1.5;
    } else if (type === 'gas_bottle') {
      width = 30;
      height = 45;
      y = dimensions.height - 150 - Math.random() * 120; // Float in the air
      vx = -speedRef.current;
    } else if (type === 'star_invincibility' || type === 'cookie_multiplier') {
      width = 40;
      height = 40;
      y = dimensions.height - 180 - Math.random() * 100;
      vx = -speedRef.current;
    }

    obstaclesRef.current.push({
      id: Math.random().toString(36).substr(2, 9),
      x: dimensions.width + 100,
      y,
      width,
      height,
      type,
      vx
    });
  };

  const createParticles = (x: number, y: number, color: string, count: number = 5, size: number = 4) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color,
        size
      });
    }
  };

  const drawCharacter = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, cust: CharacterCustomization, rotation: number = 0) => {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rotation);
    
    // Body
    ctx.fillStyle = cust.skinTone;
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Ears based on baseType
    ctx.fillStyle = cust.skinTone;
    if (cust.baseType === 'cat') {
      ctx.beginPath();
      ctx.moveTo(-20, -15); ctx.lineTo(-10, -25); ctx.lineTo(0, -15);
      ctx.moveTo(20, -15); ctx.lineTo(10, -25); ctx.lineTo(0, -15);
      ctx.fill(); ctx.stroke();
    } else if (cust.baseType === 'bunny') {
      ctx.beginPath();
      ctx.ellipse(-10, -25, 6, 15, 0, 0, Math.PI * 2);
      ctx.ellipse(10, -25, 6, 15, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (cust.baseType === 'panda') {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(-15, -20, 10, 0, Math.PI * 2);
      ctx.arc(15, -20, 10, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = cust.skinTone;
    } else if (cust.baseType === 'frog') {
      ctx.beginPath();
      ctx.arc(-15, -15, 10, 0, Math.PI * 2);
      ctx.arc(15, -15, 10, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }

    // Eyes
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.arc(-12, -5, 3, 0, Math.PI * 2);
    ctx.arc(12, -5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Blush
    ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
    ctx.beginPath();
    ctx.arc(-18, 5, 5, 0, Math.PI * 2);
    ctx.arc(18, 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Clothing
    if (cust.clothing === 'scarf') {
      ctx.fillStyle = '#FF5252';
      ctx.fillRect(-25, 10, 50, 8);
      ctx.strokeRect(-25, 10, 50, 8);
      ctx.fillRect(15, 10, 8, 20);
      ctx.strokeRect(15, 10, 8, 20);
    } else if (cust.clothing === 'glasses') {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(-18, -10, 12, 10);
      ctx.strokeRect(6, -10, 12, 10);
      ctx.beginPath();
      ctx.moveTo(-6, -5); ctx.lineTo(6, -5);
      ctx.stroke();
    } else if (cust.clothing === 'ribbon') {
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.moveTo(0, 15); ctx.lineTo(-10, 25); ctx.lineTo(10, 25); ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (cust.clothing === 'cape') {
      ctx.fillStyle = '#7C4DFF';
      ctx.beginPath();
      ctx.moveTo(-25, 0); ctx.lineTo(-40, 30); ctx.lineTo(0, 20); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    // Hairstyle (Hats)
    if (cust.hairstyle === 'bow') {
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.arc(-15, -25, 8, 0, Math.PI * 2);
      ctx.arc(-5, -25, 8, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (cust.hairstyle === 'hat') {
      ctx.fillStyle = '#333';
      ctx.fillRect(-15, -40, 30, 20);
      ctx.fillRect(-20, -25, 40, 5);
      ctx.strokeRect(-15, -40, 30, 20);
      ctx.strokeRect(-20, -25, 40, 5);
    } else if (cust.hairstyle === 'flower') {
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.arc(15, -25, 5, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#F48FB1';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(15 + Math.cos(i * Math.PI * 0.4) * 8, -25 + Math.sin(i * Math.PI * 0.4) * 8, 4, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
    } else if (cust.hairstyle === 'sprout') {
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -25); ctx.quadraticCurveTo(5, -35, 15, -40);
      ctx.stroke();
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(15, -40, 8, 4, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }

    ctx.restore();
  };

  const drawMochi = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, type: MochiType | 'grumpy' | 'squishable', rotation: number = 0) => {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rotation);
    
    // Body
    ctx.fillStyle = COLORS[type === 'grumpy' ? 'grumpy' : (type === 'squishable' ? 'frog' : type as MochiType)];
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#5D4037';
    if (type === 'grumpy') {
      // Grumpy eyes
      ctx.beginPath();
      ctx.moveTo(-15, -5); ctx.lineTo(-5, 0);
      ctx.moveTo(15, -5); ctx.lineTo(5, 0);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(-12, -5, 3, 0, Math.PI * 2);
      ctx.arc(12, -5, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blush
    ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
    ctx.beginPath();
    ctx.arc(-18, 5, 5, 0, Math.PI * 2);
    ctx.arc(18, 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Ears/Details
    if (type === 'cat') {
      ctx.fillStyle = COLORS.cat;
      ctx.beginPath();
      ctx.moveTo(-20, -15); ctx.lineTo(-10, -25); ctx.lineTo(0, -15);
      ctx.moveTo(20, -15); ctx.lineTo(10, -25); ctx.lineTo(0, -15);
      ctx.fill(); ctx.stroke();
    } else if (type === 'bunny') {
      ctx.fillStyle = COLORS.bunny;
      ctx.beginPath();
      ctx.ellipse(-10, -25, 6, 15, 0, 0, Math.PI * 2);
      ctx.ellipse(10, -25, 6, 15, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }

    ctx.restore();
  };

  const update = useCallback((deltaTime: number) => {
    if (status !== 'PLAYING') return;

    frameCountRef.current++;
    speedRef.current = Math.min(MAX_SPEED, speedRef.current + SPEED_INCREMENT);
    
    const player = playerRef.current;

    // Power-up timers
    if (player.invincibleTime > 0) {
      player.invincibleTime -= deltaTime;
      if (player.invincibleTime <= 0) {
        player.isInvincible = false;
        player.invincibleTime = 0;
      }
    }

    if (player.multiplierTime > 0) {
      player.multiplierTime -= deltaTime;
      if (player.multiplierTime <= 0) {
        player.multiplier = 1;
        player.multiplierTime = 0;
      }
    }

    scoreRef.current += (speedRef.current / 15) * player.multiplier;
    onScoreUpdate(Math.floor(scoreRef.current));

    // Flametorch logic
    if (isUsingTorchRef.current && hasFlametorch && fuelRef.current > 0) {
      fuelRef.current -= 0.5;
      onFuelUpdate(fuelRef.current);
      createParticles(player.x + player.width, player.y + 20, COLORS.flame, 3, 6);
    } else {
      isUsingTorchRef.current = false;
    }

    // Player Physics
    player.vy += GRAVITY;
    player.y += player.vy;
    if (player.isJumping) {
      player.rotation += 0.15;
    } else {
      player.rotation = 0;
    }

    const groundY = dimensions.height - 100 - player.height;
    if (player.y > groundY) {
      player.y = groundY;
      player.vy = 0;
      player.isJumping = false;
      player.jumpCount = 0;
    }

    // Obstacles
    const now = Date.now();
    if (now - lastObstacleTimeRef.current > 1200 - speedRef.current * 40) {
      if (Math.random() > 0.97) {
        spawnObstacle();
        lastObstacleTimeRef.current = now;
      }
    }

    obstaclesRef.current = obstaclesRef.current.filter(obs => {
      obs.x += obs.vx || -speedRef.current;
      
      // Flametorch collision
      if (isUsingTorchRef.current && hasFlametorch && obs.x < player.x + 200 && obs.x > player.x && obs.type !== 'gas_bottle' && obs.type !== 'star_invincibility' && obs.type !== 'cookie_multiplier') {
        createParticles(obs.x, obs.y, COLORS.flame, 10);
        return false;
      }

      // Player Collision
      const isColliding = (
        player.x < obs.x + obs.width - 10 &&
        player.x + player.width > obs.x + 10 &&
        player.y < obs.y + obs.height - 10 &&
        player.y + player.height > obs.y + 10
      );

      if (isColliding) {
        if (obs.type === 'gas_bottle') {
          // Collect gas!
          fuelRef.current = Math.min(100, fuelRef.current + 33.4);
          onFuelUpdate(fuelRef.current);
          createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, COLORS.flame, 15);
          return false;
        } else if (obs.type === 'star_invincibility') {
          player.isInvincible = true;
          player.invincibleTime = 5000; // 5 seconds
          createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, COLORS.star, 20, 6);
          return false;
        } else if (obs.type === 'cookie_multiplier') {
          player.multiplier = 2;
          player.multiplierTime = 8000; // 8 seconds
          createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, COLORS.cookie, 20, 6);
          return false;
        } else if (obs.type === 'squishable_mochi' && player.vy > 0 && player.y + player.height < obs.y + obs.height / 2 + 20) {
          // Squish!
          player.vy = JUMP_FORCE * 0.8;
          createParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, COLORS.frog, 15);
          scoreRef.current += 100 * player.multiplier;
          return false;
        } else {
          if (player.isInvincible) {
            // Just bounce off or ignore? Let's ignore.
            return true;
          }
          
          // Lose a life
          const newLives = lives - 1;
          onLivesUpdate(newLives);
          
          if (newLives <= 0) {
            onGameOver(Math.floor(scoreRef.current));
          } else {
            // Temporary invincibility after hit
            player.isInvincible = true;
            player.invincibleTime = 2000; // 2 seconds
            createParticles(player.x + player.width / 2, player.y + player.height / 2, '#FF0000', 10);
          }
          return false;
        }
      }
      
      return obs.x + obs.width > -100;
    });

    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });

  }, [status, dimensions, onGameOver, onScoreUpdate, hasFlametorch, onFuelUpdate, onLivesUpdate, lives]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw Ground
    ctx.fillStyle = '#E1F5FE';
    ctx.fillRect(0, dimensions.height - 100, dimensions.width, 100);
    ctx.strokeStyle = '#B3E5FC';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, dimensions.height - 100);
    ctx.lineTo(dimensions.width, dimensions.height - 100);
    ctx.stroke();

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Player
    const player = playerRef.current;
    if (player.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    drawCharacter(ctx, player.x, player.y, player.width, player.height, customization, player.rotation);
    ctx.globalAlpha = 1.0;

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
      if (obs.type === 'dango_missile') {
        // Draw Dango
        const dangoColors = COLORS.dango;
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = dangoColors[i];
          ctx.beginPath();
          ctx.arc(obs.x + 15 + i * 25, obs.y + obs.height / 2, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#5D4037';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        // Stick
        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(obs.x - 10, obs.y + obs.height / 2);
        ctx.lineTo(obs.x + 80, obs.y + obs.height / 2);
        ctx.stroke();
      } else if (obs.type === 'gas_bottle') {
        // Draw Gas Bottle
        ctx.save();
        ctx.translate(obs.x, obs.y);
        
        // Bottle Body
        ctx.fillStyle = '#FFCC80';
        ctx.fillRect(5, 15, 20, 30);
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 15, 20, 30);
        
        // Bottle Neck
        ctx.fillStyle = '#FFCC80';
        ctx.fillRect(10, 5, 10, 10);
        ctx.strokeRect(10, 5, 10, 10);
        
        // Label
        ctx.fillStyle = '#FF7043';
        ctx.fillRect(7, 25, 16, 10);
        
        ctx.restore();
      } else if (obs.type === 'star_invincibility') {
        // Draw Star
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        ctx.fillStyle = COLORS.star;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.rotate(Math.PI / 5);
          ctx.lineTo(0, 0 - (obs.width * 0.5));
          ctx.rotate(Math.PI / 5);
          ctx.lineTo(0, 0 - (obs.width * 0.2));
        }
        ctx.fill();
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      } else if (obs.type === 'cookie_multiplier') {
        // Draw Cookie
        ctx.save();
        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        ctx.fillStyle = COLORS.cookie;
        ctx.beginPath();
        ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Choco chips
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.arc(-5, -5, 2, 0, Math.PI * 2);
        ctx.arc(5, 0, 2, 0, Math.PI * 2);
        ctx.arc(-2, 8, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        drawMochi(ctx, obs.x, obs.y, obs.width, obs.height, obs.type === 'grumpy_mochi' ? 'grumpy' : 'squishable');
      }
    });

    // Draw Flametorch effect
    if (isUsingTorchRef.current && hasFlametorch) {
      const gradient = ctx.createLinearGradient(player.x + player.width, 0, player.x + player.width + 150, 0);
      gradient.addColorStop(0, 'rgba(255, 112, 67, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 112, 67, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(player.x + player.width, player.y, 150, player.height);
    }

  }, [dimensions, customization, hasFlametorch]);

  useGameLoop((dt) => {
    update(dt);
    draw();
  }, status === 'PLAYING' || status === 'START' || status === 'CREATOR');

  const handleJump = useCallback(() => {
    if (status !== 'PLAYING') return;
    const player = playerRef.current;
    if (player.jumpCount < 2) {
      player.vy = JUMP_FORCE;
      player.isJumping = true;
      player.jumpCount++;
      createParticles(player.x + player.width / 2, player.y + player.height, customization.skinTone, 8);
    }
  }, [status, customization]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
      if (e.code === 'KeyF' && hasFlametorch) {
        isUsingTorchRef.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        isUsingTorchRef.current = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleJump, hasFlametorch]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative cursor-pointer"
      onMouseDown={handleJump}
      onTouchStart={handleJump}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block"
      />
    </div>
  );
};
