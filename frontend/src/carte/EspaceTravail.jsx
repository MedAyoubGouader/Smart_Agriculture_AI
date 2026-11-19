import { useState } from 'react'
import { CULTURES, INDICATEURS, PREVISION, aUneCarte, fmt, previsionNationale, titreCouche } from './donneesDemo.js'
import { BadgeFiabilite, Icone, LegendePrediction, LegendeSequentielle, MiniCourbe } from './elements.jsx'

const LIBELLES_INDICATEURS = { yield: 'Rendement prédit', risk: 'Risque faible rdt', anom: 'Écart à la moyenne', hist: 'Historique' }

function MenuCultures({ couche, onChoisir }) {
  return (
    <div className="menu" role="listbox">
      {[3, 2, 1].map((r) => (
        <div key={r}>
          <div className="gh"><BadgeFiabilite rel={r} /></div>
          {Object.entries(CULTURES)
            .filter(([k, c]) => c.rel === r && (couche.kind !== 'hist' || ['ble', 'bt', 'orge'].includes(k)))
            .map(([k, c]) => (
              <button key={k} type="button" className={couche.crop === k ? 'sel' : ''} onClick={() => onChoisir(k)}>
                {c.nom}
                {couche.crop === k && <span style={{ marginLeft: 'auto' }}><Icone nom="coche" /></span>}
              </button>
            ))}
        </div>
      ))}
    </div>
  )
}

