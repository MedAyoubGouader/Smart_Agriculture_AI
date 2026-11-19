import { useEffect, useRef, useState } from 'react'
import api from '../api/client.js'

/*
 * Vérification du mot de passe en direct (reprise d'Ayoub) : le serveur applique les mêmes règles que
 * lors de la création du compte, 300 ms après la frappe. Renvoie les critères et l'état de la vérification.
 */
export function useVerificationMotDePasse({ username, first_name, last_name, email, password1 }) {
  const [criteres, setCriteres] = useState([])
  const [resultat, setResultat] = useState({ pour: null, etat: 'vide' }) // vide | ok | ko | indisponible
  const revision = useRef(0)

  useEffect(() => {
    const courante = ++revision.current
    const minuteur = setTimeout(
      async () => {
        try {
          const { data } = await api.post('/comptes/verifier-mot-de-passe/', { username, first_name, last_name, email, password1 })
          if (courante !== revision.current) return
          setCriteres(data.criteres)
          setResultat({ pour: password1, etat: !password1 ? 'vide' : data.criteres.every((c) => c.valide) ? 'ok' : 'ko' })
        } catch {
          if (courante === revision.current) setResultat({ pour: password1, etat: 'indisponible' })
        }
      },
      password1 ? 300 : 0,
    )
    return () => clearTimeout(minuteur)
  }, [username, first_name, last_name, email, password1])

  // Tant que la réponse ne concerne pas le mot de passe actuellement saisi, on est « en cours ».
  const etat = password1 && resultat.pour !== password1 ? 'en-cours' : resultat.etat
  const statut = {
    vide: 'Saisissez un mot de passe.',
    'en-cours': 'Vérification en cours…',
    ok: 'Tous les critères sont respectés.',
    ko: 'Complétez les critères indiqués en rouge.',
    indisponible: 'Vérification indisponible. Modifiez le champ pour réessayer.',
  }[etat]

  return { criteres, etat, statut, valide: etat === 'ok' }
}
