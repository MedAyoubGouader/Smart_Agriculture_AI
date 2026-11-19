import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import CarteLeaflet from './CarteLeaflet.jsx'
import Catalogue from './Catalogue.jsx'
import { ANNEES, CATALOGUE, CULTURES, campagne, cleCatalogue, titreCouche } from './donneesDemo.js'
import { Icone } from './elements.jsx'
import EspaceTravail from './EspaceTravail.jsx'
import FicheRegion from './FicheRegion.jsx'
import Frise from './Frise.jsx'
import ModaleCompte from './ModaleCompte.jsx'
import Recherche from './Recherche.jsx'
import './carte.css'

const FONDS = [
  ['sombre', 'Carte sombre', 'linear-gradient(135deg,#1c2420,#2c3630)'],
  ['terre', 'Terre désaturée', 'linear-gradient(135deg,#5b5440,#3a3a2c)'],
  ['aucun', 'Sans fond', '#0B110E'],
]
const autreCulture = (k) => (k === 'orge' ? 'ble' : 'orge')
let compteurCouches = 0
const nouvelleCouche = (o) => ({ uid: ++compteurCouches, visible: true, opacity: 0.78, open: true, ...o })

export default function CartePublique() {
  const { utilisateur } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const carte = useRef(null)
  // Fenêtre de compte : null (fermée), 'connexion' ou 'inscription'. Une page protégée peut demander son ouverture.
  const [compte, setCompte] = useState(() => (utilisateur ? null : (location.state?.auth ?? null)))
  const suivant = location.state?.suivant

  const [geo, setGeo] = useState(null)
  const [couches, setCouches] = useState(() => [
    nouvelleCouche({ kind: 'pred', crop: 'ble', ind: 'yield' }),
    nouvelleCouche({ kind: 'admin', opacity: 0.6, open: false }),
  ])
  const [annee, setAnneeBrute] = useState('pred')
  const [selection, setSelection] = useState(null)
  const [comparaison, setComparaison] = useState(false)
  const [cultureB, setCultureB] = useState('orge')
  const [fond, setFond] = useState('sombre')
  const [menuFond, setMenuFond] = useState(false)
  const [menuCouche, setMenuCouche] = useState(null)
  const [enLecture, setEnLecture] = useState(false)
  const [panneauOuvert, setPanneauOuvert] = useState(() => window.innerWidth > 760)
  const [catalogue, setCatalogue] = useState(null) // null = fermé, sinon { sel }
  const [message, setMessage] = useState(null)

  // Contours des 24 gouvernorats (pcode, nom, nom_ar).
  useEffect(() => {
    fetch('/geo/gouvernorats.geojson').then((r) => r.json()).then(setGeo)
  }, [])
  const regions = useMemo(() => {
    const r = {}
    geo?.features.forEach((f) => { r[f.properties.pcode] = f.properties })
    return r
  }, [geo])
  const listeRegions = useMemo(() => Object.values(regions).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')), [regions])

  const couchePrincipale = couches.find((l) => l.visible && l.kind === 'pred' && CULTURES[l.crop].rel > 1)
  const cultureFiche = couchePrincipale?.crop ?? 'ble'
  const cultureComparee = cultureB === cultureFiche ? autreCulture(cultureFiche) : cultureB

  // Petit message temporaire en bas de l'écran.
  const minuteurMessage = useRef(null)
  const afficherMessage = useCallback((texte) => {
    setMessage(texte)
    clearTimeout(minuteurMessage.current)
    minuteurMessage.current = setTimeout(() => setMessage(null), 2400)
  }, [])

  // Le risque n'existe que pour la campagne en prévision : on repasse alors sur « Rendement ».
  const setAnnee = (y) => {
    if (y !== 'pred' && couches.some((l) => l.kind === 'pred' && l.ind === 'risk')) {
      setCouches(couches.map((l) => (l.kind === 'pred' && l.ind === 'risk' ? { ...l, ind: 'yield' } : l)))
      afficherMessage('Risque disponible uniquement en prévision — indicateur « Rendement »')
    }
    setAnneeBrute(y)
  }

  // Lecture animée de la frise.
  useEffect(() => {
    if (!enLecture) return
    const t = setInterval(() => {
      setAnneeBrute((y) => {
        const i = y === 'pred' ? 0 : ANNEES.indexOf(y) + 1
        if (i >= ANNEES.length) {
          setEnLecture(false)
          return 'pred'
        }
        return ANNEES[i]
      })
    }, 700)
    return () => clearInterval(t)
  }, [enLecture])

  const entrerComparaison = useCallback(() => {
    if (!couchePrincipale) {
      afficherMessage('Ajoutez une couche de prédiction pour comparer')
      return
    }
    if (cultureB === couchePrincipale.crop) setCultureB(autreCulture(couchePrincipale.crop))
    setComparaison(true)
    if (window.innerWidth <= 760) setSelection(null)
  }, [couchePrincipale, cultureB, afficherMessage])

  // La comparaison n'a de sens que s'il reste une couche de prédiction régionale visible.
  const comparaisonActive = comparaison && Boolean(couchePrincipale)

  const selectionner = useCallback((pcode, voler) => {
    setSelection(pcode)
    if (voler) setTimeout(() => carte.current?.voler(pcode), 50)
  }, [])

  // Le découpage de l'écran partagé suit l'ouverture des panneaux.
  useEffect(() => {
    carte.current?.majDecoupe()
  }, [panneauOuvert, selection])

  // Fermer les menus au clic extérieur, Échap pour fermer catalogue / comparaison / fiche.
  useEffect(() => {
    const clic = (e) => {
      if (!e.target.closest('.field')) setMenuCouche(null)
      if (!e.target.closest('.fond-carte')) setMenuFond(false)
    }
    const touche = (e) => {
      if (e.key !== 'Escape') return
      if (compte) setCompte(null)
      else if (catalogue) setCatalogue(null)
      else if (comparaisonActive) setComparaison(false)
      else if (selection) setSelection(null)
    }
    document.addEventListener('click', clic)
    document.addEventListener('keydown', touche)
    return () => {
      document.removeEventListener('click', clic)
      document.removeEventListener('keydown', touche)
    }
  }, [compte, catalogue, comparaisonActive, selection])

  const actions = {
    modifier: (uid, modif) => setCouches((cs) => cs.map((l) => (l.uid === uid ? { ...l, ...modif } : l))),
    basculerMenu: (uid) => setMenuCouche((m) => (m === uid ? null : uid)),
    choisirCulture: (uid, k) => {
      setCouches((cs) => cs.map((l) => (l.uid === uid ? { ...l, crop: k } : l)))
      setMenuCouche(null)
      if (comparaison && cultureB === k) setCultureB(autreCulture(k))
    },
    choisirIndicateur: (uid, k) => {
      setCouches((cs) => cs.map((l) => (l.uid === uid ? { ...l, ind: k } : l)))
      if (k === 'risk' && annee !== 'pred') {
        setEnLecture(false)
        setAnneeBrute('pred')
        afficherMessage('Le risque est calculé pour la campagne en prévision')
      }
    },
    retirer: (uid) => setCouches((cs) => cs.filter((l) => l.uid !== uid)),
    aPropos: (l) => setCatalogue({ sel: cleCatalogue(l) }),
    comparer: entrerComparaison,
    deplacer: (source, cible) =>
      setCouches((cs) => {
        const de = cs.findIndex((l) => l.uid === source)
        const vers = cs.findIndex((l) => l.uid === cible)
        if (de < 0 || vers < 0 || de === vers) return cs
        const copie = [...cs]
        const [m] = copie.splice(de, 1)
        copie.splice(vers, 0, m)
        return copie
      }),
  }

  function ajouterCouche(cle) {
    const d = CATALOGUE[cle]
    setCouches((cs) => [nouvelleCouche({ ...d.couche }), ...cs])
    setCatalogue(null)
    setPanneauOuvert(true)
    afficherMessage(`« ${d.titre} » ajoutée à la carte`)
  }

  async function partager() {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // Le presse-papiers peut être refusé par le navigateur : le message reste informatif.
    }
    afficherMessage('Lien de la vue copié')
  }

  const classes = ['cp', panneauOuvert ? '' : 'ws-ferme', selection ? 'fiche-ouverte' : '', comparaisonActive ? 'comparaison' : '']
  const optionsB = Object.entries(CULTURES).filter(([k, c]) => c.rel > 1 && k !== couchePrincipale?.crop)

  return (
    <div className={classes.filter(Boolean).join(' ')} data-fond={fond}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <pattern id="hachures" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#535A53" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#959C94" strokeWidth="2" />
          </pattern>
          <filter id="halo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b" />
            <feFlood floodColor="#FFF1CC" floodOpacity=".9" />
            <feComposite in2="b" operator="in" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      <CarteLeaflet
        ref={carte}
        geo={geo}
        regions={regions}
        couches={couches}
        annee={annee}
        selection={selection}
        comparaison={comparaisonActive}
        couchePrincipale={couchePrincipale}
        cultureB={cultureComparee}
        optionsB={optionsB}
        onCultureB={setCultureB}
        panneauOuvert={panneauOuvert}
        ficheOuverte={Boolean(selection)}
        onSelection={selectionner}
      />
      <div className="vignette" />

      <header className="ui top glass">
        <div className="logo">
          <div className="mark"><i /></div>
          <span className="tx">Smart Agriculture AI</span>
          <small>Tunisie</small>
        </div>
        <Recherche regions={listeRegions} culture={cultureFiche} onChoisir={(p) => selectionner(p, true)} />
        <div className="sp" />
        {utilisateur ? (
          <button type="button" className="btn-gold" onClick={() => navigate('/espace')}>Mon espace</button>
        ) : (
          <>
            <button type="button" className="btn-ghost" onClick={() => setCompte('connexion')}>Se connecter</button>
            <button type="button" className="btn-gold inscription" onClick={() => setCompte('inscription')}>Créer un compte</button>
          </>
        )}
      </header>

      {panneauOuvert ? (
        <EspaceTravail
          couches={couches}
          annee={annee}
          menu={menuCouche}
          actions={actions}
          onFermer={() => setPanneauOuvert(false)}
          onExplorer={() => setCatalogue({ sel: null })}
        />
      ) : (
        <button type="button" className="ui ws-tab glass" onClick={() => setPanneauOuvert(true)}>
          <Icone nom="couches" />Espace de travail <span className="num" style={{ color: 'var(--dim)' }}>· {couches.length}</span>
        </button>
      )}

      <div className="ui ctrl">
        <div className="zgrp glass">
          <button type="button" className="rb" onClick={() => carte.current?.zoomAvant()}><Icone nom="plus" /><span className="tt">Zoom avant</span></button>
          <button type="button" className="rb" onClick={() => carte.current?.zoomArriere()}><Icone nom="moins" /><span className="tt">Zoom arrière</span></button>
        </div>
        <button type="button" className="rb glass boussole" onClick={() => afficherMessage('Carte orientée nord en haut')}><Icone nom="boussole" /><span className="tt">Nord en haut</span></button>
        <button type="button" className="rb glass" onClick={() => carte.current?.recentrer()}><Icone nom="cible" /><span className="tt">Recentrer sur la Tunisie</span></button>
        <div className="fond-carte" style={{ position: 'relative' }}>
          <button type="button" className="rb glass" onClick={() => setMenuFond((o) => !o)}><Icone nom="couches" /><span className="tt">Fond de carte</span></button>
          {menuFond && (
            <div className="bmenu on glass">
              <div className="lbl" style={{ padding: '6px 8px' }}>Fond de carte</div>
              {FONDS.map(([k, t, bg]) => (
                <button key={k} type="button" className={fond === k ? 'sel' : ''} onClick={() => setFond(k)}>
                  <span className="bth" style={{ background: bg }} />{t}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className="rb glass" onClick={partager}><Icone nom="lien" /><span className="tt">Partager la vue</span></button>
      </div>

      {comparaisonActive && (
        <div className="ui cmpbar glass">
          <Icone nom="partage" />
          <span>{titreCouche(couchePrincipale, annee)[0]} · {couchePrincipale.ind === 'hist' ? '2000-2020' : campagne(annee)}</span>
          <button type="button" className="btn-ghost" style={{ height: 30 }} onClick={() => setComparaison(false)}>
            Quitter <Icone nom="croix" />
          </button>
        </div>
      )}

      <Frise
        culture={cultureFiche}
        annee={annee}
        enLecture={enLecture}
        onAnnee={(y) => { setEnLecture(false); setAnnee(y) }}
        onLecture={() => {
          if (enLecture) return setEnLecture(false)
          if (annee === 'pred') setAnnee(ANNEES[0])
          setEnLecture(true)
        }}
      />

      {selection && (
        <FicheRegion
          pcode={selection}
          region={regions[selection]}
          culture={cultureFiche}
          annee={annee}
          cultureComparee={cultureComparee}
          onFermer={() => setSelection(null)}
          onComparer={entrerComparaison}
        />
      )}

      {catalogue && (
        <Catalogue
          geo={geo}
          selectionInitiale={catalogue.sel}
          cleesSurCarte={couches.map(cleCatalogue)}
          onAjouter={ajouterCouche}
          onFermer={() => setCatalogue(null)}
        />
      )}

      {compte && !utilisateur && (
        <ModaleCompte
          onglet={compte}
          onOnglet={setCompte}
          onFermer={() => setCompte(null)}
          onConnecte={() => {
            setCompte(null)
            navigate(suivant ?? '/espace')
          }}
        />
      )}

      <div className={`toast glass ${message ? 'on' : ''}`} role="status">{message}</div>
    </div>
  )
}
