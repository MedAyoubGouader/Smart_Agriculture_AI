import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

// Espace connecté : pas encore développé (sera fait selon la maquette « Smart Agriculture AI - App »).
export default function EspacePage() {
  const { utilisateur, deconnexion } = useAuth()
  const navigate = useNavigate()

  async function seDeconnecter() {
    await deconnexion()
    navigate('/', { replace: true })
  }

  return (
    <div className="page-vide">
      <p className="page-vide-titre">Pas encore traité</p>
      <p className="page-vide-texte">
        Connecté en tant que <strong>{utilisateur.first_name || utilisateur.username}</strong>.
      </p>
      <div className="page-vide-actions">
        <Link to="/">Retour à la carte</Link>
        <button type="button" className="bouton-texte" onClick={seDeconnecter}>Déconnexion</button>
      </div>
    </div>
  )
}
