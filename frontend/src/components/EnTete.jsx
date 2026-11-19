import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export default function EnTete() {
  const { utilisateur, deconnexion } = useAuth()
  const navigate = useNavigate()

  async function seDeconnecter() {
    await deconnexion()
    navigate('/connexion', { state: { message: 'Vous êtes déconnecté.' } })
  }

  return (
    <header className="entete">
      <Link className="logo" to="/">
        <span className="logo-icone" aria-hidden="true">✳</span>
        <span>
          Smart Agriculture<small>TUNISIA</small>
        </span>
      </Link>
      <nav aria-label="Navigation principale" className="nav">
        <NavLink to="/" end>
          Carte agricole
        </NavLink>
      </nav>
      <div className="nav-actions">
        {utilisateur ? (
          <>
            <NavLink className="bouton secondaire" to="/espace">
              Mon espace
            </NavLink>
            <button type="button" className="bouton-texte" onClick={seDeconnecter}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <NavLink to="/connexion">Connexion</NavLink>
            <NavLink className="bouton" to="/inscription">
              Créer un compte
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}
