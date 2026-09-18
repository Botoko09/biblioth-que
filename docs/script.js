const API = 'http://localhost:3000/api';

let pageActuelle = 1;
const LIMITE_LIVRES = 10;

function echapperHTML(valeur) {
    return String(valeur ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formaterDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return 'N/A';
    }

    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

async function lireReponse(response) {
    const texte = await response.text();

    if (!texte) {
        return {};
    }

    try {
        return JSON.parse(texte);
    } catch {
        return { message: texte };
    }
}

function afficherMessage(id, message, type = 'error') {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = message || '';
    element.className = `message ${type}`;

    if (message) {
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 4000);
    }
}

async function chargerStatistiques() {
    const element = document.getElementById('statistiques');

    if (!element) return;

    try {
        const response = await fetch(`${API}/statistiques`);
        const data = await lireReponse(response);

        if (!response.ok) {
            throw new Error(data.message || 'Erreur');
        }

        element.innerHTML = `
            <div class="statistique">
                <span>Total des livres</span>
                <strong>${echapperHTML(data.total_livres)}</strong>
            </div>
            <div class="statistique">
                <span>Total des membres</span>
                <strong>${echapperHTML(data.total_membres)}</strong>
            </div>
            <div class="statistique">
                <span>Emprunts en cours</span>
                <strong>${echapperHTML(data.emprunts_en_cours)}</strong>
            </div>
            <div class="statistique">
                <span>Emprunts en retard</span>
                <strong>${echapperHTML(data.emprunts_en_retard)}</strong>
            </div>
            <div class="statistique">
                <span>Livre le plus emprunté</span>
                <strong>${
                    data.livre_plus_emprunte
                        ? echapperHTML(data.livre_plus_emprunte.titre)
                        : 'Aucun'
                }</strong>
            </div>
            <div class="statistique">
                <span>Membre le plus actif</span>
                <strong>${
                    data.membre_plus_actif
                        ? echapperHTML(data.membre_plus_actif.nom)
                        : 'Aucun'
                }</strong>
            </div>
        `;
    } catch (error) {
        console.error(error);
        element.innerHTML = '<p>Impossible de charger les statistiques.</p>';
    }
}

