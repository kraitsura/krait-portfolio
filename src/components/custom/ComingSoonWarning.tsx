'use client';

interface ComingSoonWarningProps {
  onClose: () => void;
}

const ComingSoonWarning: React.FC<ComingSoonWarningProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
      onClick={onClose}
    >
      {/* Darkened background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Warning band container */}
      <div className="relative w-full">
        {/* Yellow warning band */}
        <div className="relative bg-yellow-400 px-3 md:px-6 py-8 md:py-10 overflow-hidden">
          {/* Top border with black rectangles */}
          <div className="absolute top-1.5 md:top-2 left-0 right-0 h-2.5 md:h-3 flex gap-8 md:gap-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`top-${i}`}
                className="flex-1 bg-black"
              />
            ))}
          </div>

          {/* Bottom border with black rectangles */}
          <div className="absolute bottom-1.5 md:bottom-2 left-0 right-0 h-2.5 md:h-3 flex gap-8 md:gap-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`bottom-${i}`}
                className="flex-1 bg-black"
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 md:gap-3">
            {/* Video */}
            <div className="w-[180px] h-[120px] md:w-[240px] md:h-[160px] flex items-center justify-center">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              >
                <source src="/images/fallback.webm" type="video/webm" />
                <source src="/images/fallback.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Coming Soon Text */}
            <div className="text-center">
              <p className="text-xl md:text-2xl font-bold text-black tracking-[0.2em] uppercase font-[family-name:var(--font-press-start)] leading-tight" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.15)' }}>
                COMING SOON
              </p>
            </div>

            {/* ESC text */}
            <div className="text-center mt-1 md:mt-1.5">
              <p className="text-sm md:text-base font-mono text-black tracking-wider">
                &gt; ESC
              </p>
              <p className="text-[9px] md:text-[10px] font-mono text-black/60 mt-0.5">
                Click anywhere to go back
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonWarning;
