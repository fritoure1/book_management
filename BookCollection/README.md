# BookCollection 📚

**BookCollection** est une application mobile native de gestion de bibliothèque personnelle et de suivi de lecture développée avec **React Native**, **Expo** et **TypeScript**.

Conçue selon une approche *Offline-First*, elle permet aux lecteurs de centraliser l'inventaire de leurs livres (physiques, PDF et EPUB), de suivre précisément leur progression de lecture et de visualiser des statistiques détaillées sur leurs habitudes de consommation littéraire.

---

## 🚀 Fonctionnalités principales

L'application est découpée en quatre modules interconnectés :

### 1. Acquisition et Inventaire (Smart Cataloging)

- **Smart Scan (Code-barres) :** Utilisation de l'appareil photo du smartphone (`expo-camera`) pour scanner l'ISBN d'un livre physique. L'application interroge l'API Google Books pour pré-remplir automatiquement toutes les métadonnées (titre, auteur, résumé, nombre de pages, couverture).
- **Recherche en ligne :** Moteur de recherche textuel intégré permettant de retrouver une œuvre sur Google Books par son titre ou son auteur.
- **Formulaire manuel :** Saisie personnalisée pour ajouter des livres indépendants ou non répertoriés sur internet.
- **Sécurité anti-doublon :** Algorithme de vérification interdisant la duplication d'un même ouvrage sous un format identique en base de données.

### 2. Suivi de Progression (Reading Tracker)

- **Mise à jour fluide :** L'utilisateur renseigne sa page courante directement sur la fiche du livre.
- **Statut automatisé :** Calcul en temps réel de l'état d'avancement :
  - `À lire` : Page courante égale à 0.
  - `En cours` : Lecture initiée.
  - `Terminé` : Page courante supérieure ou égale au total de pages de l'ouvrage.

### 3. Liseuse Numérique Intégrée (Ebook Reader)

- **Lecteur PDF interne :** Les fichiers PDF stockés localement sur le téléphone s'ouvrent directement dans l'application via une `WebView` dédiée.
- **Délégation EPUB :** Pour le format dynamique EPUB, l'application utilise l'API de partage native (`Share API`) pour ouvrir proprement le fichier dans l'application spécialisée de l'appareil (Apple Books, Google Play Books).

### 4. Tableau de Bord (Dashboard)

- **Statistiques globales :** Écran d'analyse calculant dynamiquement le nombre total de pages lues, le nombre de livres possédés, le ratio de livres terminés et la répartition par formats (Physique vs Numérique).

---

## 🛠️ Stack Technique

| Domaine | Technologie |
|---|---|
| Framework | React Native avec **Expo** (Workflow managé) |
| Navigation | **Expo Router** (architecture `Stack` et `Tabs`) |
| Langage | **TypeScript** (typage strict des interfaces) |
| Base de données | **SQLite** (`expo-sqlite`) — stockage local relationnel |
| Formulaires | **React Hook Form** — isolation des rendus |
| Réseau | API native **Fetch** (aucune dépendance lourde tierce) |

---

## 📐 Architecture du Projet

L'application suit un patron de conception inspiré du modèle **MVC (Modèle-Vue-Contrôleur)** afin de séparer strictement l'interface graphique de la logique métier.

```text
BookCollection/
├── app/                        # Écrans et Navigation (Les Vues / Expo Router)
│   ├── (tabs)/                 # Onglets principaux (Ma Biblio, Scanner, Stats)
│   ├── book/                   # [id].tsx - Fiche détaillée dynamique d'un livre
│   ├── _layout.tsx             # Configuration globale du routeur
│   └── modal.tsx               # Fenêtre modale de recherche/ajout manuel
├── src/
│   ├── components/             # Composants d'interface réutilisables (ex: book-form.tsx)
│   ├── hooks/                  # Logique métier et états (Les Contrôleurs / Custom Hooks)
│   │   ├── useManualSearch.ts
│   │   ├── useScannerController.ts
│   │   └── useStatsController.ts
│   └── services/               # Accès aux données (Les Modèles / Services)
│       ├── bookService.ts      # Requêtes SQL locales (SQLite CRUD)
│       └── googleBookService.ts# Requêtes HTTP externes (Google Books API)
├── .env                        # Fichier de configuration des clés secrètes (local)
└── package.json                # Dépendances et scripts du projet
```

---

## ⚙️ Installation et Configuration

Pour faire tourner le projet en local sur votre machine ou sur votre smartphone, suivez ces étapes :

### 1. Prérequis

Assurez-vous d'avoir installé [Node.js](https://nodejs.org/) (version LTS recommandée) et l'application mobile **Expo Go** sur votre smartphone (iOS/Android) pour tester en temps réel.

### 2. Installer les dépendances

Placez-vous dans le dossier de l'application et exécutez la commande suivante pour installer tous les modules requis :

```bash
npm install
```

### 3. Configurer la clé API Google Books

L'accès à l'API de Google nécessite une clé d'identification. Par mesure de sécurité et pour respecter les bonnes pratiques, cette clé ne doit pas être inscrite en dur dans le code.

1. À la racine du dossier de l'application, créez un fichier nommé exactement `.env`.
2. L'explication de la récupération de la clé se trouve dans le dossier PDF.
3. Ouvrez ce fichier et insérez-y votre clé API Google Cloud en respectant scrupuleusement le préfixe obligatoire d'Expo :

```plaintext
EXPO_PUBLIC_GOOGLE_BOOK_API_KEY=VOTRE_CLE_API_GOOGLE_ICI
```

> ⚠️ **Attention :** Ne pas mettre d'espaces autour du signe `=`, ni de guillemets autour de la clé.

### 4. Lancer l'application

Pour démarrer le serveur de développement Expo en vidant le cache — afin de s'assurer de la bonne lecture du fichier `.env` — lancez :

```bash
npx expo start -c
```

Il vous suffit ensuite de scanner le **QR Code** affiché dans votre terminal à l'aide de l'application **Expo Go** (sur Android) ou de l'appareil photo natif (sur iOS) pour lancer l'application sur votre téléphone.