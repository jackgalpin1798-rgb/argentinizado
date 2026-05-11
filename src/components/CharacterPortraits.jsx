import React from 'react'

export function FacundoPortrait({ speaking }) {
  return (
    <svg viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg" className={`portrait-svg ${speaking ? 'portrait-speaking' : ''}`}>
      {/* Background */}
      <defs>
        <radialGradient id="fac-bg" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#2a0005"/>
          <stop offset="100%" stopColor="#0a0005"/>
        </radialGradient>
        <clipPath id="fac-clip">
          <ellipse cx="110" cy="130" rx="100" ry="120"/>
        </clipPath>
      </defs>
      <ellipse cx="110" cy="130" rx="100" ry="120" fill="url(#fac-bg)"/>

      {/* Body - River Plate jersey */}
      <path d="M30 260 Q30 195 110 188 Q190 195 190 260Z" fill="#E8052A"/>
      {/* White diagonal stripe */}
      <path d="M55 205 Q110 198 165 205 L162 225 Q110 218 58 225Z" fill="#fff"/>

      {/* Neck */}
      <rect x="93" y="170" width="34" height="25" rx="8" fill="#c68a4a"/>

      {/* Head */}
      <ellipse cx="110" cy="118" rx="52" ry="60" fill="#c68a4a"/>

      {/* Hair - dark, messy */}
      <ellipse cx="110" cy="68" rx="54" ry="36" fill="#1a0a00"/>
      <path d="M58 90 Q52 65 70 52 Q90 42 110 42 Q130 42 150 52 Q168 65 162 90" fill="#1a0a00"/>
      <path d="M58 90 Q55 78 62 72" stroke="#1a0a00" strokeWidth="4" fill="none"/>

      {/* Eyebrows - thick, expressive */}
      <path d="M76 96 Q88 90 100 95" stroke="#1a0a00" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M120 95 Q132 90 144 96" stroke="#1a0a00" strokeWidth="4" strokeLinecap="round" fill="none"/>

      {/* Eyes */}
      <ellipse cx="88" cy="108" rx="10" ry="11" fill="#fff"/>
      <ellipse cx="132" cy="108" rx="10" ry="11" fill="#fff"/>
      <circle cx="90" cy="109" r="6" fill="#3d1a00"/>
      <circle cx="134" cy="109" r="6" fill="#3d1a00"/>
      <circle cx="91" cy="107" r="2.5" fill="#000"/>
      <circle cx="135" cy="107" r="2.5" fill="#000"/>
      <circle cx="92" cy="106" r="1" fill="#fff"/>
      <circle cx="136" cy="106" r="1" fill="#fff"/>

      {/* Nose */}
      <path d="M106 115 L102 132 Q110 136 118 132 L114 115" fill="#b5762e"/>
      <ellipse cx="105" cy="132" rx="6" ry="4" fill="#a06228"/>
      <ellipse cx="115" cy="132" rx="6" ry="4" fill="#a06228"/>

      {/* Big open grin */}
      <path d="M82 148 Q110 168 138 148" stroke="#7a2000" strokeWidth="3" fill="none"/>
      <path d="M84 150 Q110 166 136 150 Q136 158 110 162 Q84 158 84 150Z" fill="#8b1a00"/>
      <path d="M88 150 L108 152 L132 150 L128 156 L108 158 L92 156Z" fill="#fff"/>

      {/* Ears */}
      <ellipse cx="58" cy="115" rx="9" ry="12" fill="#b57838"/>
      <ellipse cx="162" cy="115" rx="9" ry="12" fill="#b57838"/>

      {/* Stubble */}
      <path d="M85 142 Q110 148 135 142" stroke="#7a4010" strokeWidth="1.5" strokeDasharray="2,3" fill="none"/>

      {/* River Plate scarf around neck */}
      <path d="M75 175 Q110 168 145 175 L148 188 Q110 180 72 188Z" fill="#E8052A"/>
      <path d="M76 180 Q110 173 144 180 L143 184 Q110 177 77 184Z" fill="#fff"/>

      {/* Excited sweat drop */}
      <ellipse cx="152" cy="78" rx="5" ry="7" fill="rgba(117,170,219,0.7)"/>
      <ellipse cx="152" cy="73" rx="3" ry="4" fill="rgba(117,170,219,0.5)"/>
    </svg>
  )
}

