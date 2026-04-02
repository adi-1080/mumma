'use client';
import React from 'react';

export default function Cheese2D() {
  return (
    <div className="w-[200px] h-[200px] hover:scale-105 transition-transform duration-300">
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
        
        {/* ---- SHADOW (Hard Dark Green) ---- */}
        <g transform="translate(18, 22)" fill="#0B7A42">
          <path d="
            M 100 160 
            Q 140 140 170 100 
            L 200 90 
            Q 260 90 320 110 
            L 320 140 
            A 15 15 0 0 0 315 170 
            L 310 260 
            L 100 320 
            L 95 260 
            A 20 20 0 0 1 100 200 Z
          " />
        </g>

        {/* ---- TOP FACE (Light Pale Yellow) ---- */}
        <path d="
            M 100 160 
            Q 140 140 170 100 
            L 200 90 
            Q 260 90 320 110 
            Q 220 150 100 160 Z
          " 
          fill="#FFF6C2" 
        />

        {/* Top Face Holes */}
        <g fill="#FFB938">
          <ellipse cx="180" cy="135" rx="32" ry="14" />
          <ellipse cx="240" cy="105" rx="18" ry="7" />
          <ellipse cx="130" cy="145" rx="12" ry="5" />
          <ellipse cx="280" cy="120" rx="16" ry="6" />
        </g>

        {/* Top Face Inner Shadows (Crescent cuts) */}
        <g fill="#DF8A00">
          <path d="M 155 135 A 32 14 0 0 0 205 142 A 32 14 0 0 1 155 135 Z" />
          <path d="M 225 105 A 18 7 0 0 0 252 108 A 18 7 0 0 1 225 105 Z" />
          <path d="M 120 145 A 12 5 0 0 0 138 147 A 12 5 0 0 1 120 145 Z" />
          <path d="M 268 120 A 16 6 0 0 0 292 123 A 16 6 0 0 1 268 120 Z" />
        </g>

        {/* ---- FRONT FACE (Vibrant Solid Yellow) ---- */}
        <path d="
            M 100 160 
            Q 220 150 320 110 
            L 320 140 
            A 15 15 0 0 0 315 170 
            L 310 260 
            L 100 320 
            L 95 260 
            A 20 20 0 0 1 100 200 Z
          " 
          fill="#FFD966" 
        />

        {/* Front Face Bite Internal Shadows (Left/Right edges) */}
        <path d="M 320 140 A 15 15 0 0 0 315 170 Q 312 155 320 140 Z" fill="#D96D00" opacity="0.7" />
        <path d="M 100 200 A 20 20 0 0 0 95 260 Q 102 230 100 200 Z" fill="#D96D00" opacity="0.5" />

        {/* Front Face Holes (Deep Orange Base) */}
        <g fill="#FF9514">
          <ellipse cx="220" cy="245" rx="30" ry="24" />
          <ellipse cx="145" cy="215" rx="20" ry="22" />
          <ellipse cx="275" cy="180" rx="20" ry="16" />
          <ellipse cx="305" cy="215" rx="10" ry="12" />
          <ellipse cx="130" cy="285" rx="8" ry="8" />
          <ellipse cx="255" cy="220" rx="14" ry="12" />
          <ellipse cx="175" cy="185" rx="16" ry="16" />
          <ellipse cx="185" cy="275" rx="9" ry="9" />
        </g>

        {/* Front Face Inner Shadows (Top Left Crescents) */}
        <g fill="#D96D00">
          <path d="M 195 240 A 30 24 0 0 0 240 260 A 30 24 0 0 1 195 240 Z" />
          <path d="M 130 210 A 20 22 0 0 0 155 230 A 20 22 0 0 1 130 210 Z" />
          <path d="M 258 175 A 20 16 0 0 0 288 190 A 20 16 0 0 1 258 175 Z" />
          <path d="M 298 212 A 10 12 0 0 0 312 222 A 10 12 0 0 1 298 212 Z" />
          <path d="M 243 216 A 14 12 0 0 0 263 228 A 14 12 0 0 1 243 216 Z" />
          <path d="M 162 180 A 16 16 0 0 0 185 195 A 16 16 0 0 1 162 180 Z" />
        </g>

        {/* Front Face Outer Shadow Highlights (Bottom Right Rim of Holes) */}
        <g fill="#FFEDB3" opacity="0.8">
          <path d="M 235 260 A 30 24 0 0 0 248 245 A 30 24 0 0 1 235 260 Z" />
          <path d="M 152 230 A 20 22 0 0 0 162 215 A 20 22 0 0 1 152 230 Z" />
          <path d="M 282 190 A 20 16 0 0 0 292 180 A 20 16 0 0 1 282 190 Z" />
        </g>

      </svg>
    </div>
  );
}
