import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

interface EvidenceTextProps {
  children: React.ReactNode;
  basis?: string;
  className?: string;
  tooltipClassName?: string;
  block?: boolean;
}

interface TooltipPosition {
  left: number;
  top: number;
}

const TOOLTIP_WIDTH = 320;
const VIEWPORT_MARGIN = 16;
const TOOLTIP_GAP = 10;
const ESTIMATED_TOOLTIP_HEIGHT = 180;

export function EvidenceText({
  children,
  basis,
  className = '',
  tooltipClassName = '',
  block = false,
}: EvidenceTextProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement | HTMLSpanElement>(null);

  const updatePosition = () => {
    const element = wrapperRef.current;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN);
    const left = Math.min(Math.max(rect.left, VIEWPORT_MARGIN), maxLeft);
    const showBelow = rect.bottom + TOOLTIP_GAP + ESTIMATED_TOOLTIP_HEIGHT <= window.innerHeight - VIEWPORT_MARGIN;
    const top = showBelow
      ? rect.bottom + TOOLTIP_GAP
      : Math.max(VIEWPORT_MARGIN, rect.top - ESTIMATED_TOOLTIP_HEIGHT - TOOLTIP_GAP);

    setPosition({ left, top });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();

    const handleReposition = () => updatePosition();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen]);

  if (!basis) {
    return block ? <div className={className}>{children}</div> : <span className={className}>{children}</span>;
  }

  const tooltip =
    isOpen && position && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={`fixed rounded-xl bg-slate-900 text-white shadow-2xl z-[1000] p-3 pointer-events-none ${tooltipClassName}`}
              style={{ left: position.left, top: position.top, width: TOOLTIP_WIDTH }}
            >
              <div className="text-xs font-semibold text-sky-300 mb-1">依据</div>
              <div className="text-sm leading-6 whitespace-pre-line">{basis}</div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )
      : null;

  if (block) {
    return (
      <>
        <div
          ref={wrapperRef as React.RefObject<HTMLDivElement>}
          className={`relative block ${className}`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {children}
        </div>
        {tooltip}
      </>
    );
  }

  return (
    <>
      <span
        ref={wrapperRef as React.RefObject<HTMLSpanElement>}
        className={`relative inline-block ${className}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </span>
      {tooltip}
    </>
  );
}
