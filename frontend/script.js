const API = 'http://localhost:3000/api';

let pageActuelle = 1;

function formaterDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

async function chargerStatistiques() {
    const element = document.getElementById('statistiques');

    if (!element) {
        return;
    }

    try {
        const response = await fetch(`${API}/statistiques`);

        if (!response.ok) {
            throw new Error('Erreur lors du chargement des statistiques');
        }

        const data = await response.json();

        element.innerHTML = `
            <div class="statistique">
                <span>Total des livres</span>
                <strong>${data.total_livres}</strong>
            </div>

            <div class="statistique">
                <span>Total des membres</span>
                <strong>${data.total_membres}</strong>
            </div>

            <div class="statistique">
                <span>Emprunts en cours</span>
                <strong>${data.emprunts_en_cours}</strong>
            </div>

            <div class="statistique">
                <span>Emprunts en retard</span>
                <strong>${data.emprunts_en_retard}</strong>
            </div>

            <div class="statistique">
                <span>Livre le plus emprunté</span>
                <strong>
                    ${data.livre_plus_emprunte
                        ? data.livre_plus_emprunte.titre
                        : 'Aucun'}
                </strong>
            </div>

            <div class="statistique">
                <span>Membre le plus actif</span>
                <strong>
                    ${data.membre_plus_actif
                        ? data.membre_plus_actif.nom
                        : 'Aucun'}
                </strong>
            </div>
        `;
    } catch (error) {
        element.innerHTML = '<p>Impossible de charger les statistiques.</p>';
    }
}

async function chargerAuteurs() {
    const select = document.getElementById('auteur-livre');

    if (!select) {
        return;
    }

    try {
        const response = await fetch(`${API}/auteurs`);

        if (!response.ok) {
            throw new Error('Erreur');
        }

        const auteurs = await response.json();

        select.innerHTML = '<option value="">Choisir un auteur</option>';

        auteurs.forEach(auteur => {
            select.innerHTML += `
                <option value="${auteur.id}">
                    ${auteur.nom}
                </option>
            `;
        });
    } catch (error) {
        select.innerHTML = '<option value="">Erreur de chargement</option>';
    }
}

async function chargerLivres() {
    const element = document.getElementById('liste-livres');

    if (!element) {
        return;
    }

    const rechercheElement = document.getElementById('recherche-livre');

    const recherche = rechercheElement
        ? rechercheElement.value
        : '';

    try {
        const response = await fetch(
            `${API}/livres?recherche=${encodeURIComponent(recherche)}&page=${pageActuelle}&limite=10`
        );

        if (!response.ok) {
            throw new Error('Erreur');
        }

        const data = await response.json();

        element.innerHTML = '';

        if (data.livres.length === 0) {
            element.innerHTML = '<p>Aucun livre trouvé.</p>';
        }

        data.livres.forEach(livre => {
            const statut = livre.statut === 'available'
                ? 'Disponible'
                : 'Emprunté';

            const classeStatut = livre.statut === 'available'
                ? 'disponible'
                : 'emprunte';

            element.innerHTML += `
                <div class="livre">
                    <div class="livre-info">
                        <h3>${livre.titre}</h3>
                        <p>Auteur : ${livre.auteur_nom}</p>
                        <p>Année : ${livre.annee_publication}</p>
                        <p class="${classeStatut}">${statut}</p>
                    </div>
                </div>
            `;
        });

        const numeroPage = document.getElementById('numero-page');

        if (numeroPage) {
            numeroPage.textContent = `Page ${pageActuelle}`;
        }

    } catch (error) {
        element.innerHTML = '<p>Impossible de charger les livres.</p>';
    }
}

async function chargerMembres() {
    const element = document.getElementById('liste-membres');

    if (!element) {
        return;
    }

    try {
        const response = await fetch(`${API}/membres`);

        if (!response.ok) {
            throw new Error('Erreur');
        }

        const membres = await response.json();

        element.innerHTML = '';

        if (membres.length === 0) {
            element.innerHTML = '<p>Aucun membre enregistré.</p>';
        }

        membres.forEach(membre => {
            element.innerHTML += `
                <div class="membre">
                    <div class="membre-info">
                        <h3>${membre.nom}</h3>
                        <p>Contact : ${membre.contact}</p>
                    </div>

                    <button onclick="voirHistorique(${membre.id})">
                        Voir l'historique
                    </button>
                </div>
            `;
        });

    } catch (error) {
        element.innerHTML = '<p>Impossible de charger les membres.</p>';
    }
}

