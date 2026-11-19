import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { erreursDeChamps } from '../api/client.js'
import { useAuth } from '../auth/useAuth.js'
import Champ from '../components/Champ.jsx'

const MDP_VIDE = { ancien_mot_de_passe: '', nouveau_mot_de_passe1: '', nouveau_mot_de_passe2: '' }

export default function ProfilPage() {
  const { utilisateur, setUtilisateur } = useAuth()
  const [profil, setProfil] = useState({
    first_name: utilisateur.first_name,
    last_name: utilisateur.last_name,
    email: utilisateur.email,
  })
  const [erreursProfil, setErreursProfil] = useState({})
  const [messageProfil, setMessageProfil] = useState('')
  const [mdp, setMdp] = useState(MDP_VIDE)
  const [erreursMdp, setErreursMdp] = useState({})
  const [messageMdp, setMessageMdp] = useState('')

  async function enregistrerProfil(evenement) {
    evenement.preventDefault()
    setErreursProfil({})
    setMessageProfil('')
    try {
      const { data } = await api.patch('/comptes/profil/', profil)
      setUtilisateur(data)
      setMessageProfil('Profil enregistré.')
    } catch (erreur) {
      setErreursProfil(erreursDeChamps(erreur))
    }
  }

  async function changerMotDePasse(evenement) {
    evenement.preventDefault()
    setErreursMdp({})
    setMessageMdp('')
    try {
      await api.put('/comptes/profil/mot-de-passe/', mdp)
      setMdp(MDP_VIDE)
      setMessageMdp('Mot de passe modifié.')
    } catch (erreur) {
      setErreursMdp(erreursDeChamps(erreur))
    }
  }

  const modifierProfil = (e) => setProfil((p) => ({ ...p, [e.target.name]: e.target.value }))
  const modifierMdp = (e) => setMdp((m) => ({ ...m, [e.target.name]: e.target.value }))
  const membreDepuis = new Date(utilisateur.date_joined).toLocaleDateString('fr-FR', { dateStyle: 'long' })

  return (
    <div className="page-compte">
      <section className="carte-compte" aria-labelledby="titre-espace">
        <span className="surtitre">MON ESPACE</span>
        <h1 id="titre-espace">Bonjour {utilisateur.first_name || utilisateur.username} !</h1>
        <p className="intro-formulaire">
          Connecté en tant que <strong>{utilisateur.username}</strong>
          <span className="badge">{utilisateur.role_libelle}</span> · membre depuis le {membreDepuis}.
        </p>
        <ul className="navigation-compte">
          <li>
            <Link to="/">Consulter la carte agricole</Link>
          </li>
        </ul>
      </section>

      <section className="carte-compte" aria-labelledby="titre-profil">
        <h2 id="titre-profil">Mes informations</h2>
        {messageProfil && <p className="message-succes" role="status">{messageProfil}</p>}
        {erreursProfil.general && <div className="resume-erreurs" role="alert">{erreursProfil.general}</div>}
        <form onSubmit={enregistrerProfil} noValidate>
          <div className="champs">
            <Champ id="first_name" libelle="Prénom" demiLargeur required value={profil.first_name}
              onChange={modifierProfil} erreur={erreursProfil.first_name} />
            <Champ id="last_name" libelle="Nom" demiLargeur required value={profil.last_name}
              onChange={modifierProfil} erreur={erreursProfil.last_name} />
            <Champ id="email" libelle="Adresse e-mail" type="email" required value={profil.email}
              onChange={modifierProfil} erreur={erreursProfil.email} />
          </div>
          <button type="submit" className="bouton-principal">
            Enregistrer <span aria-hidden="true">→</span>
          </button>
        </form>
      </section>

      <section className="carte-compte" aria-labelledby="titre-mdp">
        <h2 id="titre-mdp">Changer mon mot de passe</h2>
        {messageMdp && <p className="message-succes" role="status">{messageMdp}</p>}
        {erreursMdp.general && <div className="resume-erreurs" role="alert">{erreursMdp.general}</div>}
        <form onSubmit={changerMotDePasse} noValidate>
          <Champ id="ancien_mot_de_passe" libelle="Mot de passe actuel" type="password"
            autoComplete="current-password" value={mdp.ancien_mot_de_passe} onChange={modifierMdp}
            erreur={erreursMdp.ancien_mot_de_passe} />
          <Champ id="nouveau_mot_de_passe1" libelle="Nouveau mot de passe" type="password"
            autoComplete="new-password" value={mdp.nouveau_mot_de_passe1} onChange={modifierMdp}
            erreur={erreursMdp.nouveau_mot_de_passe1} />
          <Champ id="nouveau_mot_de_passe2" libelle="Confirmation du nouveau mot de passe" type="password"
            autoComplete="new-password" value={mdp.nouveau_mot_de_passe2} onChange={modifierMdp}
            erreur={erreursMdp.nouveau_mot_de_passe2} />
          <button type="submit" className="bouton-principal"
            disabled={!mdp.ancien_mot_de_passe || !mdp.nouveau_mot_de_passe1 || !mdp.nouveau_mot_de_passe2}>
            Modifier le mot de passe <span aria-hidden="true">→</span>
          </button>
        </form>
      </section>
    </div>
  )
}
