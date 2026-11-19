import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api, { erreursDeChamps } from '../api/client.js'
import { useAuth } from '../auth/useAuth.js'
import Champ from '../components/Champ.jsx'

const VIDE = { first_name: '', last_name: '', username: '', email: '', password1: '', password2: '' }

export default function InscriptionPage() {
  const { utilisateur, inscription } = useAuth()
  const navigate = useNavigate()
  const [donnees, setDonnees] = useState(VIDE)
  const [erreurs, setErreurs] = useState({})
  const [criteres, setCriteres] = useState([])
  const [etatVerification, setEtatVerification] = useState('vide') // vide | en-cours | ok | ko | indisponible
  const [envoi, setEnvoi] = useState(false)
  const revision = useRef(0)

  // Vérification du mot de passe en direct (repris d'Ayoub) : mêmes règles que le serveur, 300 ms après la frappe.
  const { username, first_name, last_name, email, password1 } = donnees
  useEffect(() => {
    const courante = ++revision.current
    const minuteur = setTimeout(
      async () => {
        try {
          const { data } = await api.post('/comptes/verifier-mot-de-passe/', {
            username, first_name, last_name, email, password1,
          })
          if (courante !== revision.current) return
          setCriteres(data.criteres)
          if (!password1) setEtatVerification('vide')
          else setEtatVerification(data.criteres.every((c) => c.valide) ? 'ok' : 'ko')
        } catch {
          if (courante === revision.current) setEtatVerification('indisponible')
        }
      },
      password1 ? 300 : 0,
    )
    return () => clearTimeout(minuteur)
  }, [username, first_name, last_name, email, password1])

  if (utilisateur) return <Navigate to="/espace" replace />

  const identiques = donnees.password1 !== '' && donnees.password1 === donnees.password2
  const peutEnvoyer = etatVerification === 'ok' && identiques && !envoi

  function modifier(evenement) {
    const { name, value } = evenement.target
    setDonnees((precedent) => ({ ...precedent, [name]: value }))
    if (name === 'password1' && value) setEtatVerification('en-cours')
  }

  async function envoyer(evenement) {
    evenement.preventDefault()
    if (!peutEnvoyer) return
    setEnvoi(true)
    setErreurs({})
    try {
      await inscription(donnees)
      navigate('/connexion', {
        state: { message: 'Votre compte a été créé avec succès. Vous pouvez vous connecter.' },
      })
    } catch (erreur) {
      setErreurs(erreursDeChamps(erreur))
      setEnvoi(false)
    }
  }

  const statut = {
    vide: 'Saisissez un mot de passe.',
    'en-cours': 'Vérification en cours…',
    ok: 'Tous les critères sont respectés.',
    ko: 'Complétez les critères indiqués en rouge.',
    indisponible: 'Vérification indisponible. Modifiez le champ pour réessayer.',
  }[etatVerification]

  return (
    <div className="page-inscription">
      <section className="carte-inscription" aria-labelledby="titre-inscription">
        <div className="introduction">
          <span className="surtitre">CULTIVONS DEMAIN</span>
          <h1 id="titre-inscription">
            Votre prochaine
            <br />
            récolte commence ici.
          </h1>
          <p className="description">
            Rejoignez Smart Agriculture Tunisia pour explorer le potentiel agricole de nos régions.
          </p>
          <div className="paysage" aria-hidden="true">
            <div className="soleil" />
            <div className="colline colline-arriere" />
            <div className="colline colline-avant" />
            <div className="sillons" />
          </div>
          <p className="legende">Des données pour éclairer vos choix.</p>
        </div>

        <div className="panneau-formulaire">
          <h2>Créer un compte</h2>
          <p className="intro-formulaire">Quelques informations pour commencer.</p>

          {Object.keys(erreurs).length > 0 && (
            <div className="resume-erreurs" role="alert">
              {erreurs.general ?? 'Votre compte n’a pas été créé. Vérifiez les champs indiqués ci-dessous.'}
            </div>
          )}

          <form onSubmit={envoyer} noValidate>
            <div className="champs">
              <Champ id="first_name" libelle="Prénom" autoComplete="given-name" demiLargeur required
                value={donnees.first_name} onChange={modifier} erreur={erreurs.first_name} />
              <Champ id="last_name" libelle="Nom" autoComplete="family-name" demiLargeur required
                value={donnees.last_name} onChange={modifier} erreur={erreurs.last_name} />
              <Champ id="username" libelle="Nom d’utilisateur" autoComplete="username" required
                aide="150 caractères maximum : lettres, chiffres et @ . + - _ uniquement."
                value={donnees.username} onChange={modifier} erreur={erreurs.username} />
              <Champ id="email" libelle="Adresse e-mail" type="email" autoComplete="email" required
                value={donnees.email} onChange={modifier} erreur={erreurs.email} />
              <Champ
                id="password1"
                libelle="Mot de passe"
                type="password"
                autoComplete="new-password"
                required
                value={donnees.password1}
                onChange={modifier}
                erreur={erreurs.password1}
                aide={
                  <>
                    <ul>
                      {criteres.map((critere) => (
                        <li
                          key={critere.texte}
                          className={
                            etatVerification === 'en-cours' ? 'regle-attente'
                              : critere.valide ? 'regle-valide' : 'regle-invalide'
                          }
                        >
                          {etatVerification !== 'en-cours' && (critere.valide ? '✓ ' : '✕ ')}
                          {critere.texte}
                        </li>
                      ))}
                    </ul>
                    <p role="status">{statut}</p>
                  </>
                }
              />
              <Champ
                id="password2"
                libelle="Confirmation du mot de passe"
                type="password"
                autoComplete="new-password"
                required
                value={donnees.password2}
                onChange={modifier}
                erreur={erreurs.password2}
                aide={
                  <span className={donnees.password2 ? (identiques ? 'regle-valide' : 'regle-invalide') : ''} aria-live="polite">
                    {!donnees.password2
                      ? 'Confirmez votre mot de passe.'
                      : identiques
                        ? '✓ Les mots de passe correspondent.'
                        : '✕ Les mots de passe ne correspondent pas encore.'}
                  </span>
                }
              />
            </div>
            <p className="note-obligatoire">Tous les champs sont obligatoires.</p>
            <button type="submit" className="bouton-principal" disabled={!peutEnvoyer}>
              {envoi ? 'Création…' : 'Créer mon compte'} <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="lien-compte">
            Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
