import { useState } from 'react'
import {
  CLASSES, COULEURS, CULTURES, PREVISION, base, campagne, classe, fmt, moyenne, pluieActuelle, pluieNormale,
  risque, serie, tempAnomalie, tempNormale,
} from './donneesDemo.js'
import { BadgeFiabilite, Icone, Pastille } from './elements.jsx'

const W = 360
const H = 160
const G = 30
const D = 12
const HAUT = 12
const BAS = 22
const AN_MIN = 1980
const AN_MAX = PREVISION.annee

// Historique 1980-2020 + prévision avec son intervalle.
function Graphique({ culture, pcode, annee }) {
  const [survol, setSurvol] = useState(null)
  const s = serie(culture, pcode)
  const C = CULTURES[culture]
  const p = base(culture, pcode)
  const hi = p * 1.17
  const lo = p * 0.83
  const ys = []
  for (let y = 1980; y <= 2020; y++) ys.push(y)
  const mx = Math.max(...ys.map((y) => s[y]), hi) * 1.08
  const X = (y) => G + ((y - AN_MIN) / (AN_MAX - AN_MIN)) * (W - G - D)
  const Y = (v) => HAUT + (1 - v / mx) * (H - HAUT - BAS)
  const pts = ys.map((y) => `${X(y).toFixed(1)},${Y(s[y]).toFixed(1)}`).join(' ')
  const m = moyenne(s)
  const cl = COULEURS[classe(p, C.th)]
  const pas = mx > 20 ? 20 : mx > 6 ? 2 : mx > 2.5 ? 1 : 0.5
  const grille = []
  for (let v = 0; v < mx; v += pas) grille.push(v)

  function bouger(e) {
    const r = e.currentTarget.ownerSVGElement.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const y = Math.round(AN_MIN + ((x - G) / (W - G - D)) * (AN_MAX - AN_MIN))
    if (y < 1980) return setSurvol(null)
    if (y > 2020) return setSurvol(y >= AN_MAX - 2 ? AN_MAX : null)
    setSurvol(y)
  }

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ fontFamily: 'IBM Plex Sans' }} role="img" aria-label="Historique du rendement et prévision">
        {grille.map((v) => (
          <g key={v}>
            <line x1={G} x2={W - D} y1={Y(v)} y2={Y(v)} stroke="rgba(255,255,255,.06)" />
            <text x={G - 6} y={Y(v) + 3.5} textAnchor="end" fill="#7E8977" fontSize="10">{fmt(v, pas < 1 ? 1 : 0)}</text>
          </g>
        ))}
        {C.th.map((v) => (
          <line key={v} x1={G} x2={W - D} y1={Y(v)} y2={Y(v)} stroke="rgba(255,255,255,.12)" strokeDasharray="1 3" />
        ))}
        <polygon points={`${X(1980)},${H - BAS} ${pts} ${X(2020)},${H - BAS}`} fill="rgba(236,239,230,.05)" />
        <line x1={G} x2={X(2020)} y1={Y(m)} y2={Y(m)} stroke="#A9B3A2" strokeDasharray="4 3" strokeWidth="1" />
        <text x={G + 4} y={Y(m) - 4} fill="#A9B3A2" fontSize="9.5">moy. 2000-2020</text>
        <polyline points={pts} fill="none" stroke="#E6E9DF" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1={X(2020)} y1={Y(s[2020])} x2={X(AN_MAX)} y2={Y(p)} stroke={cl} strokeDasharray="3 2" strokeWidth="1.5" />
        <line x1={X(AN_MAX)} x2={X(AN_MAX)} y1={Y(hi)} y2={Y(lo)} stroke={cl} strokeWidth="2" />
        <line x1={X(AN_MAX) - 4} x2={X(AN_MAX) + 4} y1={Y(hi)} y2={Y(hi)} stroke={cl} strokeWidth="2" />
        <line x1={X(AN_MAX) - 4} x2={X(AN_MAX) + 4} y1={Y(lo)} y2={Y(lo)} stroke={cl} strokeWidth="2" />
        <circle cx={X(AN_MAX)} cy={Y(p)} r="5" fill={cl} stroke="#0E1611" strokeWidth="2" />
        {annee !== 'pred' && (
          <>
            <line x1={X(annee)} x2={X(annee)} y1={HAUT} y2={H - BAS} stroke="rgba(244,235,214,.5)" />
            <circle cx={X(annee)} cy={Y(s[annee])} r="3.5" fill="#F4EBD6" />
          </>
        )}
        {[1980, 1990, 2000, 2010, 2020].map((y) => (
          <text key={y} x={X(y)} y={H - 6} textAnchor="middle" fill="#7E8977" fontSize="10">{y}</text>
        ))}
        {survol != null && <line x1={X(survol)} x2={X(survol)} y1={HAUT} y2={H - BAS} stroke="rgba(244,235,214,.35)" />}
        <rect x={G} y={HAUT} width={W - G - D} height={H - HAUT - BAS} fill="transparent" onMouseMove={bouger} onMouseLeave={() => setSurvol(null)} />
      </svg>
      <div className="hv num">
        {survol != null && (survol === AN_MAX ? `Prévision ${PREVISION.libelle}` : campagne(survol)) + ' · ' + fmt(survol === AN_MAX ? p : s[survol]) + ' t/ha'}
      </div>
    </div>
  )
}

