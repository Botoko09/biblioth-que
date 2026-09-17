Application de gestion d'une bibliothèque

Application web de gestion d'une bibliothèque de quartier.

Le projet permet de gérer les auteurs, les membres, les livres et les emprunts.

Technologies utilisées

* Node.js
* Express.js
* PostgreSQL
* HTML
* CSS
* JavaScript
* Fetch API
* Postman

Fonctionnalités

Auteurs

* Ajouter un auteur
* Afficher les auteurs
* Modifier un auteur
* Supprimer un auteur

Membres

* Ajouter un membre
* Afficher les membres
* Modifier un membre
* Supprimer un membre
* Consulter l'historique des emprunts d'un membre

Livres

* Ajouter un livre
* Afficher les livres
* Modifier un livre
* Supprimer un livre
* Rechercher un livre par titre ou auteur
* Pagination
* Afficher la disponibilité d'un livre

Emprunts

* Enregistrer un emprunt
* Vérifier la disponibilité d'un livre
* Enregistrer le retour d'un livre
* Afficher les emprunts en cours
* Afficher les emprunts en retard

Dashboard

* Total des livres
* Total des membres
* Nombre d'emprunts en cours
* Nombre d'emprunts en retard
* Livre le plus emprunté
* Membre le plus actif

Installation

1. Cloner le projet

git clone URL_DU_REPOSITORY
cd Bibliotheque

2. Installer les dépendances

cd backend
npm install

3. Configurer les variables d'environnement

Créer un fichier .env à partir de .env.example et renseigner les informations de connexion à PostgreSQL.

4. Créer la base de données

Exécuter le fichier schema.sql pour créer les tables de la base de données.

5. Lancer le serveur

node app.js

Base de données

La base de données utilisée est PostgreSQL.

Le fichier schema.sql permet de créer les tables nécessaires au fonctionnement de l'application.

Modélisation

Le projet utilise une base de données relationnelle pour gérer les auteurs, les membres, les livres et les emprunts.

Les relations entre ces différentes entités sont représentées dans le diagramme entité-relation du projet.

Tests

L'API a été testée avec Postman et l'application a été testée de bout en bout afin de vérifier le bon fonctionnement des différentes fonctionnalités.

Projet

Akieni Academy — Cohorte 2
Projet pratique — Semaines 14 & 15
