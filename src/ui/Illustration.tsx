export function ShieldIllustration() {
  const petals = [0, 72, 144, 216, 288];
  return (
    <svg className="illustration" viewBox="0 0 320 320" role="img" aria-label="Un escudo con un candado rodeado de pétalos">
      <defs>
        <linearGradient id="bs-shield" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8fbd" />
          <stop offset="1" stopColor="#a88bf5" />
        </linearGradient>
        <linearGradient id="bs-petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc2da" />
          <stop offset="1" stopColor="#d9c8ff" />
        </linearGradient>
      </defs>
      <g transform="translate(160 160)">
        {petals.map((angle) => (
          <ellipse key={angle} cx="0" cy="-100" rx="32" ry="52" fill="url(#bs-petal)" opacity="0.7" transform={`rotate(${angle})`} />
        ))}
      </g>
      <path d="M160 50 L248 84 V160 C248 214 211 252 160 272 C109 252 72 214 72 160 V84 Z" fill="url(#bs-shield)" />
      <path d="M160 66 L234 94 V160 C234 205 204 238 160 256 C116 238 86 205 86 160 V94 Z" fill="#ffffff" opacity="0.16" />
      <path d="M142 156 v-16 a18 18 0 0 1 36 0 v16" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      <rect x="128" y="152" width="64" height="52" rx="14" fill="#fff" />
      <circle cx="160" cy="173" r="7" fill="#e8548f" />
      <rect x="157" y="176" width="6" height="14" rx="3" fill="#e8548f" />
      <path d="M52 78 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#ffb3d1" />
      <path d="M268 232 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#c9b5ff" />
      <circle cx="262" cy="70" r="5" fill="#ffd6e7" />
      <circle cx="46" cy="236" r="4" fill="#e3d6ff" />
    </svg>
  );
}
