// Champ de formulaire avec libellé, aide et message d'erreur (accessible).
export default function Champ({ id, libelle, erreur, aide, demiLargeur = false, ...props }) {
  const idAide = aide ? `${id}-aide` : undefined
  const idErreur = erreur ? `${id}-erreur` : undefined
  return (
    <div className={demiLargeur ? 'champ demi-largeur' : 'champ'}>
      <label htmlFor={id}>{libelle}</label>
      <input
        id={id}
        name={id}
        aria-invalid={erreur ? 'true' : undefined}
        aria-describedby={[idAide, idErreur].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {aide && (
        <div className="aide" id={idAide}>
          {aide}
        </div>
      )}
      {erreur && (
        <p className="erreur-champ" id={idErreur}>
          {erreur}
        </p>
      )}
    </div>
  )
}
