type Props = {
  color?: string;
  color2?: string;
};

export function BfSymbol({ color = "var(--bfds-text)", color2 }: Props) {
  const boltFill = color;

  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 73 72"
      xmlSpace="preserve"
      style={{ height: "100%" }}
    >
      {color2 && (
        <defs>
          <linearGradient id="symbolGradient" x2="0.35" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
      )}
      <g>
        <path
          fill={color2 ? "url(#symbolGradient" : boltFill}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M42.1462 0.509311V30.288H57.5567L32.9404 71.6886C33.9686 71.7764 35.0091 71.8211 36.0601 71.8211C55.9755 71.8211 72.1202 55.7434 72.1202 35.9106C72.1202 18.1434 59.1635 3.38984 42.1462 0.509311ZM40.8091 0.308638L14.9998 43.7157H30.4103V71.3829C13.1787 68.6827 0 53.8293 0 35.9106C0 16.0777 16.1447 0 36.0601 0C37.6699 0 39.2551 0.105049 40.8091 0.308638Z"
        />
      </g>
    </svg>
  );
}