import React from 'react';
import { motion } from 'framer-motion';

interface SquashHamburgerProps {
  isOpen: boolean;
  onClick?: () => void;
  isMobile?: boolean;
}

export const SquashHamburger: React.FC<SquashHamburgerProps> = ({
  isOpen,
  onClick,
  isMobile = false,
}) => {
  const width = isMobile ? 15 : 18;
  const height = isMobile ? 10 : 12;
  const barH = isMobile ? 1.2 : 1.5;
  const halfH = height / 2;

  const springConfig = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  };

  const bars = (
    <>
      {/* Top Bar */}
      <motion.span
        className="absolute left-0 right-0 bg-white rounded-full pointer-events-none"
        style={{ height: `${barH}px` }}
        animate={{
          top: isOpen ? `${halfH - barH / 2}px` : '0px',
          rotate: isOpen ? 45 : 0,
        }}
        transition={springConfig}
      />

      {/* Middle Bar */}
      <motion.span
        className="absolute left-0 right-0 bg-white rounded-full pointer-events-none"
        style={{ 
          height: `${barH}px`,
          top: `${halfH - barH / 2}px`,
        }}
        animate={{
          opacity: isOpen ? 0 : 1,
          scaleX: isOpen ? 0.2 : 1,
        }}
        transition={springConfig}
      />

      {/* Bottom Bar */}
      <motion.span
        className="absolute left-0 right-0 bg-white rounded-full pointer-events-none"
        style={{ height: `${barH}px` }}
        animate={{
          bottom: isOpen ? `${halfH - barH / 2}px` : '0px',
          rotate: isOpen ? -45 : 0,
        }}
        transition={springConfig}
      />
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Toggle navigation menu"
        className="relative flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer select-none"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {bars}
      </button>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="relative flex items-center justify-center p-0 bg-transparent border-0 select-none pointer-events-none"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {bars}
    </div>
  );
};
