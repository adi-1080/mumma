import React from 'react';

export default function AppLogo({ className = '' }: { className?: string }) {
  return (
    <svg 
        viewBox="0 0 100 150" 
        className={className} 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
    >
      <rect width="100" height="150" fill="#fdfaf3" />
      
      {/* Hair Bun */}
      <ellipse cx="50" cy="28" rx="24" ry="22" fill="#1a0800" />
      <ellipse cx="50" cy="24" rx="20" ry="18" fill="#241000" />
      <ellipse cx="50" cy="20" rx="16" ry="14" fill="#1a0800" />
      <circle cx="50" cy="16" rx="11" fill="#2a1200" />
      <circle cx="50" cy="13" rx="7" fill="#1a0800" />
      <path d="M28 36 Q50 24 72 36" fill="none" stroke="#2e1400" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M34 40 Q50 30 66 40" fill="none" stroke="#2e1400" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="26" cy="52" rx="9" ry="24" fill="#1a0800" />
      <ellipse cx="74" cy="52" rx="9" ry="24" fill="#1a0800" />
      
      <circle cx="50" cy="6" r="4.5" fill="#e8508a" />
      <circle cx="43" cy="11" r="3" fill="#e8508a" />
      <circle cx="57" cy="11" r="3" fill="#e8508a" />
      <circle cx="50" cy="6" r="2" fill="#ffd0e8" />

      {/* Head */}
      <ellipse cx="50" cy="64" rx="29" ry="30" fill="#f5c87a" />
      <ellipse cx="24" cy="73" rx="10" ry="7" fill="#d06020" opacity=".32" />
      <ellipse cx="76" cy="73" rx="10" ry="7" fill="#d06020" opacity=".32" />
      <circle cx="50" cy="49" r="2.8" fill="#cc0000" />

      {/* Eyebrows */}
      <path d="M34 57 Q40 54 46 57" fill="none" stroke="#1a0800" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M54 57 Q60 54 66 57" fill="none" stroke="#1a0800" strokeWidth="2.2" strokeLinecap="round" />

      {/* Nose */}
      <path d="M47 69 Q50 73 53 69" fill="none" stroke="#b07030" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />

      {/* Eyes */}
      <ellipse cx="38" cy="63" rx="6.5" ry="7.5" fill="#1a0800" />
      <ellipse cx="62" cy="63" rx="6.5" ry="7.5" fill="#1a0800" />
      <circle cx="40" cy="60" r="2.8" fill="white" />
      <circle cx="64" cy="60" r="2.8" fill="white" />
      <circle cx="40.8" cy="60.8" r="1" fill="white" opacity=".7" />
      <circle cx="64.8" cy="60.8" r="1" fill="white" opacity=".7" />

      {/* Mouth */}
      <path d="M40 79 Q50 90 60 79" fill="none" stroke="#9b5530" strokeWidth="2.8" strokeLinecap="round" />

      {/* Neck */}
      <rect x="44" y="93" width="12" height="11" rx="4" fill="#e8b060" />

      {/* Kurti */}
      <rect x="16" y="102" width="68" height="68" rx="15" fill="#9b59b6" />
      <path d="M32 102 Q50 121 68 102" fill="none" stroke="#d4a0ff" strokeWidth="1.8" opacity=".7" />
      <path d="M32 102 Q50 121 68 102" fill="none" stroke="#f5b827" strokeWidth="1" opacity=".55" />
      <circle cx="50" cy="115" r="3.5" fill="none" stroke="#f5b827" strokeWidth="1.4" opacity=".65" />
      <circle cx="50" cy="115" r="1.2" fill="#f5b827" opacity=".6" />

      {/* Left Arm */}
      <rect x="3" y="102" width="18" height="44" rx="9" fill="#9b59b6" />
      <ellipse cx="12" cy="137" rx="10" ry="3.5" fill="none" stroke="#f5b827" strokeWidth="2.5" />
      <ellipse cx="12" cy="149" rx="9" ry="7" fill="#f0b860" />
      <ellipse cx="6" cy="144" rx="3" ry="4.5" fill="#f0b860" />
      <ellipse cx="12" cy="142" rx="3" ry="4.5" fill="#f0b860" />
      <ellipse cx="18" cy="144" rx="3" ry="4.5" fill="#f0b860" />
      <ellipse cx="21" cy="151" rx="4" ry="2.8" fill="#f0b860" />

      {/* Right Arm */}
      <rect x="79" y="102" width="18" height="44" rx="9" fill="#9b59b6" />
      <ellipse cx="88" cy="137" rx="10" ry="3.5" fill="none" stroke="#f5b827" strokeWidth="2.5" />
      <ellipse cx="88" cy="149" rx="9" ry="7" fill="#f0b860" />
      <ellipse cx="94" cy="144" rx="3" ry="4.5" fill="#f0b860" />
      <ellipse cx="88" cy="142" rx="3" ry="4.5" fill="#f0b860" />
      <ellipse cx="82" cy="144" rx="3" ry="4.5" fill="#f0b860" />
      <ellipse cx="79" cy="151" rx="4" ry="2.8" fill="#f0b860" />
    </svg>
  );
}
