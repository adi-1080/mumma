'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MomExpression {
  n: string;
  a: string;
  bw: string;
  ey: string;
  mo: string;
  la: number;
  ra: number;
  ex: string[];
  msgs: string[];
  hrt: boolean;
  wave?: boolean;
}

const MOM_EXPRESSIONS: MomExpression[] = [
  { n: 'warm smile', a: 'aF', bw: 'bN', ey: 'eH', mo: 'mSm', la: 0, ra: 0, ex: [], msgs: ['Beta, have you eaten?', 'Come home now!', 'Did you call nani?', 'You look tired!', 'I made food!'], hrt: false },
  { n: 'laughing', a: 'aL', bw: 'bR', ey: 'eL', mo: 'mLa', la: 18, ra: -18, ex: [], msgs: ['Hahaha!', 'Arre so funny!', 'Ha ha ha!', 'Oh my God!'], hrt: false },
  { n: 'waving hello', a: 'aF', bw: 'bN', ey: 'eW', mo: 'mSm', la: 0, ra: -50, ex: [], msgs: ['Hello beta!', 'Aaao aaao!', 'Yoo-hoo!', 'I see you!', 'Come home now!'], hrt: false, wave: true },
  { n: 'cooking', a: 'aC', bw: 'bN', ey: 'eS', mo: 'mSm', la: -12, ra: 18, ex: ['ladleG'], msgs: ['Secret masala!', 'Almost ready!', 'Smells so good!', 'Best recipe!', 'You will love it!'], hrt: false },
  { n: 'giggling', a: 'aF', bw: 'bR', ey: 'eL', mo: 'mGi', la: 0, ra: -55, ex: [], msgs: ['Hehe!', 'Heehee!', 'Shhh so funny!', 'So cute!', 'Giggle!'], hrt: false },
  { n: 'sending love', a: 'aB', bw: 'bR', ey: 'eH', mo: 'mKi', la: -5, ra: -58, ex: ['hrtG'], msgs: ['Love you beta!', 'Muah!', 'My sweetheart!', 'So much love!', 'You are my world!'], hrt: true },
  { n: 'SCOLDING!', a: 'aS', bw: 'bF', ey: 'eS', mo: 'mSc', la: 0, ra: 0, ex: ['SFAG'], msgs: ['Beta! Eat now!', 'I told you so!', 'Listen to mumma!', 'No screen time!', 'Did you study?!'], hrt: false },
  { n: 'surprised!', a: 'aB', bw: 'bR', ey: 'eSu', mo: 'mSu', la: 22, ra: -22, ex: [], msgs: ['Arrey!', 'Oh my God!', 'Haye haye!', 'What happened?!', 'I cannot believe!'], hrt: false },
];

const POSITIONS = [
  { n: 'bottom-left', gP: (w: number, h: number) => ({ x: 20, y: h - 195 }), hT: 'translateY(120%)', bubC: '' },
  { n: 'bottom-right', gP: (w: number, h: number) => ({ x: w - 125, y: h - 195 }), hT: 'translateY(120%)', bubC: '' },
  { n: 'left', gP: (w: number, h: number) => ({ x: 20, y: h * 0.25 }), hT: 'translateX(-120%)', bubC: '' },
  { n: 'right', gP: (w: number, h: number) => ({ x: w - 125, y: h * 0.25 }), hT: 'translateX(120%)', bubC: '' },
  { n: 'top-left', gP: (w: number, h: number) => ({ x: 20, y: 20 }), hT: 'translateY(-120%)', bubC: 'below' },
  { n: 'top-right', gP: (w: number, h: number) => ({ x: w - 125, y: 20 }), hT: 'translateY(-120%)', bubC: 'below' },
];

const KURTI_COLORS = ['#9b59b6', '#e74c3c', '#2980b9', '#27ae60', '#e91e63', '#d35400', '#16a085', '#8e44ad'];

interface MomAnimationProps {
  enabled?: boolean;
}

