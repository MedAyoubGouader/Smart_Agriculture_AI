import { useState } from 'react'
import { erreursDeChamps } from '../api/client.js'
import { useAuth } from '../auth/useAuth.js'
import { useVerificationMotDePasse } from '../auth/useVerificationMotDePasse.js'
import Champ from '../components/Champ.jsx'
import { Icone } from './elements.jsx'

const VIDE = { first_name: '', last_name: '', username: '', email: '', password1: '', password2: '' }

function BoutonAfficher({ visible, onClick }) {
  return (
    <button type="button" className="afficher-mdp" onClick={onClick} aria-pressed={visible}>
      {visible ? 'Masquer' : 'Afficher'}
    </button>
  )
}

function FormulaireConnexion({ message, identifiantInitial, onConnecte, onInscription }) {
  const { connexion } = useAuth()
  const [identifiant, setIdentifiant] = useState(identifiantInitial)
  const [motDePasse, setMotDePasse] = useState('')
  const [visible, setVisible] = useState(false)
  const [erreurs, setErreurs] = useState({})
  const [envoi, setEnvoi] = useState(false)

  async function envoyer(e) {
    e.preventDefault()
    setEnvoi(true)
    setErreurs({})
    try {
      await connexion(identifiant.trim(), motDePasse)
      onConnecte()
    } catch (erreur) {
      setErreurs(erreursDeChamps(erreur))
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={envoyer} noValidate className="formulaire-compte">
      <h2 id="titre-modale">Bon retour</h2>
      <p className="intro">Retrouvez votre espace Smart Agriculture.</p>
      {message && <p className="message-ok" role="status">{message}</p>}
      {erreurs.general && <div className="message-erreur" role="alert">{erreurs.general}</div>}
      <Champ id="username" libelle="Nom d’utilisateur ou adresse e-mail" autoComplete="username" autoFocus required
        placeholder="nom@exemple.tn" value={identifiant} onChange={(e) => setIdentifiant(e.target.value)} erreur={erreurs.username} />
      <div className="champ-mdp">
        <Champ id="password" libelle="Mot de passe" type={visible ? 'text' : 'password'} autoComplete="current-password" required
          placeholder="••••••••" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} erreur={erreurs.password} />
        <BoutonAfficher visible={visible} onClick={() => setVisible((v) => !v)} />
      </div>
      <button type="submit" className="btn-gold envoyer" disabled={envoi || !identifiant || !motDePasse}>
        {envoi ? 'Connexion…' : 'Se connecter'} <Icone nom="chevronDroite" taille={16} />
      </button>
      <p className="bascule">Pas encore de compte ? <button type="button" onClick={onInscription}>Créer un compte</button></p>
    </form>
  )
}

