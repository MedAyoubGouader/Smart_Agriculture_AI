import { ANNEES, PREVISION, campagne, fmt, previsionNationale, serieNationale } from './donneesDemo.js'
import { Icone } from './elements.jsx'

// Frise des campagnes : 2000-2001 → 2019-2020 (observé) + la campagne en prévision.
export default function Frise({ culture, annee, enLecture, onAnnee, onLecture }) {
  const s = serieNationale(culture)
  const max = Math.max(...ANNEES.map((y) => s[y]), previsionNationale(culture))
  const prevision = annee === 'pred'
  return (
    <div className="ui tl glass">
      <button type="button" className="play" title={enLecture ? 'Pause' : 'Lecture'} onClick={onLecture}>
        <Icone nom={enLecture ? 'pause' : 'lecture'} taille={16} />
      </button>
      <div className="tl-cur">
        <div className="lbl">{prevision ? 'Prévision' : 'Campagne observée'}</div>
        <div className="y num">{campagne(annee)}</div>
      </div>
      <div className="tl-track">
        <div className="tl-bars">
          {ANNEES.map((y) => (
            <button
              key={y}
              type="button"
              className={annee === y ? 'on' : ''}
              title={`Campagne ${campagne(y)} · ${fmt(s[y])} t/ha`}
              aria-label={`Campagne ${campagne(y)}`}
              onClick={() => onAnnee(y)}
            >
              <i style={{ height: `${Math.max(8, (s[y] / max) * 100)}%` }} />
            </button>
          ))}
        </div>
        <div className="tl-ax num">
          <span>2000-01</span><span>2005-06</span><span>2010-11</span><span>2015-16</span><span>2019-20</span>
        </div>
      </div>
      <div className="tl-sep" />
      <button type="button" className={`tl-pred ${prevision ? 'on' : ''}`} onClick={() => onAnnee('pred')}>
        <span className="a">Prévision</span>
        <span className="b num">{PREVISION.libelle}</span>
      </button>
    </div>
  )
}
