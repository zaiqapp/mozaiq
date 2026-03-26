'use client'

interface AnimatedGenerateButtonProps {
  generating: boolean
  labelIdle: string
  labelActive: string
  highlightHueDeg: number
  onClick: () => void
  disabled?: boolean
}

export function AnimatedGenerateButton({
  generating,
  labelIdle,
  labelActive,
  highlightHueDeg,
  onClick,
  disabled = false,
}: AnimatedGenerateButtonProps) {
  const isDisabled = disabled || generating

  return (
    <>
      <style>{`
        @keyframes agb-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .agb-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            hsl(${highlightHueDeg}, 100%, 50%) 0%,
            hsl(${highlightHueDeg + 40}, 80%, 55%) 50%,
            hsl(${highlightHueDeg}, 100%, 50%) 100%
          );
          background-size: 200% auto;
        }
        .agb-btn:not(:disabled):hover {
          animation: agb-shimmer 1.5s linear infinite;
        }
        .agb-btn.agb-generating {
          animation: agb-shimmer 1.5s linear infinite;
        }
      `}</style>
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`agb-btn flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-60 ${
          generating ? 'agb-generating' : ''
        }`}
      >
        {generating && (
          <svg
            className="h-3.5 w-3.5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {generating ? labelActive : labelIdle}
      </button>
    </>
  )
}
