import { useEffect, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import api from '../api/client.js'

// Centre et emprise approximatifs de la Tunisie
const CENTRE_TUNISIE = [34.0, 9.5]
const LIMITES_TUNISIE = [
  [30.0, 7.0],
  [37.6, 12.0],
]

export default function CartePage() {
  const [statut, setStatut] = useState({ etat: 'chargement', texte: 'Connexion à l’API…' })

  useEffect(() => {
    api
      .get('/core/health/')
      .then(({ data }) => setStatut({ etat: 'ok', texte: `API connectée · ${data.database}` }))
      .catch(() => setStatut({ etat: 'erreur', texte: 'API ou base de données injoignable' }))
  }, [])

  return (
    <div className="carte-page">
      <MapContainer
        center={CENTRE_TUNISIE}
        zoom={6}
        minZoom={5}
        maxBounds={LIMITES_TUNISIE}
        maxBoundsViscosity={0.8}
        className="carte"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      <div className={`statut-api statut-${statut.etat}`}>{statut.texte}</div>
    </div>
  )
}
