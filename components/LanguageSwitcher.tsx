import React, { useState } from 'react';

// Simple language switcher – placeholder implementation.
// In a real app, integrate i18n library (e.g., next-i18next) and persistence.

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('en');

  const languages = [
    { code: 'en', label: '🇬🇧' },
    { code: 'bn', label: '🇧🇩' },
    { code: 'ar', label: '🇸🇦' },
  ];

  const handleChange = (code: string) => {
    setLang(code);
    console.log('Language changed to', code);
    // TODO: integrate with i18n library / persist selection.
  };

  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => handleChange(l.code)}
          className={`w-6 h-6 flex items-center justify-center rounded-full transition ${
            lang === l.code ? 'bg-[var(--mint)] text-white' : 'bg-white/10 text-gray-400'
          }`}
          aria-label={`Switch to ${l.code}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