export default function MomAnimation({ enabled = true }: MomAnimationProps) {
  const [positionIndex, setPositionIndex] = useState(0);
  const [expressionIndex, setExpressionIndex] = useState(0);
  const [kurtiColorIndex, setKurtiColorIndex] = useState(0);
  const [bubbleText, setBubbleText] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleClass, setBubbleClass] = useState('');
  const [currentExpression, setCurrentExpression] = useState(MOM_EXPRESSIONS[0]);
  const [isBusy, setIsBusy] = useState(false);
  const [currentTransform, setCurrentTransform] = useState('');

  const stageRef = useRef<HTMLDivElement>(null);
  const momWrapperRef = useRef<HTMLDivElement>(null);
  const momInnerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveAngleRef = useRef(-30);
  const waveDirectionRef = useRef(1);

  const showElement = (id: string, show: boolean) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = show ? 'block' : 'none';
    }
  };

  const stopWave = () => {
    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
  };

  const startWave = () => {
    waveAngleRef.current = -30;
    waveDirectionRef.current = 1;
    waveIntervalRef.current = setInterval(() => {
      waveAngleRef.current += waveDirectionRef.current * 4;
      if (waveAngleRef.current >= -8) waveDirectionRef.current = -1;
      if (waveAngleRef.current <= -58) waveDirectionRef.current = 1;

      const rag = document.getElementById('RAG');
      if (rag) {
        rag.setAttribute('transform', `rotate(${waveAngleRef.current},80,102)`);
      }
    }, 42);
  };

  const applyExpression = (expression: MomExpression) => {
    stopWave();

    if (momInnerRef.current) {
      momInnerRef.current.className = 'mi ' + expression.a;
    }

    // Hide/show eyes
    ['eH', 'eL', 'eW', 'eS', 'eSu'].forEach((e: string) => showElement(e, e === expression.ey));

    // Hide/show eyebrows
    ['bN', 'bR', 'bF'].forEach((b: string) => showElement(b, b === expression.bw));

    // Hide/show mouths
    ['mSm', 'mLa', 'mGi', 'mKi', 'mSc', 'mSu'].forEach((m: string) => showElement(m, m === expression.mo));

    // Hide/show extras
    (['ladleG', 'hrtG', 'SFAG'] as const).forEach((e: string) => showElement(e, expression.ex.includes(e)));

    // Hide left arm when scolding arm is shown
    const isScolding = expression.ex.includes('SFAG');
    showElement('LAG', !isScolding);

    // Set arm rotations
    const lag = document.getElementById('LAG');
    if (lag) {
      lag.setAttribute('transform', `rotate(${expression.la},20,102)`);
    }

    const rag = document.getElementById('RAG');
    if (rag && !expression.wave) {
      rag.setAttribute('transform', `rotate(${expression.ra},80,102)`);
    }

    // Update kurti color
    const color = KURTI_COLORS[kurtiColorIndex % KURTI_COLORS.length];
    ['kB', 'lSl', 'rSl', 'sSl'].forEach((id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.setAttribute('fill', color);
      }
    });

    if (expression.wave) {
      startWave();
    }
  };

  const displayBubble = (msgs: string[], cls: string) => {
    const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
    setBubbleText(randomMsg);
    setBubbleClass('bub ' + cls);
    setShowBubble(true);
  };

  const hideBubbleDisplay = () => {
    setShowBubble(false);
  };

  const spawnEffects = (x: number, y: number, hearts: boolean) => {
    const colors = ['#9b59b6', '#f5b827', '#e74c3c', '#27ae60', '#e8508a'];
    const count = hearts ? 5 : 6;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const element = document.createElement('div');
        element.className = hearts ? 'hp' : 'sp';

        if (hearts) {
          element.textContent = '♥';
        } else {
          (element as HTMLElement).style.background = colors[i % colors.length];
        }

        element.style.left = (x + 10 + Math.random() * 80) + 'px';
        element.style.top = (y + (hearts ? 0 : 10) + Math.random() * (hearts ? 10 : 70)) + 'px';

        if (stageRef.current) {
          stageRef.current.appendChild(element);
          setTimeout(() => element.remove(), 1500);
        }
      }, i * (hearts ? 240 : 110));
    }
  };

  const appear = () => {
    const position = POSITIONS[positionIndex];
    const expression = MOM_EXPRESSIONS[expressionIndex];

    if (!stageRef.current || !momWrapperRef.current) return;

    // Use window dimensions with mobile adjustments
    const stageWidth = window.innerWidth || 1200;
    const stageHeight = window.innerHeight || 800;
    const isMobile = stageWidth < 768;
    const isTablet = stageWidth >= 768 && stageWidth < 1024;

    // Mobile-responsive positioning
    let { x, y } = position.gP(stageWidth, stageHeight);

    if (isMobile) {
      // Adjust positions for mobile screens
      const mobileOffset = 20;
      if (position.n.includes('left')) x += mobileOffset;
      if (position.n.includes('right')) x -= mobileOffset;
      if (position.n.includes('bottom')) y -= mobileOffset;
      if (position.n.includes('top')) y += mobileOffset;
    } else if (isTablet) {
      // Adjust positions for tablet screens
      const tabletOffset = 10;
      if (position.n.includes('left')) x += tabletOffset;
      if (position.n.includes('right')) x -= tabletOffset;
      if (position.n.includes('bottom')) y -= tabletOffset;
      if (position.n.includes('top')) y += tabletOffset;
    }

    setCurrentExpression(expression);
    applyExpression(expression);

    // Place off-screen instantly
    if (momWrapperRef.current) {
      momWrapperRef.current.style.transition = 'none';
      momWrapperRef.current.style.left = x + 'px';
      momWrapperRef.current.style.top = y + 'px';

      // Mobile-responsive sizing
      if (isMobile) {
        momWrapperRef.current.style.transform = 'scale(0.8) ' + position.hT;
      } else if (isTablet) {
        momWrapperRef.current.style.transform = 'scale(0.9) ' + position.hT;
      } else {
        momWrapperRef.current.style.transform = position.hT;
      }

      void momWrapperRef.current.offsetHeight; // Force reflow

      // Slide in with springy bounce
      const scaleTransform = isMobile ? 'scale(0.8)' : isTablet ? 'scale(0.9)' : '';
      momWrapperRef.current.style.transition = 'transform .62s cubic-bezier(.34,1.58,.64,1)';
      momWrapperRef.current.style.transform = scaleTransform + ' translate(0,0)';
    }

    setIsBusy(true);
    setCurrentTransform(position.hT);

    setTimeout(() => {
      displayBubble(expression.msgs, position.bubC);
      spawnEffects(x, y, expression.hrt);
    }, 540);

    setTimeout(() => {
      hideBubbleDisplay();
      if (momWrapperRef.current) {
        const scaleTransform = isMobile ? 'scale(0.8)' : isTablet ? 'scale(0.9)' : '';
        momWrapperRef.current.style.transition = 'transform .48s cubic-bezier(.4,0,.6,1)';
        momWrapperRef.current.style.transform = scaleTransform + ' ' + position.hT;
      }
      setTimeout(() => {
        setIsBusy(false);
        setPositionIndex((prev) => (prev + 1) % POSITIONS.length);
        setExpressionIndex((prev) => (prev + 1) % MOM_EXPRESSIONS.length);
        setKurtiColorIndex((prev) => prev + 1);
        if (enabled) {
          // Wait 2 seconds before next appearance
          setTimeout(appear, 2000);
        }
      }, 650);
    }, 5000);
  };

  const handleStageClick = () => {
  if (!isBusy || !momWrapperRef.current) return;
  
  hideBubbleDisplay();
  stopWave();
  
  // Mobile-responsive exit animation
  const stageWidth = window.innerWidth || 1200;
  const isMobile = stageWidth < 768;
  const isTablet = stageWidth >= 768 && stageWidth < 1024;
  
  if (momWrapperRef.current) {
    const scaleTransform = isMobile ? 'scale(0.8)' : isTablet ? 'scale(0.9)' : '';
    momWrapperRef.current.style.transition = 'transform .3s ease-in';
    momWrapperRef.current.style.transform = scaleTransform + ' ' + currentTransform;
    setIsBusy(false);
    
    setTimeout(() => {
      setPositionIndex((prev) => (prev + 1) % POSITIONS.length);
      setExpressionIndex((prev) => (prev + 1) % MOM_EXPRESSIONS.length);
      setKurtiColorIndex((prev) => prev + 1);
      if (enabled) {
        appear();
      }
    }, 320);
  }
};

