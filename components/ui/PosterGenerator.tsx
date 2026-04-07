'use client';

import React, { useRef, useState } from 'react';

interface PosterGeneratorProps {
  recipeName: string;
  score: number;
  userName: string;
  userImage?: string;
  foodPhotoUrl?: string;
  caption?: string;
}

export function PosterGenerator({
  recipeName,
  score,
  userName,
  userImage,
  foodPhotoUrl,
  caption
}: PosterGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPoster = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      setIsGenerating(false);
      return;
    }

    try {
      // Set canvas size (Instagram story: 1080x1920)
      canvas.width = 1080;
      canvas.height = 1920;

      // Background - light cream color
      ctx.fillStyle = '#FFF8E7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top decorative border pattern
      ctx.strokeStyle = '#D4A574';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      
      // Draw decorative border at top
      for (let i = 0; i < 20; i++) {
        const x = i * 54;
        ctx.beginPath();
        ctx.moveTo(x, 60);
        ctx.lineTo(x + 27, 90);
        ctx.lineTo(x + 54, 60);
        ctx.stroke();
      }

      // Title section
      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 72px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('I Made', canvas.width / 2, 180);

      // Recipe name with decorative background
      ctx.font = 'bold 96px Georgia';
      const recipeText = recipeName.toUpperCase();
      const textWidth = ctx.measureText(recipeText).width;
      const textX = (canvas.width - textWidth) / 2;
      
      // Decorative background for recipe name
      ctx.fillStyle = '#F5DEB3';
      ctx.fillRect(textX - 30, 220, textWidth + 60, 120);
      
      // Border around recipe name background
      ctx.strokeStyle = '#D4A574';
      ctx.lineWidth = 4;
      ctx.strokeRect(textX - 30, 220, textWidth + 60, 120);
      
      ctx.fillStyle = '#8B4513';
      ctx.fillText(recipeText, canvas.width / 2, 310);

      // "with Mumma's Kitchen" in elegant font
      ctx.font = 'italic 48px Georgia';
      ctx.fillStyle = '#A0522D';
      ctx.fillText('with Mumma\'s Kitchen', canvas.width / 2, 400);

      // Food photo section with fancy frame
      if (foodPhotoUrl) {
        try {
          console.log('Loading food photo from:', foodPhotoUrl);
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Image loading timeout'));
            }, 5000);
            
            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Failed to load image'));
            };
            img.src = foodPhotoUrl;
          });

          // Calculate photo dimensions (maintain aspect ratio)
          const maxWidth = canvas.width - 200;
          const maxHeight = 500;
          let photoWidth = img.width;
          let photoHeight = img.height;

          if (photoWidth > maxWidth) {
            photoHeight = (maxWidth / photoWidth) * photoHeight;
            photoWidth = maxWidth;
          }

          if (photoHeight > maxHeight) {
            photoWidth = (maxHeight / photoHeight) * photoWidth;
            photoHeight = maxHeight;
          }

          const photoX = (canvas.width - photoWidth) / 2;
          const photoY = 480;

          // Draw fancy frame for photo
          ctx.strokeStyle = '#D4A574';
          ctx.lineWidth = 8;
          ctx.strokeRect(photoX - 15, photoY - 15, photoWidth + 30, photoHeight + 30);
          
          // Inner frame
          ctx.strokeStyle = '#8B4513';
          ctx.lineWidth = 3;
          ctx.strokeRect(photoX - 10, photoY - 10, photoWidth + 20, photoHeight + 20);
          
          ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
        } catch (error) {
          console.error('Failed to load food photo:', error);
          // Draw placeholder with frame
          const placeholderX = (canvas.width - 400) / 2;
          const placeholderY = 480;
          
          ctx.fillStyle = '#F5DEB3';
          ctx.fillRect(placeholderX - 15, placeholderY - 15, 430, 230);
          
          ctx.strokeStyle = '#D4A574';
          ctx.lineWidth = 8;
          ctx.strokeRect(placeholderX - 15, placeholderY - 15, 430, 230);
          
          ctx.font = '120px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🍽️', canvas.width / 2, 620);
        }
      } else {
        // Draw placeholder with frame
        const placeholderX = (canvas.width - 400) / 2;
        const placeholderY = 480;
        
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(placeholderX - 15, placeholderY - 15, 430, 230);
        
        ctx.strokeStyle = '#D4A574';
        ctx.lineWidth = 8;
        ctx.strokeRect(placeholderX - 15, placeholderY - 15, 430, 230);
        
        ctx.font = '120px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🍽️', canvas.width / 2, 620);
      }

      // Score badge - elegant circular design
      const badgeX = canvas.width - 180;
      const badgeY = 140;
      
      // Outer circle
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 90, 0, 2 * Math.PI);
      ctx.fill();
      
      // Inner circle
      ctx.fillStyle = '#FFB6C1';
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 75, 0, 2 * Math.PI);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 90, 0, 2 * Math.PI);
      ctx.stroke();

      // Score text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 56px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(`${score}/10`, badgeX, badgeY + 20);

      // User section with elegant styling
      ctx.fillStyle = '#8B4513';
      ctx.font = 'italic 42px Georgia';
      ctx.textAlign = 'left';
      ctx.fillText(`- ${userName}`, 120, 1150);

      // User avatar with fancy frame
      if (userImage) {
        try {
          console.log('Loading user avatar from:', userImage);
          const avatarImg = new Image();
          avatarImg.crossOrigin = 'anonymous';
          
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Avatar loading timeout'));
            }, 5000);
            
            avatarImg.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            avatarImg.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Failed to load avatar'));
            };
            avatarImg.src = userImage;
          });

          ctx.save();
          ctx.beginPath();
          ctx.arc(120, 1250, 70, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          
          ctx.drawImage(avatarImg, 50, 1180, 140, 140);
          ctx.restore();
          
          // Avatar frame
          ctx.strokeStyle = '#D4A574';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(120, 1250, 70, 0, 2 * Math.PI);
          ctx.stroke();
        } catch (error) {
          console.error('Failed to load user avatar:', error);
          // Draw fancy default avatar
          ctx.fillStyle = '#F5DEB3';
          ctx.beginPath();
          ctx.arc(120, 1250, 70, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#D4A574';
          ctx.lineWidth = 6;
          ctx.stroke();
          
          ctx.fillStyle = '#8B4513';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('👤', 120, 1270);
        }
      } else {
        // Draw fancy default avatar
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.arc(120, 1250, 70, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#D4A574';
        ctx.lineWidth = 6;
        ctx.stroke();
        
        ctx.fillStyle = '#8B4513';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', 120, 1270);
      }

      // Caption section with decorative background
      if (caption) {
        const captionY = 1400;
        
        // Caption background
        ctx.fillStyle = '#F5DEB3';
        const captionWidth = canvas.width - 200;
        const captionHeight = 120;
        const captionX = 100;
        
        ctx.fillRect(captionX, captionY, captionWidth, captionHeight);
        
        // Caption border
        ctx.strokeStyle = '#D4A574';
        ctx.lineWidth = 4;
        ctx.strokeRect(captionX, captionY, captionWidth, captionHeight);
        
        ctx.fillStyle = '#8B4513';
        ctx.font = 'italic 36px Georgia';
        ctx.textAlign = 'center';
        
        // Word wrap for caption
        const maxWidth = captionWidth - 40;
        const words = caption.split(' ');
        let line = '';
        let y = captionY + 60;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, canvas.width / 2, y);
            line = words[n] + ' ';
            y += 45;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, canvas.width / 2, y);
      }

      // Bottom decorative border pattern
      for (let i = 0; i < 20; i++) {
        const x = i * 54;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 60);
        ctx.lineTo(x + 27, canvas.height - 90);
        ctx.lineTo(x + 54, canvas.height - 60);
        ctx.stroke();
      }

      // Footer with elegant styling
      ctx.fillStyle = '#8B4513';
      ctx.font = 'italic 36px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('[Chef] Mumma\'s Kitchen', canvas.width / 2, canvas.height - 120);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `mummas-kitchen-${recipeName.toLowerCase().replace(/\s+/g, '-')}.png`;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up
          window.URL.revokeObjectURL(url);
        }
      }, 'image/png', 0.9);
      
      console.log('Poster downloaded successfully');
    } catch (error) {
      console.error('Error generating poster:', error);
      alert('Failed to generate poster. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={downloadPoster}
        disabled={isGenerating}
        className="bg-yellow border-2 border-dark rounded-[10px] px-6 py-3 font-nunito font-bold text-dark hover:bg-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating Poster...' : 'Download Poster'}
      </button>
      
      <canvas
        ref={canvasRef}
        className="hidden"
        width={1080}
        height={1920}
      />
    </div>
  );
}
