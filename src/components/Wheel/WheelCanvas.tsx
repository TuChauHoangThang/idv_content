import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

export interface WheelItem {
  id: string;
  name: string;
  image?: string;
}

export interface WheelCanvasRef {
  spin: (customDuration?: number) => void;
  isSpinning: boolean;
}

interface WheelCanvasProps {
  items: WheelItem[];
  onSpinEnd: (winner: WheelItem) => void;
  size?: number;
}

const colors = [
  '#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557',
  '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#264653',
  '#8ab17d', '#babb74', '#d8b365', '#d9a05b', '#df7a5e'
];

export const WheelCanvas = forwardRef<WheelCanvasRef, WheelCanvasProps>(({ items, onSpinEnd, size = 500 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});
  const rotationRef = useRef(0);

  const onSpinEndRef = useRef(onSpinEnd);
  
  useEffect(() => {
    onSpinEndRef.current = onSpinEnd;
  }, [onSpinEnd]);

  useImperativeHandle(ref, () => ({
    spin: (customDuration?: number) => spin(customDuration),
    isSpinning
  }));

  const scale = size / 500; // Scale factor relative to default 500

  useEffect(() => {
    const imagesToLoad: Record<string, HTMLImageElement> = {};
    let loadedCount = 0;
    const itemsWithImages = items.filter(i => i.image);
    
    if (itemsWithImages.length === 0) return;

    itemsWithImages.forEach(item => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
        img.onload = () => {
          imagesToLoad[item.id] = img;
          loadedCount++;
          if (loadedCount === itemsWithImages.length) {
            setLoadedImages({...imagesToLoad});
          }
        };
        img.onerror = () => {
          // If image fails to load, still count it so we don't hang
          loadedCount++;
          if (loadedCount === itemsWithImages.length) {
            setLoadedImages({...imagesToLoad});
          }
        }
      }
    });
  }, [items]);

  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (items.length === 0) {
      // Draw empty wheel
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b4654';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#a0abbc';
      ctx.stroke();
      
      ctx.fillStyle = '#a0abbc';
      ctx.font = `${Math.round(20 * scale)}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add items to spin', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / items.length;

    for (let i = 0; i < items.length; i++) {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const item = items[i];

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      // Draw text or image
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);

      if (item.image && loadedImages[item.id]) {
        const img = loadedImages[item.id];
        const imgSize = Math.min(radius / 2.5, 50 * scale);
        ctx.drawImage(img, radius - imgSize - 20 * scale, -imgSize / 2, imgSize, imgSize);
      } else {
        ctx.textAlign = 'right';
        ctx.fillStyle = colors[i % colors.length] === '#f1faee' ? '#000' : '#fff';
        const fontSize = Math.max(10, Math.round(16 * scale));
        ctx.font = `bold ${fontSize}px Inter`;
        let text = item.name;
        const maxLen = size < 350 ? 14 : 20;
        if (text.length > maxLen) text = text.substring(0, maxLen - 3) + '...';
        ctx.fillText(text, radius - 15 * scale, 4 * scale);
      }
      
      ctx.restore();
    }

    // Draw center circle
    const centerRadius = Math.max(15, 30 * scale);
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 3 * scale;
    ctx.strokeStyle = '#1a1e24';
    ctx.stroke();

    // Draw arrow/pointer at the top
    const arrowSize = 15 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX - arrowSize, -5 * scale);
    ctx.lineTo(centerX + arrowSize, -5 * scale);
    ctx.closePath();
    ctx.fillStyle = '#e63946';
    ctx.fill();

    // Also draw a small triangle pointing down into the wheel
    ctx.beginPath();
    ctx.moveTo(centerX, arrowSize * 1.5);
    ctx.lineTo(centerX - arrowSize * 0.8, 0);
    ctx.lineTo(centerX + arrowSize * 0.8, 0);
    ctx.closePath();
    ctx.fillStyle = '#e63946';
    ctx.fill();
  };

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [items, loadedImages, size]);

  const spin = (customDuration?: number) => {
    if (isSpinning || items.length === 0) return;
    
    setIsSpinning(true);
    
    const minSpins = 5;
    const randomExtraRotations = Math.random() * 5;
    const targetRotation = rotationRef.current + (minSpins + randomExtraRotations) * 2 * Math.PI;
    
    const duration = customDuration || 5000;
    const start = performance.now();
    const startRotation = rotationRef.current;

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentRotation = startRotation + (targetRotation - startRotation) * easeOut(progress);
      rotationRef.current = currentRotation;
      drawWheel(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // The arrow is now at the top (angle = -PI/2 or 3PI/2)
        // To find which slice is at the top:
        const normalizedRotation = ((rotationRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const sliceAngle = (2 * Math.PI) / items.length;
        
        // Arrow is at top = -PI/2 = 3PI/2 = 270 degrees
        // The slice at angle A is at the top when: rotation + i*sliceAngle <= 3PI/2 < rotation + (i+1)*sliceAngle
        let winningAngle = ((3 * Math.PI / 2) - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
        
        const winnerIndex = Math.floor(winningAngle / sliceAngle) % items.length;
        onSpinEndRef.current(items[winnerIndex]);
      }
    };

    requestAnimationFrame(animate);
  };

  const btnSize = Math.max(30, 60 * scale);
  const fontSize = Math.max(10, 14 * scale);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div 
        onClick={() => spin()}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${btnSize}px`,
          height: `${btnSize}px`,
          borderRadius: '50%',
          cursor: isSpinning || items.length === 0 ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: `${fontSize}px`,
          color: '#1a1e24',
          zIndex: 10
        }}
      >
        {isSpinning ? '...' : 'SPIN'}
      </div>
    </div>
  );
});