async function chargerMembresPourEmprunt() {
    const select = document.getElementById('membre-emprunt');

    if (!select) {
        return;
    }

    try {
        const response = await fetch(`${API}/membres`);

        if (!response.ok) {
            throw new Error('Erreur');
        }

        const membres = await response.json();

        select.innerHTML = `
            <option value="">
                Choisir un membre
            </option>
        `;

        membres.forEach(membre => {
            select.innerHTML += `
                <option value="${membre.id}">
                    ${membre.nom}
                </option>
            `;
        });

    } catch (error) {
        select.innerHTML = `
            <option value="">
                Erreur de chargement
            </option>
        `;
    }
}

async function chargerLivresPourEmprunt() {
    const select = document.getElementById('livre-emprunt');

    if (!select) {
        return;
    }

    try {
        const response = await fetch(
            `${API}/livres?limite=100`
        );

        if (!response.ok) {
            throw new Error('Erreur');
        }

        const data = await response.json();

        select.innerHTML = `
            <option value="">
                Choisir un livre
            </option>
        `;

        data.livres
            .filter(livre => livre.statut === 'available')
            .forEach(livre => {
                select.innerHTML += `
                    <option value="${livre.id}">
                        ${livre.titre}
                    </option>
                `;
            });

    } catch (error) {
        select.innerHTML = `
            <option value="">
                Erreur de chargement
            </option>
        `;
    }
}

async function chargerEmprunts() {
    const element = document.getElementById('liste-emprunts');

    if (!element) {
        return;
    }

    try {
        const response = await fetch(`${API}/emprunts/en-cours`);

        if (!response.ok) {
            throw new Error('Erreur');
        }

        const emprunts = await response.json();

        element.innerHTML = '';

        if (emprunts.length === 0) {
            element.innerHTML = '<p>Aucun emprunt en cours.</p>';
        }

        emprunts.forEach(emprunt => {
            element.innerHTML += `
                <div class="emprunt">
                    <div class="emprunt-livre">
                        <h3>${emprunt.livre_titre}</h3>
                        <p>Membre : ${emprunt.membre_nom}</p>
                    </div>

                    <div class="emprunt-dates">
                        <span>Emprunté le : ${formaterDate(emprunt.date_emprunt)}</span>
                        <span>Retour prévu : ${formaterDate(emprunt.date_retour_prevue)}</span>
                    </div>

                    <button onclick="retournerLivre(${emprunt.id})">
                        Retourner le livre
                    </button>
                </div>
            `;
        });

    } catch (error) {
        element.innerHTML = '<p>Impossible de charger les emprunts.</p>';
    }
}

async function chargerRetards() {
    const element = document.getElementById('liste-retards');

    if (!element) {
        return;
    }

    try {
        const response = await fetch(`${API}/emprunts/en-retard`);

        if (!response.ok) {
            throw new Error('Erreur');
        }

        const emprunts = await response.json();

        element.innerHTML = '';

        if (emprunts.length === 0) {
            element.innerHTML = '<p>Aucun emprunt en retard.</p>';
        }

        emprunts.forEach(emprunt => {
            element.innerHTML += `
                <div class="emprunt en-retard">
                    <div class="emprunt-livre">
                        <h3>${emprunt.livre_titre}</h3>
                        <p>Membre : ${emprunt.membre_nom}</p>
                    </div>

                    <div class="emprunt-dates">
                        <span>Emprunté le : ${formaterDate(emprunt.date_emprunt)}</span>
                        <span>Retour prévu : ${formaterDate(emprunt.date_retour_prevue)}</span>
                    </div>

                    <button onclick="retournerLivre(${emprunt.id})">
                        Retourner le livre
                    </button>
                </div>
            `;
        });

    } catch (error) {
        element.innerHTML = '<p>Impossible de charger les retards.</p>';
    }
}

async function retournerLivre(id) {
    try {
        const response = await fetch(
            `${API}/emprunts/${id}/retour`,
            {
                method: 'PUT'
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert('Livre retourné avec succès');

        chargerEmprunts();
        chargerRetards();
        chargerLivresPourEmprunt();

    } catch (error) {
        alert('Erreur lors du retour du livre');
    }
}

async function voirHistorique(id) {
    try {
        const response = await fetch(
            `${API}/emprunts/membre/${id}/historique`
        );

        if (!response.ok) {
            throw new Error('Erreur');
        }

        const historique = await response.json();

        if (historique.length === 0) {
            alert('Aucun historique pour ce membre.');
            return;
        }

        let message = 'Historique des emprunts :\n\n';

        historique.forEach(emprunt => {
            message += `Livre : ${emprunt.livre_titre}\n`;
            message += `Emprunt : ${formaterDate(emprunt.date_emprunt)}\n`;
            message += `Retour prévu : ${formaterDate(emprunt.date_retour_prevue)}\n`;
            message += `Retour : ${emprunt.date_retour ? formaterDate(emprunt.date_retour) : 'Pas encore retourné'}\n\n`;
        });

        alert(message);

    } catch (error) {
        alert('Impossible de charger l’historique.');
    }
}

function afficherMessage(id, message) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = message;
    }
}

