import React from 'react';

export default function Custom500() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">500</h1>
        <p className="text-xl">Oops! Something went wrong on our end.</p>
        <p className="mt-2 text-gray-400">Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    </div>
  );
}