function CarteCouche({ couche, annee, menuOuvert, actions, glisser }) {
  const [t1, t2] = titreCouche(couche, annee)
  const C = couche.crop ? CULTURES[couche.crop] : null
  const maj = (modif) => actions.modifier(couche.uid, modif)

  return (
    <div
      className={`card ${couche.visible ? '' : 'off'} ${couche.open ? '' : 'closed'} ${glisser.cible === couche.uid ? 'over' : ''} ${glisser.source === couche.uid ? 'drag' : ''}`}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; glisser.debut(couche.uid) }}
      onDragOver={(e) => { e.preventDefault(); glisser.survol(couche.uid) }}
      onDrop={(e) => { e.preventDefault(); glisser.deposer(couche.uid) }}
      onDragEnd={glisser.fin}
    >
      <div className="card-h">
        <span className="grip"><Icone nom="poignee" taille={16} /></span>
        <div className="card-t">
          <div className="t1">{t1}</div>
          <div className="t2">{t2}</div>
        </div>
        <button type="button" className="ibtn" title={couche.visible ? 'Masquer' : 'Afficher'} onClick={() => maj({ visible: !couche.visible })}>
          <Icone nom={couche.visible ? 'oeil' : 'oeilBarre'} />
        </button>
        <button type="button" className="ibtn" title={couche.open ? 'Replier' : 'Déplier'} onClick={() => maj({ open: !couche.open })}>
          <Icone nom="chevron" className="chev" />
        </button>
      </div>

      <div className="card-b">
        {(couche.kind === 'pred' || couche.kind === 'hist') && (
          <div className="field">
            <span className="lbl">Culture</span>
            <button type="button" className="dd" onClick={(e) => { e.stopPropagation(); actions.basculerMenu(couche.uid) }}>
              <span className="nm">{C.nom}</span>
              <span className="sp" />
              {couche.kind === 'pred' && <BadgeFiabilite rel={C.rel} />}
              <Icone nom="chevron" taille={16} style={{ color: 'var(--dim)' }} />
            </button>
            {menuOuvert && <MenuCultures couche={couche} onChoisir={(k) => actions.choisirCulture(couche.uid, k)} />}
          </div>
        )}

        {couche.kind === 'pred' && C.rel === 1 && (
          <>
            <div className="notice">
              Pas de carte régionale pour cette culture : les données par gouvernorat sont insuffisantes. Seule la tendance
              nationale est estimée.
            </div>
            <div className="spark">
              <MiniCourbe culture={couche.crop} w={150} h={40} />
              <div className="t"><b className="num">{fmt(C.nat, 2)} t/ha</b>Prévision nationale {PREVISION.libelle}</div>
            </div>
          </>
        )}

        {couche.kind === 'pred' && C.rel > 1 && (
          <>
            <div className="field">
              <span className="lbl">Indicateur</span>
              <div className="chips">
                {Object.keys(INDICATEURS).map((k) => (
                  <button key={k} type="button" className={`chip ${couche.ind === k ? 'on' : ''}`} onClick={() => actions.choisirIndicateur(couche.uid, k)}>
                    {LIBELLES_INDICATEURS[k]}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="lbl">Légende</span>
              <LegendePrediction couche={couche} annee={annee} />
            </div>
            <div className="spark">
              <MiniCourbe culture={couche.crop} />
              <div className="t"><b className="num">{fmt(previsionNationale(couche.crop))} t/ha</b>Moyenne nationale prévue</div>
            </div>
          </>
        )}

        {(couche.kind === 'hist' || couche.kind === 'clim') && (
          <div className="field">
            <span className="lbl">Légende</span>
            <LegendeSequentielle couche={couche} annee={annee} />
          </div>
        )}

        {aUneCarte(couche) && (
          <div className="field">
            <div className="row">
              <span className="lbl" style={{ width: 62 }}>Opacité</span>
              <input
                type="range"
                className="range"
                min="0"
                max="100"
                aria-label="Opacité de la couche"
                value={Math.round(couche.opacity * 100)}
                style={{ '--p': `${couche.opacity * 100}%` }}
                onChange={(e) => maj({ opacity: e.target.value / 100 })}
              />
              <span className="num" style={{ width: 36, textAlign: 'right', fontSize: 12, color: 'var(--mut)' }}>
                {Math.round(couche.opacity * 100)} %
              </span>
            </div>
          </div>
        )}

        <div className="card-foot">
          <button type="button" className="lnk" onClick={() => actions.aPropos(couche)}>
            <Icone nom="info" taille={16} />À propos de ces données
          </button>
          <span className="sp" />
          {couche.kind === 'pred' && C.rel > 1 && (
            <button type="button" className="lnk" title="Comparer deux cultures" onClick={actions.comparer}>
              <Icone nom="partage" taille={16} />Comparer
            </button>
          )}
          <button type="button" className="ibtn" title="Retirer la couche" onClick={() => actions.retirer(couche.uid)}>
            <Icone nom="corbeille" taille={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EspaceTravail({ couches, annee, menu, actions, onFermer, onExplorer }) {
  const [glisse, setGlisse] = useState({ source: null, cible: null })
  const glisser = {
    ...glisse,
    debut: (uid) => setGlisse({ source: uid, cible: null }),
    survol: (uid) => setGlisse((g) => (g.cible === uid ? g : { ...g, cible: uid })),
    deposer: (uid) => { if (glisse.source != null) actions.deplacer(glisse.source, uid) },
    fin: () => setGlisse({ source: null, cible: null }),
  }
  const n = couches.length
  return (
    <aside className="ui ws glass" aria-label="Espace de travail">
      <div className="ws-h">
        <h2>Espace de travail</h2>
        <span className="cnt num">{n} {n > 1 ? 'couches' : 'couche'}</span>
        <span className="sp" />
        <button type="button" className="ibtn" title="Replier le panneau" onClick={onFermer}><Icone nom="chevronGauche" /></button>
      </div>
      <button type="button" className="btn-gold ws-add" onClick={onExplorer}><Icone nom="plus" />Explorer les données</button>
      <div className="lbl" style={{ padding: '0 16px 8px' }}>Couches actives</div>
      <div className="ws-list">
        {couches.map((c) => (
          <CarteCouche key={c.uid} couche={c} annee={annee} menuOuvert={menu === c.uid} actions={actions} glisser={glisser} />
        ))}
      </div>
      <div className="ws-f">
        Données de démonstration. Prévisions issues d'un modèle statistique entraîné sur les séries 1980-2020.
      </div>
    </aside>
  )
}
