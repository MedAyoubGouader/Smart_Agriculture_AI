import axios from 'axios'

// Client HTTP unique pour l'API Django. En dev, Vite redirige /api vers le port 8000.
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// --- Jetons JWT (stockés dans le navigateur) -------------------------------------------
const CLE_ACCES = 'sa_jeton_acces'
const CLE_RAFRAICHISSEMENT = 'sa_jeton_rafraichissement'

export const jetons = {
  acces: () => localStorage.getItem(CLE_ACCES),
  rafraichissement: () => localStorage.getItem(CLE_RAFRAICHISSEMENT),
  enregistrer({ access, refresh }) {
    if (access) localStorage.setItem(CLE_ACCES, access)
    if (refresh) localStorage.setItem(CLE_RAFRAICHISSEMENT, refresh)
  },
  effacer() {
    localStorage.removeItem(CLE_ACCES)
    localStorage.removeItem(CLE_RAFRAICHISSEMENT)
  },
}

// Ajoute le jeton d'accès à chaque requête.
api.interceptors.request.use((config) => {
  const acces = jetons.acces()
  if (acces) config.headers.Authorization = `Bearer ${acces}`
  return config
})

// Quand le jeton d'accès a expiré (401), on le renouvelle une fois puis on rejoue la requête.
let renouvellementEnCours = null

api.interceptors.response.use(
  (reponse) => reponse,
  async (erreur) => {
    const requete = erreur.config
    const estRouteAuth = requete?.url?.includes('/comptes/connexion/') || requete?.url?.includes('/comptes/jeton/')
    if (erreur.response?.status !== 401 || requete._rejouee || estRouteAuth || !jetons.rafraichissement()) {
      return Promise.reject(erreur)
    }
    requete._rejouee = true
    try {
      renouvellementEnCours ??= axios
        .post('/api/comptes/jeton/rafraichir/', { refresh: jetons.rafraichissement() })
        .then(({ data }) => jetons.enregistrer(data))
        .finally(() => {
          renouvellementEnCours = null
        })
      await renouvellementEnCours
      return api(requete)
    } catch {
      jetons.effacer()
      window.dispatchEvent(new Event('session-expiree'))
      return Promise.reject(erreur)
    }
  },
)

// Transforme une erreur DRF ({champ: [messages]} ou {detail}) en objet {champ: "message"}.
export function erreursDeChamps(erreur) {
  const donnees = erreur?.response?.data
  if (!erreur?.response) return { general: 'Serveur injoignable. Réessayez dans un instant.' }
  if (!donnees || typeof donnees !== 'object') return { general: 'Une erreur est survenue.' }
  const resultat = {}
  for (const [champ, valeur] of Object.entries(donnees)) {
    const message = Array.isArray(valeur) ? valeur.join(' ') : String(valeur)
    resultat[champ === 'detail' || champ === 'non_field_errors' ? 'general' : champ] = message
  }
  return resultat
}

export default api