function FormulaireInscription({ onCree, onConnexion }) {
  const { inscription } = useAuth()
  const [donnees, setDonnees] = useState(VIDE)
  const [visible, setVisible] = useState(false)
  const [erreurs, setErreurs] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const verification = useVerificationMotDePasse(donnees)
  const identiques = donnees.password1 !== '' && donnees.password1 === donnees.password2
  const peutEnvoyer = verification.valide && identiques && !envoi

  const modifier = (e) => setDonnees((d) => ({ ...d, [e.target.name]: e.target.value }))

  async function envoyer(e) {
    e.preventDefault()
    if (!peutEnvoyer) return
    setEnvoi(true)
    setErreurs({})
    try {
      await inscription(donnees)
      onCree(donnees.email)
    } catch (erreur) {
      setErreurs(erreursDeChamps(erreur))
      setEnvoi(false)
    }
  }

  const typeMdp = visible ? 'text' : 'password'
  return (
    <form onSubmit={envoyer} noValidate className="formulaire-compte">
      <h2 id="titre-modale">Créer un compte</h2>
      <p className="intro">Quelques informations pour commencer.</p>
      {Object.keys(erreurs).length > 0 && (
        <div className="message-erreur" role="alert">
          {erreurs.general ?? 'Votre compte n’a pas été créé. Vérifiez les champs indiqués ci-dessous.'}
        </div>
      )}
      <div className="champs">
        <Champ id="first_name" libelle="Prénom" autoComplete="given-name" autoFocus demiLargeur required placeholder="Amine"
          value={donnees.first_name} onChange={modifier} erreur={erreurs.first_name} />
        <Champ id="last_name" libelle="Nom" autoComplete="family-name" demiLargeur required placeholder="Ben Salah"
          value={donnees.last_name} onChange={modifier} erreur={erreurs.last_name} />
        <Champ id="username" libelle="Nom d’utilisateur" autoComplete="username" required
          aide="Lettres, chiffres et @ . + - _ uniquement."
          value={donnees.username} onChange={modifier} erreur={erreurs.username} />
        <Champ id="email" libelle="Adresse e-mail" type="email" autoComplete="email" required placeholder="nom@exemple.tn"
          value={donnees.email} onChange={modifier} erreur={erreurs.email} />
        <div className="champ-mdp pleine-largeur">
          <Champ
            id="password1"
            libelle="Mot de passe"
            type={typeMdp}
            autoComplete="new-password"
            required
            value={donnees.password1}
            onChange={modifier}
            erreur={erreurs.password1}
            aide={
              <>
                <ul className="criteres">
                  {verification.criteres.map((c) => (
                    <li key={c.texte} className={verification.etat === 'en-cours' ? 'attente' : c.valide ? 'valide' : 'invalide'}>
                      {verification.etat !== 'en-cours' && (c.valide ? '✓ ' : '✕ ')}
                      {c.texte}
                    </li>
                  ))}
                </ul>
                <p role="status">{verification.statut}</p>
              </>
            }
          />
          <BoutonAfficher visible={visible} onClick={() => setVisible((v) => !v)} />
        </div>
        <Champ
          id="password2"
          libelle="Confirmation du mot de passe"
          type={typeMdp}
          autoComplete="new-password"
          required
          value={donnees.password2}
          onChange={modifier}
          erreur={erreurs.password2}
          aide={
            <span className={donnees.password2 ? (identiques ? 'valide' : 'invalide') : ''} aria-live="polite">
              {!donnees.password2
                ? 'Confirmez votre mot de passe.'
                : identiques ? '✓ Les mots de passe correspondent.' : '✕ Les mots de passe ne correspondent pas encore.'}
            </span>
          }
        />
      </div>
      <button type="submit" className="btn-gold envoyer" disabled={!peutEnvoyer}>
        {envoi ? 'Création…' : 'Créer mon compte'} <Icone nom="chevronDroite" taille={16} />
      </button>
      <p className="bascule">Déjà inscrit ? <button type="button" onClick={onConnexion}>Se connecter</button></p>
    </form>
  )
}

// Fenêtre de connexion / inscription affichée par-dessus la carte (style de la carte publique).
export default function ModaleCompte({ onglet, onOnglet, onFermer, onConnecte }) {
  const [message, setMessage] = useState('')
  const [identifiant, setIdentifiant] = useState('')

  function compteCree(email) {
    setIdentifiant(email)
    setMessage('Votre compte a été créé avec succès. Vous pouvez vous connecter.')
    onOnglet('connexion')
  }

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="modal modale-compte glass" role="dialog" aria-modal="true" aria-labelledby="titre-modale">
        <div className="mc-h">
          <div className="logo">
            <div className="mark"><i /></div>
            <span>Smart Agriculture AI</span>
          </div>
          <button type="button" className="ibtn" title="Fermer" onClick={onFermer}><Icone nom="croix" /></button>
        </div>
        <div className="onglets" role="tablist" aria-label="Compte">
          <button type="button" role="tab" aria-selected={onglet === 'connexion'} className={onglet === 'connexion' ? 'on' : ''}
            onClick={() => onOnglet('connexion')}>Connexion</button>
          <button type="button" role="tab" aria-selected={onglet === 'inscription'} className={onglet === 'inscription' ? 'on' : ''}
            onClick={() => onOnglet('inscription')}>Inscription</button>
        </div>
        <div className="mc-b">
          {onglet === 'connexion' ? (
            <FormulaireConnexion
              key={identifiant}
              message={message}
              identifiantInitial={identifiant}
              onConnecte={onConnecte}
              onInscription={() => { setMessage(''); onOnglet('inscription') }}
            />
          ) : (
            <FormulaireInscription onCree={compteCree} onConnexion={() => onOnglet('connexion')} />
          )}
        </div>
        <div className="mc-f">
          <button type="button" className="lien-discret" onClick={onFermer}>Explorer la carte sans compte</button>
        </div>
      </div>
    </div>
  )
}
