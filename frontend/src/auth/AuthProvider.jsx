import { useCallback, useEffect, useMemo, useState } from 'react'
import api, { jetons } from '../api/client.js'
import { AuthContext } from './AuthContext.js'

export default function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null)
  // Tant qu'on vérifie un jeton déjà enregistré, on n'affiche pas les pages protégées.
  const [chargement, setChargement] = useState(() => Boolean(jetons.acces()))

  // Au démarrage : si un jeton existe, on récupère le profil.
  useEffect(() => {
    if (!jetons.acces()) return
    api
      .get('/comptes/profil/')
      .then(({ data }) => setUtilisateur(data))
      .catch(() => jetons.effacer())
      .finally(() => setChargement(false))
  }, [])

  // Si le renouvellement du jeton échoue, la session est terminée.
  useEffect(() => {
    const finDeSession = () => setUtilisateur(null)
    window.addEventListener('session-expiree', finDeSession)
    return () => window.removeEventListener('session-expiree', finDeSession)
  }, [])

  const connexion = useCallback(async (identifiant, motDePasse) => {
    const { data } = await api.post('/comptes/connexion/', { username: identifiant, password: motDePasse })
    jetons.enregistrer(data)
    setUtilisateur(data.utilisateur)
    return data.utilisateur
  }, [])

  const inscription = useCallback((donnees) => api.post('/comptes/inscription/', donnees), [])

  const deconnexion = useCallback(async () => {
    try {
      await api.post('/comptes/deconnexion/', { refresh: jetons.rafraichissement() })
    } catch {
      // Même si le serveur ne répond pas, on termine la session côté navigateur.
    }
    jetons.effacer()
    setUtilisateur(null)
  }, [])

  const valeur = useMemo(
    () => ({ utilisateur, setUtilisateur, chargement, connexion, inscription, deconnexion }),
    [utilisateur, chargement, connexion, inscription, deconnexion],
  )

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>
}
