import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'

// Page réservée aux utilisateurs connectés (et, si `role` est précisé, à ce rôle).
// Sans connexion : retour à la carte avec la fenêtre de connexion ouverte, puis retour ici après connexion.
export default function RouteProtegee({ children, role }) {
  const { utilisateur, chargement } = useAuth()
  const location = useLocation()

  if (chargement) return <p className="chargement">Chargement…</p>
  if (!utilisateur) return <Navigate to="/" replace state={{ auth: 'connexion', suivant: location.pathname }} />
  if (role && utilisateur.role !== role) {
    return (
      <div className="page-vide">
        <p className="page-vide-titre">Accès refusé</p>
        <p className="page-vide-texte">Cette page est réservée aux administrateurs.</p>
        <div className="page-vide-actions"><Link to="/">Retour à la carte</Link></div>
      </div>
    )
  }
  return children
}
