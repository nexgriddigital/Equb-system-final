import React, { useEffect, useRef, useState } from 'react';
import { EligibleTicket } from '../types/equb';
import confetti from 'canvas-confetti';
import { isLowEndDevice } from '../services/native';

interface DrawWheelProps {
  tickets: EligibleTicket[];
  winningIndex: number | null;
  isSpinning: boolean;
  onSpinComplete: () => void;
}

const SECTOR_COLORS = [
  '#15803d', // Green (primary)
  '#b45309', // Amber (gold accent)
  '#0369a1', // Sky
  '#6d28d9', // Purple
  '#0f766e', // Teal
  '#c2410c', // Orange
  '#4338ca', // Indigo
  '#a16207', // Yellow
  '#be185d', // Pink
  '#166534', // Forest
  '#7c2d12', // Warm earth
  '#0e7490'  // Cyan
];

export const DrawWheel: React.FC<DrawWheelProps> = ({
  tickets,
  winningIndex,
  isSpinning,
  onSpinComplete
}) => {
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const total = Math.max(1, tickets.length);
  const arcSize = (2 * Math.PI) / total;

  const isLowEnd = isLowEndDevice();
  const spinDuration = isLowEnd ? 1200 : 3500;

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Draw the wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 8;

    ctx.clearRect(0, 0, width, height);

    // Draw sectors
    tickets.forEach((ticket, i) => {
      const angleStart = i * arcSize;
      const angleEnd = angleStart + arcSize;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angleStart, angleEnd);
      ctx.closePath();

      ctx.fillStyle = SECTOR_COLORS[i % SECTOR_COLORS.length];
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Sector label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angleStart + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Noto Sans Ethiopic", "Figtree", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;

      const label =
        ticket.memberName.length > 13
          ? ticket.memberName.substring(0, 11) + '…'
          : ticket.memberName;

      ctx.fillText(label, radius - 16, 4);
      ctx.restore();
    });

    // Outer rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1c1917';
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#1c1917';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ዕጣ', centerX, centerY);
  }, [tickets, arcSize]);

  // Handle spinning animation
  useEffect(() => {
    if (isSpinning && winningIndex !== null && winningIndex >= 0) {
      if (prefersReducedMotion) {
        // Immediate reveal path for accessibility
        onSpinComplete();
        return;
      }

      // Pointer is at top (270 degrees)
      const sectorCenterDeg = (winningIndex * (360 / total)) + (180 / total);
      const targetDeg = 270 - sectorCenterDeg;
      // Low-end devices do 2 rotations for speed and low CPU; standard devices do 5
      const fullRotations = 360 * (isLowEnd ? 2 : 5);
      const targetRotation = rotation + fullRotations + ((targetDeg - (rotation % 360) + 360) % 360);

      setRotation(targetRotation);

      const timer = setTimeout(() => {
        onSpinComplete();
        if (!isLowEnd) {
          try {
            confetti({
              particleCount: 50,
              spread: 55,
              origin: { y: 0.6 }
            });
          } catch {
            // ignore
          }
        }
      }, spinDuration);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, winningIndex, prefersReducedMotion, isLowEnd, spinDuration]);

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      {/* Pointer Indicator Arrow at top */}
      <div className="absolute top-0 z-20 flex flex-col items-center pointer-events-none -mt-1">
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-500 drop-shadow-md" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 -mt-1 shadow-sm" />
      </div>

      {/* Rotating Wheel Container (pure transform and opacity) */}
      <div
        className="w-68 h-68 sm:w-80 sm:h-80 rounded-full shadow-lg relative overflow-hidden will-change-transform"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${spinDuration}ms cubic-bezier(0.12, 0.8, 0.2, 1)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-full h-full rounded-full"
        />
      </div>
    </div>
  );
};
