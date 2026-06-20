"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

export interface DistortedCaptchaRef {
  validate: (input: string) => boolean;
  refresh: () => void;
}

interface DistortedCaptchaProps {
  onValidateChange?: (isValid: boolean) => void;
}

const DistortedCaptcha = forwardRef<DistortedCaptchaRef, DistortedCaptchaProps>(({ onValidateChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaText, setCaptchaText] = useState('');
  const [inputValue, setInputValue] = useState('');
  
  const generateRandomString = (length: number) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);

    const text = generateRandomString(6);
    setCaptchaText(text);

    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.5)`;
      ctx.lineWidth = Math.random() * 3;
      ctx.stroke();
    }

    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.8)`;
      ctx.fill();
    }

    ctx.font = 'bold 28px sans-serif';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = 20 + i * 25;
      const y = height / 2 + (Math.random() * 10 - 5);
      const angle = (Math.random() - 0.5) * 0.4;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#111827';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    
    setInputValue('');
    if (onValidateChange) onValidateChange(false);
  }, [onValidateChange]);

  useEffect(() => {
    drawCaptcha();
  }, [drawCaptcha]);

  useImperativeHandle(ref, () => ({
    validate: (input: string) => {
      // Case-insensitive validation
      return input.toLowerCase() === captchaText.toLowerCase();
    },
    refresh: () => {
      drawCaptcha();
    }
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (onValidateChange) {
      onValidateChange(val.toLowerCase() === captchaText.toLowerCase());
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="relative overflow-hidden rounded-md border border-gray-300 shadow-sm">
          <canvas 
            ref={canvasRef} 
            width={180} 
            height={50} 
            className="block cursor-pointer"
            onClick={drawCaptcha}
            title="Klik untuk mengubah Captcha"
          />
        </div>
        <button
          type="button"
          onClick={drawCaptcha}
          className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          title="Refresh Captcha"
        >
          <RefreshCw size={20} />
        </button>
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Masukkan kode di atas"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        required
      />
    </div>
  );
});

DistortedCaptcha.displayName = 'DistortedCaptcha';

export default DistortedCaptcha;
