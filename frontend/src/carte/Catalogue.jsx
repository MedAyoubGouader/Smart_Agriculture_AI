import { useMemo, useState } from 'react'
import { ARBRE, CATALOGUE, NIVEAUX, PCODES, PREVISION, aUneCarte, info, normaliser } from './donneesDemo.js'
import { BadgeFiabilite, Icone } from './elements.jsx'

// Contours simplifiés (SVG) pour l'aperçu de la couche.
function useMiniContours(geo) {
  return useMemo(() => {
    if (!geo) return {}
    const k = 36
    const P = ([x, y]) => `${((x - 7.4) * 0.83 * k).toFixed(1)},${((37.6 - y) * k).toFixed(1)}`
    const contours = {}
    geo.features.forEach((f) => {
      const g = f.geometry
      const polygones = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
      contours[f.properties.pcode] = polygones
        .map((poly) => poly.map((anneau) => 'M' + anneau.map(P).join('L') + 'Z').join(''))
        .join('')
    })
    return contours
  }, [geo])
}

function Apercu({ cle, contours }) {
  const d = CATALOGUE[cle]
  const couche = { ...d.couche, opacity: 1 }
  return (
    <svg viewBox="-4 -4 140 280" aria-hidden="true">
      {PCODES.map((p) => {
        let fill = 'none'
        let stroke = 'rgba(236,239,230,.55)'
        if (couche.kind !== 'admin') {
          const i = aUneCarte(couche) ? info(couche, p, 'pred') : { na: true }
          fill = i.na ? 'url(#hachures)' : i.color
          stroke = 'rgba(8,14,10,.7)'
        }
        return <path key={p} d={contours[p]} fill={fill} stroke={stroke} strokeWidth=".6" />
      })}
    </svg>
  )
}

export default function Catalogue({ geo, selectionInitiale, cleesSurCarte, onAjouter, onFermer }) {
  const contours = useMiniContours(geo)
  const [sel, setSel] = useState(selectionInitiale ?? 'pred:ble')
  const [ouverts, setOuverts] = useState(() => {
    const exp = { pred: true, predc: true, hist: false, clim: false, adm: false }
    if (selectionInitiale) {
      const g = CATALOGUE[selectionInitiale].grp
      exp[g] = true
      if (g === 'predc') exp.pred = true
    }
    return exp
  })
  const [filtre, setFiltre] = useState('')
  const d = CATALOGUE[sel]
  const dejaSurCarte = cleesSurCarte.includes(sel)

  const feuille = (k) =>
    normaliser(CATALOGUE[k].nom).includes(normaliser(filtre)) && (
      <button key={k} type="button" className={`tn ${sel === k ? 'sel' : ''}`} onClick={() => setSel(k)}>
        <Icone nom="jeu" taille={15} style={{ color: 'var(--dim)' }} />
        <span>{CATALOGUE[k].nom}</span>
        <span className="sp" />
        {CATALOGUE[k].rel && (
          <span className={`barres l${CATALOGUE[k].rel}`} title={NIVEAUX[CATALOGUE[k].rel]}><i /><i /><i /></span>
        )}
      </button>
    )
  const noeud = ([id, titre, enfants]) => (
    <div key={id}>
      <button type="button" className="tn grp" onClick={() => setOuverts((o) => ({ ...o, [id]: !o[id] }))}>
        <Icone nom={ouverts[id] ? 'chevron' : 'chevronDroite'} taille={15} className="chev" />
        <Icone nom="dossier" taille={16} style={{ color: 'var(--mut)' }} />
        <span>{titre}</span>
      </button>
      {ouverts[id] && <div className="tk">{enfants.map((e) => (typeof e === 'string' ? feuille(e) : noeud(e)))}</div>}
    </div>
  )

  return (
    <div className="scrim on" onClick={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="modal glass" role="dialog" aria-modal="true" aria-labelledby="titre-catalogue">
        <div className="mo-h">
          <h2 id="titre-catalogue">Explorer les données</h2>
          <div className="search">
            <Icone nom="loupe" />
            <input placeholder="Filtrer le catalogue…" value={filtre} onChange={(e) => setFiltre(e.target.value)} aria-label="Filtrer le catalogue" />
          </div>
          <button type="button" className="ibtn" title="Fermer" onClick={onFermer}><Icone nom="croix" /></button>
        </div>
        <div className="mo-b">
          <div className="tree">{ARBRE.map(noeud)}</div>
          <div className="prev">
            <h3>{d.titre}</h3>
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {d.rel ? <BadgeFiabilite rel={d.rel} /> : <span className="badge">Données de référence</span>}
              </div>
              <p className="desc" style={{ marginTop: 14 }}>{d.desc}</p>
              <dl className="meta">
                <dt>Source</dt><dd>{d.src}</dd>
                <dt>Période</dt><dd className="num">{d.per}</dd>
                <dt>Résolution</dt><dd>{d.res}</dd>
                <dt>Unité</dt><dd>{d.unite}</dd>
              </dl>
            </div>
            <div className="minimap">
              {d.rel === 1 ? <div className="notice" style={{ fontSize: 12 }}>Pas de carte régionale</div> : <Apercu cle={sel} contours={contours} />}
              <div className="lbl" style={{ marginTop: 8, fontSize: 10, textAlign: 'center' }}>Aperçu · {PREVISION.libelle}</div>
            </div>
            <div className="act">
              {dejaSurCarte ? (
                <span style={{ color: 'var(--mut)', display: 'flex', gap: 6, alignItems: 'center' }}><Icone nom="coche" />Déjà sur la carte</span>
              ) : (
                <button type="button" className="btn-gold" onClick={() => onAjouter(sel)}><Icone nom="plus" />Ajouter à la carte</button>
              )}
              <span style={{ fontSize: 12, color: 'var(--dim)' }}>La couche s'ajoute en haut de l'espace de travail.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
