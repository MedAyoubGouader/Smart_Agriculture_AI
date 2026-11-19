import {
  ANNEES, CLASSES, COULEURS, CULTURES, NIVEAUX, PCODES, SEQUENTIELLES,
  classe, fmt, infoPrediction, previsionNationale, rampe, serieNationale, valeursSequentielles,
} from './donneesDemo.js'

const TRACES = {
  oeil: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  oeilBarre: <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c6 0 9.5 6 9.5 6a17 17 0 01-3 3.7M6.2 7.6A17 17 0 002.5 12S6 18 12 18a9 9 0 004.2-1" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  chevronDroite: <path d="M9 6l6 6-6 6" />,
  chevronGauche: <path d="M15 6l-6 6 6 6" />,
  croix: <path d="M6 6l12 12M18 6L6 18" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  poignee: <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" strokeWidth="2.6" />,
  partage: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M12 3v18" /></>,
  corbeille: <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />,
  lecture: <path d="M8 5.5v13l10-6.5z" fill="currentColor" />,
  pause: <path d="M9 5.5v13M15 5.5v13" strokeWidth="2.2" />,
  goutte: <path d="M12 3.5s6 6.6 6 10.5a6 6 0 01-12 0c0-3.9 6-10.5 6-10.5z" />,
  thermo: <path d="M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0z" />,
  dossier: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
  jeu: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M10 10v10" /></>,
  coche: <path d="M5 12.5l4.5 4.5L19 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  moins: <path d="M5 12h14" />,
  loupe: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>,
  couches: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></>,
  boussole: <><circle cx="12" cy="12" r="9" /><path d="M12 5.5l2.4 6.5H9.6z" fill="#D9A441" stroke="#D9A441" /><path d="M12 18.5l-2.4-6.5h4.8z" /></>,
  cible: <><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="1.8" /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></>,
  lien: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" /></>,
  fleches: <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />,
}

export function Icone({ nom, taille, className = '', style }) {
  return (
    <svg className={`i ${className}`} viewBox="0 0 24 24" aria-hidden="true" style={taille ? { width: taille, height: taille, ...style } : style}>
      {TRACES[nom]}
    </svg>
  )
}

export function BadgeFiabilite({ rel }) {
  return (
    <span className="badge">
      <span className={`barres l${rel}`}><i /><i /><i /></span>
      {NIVEAUX[rel]}
    </span>
  )
}

export function Pastille({ cls, taille = 9, couleur }) {
  return <span className={`dot ${cls ? (cls === 'na' ? 'na' : 'c-' + cls) : ''}`} style={{ width: taille, height: taille, background: couleur }} />
}

// Petite courbe nationale 2001-2020 + point de prévision.
export function MiniCourbe({ culture, w = 120, h = 30 }) {
  const s = serieNationale(culture)
  const p = previsionNationale(culture)
  const vals = ANNEES.map((y) => s[y]).concat(p)
  const mn = Math.min(...vals) * 0.9
  const mx = Math.max(...vals) * 1.05
  const X = (i) => 2 + (i * (w - 10)) / ANNEES.length
  const Y = (v) => h - 2 - ((v - mn) / (mx - mn)) * (h - 4)
  const pts = ANNEES.map((y, i) => `${X(i).toFixed(1)},${Y(s[y]).toFixed(1)}`).join(' ')
  const cl = CULTURES[culture].rel === 1 ? '#ECEFE6' : COULEURS[classe(p, CULTURES[culture].th)]
  const n = ANNEES.length
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={pts} fill="none" stroke="rgba(236,239,230,.6)" strokeWidth="1.3" />
      <line x1={X(n - 1)} y1={Y(s[2020])} x2={X(n)} y2={Y(p)} stroke={cl} strokeWidth="1.3" strokeDasharray="2 2" />
      <circle cx={X(n)} cy={Y(p)} r="3" fill={cl} stroke="#0E1611" strokeWidth="1.5" />
    </svg>
  )
}

export function LegendePrediction({ couche, annee }) {
  const th = CULTURES[couche.crop].th
  let lignes
  if (couche.ind === 'risk') lignes = [['good', '< 25 %'], ['mid', '25 – 50 %'], ['low', '> 50 %']]
  else if (couche.ind === 'anom') lignes = [['good', '≥ +5 %'], ['mid', '−10 à +5 %'], ['low', '< −10 %']]
  else lignes = [['good', '≥ ' + fmt(th[1]) + ' t/ha'], ['mid', fmt(th[0]) + ' – ' + fmt(th[1]) + ' t/ha'], ['low', '< ' + fmt(th[0]) + ' t/ha']]
  const compte = { good: 0, mid: 0, low: 0, na: 0 }
  PCODES.forEach((p) => {
    const i = infoPrediction(couche.crop, p, couche.ind, annee)
    compte[i.na ? 'na' : i.cls]++
  })
  const noms = couche.ind === 'risk' ? { good: 'Risque faible', mid: 'Risque modéré', low: 'Risque élevé' } : CLASSES
  return (
    <div className="legende">
      {lignes.map(([k, t]) => (
        <div className="lg" key={k}>
          <span className={`sw c-${k}`} />
          <span>{noms[k]}</span>
          <span className="v num">{t}</span>
          <span className="c num">{compte[k]}</span>
        </div>
      ))}
      <div className="lg">
        <span className="sw na" />
        <span>Pas de prédiction fiable</span>
        <span className="c num">{compte.na}</span>
      </div>
    </div>
  )
}

export function LegendeSequentielle({ couche, annee }) {
  const q = valeursSequentielles(couche, annee)
  const m = SEQUENTIELLES[couche.metric]
  const d = m[1] === '°C' || q.max < 10 ? 1 : 0
  return (
    <div className="legende">
      <div className="degrade" style={{ background: `linear-gradient(90deg,${rampe(m[2], 0)},${rampe(m[2], 1)})` }} />
      <div className="lg num" style={{ fontSize: 11.5, color: 'var(--mut)' }}>
        <span>{fmt(q.min, d)}</span>
        <span style={{ margin: 'auto' }}>{m[1]}</span>
        <span>{fmt(q.max, d)}</span>
      </div>
    </div>
  )
}