export default function FicheRegion({ pcode, region, culture, annee, cultureComparee, onFermer, onComparer }) {
  const C = CULTURES[culture]
  const b = base(culture, pcode)
  let corps
  if (b == null) {
    corps = (
      <div>
        <span className="clsb na">Pas de prédiction fiable</span>
        <p className="notice" style={{ marginTop: 12 }}>
          Les surfaces cultivées en {C.nom.toLowerCase()} sont trop faibles ou les séries trop lacunaires dans ce gouvernorat
          pour produire une estimation fiable.
        </p>
      </div>
    )
  } else {
    const k = classe(b, C.th)
    const lo = b * (C.rel === 3 ? 0.84 : 0.76)
    const hi = b * (C.rel === 3 ? 1.16 : 1.24)
    const r = risque(culture, pcode)
    const s = serie(culture, pcode)
    const m = moyenne(s)
    const pluie = pluieActuelle(pcode)
    const normale = pluieNormale(pcode)
    const ecartPluie = Math.round(((pluie - normale) / normale) * 100)
    const tN = tempNormale(pcode)
    const tA = tempAnomalie(pcode)
    corps = (
      <>
        <div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className={`clsb ${k}`}>
              <span className="dot" style={{ background: '#0F1510', opacity: 0.35, width: 6, height: 6 }} />
              {CLASSES[k]}
            </span>
            <BadgeFiabilite rel={C.rel} />
          </div>
          <div className="lbl" style={{ marginTop: 16 }}>Rendement prédit · {C.nom} · {PREVISION.libelle}</div>
          <div className="big num" style={{ marginTop: 8 }}>{fmt(b)}<small>t/ha</small></div>
          <div className="ci num">
            Intervalle à 80 % : [{fmt(lo)} – {fmt(hi)}] t/ha · {b >= m ? '+' : '−'}{fmt(Math.abs(((b - m) / m) * 100), 0)} % vs moyenne
          </div>
        </div>

        <div className="sec">
          <h4>Risque de faible rendement<span style={{ marginLeft: 'auto', color: 'var(--text)', fontFamily: 'var(--fb)' }} className="num">{r} %</span></h4>
          <div className="gauge">
            <span style={{ width: '25%', background: 'var(--good)', borderRadius: '4px 0 0 4px' }} />
            <span style={{ width: '25%', background: 'var(--mid)' }} />
            <span style={{ width: '50%', background: 'var(--low)', borderRadius: '0 4px 4px 0' }} />
            <i className="mk" style={{ left: `calc(${r}% - 1.5px)` }} />
          </div>
          <div className="gax num">
            <span>0</span><span style={{ marginLeft: '18%' }}>25</span><span style={{ marginLeft: '18%' }}>50</span><span style={{ marginLeft: 'auto' }}>100 %</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>Probabilité d'un rendement inférieur à {fmt(C.th[0])} t/ha</div>
        </div>

        <div className="sec">
          <h4>Historique 1980-2020 et prévision</h4>
          <Graphique culture={culture} pcode={pcode} annee={annee} />
        </div>

        <div className="sec">
          <h4>Climat de la campagne</h4>
          <div className="clim">
            <div className="cc">
              <div className="k"><Icone nom="goutte" taille={15} />Pluie cumulée</div>
              <div className="val num">{pluie} mm</div>
              <div className="sub num">Normale {normale} mm · <span style={{ color: 'var(--text)' }}>{ecartPluie > 0 ? '+' : '−'}{Math.abs(ecartPluie)} %</span></div>
              <div className="cbar"><i style={{ width: `${Math.min(100, (pluie / (normale * 1.2)) * 100)}%` }} /><b style={{ left: `${100 / 1.2}%` }} /></div>
            </div>
            <div className="cc">
              <div className="k"><Icone nom="thermo" taille={15} />Température moy.</div>
              <div className="val num">{fmt(tN + tA)} °C</div>
              <div className="sub num">Normale {fmt(tN)} °C · <span style={{ color: 'var(--text)' }}>+{fmt(tA)} °C</span></div>
              <div className="cbar"><i style={{ width: `${((tN + tA - 10) / 14) * 100}%`, background: '#CDB3DD' }} /><b style={{ left: `${((tN - 10) / 14) * 100}%` }} /></div>
            </div>
          </div>
        </div>

        <div className="sec">
          <h4>3 dernières campagnes</h4>
          <table className="mt num">
            <thead><tr><th>Campagne</th><th>Rendement</th><th>vs moyenne</th></tr></thead>
            <tbody>
              {[2018, 2019, 2020].map((y) => {
                const v = s[y]
                const a = ((v - m) / m) * 100
                return (
                  <tr key={y}>
                    <td>{campagne(y)}</td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Pastille cls={classe(v, C.th)} />{fmt(v)} t/ha</span></td>
                    <td style={{ color: 'var(--mut)' }}>{a >= 0 ? '+' : '−'}{fmt(Math.abs(a), 0)} %</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  return (
    <aside className="ui fiche glass" aria-label={`Fiche région ${region?.nom ?? ''}`}>
      <div className="fi-h">
        <div style={{ flex: 1 }}>
          <div className="lbl" style={{ marginBottom: 6 }}>Fiche région</div>
          <h3>{region?.nom}</h3>
          <div className="ar">ولاية {region?.nom_ar}</div>
        </div>
        <button type="button" className="ibtn" title="Fermer" onClick={onFermer}><Icone nom="croix" /></button>
      </div>
      <div className="fi-b">{corps}</div>
      <div className="fi-f">
        <button type="button" className="btn-gold" style={{ justifyContent: 'center' }} disabled={C.rel === 1} onClick={onComparer}>
          <Icone nom="partage" />Comparer avec {CULTURES[cultureComparee].nom.toLowerCase()}
        </button>
        <div className="disc">
          <Icone nom="info" taille={15} style={{ flex: 'none', marginTop: 1 }} />
          Estimation issue d'un modèle statistique, non une garantie.
        </div>
      </div>
    </aside>
  )
}
