// components/MobileBrowserHeader.tsx
export default function MobileBrowserHeader() {
  return (
    <header className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200">
      {/* Back arrow and title */}
      <div className="flex items-center space-x-2">
        <button className="text-gray-600" aria-label="Back">
          ←
        </button>
        <span className="font-medium text-gray-800">Messenger</span>
      </div>

      {/* URL bar */}
      <div className="flex items-center space-x-1 text-sm text-gray-500">
        <span>🔒</span>
        <span>mahmudulhoquesharif2-stack.github.io</span>
      </div>

      {/* Options menu */}
      <button className="text-gray-600" aria-label="Options">
        ⋮
      </button>
    </header>
  );
}
