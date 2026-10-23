import React from 'react';

interface LogoProps {
  /** Size in pixels (both width and height are equal to maintain 1:1 aspect ratio) */
  size?: number;
  /** Optional additional classes for margin, opacity, animation, etc. */
  className?: string;
  /** Whether the logo is decorative or needs screen-reader description */
  ariaHidden?: boolean;
}

/**
 * Reusable inline SVG Logo for Equb Draw.
 * Embedded directly for instant offline rendering, zero layout shift,
 * and strict fidelity to brand colors (#0E3B2E, #F2B705, #FFF1CC).
 * Maintains strict 1:1 aspect ratio without stretching, rotating, or recoloring.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 36,
  className = '',
  ariaHidden = true,
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      role={ariaHidden ? 'presentation' : 'img'}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : 'Equb Draw Logo'}
      className={`shrink-0 select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Equb Draw Logo</title>
      <rect width="512" height="512" rx="112" fill="#0E3B2E" />
      <circle
        cx="256"
        cy="256"
        r="145"
        fill="none"
        stroke="#FFF1CC"
        strokeOpacity="0.35"
        strokeWidth="8"
      />
      <g stroke="#FFF1CC" strokeOpacity="0.25" strokeWidth="6" strokeLinecap="round">
        <line x1="256" y1="256" x2="256" y2="111" />
        <line x1="256" y1="256" x2="381.6" y2="183.5" />
        <line x1="256" y1="256" x2="381.6" y2="328.5" />
        <line x1="256" y1="256" x2="256" y2="401" />
        <line x1="256" y1="256" x2="130.4" y2="328.5" />
        <line x1="256" y1="256" x2="130.4" y2="183.5" />
      </g>
      <g fill="#FFF1CC">
        <circle cx="381.6" cy="183.5" r="36" />
        <circle cx="381.6" cy="328.5" r="36" />
        <circle cx="256" cy="401" r="36" />
        <circle cx="130.4" cy="328.5" r="36" />
        <circle cx="130.4" cy="183.5" r="36" />
      </g>
      <circle
        cx="256"
        cy="111"
        r="58"
        fill="none"
        stroke="#F2B705"
        strokeOpacity="0.45"
        strokeWidth="8"
      />
      <circle cx="256" cy="111" r="46" fill="#F2B705" />
      <circle cx="256" cy="256" r="50" fill="#F2B705" />
      <circle cx="256" cy="256" r="30" fill="#0E3B2E" />
      <circle cx="256" cy="256" r="12" fill="#F2B705" />
    </svg>
  );
};
