import L from 'leaflet'
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { CULTURES, INDICATEURS, aUneCarte, campagne, info } from './donneesDemo.js'
import { Icone } from './elements.jsx'

const TUNISIE = [[30.2, 7.5], [37.55, 11.6]]
const echapper = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

/*
 * Carte Leaflet (impérative) : remplissage des gouvernorats par couche, infobulle, sélection au clic
 * et écran partagé pour la comparaison de deux cultures.
 */
export default function CarteLeaflet({
  ref, geo, regions, couches, annee, selection, comparaison, couchePrincipale, cultureB, optionsB,
  onCultureB, panneauOuvert, ficheOuverte, onSelection,
}) {
  const conteneur = useRef(null)
  const carte = useRef(null)
  const groupes = useRef(null)
  const infobulle = useRef(null)
  const separateur = useRef(null)
  const divX = useRef(0.5)
  const [positionDiv, setPositionDiv] = useState(0.5)
  const [prete, setPrete] = useState(false)
  const props = useRef({})
  useEffect(() => {
    props.current = { panneauOuvert, ficheOuverte, comparaison, onSelection }
  })

  const marges = useCallback(() => {
    const { panneauOuvert: ouvert, ficheOuverte: fiche } = props.current
    if (window.innerWidth <= 760) return { paddingTopLeft: [20, 80], paddingBottomRight: [60, 110] }
    const largeurPanneau = window.innerWidth <= 1100 ? 320 : 360
    return { paddingTopLeft: [ouvert ? largeurPanneau + 60 : 40, 90], paddingBottomRight: [fiche ? 440 : 80, 110] }
  }, [])

  const majDecoupe = useCallback(() => {
    const map = carte.current
    if (!map) return
    const A = map.getPane('paneA')
    const B = map.getPane('paneB')
    if (!props.current.comparaison) {
      A.style.clip = ''
      B.style.clip = ''
      return
    }
    const taille = map.getSize()
    const no = map.containerPointToLayerPoint([0, 0])
    const se = map.containerPointToLayerPoint(taille)
    const x = map.containerPointToLayerPoint([divX.current * taille.x, 0]).x
    A.style.clip = `rect(${no.y}px, ${x}px, ${se.y}px, ${no.x}px)`
    B.style.clip = `rect(${no.y}px, ${se.x}px, ${se.y}px, ${x}px)`
    if (separateur.current) separateur.current.style.left = `${divX.current * window.innerWidth}px`
  }, [])

  // Création de la carte (une fois).
  useEffect(() => {
    const map = L.map(conteneur.current, { zoomControl: false, attributionControl: true, minZoom: 5, maxZoom: 11, zoomSnap: 0.25 })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map)
    map.attributionControl.setPrefix(false)
    map.createPane('paneA').style.zIndex = 410
    map.createPane('paneB').style.zIndex = 411
    map.createPane('admPane').style.zIndex = 420
    map.getPane('admPane').style.pointerEvents = 'none'
    groupes.current = { a: L.layerGroup().addTo(map), b: L.layerGroup().addTo(map), adm: L.layerGroup().addTo(map) }
    carte.current = map
    map.fitBounds(TUNISIE, marges())
    map.on('move zoomend resize', majDecoupe)
    const observateur = new ResizeObserver(() => map.invalidateSize())
    observateur.observe(conteneur.current)
    // Synchronisation avec Leaflet (système externe) : la carte existe, on peut dessiner les couches.
    // oxlint-disable-next-line react/set-state-in-effect
    setPrete(true)
    return () => {
      observateur.disconnect()
      map.remove()
      carte.current = null
    }
  }, [marges, majDecoupe])

  // Commandes exposées au parent (zoom, recentrer, voler vers un gouvernorat).
  useImperativeHandle(ref, () => ({
    zoomAvant: () => carte.current?.zoomIn(0.5),
    zoomArriere: () => carte.current?.zoomOut(0.5),
    recentrer: () => carte.current?.flyToBounds(TUNISIE, { ...marges(), duration: 0.8 }),
    voler: (pcode) => {
      const f = geo?.features.find((x) => x.properties.pcode === pcode)
      if (f) carte.current?.flyToBounds(L.geoJSON(f).getBounds(), { ...marges(), maxZoom: 8, duration: 0.8 })
    },
    majDecoupe: () => setTimeout(majDecoupe, 400),
  }), [geo, marges, majDecoupe])

  // Dessin des couches à chaque changement d'état.
  useEffect(() => {
    if (!prete || !geo) return
    const { a, b, adm } = groupes.current
    const tip = infobulle.current

    const placer = (ev) => {
      const w = tip.offsetWidth
      const h = tip.offsetHeight
      let x = ev.clientX + 16
      let y = ev.clientY + 16
      if (x + w > window.innerWidth - 8) x = ev.clientX - w - 16
      if (y + h > window.innerHeight - 8) y = ev.clientY - h - 16
      tip.style.transform = `translate(${x}px,${y}px)`
    }
    const afficher = (l, p, ev) => {
      const i = info(l, p, annee)
      const culture = l.kind === 'pred' || l.kind === 'hist' ? CULTURES[l.crop].nom : ''
      const valeur = i.na
        ? '<span class="dot na" style="width:12px;height:12px"></span><span style="font-size:14px;font-weight:500">Pas de prédiction fiable</span>'
        : `<span class="dot" style="background:${i.color};width:11px;height:11px"></span>${echapper(i.txt)}`
      const sousTitre = [i.lab || INDICATEURS[l.ind] || '', culture, l.kind === 'pred' && l.ind !== 'hist' ? campagne(annee) : '']
        .filter(Boolean).join(' · ')
      tip.innerHTML = `<div class="h"><span class="n">${echapper(regions[p]?.nom)}</span><span class="ar">${echapper(regions[p]?.nom_ar)}</span></div>
        <div class="v num">${valeur}</div><div class="s">${echapper(sousTitre)}</div>`
      tip.classList.add('on')
      placer(ev)
    }

    const remplissage = (l, pane, interactif) => {
      const g = L.geoJSON(geo, {
        pane,
        interactive: interactif,
        style: (f) => {
          const p = f.properties.pcode
          const i = info(l, p, annee)
          const sel = selection === p
          return {
            fillColor: i.na ? 'url(#hachures)' : i.color,
            fillOpacity: i.na ? Math.min(0.85, l.opacity) : l.opacity,
            color: sel ? '#FFFFFF' : 'rgba(8,14,10,.6)',
            weight: sel ? 2.6 : 0.8,
            opacity: 1,
          }
        },
        onEachFeature: (f, lyr) => {
          if (!interactif) return
          const p = f.properties.pcode
          lyr.on({
            mouseover: (e) => {
              lyr.setStyle({ weight: 2.4, color: '#FFF4D6' })
              lyr.bringToFront()
              lyr._path?.setAttribute('filter', 'url(#halo)')
              afficher(l, p, e.originalEvent)
            },
            mousemove: (e) => placer(e.originalEvent),
            mouseout: () => {
              g.resetStyle(lyr)
              lyr._path?.removeAttribute('filter')
              tip.classList.remove('on')
            },
            click: () => {
              tip.classList.remove('on')
              props.current.onSelection(p, false)
            },
          })
        },
      })
      return g
    }

    a.clearLayers()
    b.clearLayers()
    adm.clearLayers()
    const visibles = couches.filter((l) => l.visible)
    const dessus = visibles.find((l) => l.kind !== 'admin' && aUneCarte(l))
    ;[...visibles].reverse().forEach((l) => {
      if (!aUneCarte(l)) return
      if (l.kind === 'admin') {
        L.geoJSON(geo, { pane: 'admPane', interactive: false, style: { fill: false, color: '#F4EEDC', weight: 1, opacity: l.opacity } }).addTo(adm)
        return
      }
      remplissage(l, 'paneA', l === dessus).addTo(a)
    })
    if (comparaison && couchePrincipale) remplissage({ ...couchePrincipale, crop: cultureB }, 'paneB', true).addTo(b)
    majDecoupe()
  }, [prete, geo, regions, couches, annee, selection, comparaison, couchePrincipale, cultureB, majDecoupe])

  // Poignée de l'écran partagé.
  const glisser = useRef(false)
  const deplacer = (e) => {
    if (!glisser.current) return
    divX.current = Math.min(0.92, Math.max(0.08, e.clientX / window.innerWidth))
    setPositionDiv(divX.current)
    majDecoupe()
  }

  return (
    <>
      <div className="cp-map" ref={conteneur} />
      <div className="tip glass" ref={infobulle} aria-hidden="true" />
      {comparaison && couchePrincipale && (
        <div className="divider" ref={separateur} style={{ left: `${positionDiv * window.innerWidth}px` }}>
          <div className="cmpl l glass">
            <span className="dot" style={{ background: '#F4EBD6' }} />
            {CULTURES[couchePrincipale.crop].nom}
          </div>
          <div className="cmpl r glass">
            <select value={cultureB} onChange={(e) => onCultureB(e.target.value)} aria-label="Culture comparée">
              {optionsB.map(([k, c]) => <option key={k} value={k}>{c.nom}</option>)}
            </select>
            <Icone nom="chevron" taille={14} style={{ marginLeft: -4, pointerEvents: 'none' }} />
          </div>
          <div
            className="handle"
            role="slider"
            aria-label="Position de la séparation"
            aria-valuenow={Math.round(positionDiv * 100)}
            tabIndex={0}
            onPointerDown={(e) => { glisser.current = true; e.currentTarget.setPointerCapture(e.pointerId) }}
            onPointerMove={deplacer}
            onPointerUp={() => { glisser.current = false }}
          >
            <Icone nom="fleches" />
          </div>
        </div>
      )}
    </>
  )
}
