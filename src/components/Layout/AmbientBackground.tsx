import React, { useEffect, useState } from 'react';
import './AmbientBackground.css';

export const AmbientBackground: React.FC = () => {
  const [orbs, setOrbs] = useState<number[]>([]);

  useEffect(() => {
    // Generate an array for 25 glowing orbs
    setOrbs(Array.from({ length: 25 }, (_, i) => i));
  }, []);

  return (
    <div className="ambient-background">
      <div className="ambient-overlay"></div>
      <div className="ambient-orbs-container">
        {orbs.map((i) => {
          // Randomize positioning, animation duration, and delay for each orb
          const size = Math.random() * 4 + 2; // 2px to 6px
          const top = Math.random() * 100;
          const left = Math.random() * 100;
          const duration = Math.random() * 15 + 10; // 10s to 25s
          const delay = Math.random() * 5; // 0s to 5s
          const opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
          
          return (
            <div 
              key={i} 
              className="orb"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${top}%`,
                left: `${left}%`,
                opacity: opacity,
                animationDuration: `${duration}s`,
                animationDelay: `-${delay}s` // negative delay so it starts immediately midway
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};
