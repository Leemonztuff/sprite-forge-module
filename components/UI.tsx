
import React from 'react';
import { GIcon, Icons } from './Icons';

export const IconButton: React.FC<{
  children: React.ReactNode;
  label?: string;
  onClick: () => void;
  variant?: 'ghost' | 'primary' | 'danger' | 'active' | 'emerald';
  className?: string;
  disabled?: boolean;
  title?: string;
}> = ({ children, label, onClick, variant = 'ghost', className = '', disabled = false, title }) => {
  const styles = {
    ghost: 'text-slate-500 hover:text-white hover:bg-white/[0.03] border-transparent',
    active: 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30 neon-shadow',
    primary: 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-90 border-indigo-400/50',
    danger: 'text-rose-500 hover:bg-rose-500/10 border-rose-500/10',
    emerald: 'text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/10'
  };

  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 min-w-[44px] min-h-[44px] rounded-2xl border transition-all duration-300 disabled:opacity-20 active:scale-95 ${styles[variant]} ${className}`}
    >
      <div className="flex items-center justify-center scale-110">{children}</div>
      {label && <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] whitespace-nowrap opacity-80">{label}</span>}
    </button>
  );
};

export const ParameterBox: React.FC<{
  value: number;
  onChange: (v: number) => void;
  label: string;
  icon: string;
  description: string;
  steps?: number[];
}> = ({ value, onChange, label, icon, description, steps = [25, 50, 75, 100] }) => {
  return (
    <div className="group relative bg-[#121212] border border-white/5 rounded-[2rem] p-5 hover:border-indigo-500/30 transition-all flex flex-col gap-4 shadow-xl">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500 transition-transform group-hover:scale-110">
          <GIcon d={icon} size={20} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{value}%</span>
          <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
      </div>
      
      <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed opacity-60">
        {description}
      </p>

      <div className="flex gap-2">
        {steps.map((step) => (
          <button
            key={step}
            onClick={() => onChange(step)}
            className={`flex-1 h-2.5 rounded-full transition-all duration-300 ${
              value >= step 
                ? 'bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
            title={`${step}%`}
          />
        ))}
      </div>
    </div>
  );
};

export const Slider: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}> = ({ value, min, max, onChange, label }) => (
  <div className="flex flex-col gap-2 w-full bg-white/[0.03] p-4 rounded-2xl border border-white/5">
    <div className="flex justify-between items-center px-1 mb-1">
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <span className="text-[10px] font-mono-tech text-indigo-400 font-bold">{value}%</span>
    </div>
    <input 
      type="range" min={min} max={max} value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full cursor-pointer"
    />
  </div>
);

export const ComparisonSlider: React.FC<{
  before: string;
  after: string;
  className?: string;
}> = ({ before, after, className = "" }) => {
  const [sliderPos, setSliderPos] = React.useState(50);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full select-none touch-none overflow-hidden rounded-[2rem] bg-[#050505] border border-white/5 shadow-2xl ${className}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      <div className="absolute inset-0 tech-grid opacity-10" />
      <div className="absolute inset-0 flex items-center justify-center opacity-30 grayscale pointer-events-none">
        <img src={before} className="max-h-[85%] max-w-[85%] object-contain pixelated scale-110" alt="Base" />
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-center z-10 bg-[#050505]"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      >
        <div className="absolute inset-0 tech-grid opacity-10" />
        <img src={after} className="max-h-[85%] max-w-[85%] object-contain pixelated scale-110" alt="Gen" />
      </div>
      <div className="absolute inset-y-0 w-[3px] bg-indigo-500 z-20 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ left: `${sliderPos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl border-2 border-indigo-400 bg-black flex items-center justify-center shadow-2xl">
           <div className="flex gap-1.5"><div className="w-1 h-4 bg-indigo-500 rounded-full" /><div className="w-1 h-4 bg-indigo-500 rounded-full" /></div>
        </div>
      </div>
    </div>
  );
};

export const Loader: React.FC<{ message?: string }> = ({ message = 'SYNTHESIZING' }) => (
  <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-500 backdrop-blur-md">
    <div className="relative mb-8">
      <div className="w-16 h-16 border-2 border-indigo-600/20 rounded-[2rem] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-6 h-6 bg-indigo-600 rounded-xl animate-pulse neon-shadow" />
      </div>
    </div>
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 animate-pulse">{message}</span>
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 bg-indigo-900 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 bg-indigo-900 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 bg-indigo-900 rounded-full animate-bounce" />
      </div>
    </div>
  </div>
);
