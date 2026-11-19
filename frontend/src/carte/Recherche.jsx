import { useEffect, useRef, useState } from 'react'
import { CULTURES, base, classe, normaliser } from './donneesDemo.js'
import { Icone, Pastille } from './elements.jsx'

// Recherche d'un gouvernorat par son nom français ou arabe.
export default function Recherche({ regions, culture, onChoisir }) {
  const [texte, setTexte] = useState('')
  const [ouvert, setOuvert] = useState(false)
  const zone = useRef(null)
  const q = normaliser(texte.trim())
  const resultats = q
    ? regions.filter((r) => normaliser(r.nom).includes(q) || r.nom_ar.includes(texte.trim()))
    : []

  useEffect(() => {
    const fermer = (e) => { if (!zone.current?.contains(e.target)) setOuvert(false) }
    document.addEventListener('click', fermer)
    return () => document.removeEventListener('click', fermer)
  }, [])

  function choisir(r) {
    setTexte(r.nom)
    setOuvert(false)
    onChoisir(r.pcode)
  }

  return (
    <div className="search" ref={zone}>
      <Icone nom="loupe" />
      <input
        placeholder="Rechercher un gouvernorat…"
        autoComplete="off"
        aria-label="Rechercher un gouvernorat"
        value={texte}
        onChange={(e) => { setTexte(e.target.value); setOuvert(true) }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && resultats[0]) choisir(resultats[0])
          if (e.key === 'Escape') { setOuvert(false); e.currentTarget.blur() }
        }}
      />
      {ouvert && q && (
        <div className="sres on glass">
          {resultats.length ? (
            resultats.map((r, k) => {
              const b = base(culture, r.pcode)
              return (
                <button key={r.pcode} type="button" className={k === 0 ? 'act' : ''} onClick={() => choisir(r)}>
                  <Pastille cls={b == null ? 'na' : classe(b, CULTURES[culture].th)} />
                  <span>{r.nom}</span>
                  <span className="ar">{r.nom_ar}</span>
                </button>
              )
            })
          ) : (
            <div style={{ padding: 10, color: 'var(--dim)', fontSize: 13 }}>Aucun gouvernorat trouvé</div>
          )}
        </div>
      )}
    </div>
  )
}
