import React from 'react';

export default function LanguageSwitcher() {
  return (
    <>
      <button
        type="button"
        data-language="ar"
        data-label="AR"
        aria-label="Arabic"
        className="text-sm font-bold"
      >
        AR
      </button>
      <button
        type="button"
        data-language="en"
        data-label="EN"
        aria-label="English"
        className="text-sm font-bold"
      >
        EN
      </button>
      <button
        type="button"
        data-language="bn"
        data-label="BN"
        aria-label="Bangla"
        className="text-sm font-bold"
      >
        BN
      </button>
    </>
  );
}