export function MirtraPortrait({ speaking }) {
  return (
    <svg viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg" className={`portrait-svg ${speaking ? 'portrait-speaking' : ''}`}>
      <defs>
        <radialGradient id="mir-bg" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#2a0d00"/>
          <stop offset="100%" stopColor="#0a0500"/>
        </radialGradient>
      </defs>
      <ellipse cx="110" cy="130" rx="100" ry="120" fill="url(#mir-bg)"/>

      {/* Body - white apron over dark top */}
      <path d="M30 260 Q30 195 110 188 Q190 195 190 260Z" fill="#2d1a00"/>
      {/* Apron */}
      <path d="M78 200 Q110 193 142 200 L145 260 L75 260Z" fill="#f0ede8"/>
      <path d="M78 200 Q110 193 142 200 L140 208 Q110 202 80 208Z" fill="#d4c8b0"/>

      {/* Neck */}
      <rect x="93" y="170" width="34" height="25" rx="8" fill="#d4956a"/>

      {/* Head */}
      <ellipse cx="110" cy="115" rx="50" ry="58" fill="#d4956a"/>

      {/* Hair - dark, pulled back bun */}
      <ellipse cx="110" cy="65" rx="52" ry="34" fill="#1a0800"/>
      <path d="M60 88 Q56 62 75 50 Q92 40 110 40 Q128 40 145 50 Q164 62 160 88" fill="#1a0800"/>
      {/* Bun */}
      <circle cx="110" cy="47" r="18" fill="#2d1000"/>
      <circle cx="110" cy="47" r="14" fill="#1a0800"/>

      {/* Eyebrows - neat */}
      <path d="M78 94 Q90 88 102 93" stroke="#1a0800" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M118 93 Q130 88 142 94" stroke="#1a0800" strokeWidth="3.5" strokeLinecap="round" fill="none"/>

      {/* Eyes - warm, kind */}
      <ellipse cx="90" cy="106" rx="10" ry="10" fill="#fff"/>
      <ellipse cx="130" cy="106" rx="10" ry="10" fill="#fff"/>
      <circle cx="92" cy="107" r="6" fill="#3d1500"/>
      <circle cx="132" cy="107" r="6" fill="#3d1500"/>
      <circle cx="93" cy="105" r="2.5" fill="#000"/>
      <circle cx="133" cy="105" r="2.5" fill="#000"/>
      <circle cx="94" cy="104" r="1" fill="#fff"/>
      <circle cx="134" cy="104" r="1" fill="#fff"/>

      {/* Eyelashes */}
      <path d="M82 99 L80 95 M87 97 L86 93 M92 97 L92 93" stroke="#1a0800" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M122 97 L121 93 M127 97 L127 93 M132 99 L134 95" stroke="#1a0800" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Nose */}
      <path d="M107 113 L104 126 Q110 129 116 126 L113 113" fill="#c07848"/>
      <ellipse cx="106" cy="127" rx="5" ry="3.5" fill="#aa6030"/>
      <ellipse cx="114" cy="127" rx="5" ry="3.5" fill="#aa6030"/>

      {/* Warm smile */}
      <path d="M86 142 Q110 158 134 142" stroke="#7a2500" strokeWidth="2.5" fill="none"/>
      <path d="M88 144 Q110 156 132 144 Q130 152 110 155 Q90 152 88 144Z" fill="#8b2000"/>
      <path d="M92 144 L108 146 L128 144 L126 150 L108 152 L94 150Z" fill="#fff"/>

      {/* Ears */}
      <ellipse cx="60" cy="112" rx="9" ry="12" fill="#c07848"/>
      <ellipse cx="160" cy="112" rx="9" ry="12" fill="#c07848"/>
      {/* Earrings */}
      <circle cx="60" cy="122" r="4" fill="#FFD700"/>
      <circle cx="160" cy="122" r="4" fill="#FFD700"/>

      {/* Cheeks - warm blush */}
      <ellipse cx="76" cy="122" rx="10" ry="7" fill="rgba(220,100,60,0.25)"/>
      <ellipse cx="144" cy="122" rx="10" ry="7" fill="rgba(220,100,60,0.25)"/>
    </svg>
  )
}