async function chargerAuteurs() {
    const select = document.getElementById('auteur-livre');

    if (!select) return;

    try {
        const response = await fetch(`${API}/auteurs`);
        const auteurs = await lireReponse(response);

        if (!response.ok) {
            throw new Error(auteurs.message || 'Erreur');
        }

        select.innerHTML = '<option value="">Choisir un auteur</option>';

        auteurs.forEach(auteur => {
            select.insertAdjacentHTML(
                'beforeend',
                `<option value="${echapperHTML(auteur.id)}">${echapperHTML(auteur.nom)}</option>`
            );
        });
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

async function chargerListeAuteurs() {
    const element = document.getElementById('liste-auteurs');

    if (!element) return;

    try {
        const response = await fetch(`${API}/auteurs`);
        const auteurs = await lireReponse(response);

        if (!response.ok) {
            throw new Error(auteurs.message || 'Erreur');
        }

        if (auteurs.length === 0) {
            element.innerHTML = '<p>Aucun auteur enregistré.</p>';
            return;
        }

        element.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Nationalité</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${auteurs.map(auteur => `
                        <tr>
                            <td>${echapperHTML(auteur.nom)}</td>
                            <td>${echapperHTML(auteur.nationalite)}</td>
                            <td>
                                <div class="actions">
                                    <button type="button"
                                        onclick="modifierAuteur(${Number(auteur.id)}, '${echapperHTML(auteur.nom)}', '${echapperHTML(auteur.nationalite)}')">
                                        Modifier
                                    </button>
                                    <button type="button" class="danger"
                                        onclick="supprimerAuteur(${Number(auteur.id)})">
                                        Supprimer
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error(error);
        element.innerHTML = '<p>Impossible de charger les auteurs.</p>';
    }
}

async function chargerLivres() {
    const element = document.getElementById('liste-livres');

    if (!element) return;

    const rechercheElement = document.getElementById('recherche-livre');
    const recherche = rechercheElement ? rechercheElement.value.trim() : '';

    try {
        const url = `${API}/livres?recherche=${encodeURIComponent(recherche)}&page=${pageActuelle}&limite=${LIMITE_LIVRES}`;
        const response = await fetch(url);
        const data = await lireReponse(response);

        if (!response.ok) {
            throw new Error(data.message || 'Erreur');
        }

        const livres = Array.isArray(data) ? data : (data.livres || []);

        if (livres.length === 0) {
            element.innerHTML = '<p>Aucun livre trouvé.</p>';
        } else {
            element.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Titre</th>
                            <th>Auteur</th>
                            <th>Année</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${livres.map(livre => {
                            const disponible = livre.statut === 'available';

                            return `
                                <tr>
                                    <td>${echapperHTML(livre.titre)}</td>
                                    <td>${echapperHTML(livre.auteur_nom)}</td>
                                    <td>${echapperHTML(livre.annee_publication)}</td>
                                    <td>
                                        <span class="status ${disponible ? 'disponible' : 'emprunte'}">
                                            ${disponible ? 'Disponible' : 'Emprunté'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="actions">
                                            <button type="button"
                                                onclick="modifierLivre(
                                                    ${Number(livre.id)},
                                                    '${echapperHTML(livre.titre)}',
                                                    ${Number(livre.auteur_id)},
                                                    ${Number(livre.annee_publication)}
                                                )">
                                                Modifier
                                            </button>
                                            <button type="button" class="danger"
                                                onclick="supprimerLivre(${Number(livre.id)})">
                                                Supprimer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        const numeroPage = document.getElementById('numero-page');
        const precedent = document.getElementById('precedent');
        const suivant = document.getElementById('suivant');

        if (numeroPage) {
            numeroPage.textContent = `Page ${pageActuelle}`;
        }

        if (precedent) {
            precedent.disabled = pageActuelle <= 1;
        }

        if (suivant) {
            suivant.disabled = livres.length < LIMITE_LIVRES;
        }
    } catch (error) {
        console.error(error);
        element.innerHTML = '<p>Impossible de charger les livres.</p>';
    }
}

async function chargerMembres() {
    const element = document.getElementById('liste-membres');

    if (!element) return;

    try {
        const response = await fetch(`${API}/membres`);
        const membres = await lireReponse(response);

        if (!response.ok) {
            throw new Error(membres.message || 'Erreur');
        }

        if (membres.length === 0) {
            element.innerHTML = '<p>Aucun membre enregistré.</p>';
            return;
        }

        element.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Contact</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${membres.map(membre => `
                        <tr>
                            <td>${echapperHTML(membre.nom)}</td>
                            <td>${echapperHTML(membre.contact)}</td>
                            <td>
                                <div class="actions">
                                    <button type="button"
                                        onclick="modifierMembre(${Number(membre.id)}, '${echapperHTML(membre.nom)}', '${echapperHTML(membre.contact)}')">
                                        Modifier
                                    </button>
                                    <button type="button"
                                        onclick="voirHistorique(${Number(membre.id)})">
                                        Historique
                                    </button>
                                    <button type="button" class="danger"
                                        onclick="supprimerMembre(${Number(membre.id)})">
                                        Supprimer
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error(error);
        element.innerHTML = '<p>Impossible de charger les membres.</p>';
    }
}

async function chargerMembresPourEmprunt() {
    const select = document.getElementById('membre-emprunt');

    if (!select) return;

    try {
        const response = await fetch(`${API}/membres`);
        const membres = await lireReponse(response);

        if (!response.ok) {
            throw new Error(membres.message || 'Erreur');
        }

        select.innerHTML = '<option value="">Choisir un membre</option>';

        membres.forEach(membre => {
            select.insertAdjacentHTML(
                'beforeend',
                `<option value="${echapperHTML(membre.id)}">${echapperHTML(membre.nom)}</option>`
            );
        });
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

async function chargerLivresPourEmprunt() {
    const select = document.getElementById('livre-emprunt');

    if (!select) return;

    try {
        const response = await fetch(`${API}/livres?limite=100`);
        const data = await lireReponse(response);

        if (!response.ok) {
            throw new Error(data.message || 'Erreur');
        }

        const livres = Array.isArray(data) ? data : (data.livres || []);

        select.innerHTML = '<option value="">Choisir un livre</option>';

        livres
            .filter(livre => livre.statut === 'available')
            .forEach(livre => {
                select.insertAdjacentHTML(
                    'beforeend',
                    `<option value="${echapperHTML(livre.id)}">${echapperHTML(livre.titre)}</option>`
                );
            });
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

async function chargerEmprunts() {
    const element = document.getElementById('liste-emprunts');

    if (!element) return;

    try {
        const response = await fetch(`${API}/emprunts/en-cours`);
        const emprunts = await lireReponse(response);

        if (!response.ok) {
            throw new Error(emprunts.message || 'Erreur');
        }

        if (emprunts.length === 0) {
            element.innerHTML = '<p>Aucun emprunt en cours.</p>';
            return;
        }

        element.innerHTML = emprunts.map(emprunt => `
            <div class="emprunt">
                <h3>${echapperHTML(emprunt.livre_titre)}</h3>
                <p>Membre : ${echapperHTML(emprunt.membre_nom)}</p>
                <div class="emprunt-dates">
                    <span>Emprunté le : ${formaterDate(emprunt.date_emprunt)}</span>
                    <span>Retour prévu : ${formaterDate(emprunt.date_retour_prevue)}</span>
                </div>
                <button type="button" class="success"
                    onclick="retournerLivre(${Number(emprunt.id)})">
                    Retourner le livre
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        element.innerHTML = '<p>Impossible de charger les emprunts.</p>';
    }
}

async function chargerRetards() {
    const element = document.getElementById('liste-retards');

    if (!element) return;

    try {
        const response = await fetch(`${API}/emprunts/en-retard`);
        const emprunts = await lireReponse(response);

        if (!response.ok) {
            throw new Error(emprunts.message || 'Erreur');
        }

        if (emprunts.length === 0) {
            element.innerHTML = '<p>Aucun emprunt en retard.</p>';
            return;
        }

        element.innerHTML = emprunts.map(emprunt => `
            <div class="emprunt en-retard">
                <h3>${echapperHTML(emprunt.livre_titre)}</h3>
                <p>Membre : ${echapperHTML(emprunt.membre_nom)}</p>
                <div class="emprunt-dates">
                    <span>Emprunté le : ${formaterDate(emprunt.date_emprunt)}</span>
                    <span>Retour prévu : ${formaterDate(emprunt.date_retour_prevue)}</span>
                </div>
                <button type="button" class="success"
                    onclick="retournerLivre(${Number(emprunt.id)})">
                    Retourner le livre
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        element.innerHTML = '<p>Impossible de charger les retards.</p>';
    }
}

async function retournerLivre(id) {
    if (!confirm('Confirmer le retour de ce livre ?')) return;

    try {
        const response = await fetch(`${API}/emprunts/${id}/retour`, {
            method: 'PUT'
        });

        const data = await lireReponse(response);

        if (!response.ok) {
            alert(data.message || 'Impossible de retourner le livre.');
            return;
        }

        alert('Livre retourné avec succès.');

        await Promise.all([
            chargerEmprunts(),
            chargerRetards(),
            chargerLivresPourEmprunt(),
            chargerLivres(),
            chargerStatistiques()
        ]);
    } catch (error) {
        console.error(error);
        alert('Erreur lors du retour du livre.');
    }
}

async function voirHistorique(id) {
    try {
        const response = await fetch(`${API}/emprunts/membre/${id}/historique`);
        const historique = await lireReponse(response);

        if (!response.ok) {
            throw new Error(historique.message || 'Erreur');
        }

        if (historique.length === 0) {
            alert('Aucun historique pour ce membre.');
            return;
        }

        const message = historique.map(emprunt => {
            const retour = emprunt.date_retour
                ? formaterDate(emprunt.date_retour)
                : 'Pas encore retourné';

            return [
                `Livre : ${emprunt.livre_titre}`,
                `Emprunt : ${formaterDate(emprunt.date_emprunt)}`,
                `Retour prévu : ${formaterDate(emprunt.date_retour_prevue)}`,
                `Retour : ${retour}`
            ].join('\n');
        }).join('\n\n');

        alert(`Historique des emprunts :\n\n${message}`);
    } catch (error) {
        console.error(error);
        alert('Impossible de charger l’historique.');
    }
}

async function envoyerFormulaireAuteur(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const id = document.getElementById('id-auteur').value;
    const nom = document.getElementById('nom-auteur').value.trim();
    const nationalite = document.getElementById('nationalite-auteur').value.trim();

    if (!nom || !nationalite) {
        afficherMessage('message-auteur', 'Tous les champs sont obligatoires.');
        return;
    }

    const url = id ? `${API}/auteurs/${id}` : `${API}/auteurs`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, nationalite })
        });

        const data = await lireReponse(response);

        if (!response.ok) {
            afficherMessage('message-auteur', data.message || 'Opération impossible.');
            return;
        }

        afficherMessage(
            'message-auteur',
            id ? 'Auteur modifié avec succès.' : 'Auteur ajouté avec succès.',
            'success'
        );

        form.reset();
        annulerModificationAuteur();

        await Promise.all([
            chargerListeAuteurs(),
            chargerAuteurs()
        ]);
    } catch (error) {
        console.error(error);
        afficherMessage('message-auteur', 'Erreur de communication avec le serveur.');
    }
}

function modifierAuteur(id, nom, nationalite) {
    document.getElementById('id-auteur').value = id;
    document.getElementById('nom-auteur').value = nom;
    document.getElementById('nationalite-auteur').value = nationalite;

    document.getElementById('titre-form-auteur').textContent = 'Modifier un auteur';
    document.getElementById('bouton-auteur').textContent = 'Enregistrer les modifications';
    document.getElementById('annuler-auteur').hidden = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function annulerModificationAuteur() {
    const form = document.getElementById('form-auteur');
    if (!form) return;

    form.reset();
    document.getElementById('id-auteur').value = '';
    document.getElementById('titre-form-auteur').textContent = 'Ajouter un auteur';
    document.getElementById('bouton-auteur').textContent = "Ajouter l'auteur";
    document.getElementById('annuler-auteur').hidden = true;
}

async function supprimerAuteur(id) {
    if (!confirm('Supprimer cet auteur ?')) return;

    try {
        const response = await fetch(`${API}/auteurs/${id}`, {
            method: 'DELETE'
        });

        const data = await lireReponse(response);

        if (!response.ok) {
            alert(data.message || 'Impossible de supprimer l’auteur.');
            return;
        }

        alert('Auteur supprimé avec succès.');

        await Promise.all([
            chargerListeAuteurs(),
            chargerAuteurs()
        ]);
    } catch (error) {
        console.error(error);
        alert('Erreur lors de la suppression de l’auteur.');
    }
}

async function envoyerFormulaireLivre(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const id = document.getElementById('id-livre').value;
    const titre = document.getElementById('titre-livre').value.trim();
    const auteur_id = document.getElementById('auteur-livre').value;
    const annee_publication = document.getElementById('annee-livre').value;

    if (!titre || !auteur_id || !annee_publication) {
        afficherMessage('message-livre', 'Tous les champs sont obligatoires.');
        return;
    }

    const url = id ? `${API}/livres/${id}` : `${API}/livres`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titre,
                auteur_id,
                annee_publication
            })
        });

        const data = await lireReponse(response);

        if (!response.ok) {
            afficherMessage('message-livre', data.message || 'Opération impossible.');
            return;
        }

        afficherMessage(
            'message-livre',
            id ? 'Livre modifié avec succès.' : 'Livre ajouté avec succès.',
            'success'
        );

        form.reset();
        annulerModificationLivre();

        await Promise.all([
            chargerLivres(),
            chargerLivresPourEmprunt()
        ]);
    } catch (error) {
        console.error(error);
        afficherMessage('message-livre', 'Erreur de communication avec le serveur.');
    }
}

function modifierLivre(id, titre, auteurId, annee) {
    document.getElementById('id-livre').value = id;
    document.getElementById('titre-livre').value = titre;
    document.getElementById('auteur-livre').value = auteurId;
    document.getElementById('annee-livre').value = annee;

    document.getElementById('titre-form-livre').textContent = 'Modifier un livre';
    document.getElementById('bouton-livre').textContent = 'Enregistrer les modifications';
    document.getElementById('annuler-livre').hidden = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function annulerModificationLivre() {
    const form = document.getElementById('form-livre');
    if (!form) return;

    form.reset();
    document.getElementById('id-livre').value = '';
    document.getElementById('titre-form-livre').textContent = 'Ajouter un livre';
    document.getElementById('bouton-livre').textContent = 'Ajouter le livre';
    document.getElementById('annuler-livre').hidden = true;
}

async function supprimerLivre(id) {
    if (!confirm('Supprimer ce livre ?')) return;

    try {
        const response = await fetch(`${API}/livres/${id}`, {
            method: 'DELETE'
        });

        const data = await lireReponse(response);

        if (!response.ok) {
            alert(data.message || 'Impossible de supprimer le livre.');
            return;
        }

        alert('Livre supprimé avec succès.');

        await Promise.all([
            chargerLivres(),
            chargerLivresPourEmprunt()
        ]);
    } catch (error) {
        console.error(error);
        alert('Erreur lors de la suppression du livre.');
    }
}

async function envoyerFormulaireMembre(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const id = document.getElementById('id-membre').value;
    const nom = document.getElementById('nom-membre').value.trim();
    const contact = document.getElementById('contact-membre').value.trim();

    if (!nom || !contact) {
        afficherMessage('message-membre', 'Tous les champs sont obligatoires.');
        return;
    }

    const url = id ? `${API}/membres/${id}` : `${API}/membres`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, contact })
        });

        const data = await lireReponse(response);

        if (!response.ok) {
            afficherMessage('message-membre', data.message || 'Opération impossible.');
            return;
        }

        afficherMessage(
            'message-membre',
            id ? 'Membre modifié avec succès.' : 'Membre ajouté avec succès.',
            'success'
        );

        form.reset();
        annulerModificationMembre();

        await Promise.all([
            chargerMembres(),
            chargerMembresPourEmprunt()
        ]);
    } catch (error) {
        console.error(error);
        afficherMessage('message-membre', 'Erreur de communication avec le serveur.');
    }
}

function modifierMembre(id, nom, contact) {
    document.getElementById('id-membre').value = id;
    document.getElementById('nom-membre').value = nom;
    document.getElementById('contact-membre').value = contact;

    document.getElementById('titre-form-membre').textContent = 'Modifier un membre';
    document.getElementById('bouton-membre').textContent = 'Enregistrer les modifications';
    document.getElementById('annuler-membre').hidden = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function annulerModificationMembre() {
    const form = document.getElementById('form-membre');
    if (!form) return;

    form.reset();
    document.getElementById('id-membre').value = '';
    document.getElementById('titre-form-membre').textContent = 'Ajouter un membre';
    document.getElementById('bouton-membre').textContent = 'Ajouter le membre';
    document.getElementById('annuler-membre').hidden = true;
}

async function supprimerMembre(id) {
    if (!confirm('Supprimer ce membre ?')) return;

    try {
        const response = await fetch(`${API}/membres/${id}`, {
            method: 'DELETE'
        });

        const data = await lireReponse(response);

        if (!response.ok) {
            alert(data.message || 'Impossible de supprimer le membre.');
            return;
        }

        alert('Membre supprimé avec succès.');

        await Promise.all([
            chargerMembres(),
            chargerMembresPourEmprunt()
        ]);
    } catch (error) {
        console.error(error);
        alert('Erreur lors de la suppression du membre.');
    }
}

async function envoyerFormulaireEmprunt(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const membre_id = document.getElementById('membre-emprunt').value;
    const livre_id = document.getElementById('livre-emprunt').value;
    const date_retour_prevue = document.getElementById('date-retour').value;

    if (!membre_id || !livre_id || !date_retour_prevue) {
        afficherMessage(
            'message-emprunt',
            'Tous les champs sont obligatoires.'
        );
        return;
    }

    try {
        const response = await fetch(`${API}/emprunts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                membre_id,
                livre_id,
                date_retour_prevue
            })
        });

        const data = await lireReponse(response);

        if (!response.ok) {
            afficherMessage('message-emprunt', data.message || 'Impossible d’enregistrer l’emprunt.');
            return;
        }

        afficherMessage(
            'message-emprunt',
            'Emprunt enregistré avec succès.',
            'success'
        );

        form.reset();

        await Promise.all([
            chargerEmprunts(),
            chargerRetards(),
            chargerLivresPourEmprunt(),
            chargerLivres(),
            chargerStatistiques()
        ]);
    } catch (error) {
        console.error(error);
        afficherMessage(
            'message-emprunt',
            'Erreur de communication avec le serveur.'
        );
    }
}

function initialiserEvenements() {
    const formAuteur = document.getElementById('form-auteur');
    if (formAuteur) {
        formAuteur.addEventListener('submit', envoyerFormulaireAuteur);
        document.getElementById('annuler-auteur')
            ?.addEventListener('click', annulerModificationAuteur);
    }

    const formLivre = document.getElementById('form-livre');
    if (formLivre) {
        formLivre.addEventListener('submit', envoyerFormulaireLivre);
        document.getElementById('annuler-livre')
            ?.addEventListener('click', annulerModificationLivre);

        document.getElementById('bouton-recherche')
            ?.addEventListener('click', () => {
                pageActuelle = 1;
                chargerLivres();
            });

        document.getElementById('recherche-livre')
            ?.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    pageActuelle = 1;
                    chargerLivres();
                }
            });

        document.getElementById('precedent')
            ?.addEventListener('click', () => {
                if (pageActuelle > 1) {
                    pageActuelle--;
                    chargerLivres();
                }
            });

        document.getElementById('suivant')
            ?.addEventListener('click', () => {
                pageActuelle++;
                chargerLivres();
            });
    }

    const formMembre = document.getElementById('form-membre');
    if (formMembre) {
        formMembre.addEventListener('submit', envoyerFormulaireMembre);
        document.getElementById('annuler-membre')
            ?.addEventListener('click', annulerModificationMembre);
    }

    const formEmprunt = document.getElementById('form-emprunt');
    if (formEmprunt) {
        formEmprunt.addEventListener('submit', envoyerFormulaireEmprunt);
    }
}

async function initialiser() {
    initialiserEvenements();

    await Promise.all([
        chargerStatistiques(),
        chargerAuteurs(),
        chargerListeAuteurs(),
        chargerLivres(),
        chargerMembres(),
        chargerMembresPourEmprunt(),
        chargerLivresPourEmprunt(),
        chargerEmprunts(),
        chargerRetards()
    ]);
}

document.addEventListener('DOMContentLoaded', initialiser);
