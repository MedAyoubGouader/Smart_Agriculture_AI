import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'

// Page réservée aux utilisateurs connectés (et, si `role` est précisé, à ce rôle).
export default function RouteProtegee({ children, role }) {
  const { utilisateur, chargement } = useAuth()
  const location = useLocation()

  if (chargement) return <p className="chargement">Chargement…</p>
  if (!utilisateur) return <Navigate to="/connexion" replace state={{ suivant: location.pathname }} />
  if (role && utilisateur.role !== role) {
    return (
      <div className="page-compte">
        <section className="carte-compte">
          <h1>Accès refusé</h1>
          <p className="intro-formulaire">Cette page est réservée aux administrateurs.</p>
        </section>
      </div>
    )
  }
  return children
}