useEffect(() => {
    if (enabled) {
      const timeout = setTimeout(appear, 350);
      return () => clearTimeout(timeout);
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      stopWave();
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={stageRef}
      className="mom-animation-stage !z-10 pointer-events-none"
      onClick={handleStageClick}
    >
      {/* Background circles */}
      <div className="bg-circle bg-circle-purple" />
      <div className="bg-circle bg-circle-red" />
      <div className="bg-circle bg-circle-yellow" />

      {/* Mom Wrapper */}
      <div ref={momWrapperRef} className="mom-wrapper pointer-events-auto">
        <div ref={momInnerRef} className="mi aF">
          <div ref={bubbleRef} className={`bub ${bubbleClass} ${showBubble ? 'show' : ''}`}>
            {bubbleText}
          </div>

          {/* SVG Mom Character */}
          <svg id="svg" viewBox="0 0 100 175" width="105" xmlns="http://www.w3.org/2000/svg">
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
            <circle cx="50" cy="49" r="2" fill="#cc0000" />

            {/* Eyebrows */}
            <g id="bN">
              <path d="M34 57 Q40 54 46 57" fill="none" stroke="#1a0800" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M54 57 Q60 54 66 57" fill="none" stroke="#1a0800" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            <g id="bR" style={{ display: 'none' }}>
              <path d="M34 53 Q40 50 46 53" fill="none" stroke="#1a0800" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M54 53 Q60 50 66 53" fill="none" stroke="#1a0800" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            <g id="bF" style={{ display: 'none' }}>
              <path d="M33 57 Q40 52 45 56" fill="none" stroke="#1a0800" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M55 56 Q60 52 67 57" fill="none" stroke="#1a0800" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="48" y1="55" x2="52" y2="59" stroke="#1a0800" strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Nose */}
            <path d="M47 69 Q50 73 53 69" fill="none" stroke="#b07030" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />

            {/* Eyes */}
            <g id="eH">
              <ellipse cx="38" cy="63" rx="6.5" ry="7.5" fill="#1a0800" />
              <ellipse cx="62" cy="63" rx="6.5" ry="7.5" fill="#1a0800" />
              <circle cx="40" cy="60" r="2.8" fill="white" />
              <circle cx="64" cy="60" r="2.8" fill="white" />
              <circle cx="40.8" cy="60.8" r="1" fill="white" opacity=".7" />
              <circle cx="64.8" cy="60.8" r="1" fill="white" opacity=".7" />
            </g>
            <g id="eL" style={{ display: 'none' }}>
              <path d="M32 64 Q38 56 44 64" fill="none" stroke="#1a0800" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M56 64 Q62 56 68 64" fill="none" stroke="#1a0800" strokeWidth="2.8" strokeLinecap="round" />
              <ellipse cx="33" cy="68" rx="2.5" ry="2" fill="#aad4ff" opacity=".8" />
              <ellipse cx="67" cy="68" rx="2.5" ry="2" fill="#aad4ff" opacity=".8" />
            </g>
            <g id="eW" style={{ display: 'none' }}>
              <ellipse cx="38" cy="63" rx="6.5" ry="7.5" fill="#1a0800" />
              <circle cx="40" cy="60" r="2.8" fill="white" />
              <path d="M56 64 Q62 56 68 64" fill="none" stroke="#1a0800" strokeWidth="2.8" strokeLinecap="round" />
            </g>
            <g id="eS" style={{ display: 'none' }}>
              <ellipse cx="38" cy="64" rx="6.5" ry="5.5" fill="#1a0800" />
              <ellipse cx="62" cy="64" rx="6.5" ry="5.5" fill="#1a0800" />
              <circle cx="40" cy="61" r="2" fill="white" />
              <circle cx="64" cy="61" r="2" fill="white" />
            </g>
            <g id="eSu" style={{ display: 'none' }}>
              <ellipse cx="38" cy="62" rx="8" ry="9.5" fill="#1a0800" />
              <ellipse cx="62" cy="62" rx="8" ry="9.5" fill="#1a0800" />
              <circle cx="40" cy="58" r="3.8" fill="white" />
              <circle cx="64" cy="58" r="3.8" fill="white" />
            </g>

            {/* Mouths */}
            <path id="mSm" d="M40 79 Q50 90 60 79" fill="none" stroke="#9b5530" strokeWidth="2.8" strokeLinecap="round" />
            <g id="mLa" style={{ display: 'none' }}>
              <ellipse cx="50" cy="84" rx="12" ry="9" fill="#9b5530" />
              <ellipse cx="50" cy="80" rx="9" ry="4.5" fill="#c88060" />
              <rect x="43" y="77" width="14" height="5" rx="2" fill="white" />
            </g>
            <ellipse id="mGi" cx="50" cy="83" rx="4.5" ry="5.5" fill="#9b5530" style={{ display: 'none' }} />
            <g id="mKi" style={{ display: 'none' }}>
              <ellipse cx="50" cy="84" rx="6" ry="8" fill="#e8508a" />
              <path d="M44 79 Q50 75 56 79" fill="none" stroke="#ffc0d8" strokeWidth="1.5" />
            </g>
            <path id="mSc" d="M40 83 Q50 79 60 83" fill="none" stroke="#9b5530" strokeWidth="2.8" strokeLinecap="round" style={{ display: 'none' }} />
            <ellipse id="mSu" cx="50" cy="84" rx="7" ry="8.5" fill="#9b5530" style={{ display: 'none' }} />

            {/* Neck */}
            <rect x="44" y="93" width="12" height="11" rx="4" fill="#e8b060" />

            {/* Kurti */}
            <rect id="kB" x="16" y="102" width="68" height="68" rx="15" fill="#9b59b6" />
            <path d="M32 102 Q50 121 68 102" fill="none" stroke="#d4a0ff" strokeWidth="1.8" opacity=".7" />
            <path d="M32 102 Q50 121 68 102" fill="none" stroke="#f5b827" strokeWidth="1" opacity=".55" />
            <circle cx="50" cy="115" r="3.5" fill="none" stroke="#f5b827" strokeWidth="1.4" opacity=".65" />
            <circle cx="50" cy="115" r="1.2" fill="#f5b827" opacity=".6" />
            <path d="M16 162 Q50 171 84 162" fill="none" stroke="#f5b827" strokeWidth="2" opacity=".75" />

            {/* Left Arm Group */}
            <g id="LAG">
              <rect id="lSl" x="3" y="102" width="18" height="44" rx="9" fill="#9b59b6" />
              <ellipse cx="12" cy="137" rx="10" ry="3.5" fill="none" stroke="#f5b827" strokeWidth="2.5" />
              <ellipse cx="12" cy="149" rx="9" ry="7" fill="#f0b860" />
              <ellipse cx="6" cy="144" rx="3" ry="4.5" fill="#f0b860" />
              <ellipse cx="12" cy="142" rx="3" ry="4.5" fill="#f0b860" />
              <ellipse cx="18" cy="144" rx="3" ry="4.5" fill="#f0b860" />
              <ellipse cx="21" cy="151" rx="4" ry="2.8" fill="#f0b860" />
            </g>

            {/* Right Arm Group */}
            <g id="RAG">
              <rect id="rSl" x="79" y="102" width="18" height="44" rx="9" fill="#9b59b6" />
              <ellipse cx="88" cy="137" rx="10" ry="3.5" fill="none" stroke="#f5b827" strokeWidth="2.5" />
              <ellipse cx="88" cy="149" rx="9" ry="7" fill="#f0b860" />
              <ellipse cx="94" cy="144" rx="3" ry="4.5" fill="#f0b860" />
              <ellipse cx="88" cy="142" rx="3" ry="4.5" fill="#f0b860" />
              <ellipse cx="82" cy="144" rx="3" ry="4.5" fill="#f0b860" />
              <ellipse cx="79" cy="151" rx="4" ry="2.8" fill="#f0b860" />

              {/* Ladle */}
              <g id="ladleG" style={{ display: 'none' }}>
                <rect x="86" y="116" width="5" height="34" rx="2.5" fill="#7b4818" transform="rotate(22,88,133)" />
                <ellipse cx="93" cy="108" rx="7.5" ry="5.5" fill="#7b4818" transform="rotate(22,88,133)" />
                <ellipse cx="93" cy="108" rx="4.5" ry="3" fill="#f5b827" transform="rotate(22,88,133)" opacity=".75" />
              </g>
              {/* Heart */}
              <g id="hrtG" style={{ display: 'none' }}>
                <path d="M82 104 C82 98 76 95 74 101 C72 95 66 98 66 104 C66 111 74 118 74 118 C74 118 82 111 82 104Z" fill="#e8508a" opacity=".9" />
              </g>
            </g>

            {/* Scolding Arm */}
            <g id="SFAG" style={{ display: 'none' }}>
              <rect id="sSl" x="2" y="80" width="18" height="32" rx="9" fill="#9b59b6" transform="rotate(-32,11,82)" />
              <ellipse cx="8" cy="76" rx="9" ry="7.5" fill="#f0b860" transform="rotate(-32,11,82)" />
              <rect x="5" y="55" width="8.5" height="21" rx="4.5" fill="#f0b860" transform="rotate(-32,11,82)" />
              <ellipse cx="17" cy="78" rx="3.5" ry="3" fill="#e0a050" transform="rotate(-32,11,82)" />
              <ellipse cx="8" cy="84" rx="3" ry="2.5" fill="#e0a050" transform="rotate(-32,11,82)" />
            </g>
          </svg>
        </div>
      </div>

      <div className="mom-tip pointer-events-auto">tap to call mumma!</div>
    </div>
  );
}