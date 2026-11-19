import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { erreursDeChamps } from '../api/client.js'
import { useAuth } from '../auth/useAuth.js'
import Champ from '../components/Champ.jsx'

export default function ConnexionPage() {
  const { utilisateur, connexion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifiant, setIdentifiant] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreurs, setErreurs] = useState({})
  const [envoi, setEnvoi] = useState(false)

  if (utilisateur) return <Navigate to={location.state?.suivant ?? '/profil'} replace />

  async function envoyer(evenement) {
    evenement.preventDefault()
    setEnvoi(true)
    setErreurs({})
    try {
      await connexion(identifiant.trim(), motDePasse)
      navigate(location.state?.suivant ?? '/profil', { replace: true })
    } catch (erreur) {
      setErreurs(erreursDeChamps(erreur))
      setEnvoi(false)
    }
  }

  return (
    <div className="page-compte">
      <section className="carte-compte" aria-labelledby="titre-connexion">
        <span className="surtitre">BIENVENUE</span>
        <h1 id="titre-connexion">Se connecter</h1>
        <p className="intro-formulaire">Retrouvez votre espace Smart Agriculture.</p>

        {location.state?.message && (
          <p className="message-succes" role="status">
            {location.state.message}
          </p>
        )}
        {erreurs.general && (
          <div className="resume-erreurs" role="alert">
            {erreurs.general}
          </div>
        )}

        <form onSubmit={envoyer} noValidate>
          <Champ
            id="username"
            libelle="Nom d’utilisateur ou adresse e-mail"
            autoComplete="username"
            autoFocus
            required
            value={identifiant}
            onChange={(e) => setIdentifiant(e.target.value)}
            erreur={erreurs.username}
          />
          <Champ
            id="password"
            libelle="Mot de passe"
            type="password"
            autoComplete="current-password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            erreur={erreurs.password}
          />
          <button type="submit" className="bouton-principal" disabled={envoi || !identifiant || !motDePasse}>
            {envoi ? 'Connexion…' : 'Se connecter'} <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="lien-compte">
          Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
        </p>
      </section>
    </div>
  )
}
