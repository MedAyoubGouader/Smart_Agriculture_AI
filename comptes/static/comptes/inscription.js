// Django vérifie les mêmes règles que lors de la création du compte.
const form = document.getElementById("inscription-form");
const password = document.getElementById("id_password1");
const confirmation = document.getElementById("id_password2");
const button = document.getElementById("creation-button");
const statusMessage = document.getElementById("password-status");
const confirmationMessage = document.getElementById("id_password2_helptext");
const criteria = document.querySelectorAll("#id_password1_helptext li");
let passwordValid = false;
let timer;
let revision = 0;

function updateConfirmation() {
    const matches = password.value !== "" && password.value === confirmation.value;
    confirmation.setCustomValidity(matches ? "" : "Les mots de passe doivent être identiques.");
    confirmation.setAttribute("aria-invalid", String(!matches));
    confirmationMessage.className = matches ? "help-text rule-valid" : "help-text rule-invalid";
    confirmationMessage.textContent = matches
        ? "✓ Les mots de passe correspondent."
        : "✕ Les mots de passe ne correspondent pas encore.";
    button.disabled = !passwordValid || !matches;
}

function scheduleValidation() {
    clearTimeout(timer);
    const currentRevision = ++revision;
    passwordValid = false;
    updateConfirmation();
    criteria.forEach(item => { item.className = "rule-pending"; });
    statusMessage.textContent = password.value ? "Vérification en cours…" : "Saisissez un mot de passe.";
    if (!password.value) {
        criteria.forEach(item => { item.className = "rule-invalid"; });
        return;
    }
    timer = setTimeout(async () => {
        try {
            // Le mot de passe est envoyé dans le corps POST, jamais dans l’URL.
            const data = new FormData();
            ["username", "first_name", "last_name", "email", "password1", "csrfmiddlewaretoken"].forEach(name => {
                data.append(name, form.elements[name].value);
            });
            const response = await fetch(form.dataset.validationUrl, {
                method: "POST", body: data, mode: "same-origin", cache: "no-store"
            });
            if (!response.ok) throw new Error("Validation indisponible");
            const result = await response.json();
            if (currentRevision !== revision) return;
            result.criteres.forEach((rule, index) => {
                criteria[index].className = rule.valide ? "rule-valid" : "rule-invalid";
                criteria[index].textContent = (rule.valide ? "✓ " : "✕ ") + rule.texte;
            });
            passwordValid = result.criteres.every(rule => rule.valide);
            statusMessage.textContent = passwordValid ? "Tous les critères sont respectés." : "Complétez les critères indiqués en rouge.";
            updateConfirmation();
        } catch (error) {
            if (currentRevision !== revision) return;
            statusMessage.textContent = "Vérification indisponible. Modifiez le champ pour réessayer.";
            button.disabled = true;
        }
    }, 300);
}

["username", "first_name", "last_name", "email", "password1"].forEach(name => {
    form.elements[name].addEventListener("input", scheduleValidation);
});
confirmation.addEventListener("input", updateConfirmation);
form.addEventListener("submit", event => {
    if (!passwordValid || password.value !== confirmation.value) event.preventDefault();
});
scheduleValidation();