export function RubenPortrait({ speaking }) {
  return (
    <svg viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg" className={`portrait-svg ${speaking ? 'portrait-speaking' : ''}`}>
      <defs>
        <radialGradient id="rub-bg" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#0a0a20"/>
          <stop offset="100%" stopColor="#03030f"/>
        </radialGradient>
      </defs>
      <ellipse cx="110" cy="130" rx="100" ry="120" fill="url(#rub-bg)"/>

      {/* Body - taxi driver dark jacket */}
      <path d="M30 260 Q30 192 110 185 Q190 192 190 260Z" fill="#1a1a2e"/>
      {/* Collar/shirt */}
      <path d="M88 190 L110 205 L132 190 L128 200 L110 215 L92 200Z" fill="#e8e0d0"/>
      <path d="M88 190 L92 210 L110 218 L128 210 L132 190" fill="#2d2d45" stroke="#1a1a2e" strokeWidth="1"/>

      {/* Neck */}
      <rect x="93" y="170" width="34" height="22" rx="8" fill="#b07840"/>

      {/* Head - wider, older face */}
      <ellipse cx="110" cy="116" rx="54" ry="60" fill="#b07840"/>

      {/* Hair - receding, salt and pepper */}
      <path d="M56 92 Q54 60 75 48 Q92 40 110 40 Q128 40 145 48 Q166 60 164 92" fill="#3a3a3a"/>
      <path d="M56 92 Q60 72 75 65" stroke="#3a3a3a" strokeWidth="6" fill="none"/>
      <path d="M164 92 Q160 72 145 65" stroke="#3a3a3a" strokeWidth="6" fill="none"/>
      {/* Receding part */}
      <path d="M78 62 Q95 55 110 58 Q125 55 142 62" fill="#b07840"/>

      {/* Taxi cap */}
      <path d="M54 88 Q56 66 110 62 Q164 66 166 88Z" fill="#1a1a1a"/>
      <rect x="50" y="86" width="120" height="10" rx="5" fill="#0a0a0a"/>
      {/* Cap badge */}
      <rect x="96" y="78" width="28" height="14" rx="3" fill="#FFD700"/>
      <text x="110" y="89" textAnchor="middle" fontSize="8" fill="#000" fontFamily="sans-serif" fontWeight="bold">TAXI</text>

      {/* Eyebrows - bushy */}
      <path d="M74 100 Q88 93 102 98" stroke="#2d1800" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M118 98 Q132 93 146 100" stroke="#2d1800" strokeWidth="5" strokeLinecap="round" fill="none"/>

      {/* Eyes - squinting, opinionated */}
      <ellipse cx="88" cy="112" rx="11" ry="9" fill="#fff"/>
      <ellipse cx="132" cy="112" rx="11" ry="9" fill="#fff"/>
      <circle cx="90" cy="113" r="6" fill="#2d1500"/>
      <circle cx="134" cy="113" r="6" fill="#2d1500"/>
      <circle cx="91" cy="111" r="2.5" fill="#000"/>
      <circle cx="135" cy="111" r="2.5" fill="#000"/>
      <circle cx="92" cy="110" r="1" fill="#fff"/>
      <circle cx="136" cy="110" r="1" fill="#fff"/>
      {/* Crow's feet */}
      <path d="M99 108 L104 104 M100 112 L106 110" stroke="#8a5a28" strokeWidth="1" fill="none"/>
      <path d="M121 104 L126 108 M120 110 L126 112" stroke="#8a5a28" strokeWidth="1" fill="none"/>

      {/* Nose - bigger, distinguished */}
      <path d="M105 118 L100 136 Q110 142 120 136 L115 118" fill="#9a6030"/>
      <ellipse cx="102" cy="136" rx="7" ry="5" fill="#8a5028"/>
      <ellipse cx="118" cy="136" rx="7" ry="5" fill="#8a5028"/>

      {/* Big mustache */}
      <path d="M80 148 Q95 138 110 142 Q125 138 140 148 Q130 158 110 154 Q90 158 80 148Z" fill="#4a3a2a"/>
      <path d="M80 148 Q95 140 110 143 Q125 140 140 148" stroke="#2d2015" strokeWidth="1.5" fill="none"/>

      {/* Mouth - talking */}
      <path d="M92 156 Q110 165 128 156 Q126 162 110 164 Q94 162 92 156Z" fill="#7a2a00"/>
      <path d="M96 156 L110 158 L124 156 L122 161 L110 162 L98 161Z" fill="#e0d0c0"/>

      {/* Ears */}
      <ellipse cx="56" cy="116" rx="10" ry="13" fill="#a07038"/>
      <ellipse cx="164" cy="116" rx="10" ry="13" fill="#a07038"/>

      {/* Wrinkles/character lines */}
      <path d="M76 108 Q74 116 76 124" stroke="#8a5a28" strokeWidth="1.2" fill="none"/>
      <path d="M144 108 Q146 116 144 124" stroke="#8a5a28" strokeWidth="1.2" fill="none"/>
      <path d="M86 138 Q88 142 86 146" stroke="#8a5a28" strokeWidth="1" fill="none"/>

      {/* Collar showing under jacket */}
    </svg>
  )
}
