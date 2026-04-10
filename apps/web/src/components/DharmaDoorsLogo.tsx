interface DharmaDoorsLogoProps {
  size?: number;
  className?: string;
}

/**
 * Just the seated Buddha silhouette — no arch.
 * Used as a subtle watermark behind verse cards.
 */
export function BuddhaSilhouette({ size = 120, className = "" }: DharmaDoorsLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -82 120 150"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* Ushnisha (crown bump) */}
      <ellipse cx="0" cy="-72" rx="6" ry="8" />
      {/* Head */}
      <ellipse cx="0" cy="-58" rx="16" ry="18" />
      {/* Neck */}
      <rect x="-6" y="-42" width="12" height="8" rx="3" />
      {/* Shoulders + torso */}
      <path
        d="M-6,-36 Q-40,-30 -52,-10 Q-56,-4 -50,0
           L-44,4 Q-36,8 -30,16 L-28,28
           Q-26,36 -20,40 L20,40
           Q26,36 28,28 L30,16
           Q36,8 44,4 L50,0
           Q56,-4 52,-10 Q40,-30 6,-36 Z"
      />
      {/* Hands in lap (dhyana mudra) */}
      <ellipse cx="0" cy="18" rx="18" ry="10" opacity="0.85" />
      {/* Crossed legs */}
      <path
        d="M-20,40 Q-40,44 -54,50 Q-60,54 -56,60
           Q-50,66 -30,64 L30,64
           Q50,66 56,60 Q60,54 54,50
           Q40,44 20,40 Z"
      />
      {/* Knees */}
      <ellipse cx="-46" cy="50" rx="14" ry="10" />
      <ellipse cx="46" cy="50" rx="14" ry="10" />
    </svg>
  );
}

/**
 * DharmaDoors logo: Buddha silhouette seated within a pointed arch doorway.
 * Uses currentColor so it inherits from parent and works in both themes.
 */
export function DharmaDoorsLogo({ size = 32, className = "" }: DharmaDoorsLogoProps) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 200 240"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* Arch doorway (outer) */}
      <path
        d="M10,240 L10,110 Q10,10 100,10 Q190,10 190,110 L190,240 Z
           M30,240 L30,115 Q30,30 100,30 Q170,30 170,115 L170,240 Z"
        fillRule="evenodd"
      />
      {/* Buddha silhouette */}
      <g transform="translate(100,145)" fillRule="evenodd">
        {/* Ushnisha (crown bump) */}
        <ellipse cx="0" cy="-72" rx="6" ry="8" />
        {/* Head */}
        <ellipse cx="0" cy="-58" rx="16" ry="18" />
        {/* Neck */}
        <rect x="-6" y="-42" width="12" height="8" rx="3" />
        {/* Shoulders + torso */}
        <path
          d="M-6,-36 Q-40,-30 -52,-10 Q-56,-4 -50,0
             L-44,4 Q-36,8 -30,16 L-28,28
             Q-26,36 -20,40 L20,40
             Q26,36 28,28 L30,16
             Q36,8 44,4 L50,0
             Q56,-4 52,-10 Q40,-30 6,-36 Z"
        />
        {/* Hands in lap (dhyana mudra) */}
        <ellipse cx="0" cy="18" rx="18" ry="10" opacity="0.85" />
        {/* Crossed legs */}
        <path
          d="M-20,40 Q-40,44 -54,50 Q-60,54 -56,60
             Q-50,66 -30,64 L30,64
             Q50,66 56,60 Q60,54 54,50
             Q40,44 20,40 Z"
        />
        {/* Knees */}
        <ellipse cx="-46" cy="50" rx="14" ry="10" />
        <ellipse cx="46" cy="50" rx="14" ry="10" />
      </g>
    </svg>
  );
}
