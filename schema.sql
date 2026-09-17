CREATE TABLE auteurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    nationalite VARCHAR(100) NOT NULL
);

CREATE TABLE membres (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    contact VARCHAR(100) NOT NULL
);

CREATE TABLE livres (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    auteur_id INTEGER NOT NULL,
    annee_publication INTEGER NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'available',

    CONSTRAINT fk_livre_auteur
        FOREIGN KEY (auteur_id)
        REFERENCES auteurs(id),

    CONSTRAINT check_statut_livre
        CHECK (statut IN ('available', 'borrowed'))
);

CREATE TABLE emprunts (
    id SERIAL PRIMARY KEY,
    membre_id INTEGER NOT NULL,
    livre_id INTEGER NOT NULL,
    date_emprunt DATE NOT NULL DEFAULT CURRENT_DATE,
    date_retour_prevue DATE NOT NULL,
    date_retour DATE,

    CONSTRAINT fk_emprunt_membre
        FOREIGN KEY (membre_id)
        REFERENCES membres(id),

    CONSTRAINT fk_emprunt_livre
        FOREIGN KEY (livre_id)
        REFERENCES livres(id)
);