const formAuteur = document.getElementById('form-auteur');

if (formAuteur) {
    formAuteur.addEventListener('submit', async function(event) {
        event.preventDefault();

        const nom = document.getElementById('nom-auteur').value.trim();
        const nationalite = document.getElementById('nationalite-auteur').value.trim();

        try {
            const response = await fetch('http://localhost:3000/api/auteurs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom: nom,
                    nationalite: nationalite
                })
            });

            const data = await response.json();

            if (!response.ok) {
                afficherMessage('message-auteur', data.message);
                return;
            }

            afficherMessage(
                'message-auteur',
                'Auteur ajouté avec succès'
            );

            formAuteur.reset();

            chargerAuteurs();

        } catch (error) {
            console.error(error);

            afficherMessage(
                'message-auteur',
                'Erreur lors de la création de l’auteur'
            );
        }
    });
}

const formLivre = document.getElementById('form-livre');

if (formLivre) {
    formLivre.addEventListener('submit', async function(event) {
        event.preventDefault();

        const titre = document.getElementById('titre-livre').value;
        const auteur_id = document.getElementById('auteur-livre').value;
        const annee_publication = document.getElementById('annee-livre').value;

        try {
            const response = await fetch(`${API}/livres`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    titre,
                    auteur_id,
                    annee_publication
                })
            });

            const data = await response.json();

            if (!response.ok) {
                afficherMessage('message-livre', data.message);
                return;
            }

            afficherMessage(
                'message-livre',
                'Livre ajouté avec succès'
            );

            formLivre.reset();

            chargerLivres();
            chargerLivresPourEmprunt();

        } catch (error) {
            afficherMessage(
                'message-livre',
                'Erreur lors de la création du livre'
            );
        }
    });
}

const formMembre = document.getElementById('form-membre');

if (formMembre) {
    formMembre.addEventListener('submit', async function(event) {
        event.preventDefault();

        const nom = document.getElementById('nom-membre').value;
        const contact = document.getElementById('contact-membre').value;

        try {
            const response = await fetch(`${API}/membres`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom,
                    contact
                })
            });

            const data = await response.json();

            if (!response.ok) {
                afficherMessage('message-membre', data.message);
                return;
            }

            afficherMessage(
                'message-membre',
                'Membre ajouté avec succès'
            );

            formMembre.reset();

            chargerMembres();
            chargerMembresPourEmprunt();

        } catch (error) {
            afficherMessage(
                'message-membre',
                'Erreur lors de la création du membre'
            );
        }
    });
}

const formEmprunt = document.getElementById('form-emprunt');

if (formEmprunt) {
    formEmprunt.addEventListener('submit', async function(event) {
        event.preventDefault();

        const membre_id = document.getElementById('membre-emprunt').value;
        const livre_id = document.getElementById('livre-emprunt').value;
        const date_retour_prevue = document.getElementById('date-retour').value;

        try {
            const response = await fetch(`${API}/emprunts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    membre_id,
                    livre_id,
                    date_retour_prevue
                })
            });

            const data = await response.json();

            if (!response.ok) {
                afficherMessage(
                    'message-emprunt',
                    data.message
                );
                return;
            }

            afficherMessage(
                'message-emprunt',
                'Emprunt enregistré avec succès'
            );

            formEmprunt.reset();

            chargerEmprunts();
            chargerRetards();
            chargerLivresPourEmprunt();

        } catch (error) {
            afficherMessage(
                'message-emprunt',
                'Erreur lors de la création de l’emprunt'
            );
        }
    });
}

function pageSuivante() {
    pageActuelle++;
    chargerLivres();
}

function pagePrecedente() {
    if (pageActuelle > 1) {
        pageActuelle--;
        chargerLivres();
    }
}

chargerStatistiques();
chargerAuteurs();
chargerLivres();
chargerMembres();
chargerMembresPourEmprunt();
chargerLivresPourEmprunt();
chargerEmprunts();
chargerRetards();