"use client";
import React, { useEffect, useState } from "react";

interface ConfettiProps {
  isActive: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive }) => {
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      id: number;
      left: number;
      animationDelay: number;
      backgroundColor: string;
    }>
  >([]);

  useEffect(() => {
    if (isActive) {
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 3,
        backgroundColor: [
          "#ff0000",
          "#00ff00",
          "#0000ff",
          "#ffff00",
          "#ff00ff",
          "#00ffff",
          "#ffa500",
          "#800080",
        ][Math.floor(Math.random() * 8)],
      }));
      setConfettiPieces(pieces);

      const timer = setTimeout(() => {
        setConfettiPieces([]);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isActive || confettiPieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            backgroundColor: piece.backgroundColor,
            animationDelay: `${piece.animationDelay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Confetti;
