import { useRef } from 'react';

// Single-digit boxes (6 by default) that behave like one field: typing moves forward, backspace moves
// back, and pasting a whole code fills every box.
export default function OtpInput({ value, onChange, disabled, autoFocus, length = 6 }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  function setAt(index, digit) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  }

  function handleChange(index, raw) {
    const clean = raw.replace(/\D/g, '');
    if (!clean) {
      setAt(index, '');
      return;
    }
    if (clean.length > 1) {
      // Pasted or autofilled several digits.
      const merged = (digits.slice(0, index).join('') + clean).slice(0, length);
      onChange(merged);
      refs.current[Math.min(merged.length, length - 1)]?.focus();
      return;
    }
    setAt(index, clean);
    if (index < length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      setAt(index - 1, '');
      refs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={d}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className="h-13 w-11 rounded-xl border border-slate-300 bg-white text-center font-mono text-2xl font-bold text-slate-900 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-100 disabled:bg-slate-100 sm:h-14 sm:w-12"
        />
      ))}
    </div>
  );
}
