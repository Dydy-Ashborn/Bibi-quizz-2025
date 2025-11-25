# 🎄 Quiz de Noël - Application Interactive

Application de quiz multijoueur en temps réel pour les fêtes de fin d'année.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Compiler pour la production
npm run build
```

## 📁 Structure du Projet

```
quiz-noel/
├── public/
│   └── questions.json          # Base de questions (à fournir)
├── src/
│   ├── components/
│   │   ├── AvatarCapture.jsx   # Capture photo de profil
│   │   ├── BuzzerButton.jsx    # Bouton buzzer interactif
│   │   ├── HomeScreen.jsx      # Écran d'accueil
│   │   ├── HostScreen.jsx      # Interface présentateur
│   │   ├── PlayerScreen.jsx    # Interface joueur
│   │   ├── ScoreBoard.jsx      # Tableau des scores
│   │   └── SnowEffect.jsx      # Effet neige
│   ├── utils/
│   │   ├── comms.js            # Communication BroadcastChannel
│   │   ├── gameEngine.js       # Moteur de jeu
│   │   └── shuffleQuestions.js # Mélange des questions
│   ├── styles/
│   │   └── styles.css          # Styles globaux
│   ├── App.jsx                 # Composant principal
│   └── main.jsx                # Point d'entrée
├── index.html
├── package.json
└── vite.config.js
```

## 🎮 Fonctionnalités

### Pour le Présentateur (Host)
- Gestion de la partie
- Affichage des questions avec réponses
- Validation des réponses joueurs
- Tableau des scores en temps réel
- Contrôle du buzzer
- Export des résultats en CSV

### Pour les Joueurs
- Capture de photo de profil
- Buzzer interactif (avec vibration)
- Réponses à choix multiples cliquables
- Feedback visuel immédiat
- Interface mobile optimisée

## 🔧 Règles du Jeu

### Types de Questions
- **MCQ (Multiple Choice)**: Choix multiples cliquables, pas de buzzer
- **Open/Blind Test/Lyrics/etc.**: Buzzer activé, premier arrivé répond

### Système de Points
- Facile (⭐): 10 points
- Moyen (⭐⭐): 20 points
- Difficile (⭐⭐⭐): 40 points

### Communication
- **BroadcastChannel**: Communication locale sans serveur
- **Fallback Firebase**: Option commentée dans `comms.js`

## 📱 Déploiement GitHub Pages

1. Compiler le projet:
```bash
npm run build
```

2. Déployer le dossier `dist/` sur GitHub Pages

3. Ajouter le fichier `questions.json` dans le dossier `public/` avant compilation

## 🎯 Utilisation

1. **Présentateur**: Ouvre l'app et sélectionne "Présentateur"
2. **Joueurs**: Ouvrent l'app sur leur mobile et sélectionnent "Joueur"
3. Les joueurs s'inscrivent avec pseudo + photo
4. Le présentateur lance la partie
5. Les questions s'affichent automatiquement
6. Le présentateur valide les réponses et avance

## 🛠️ Technologies

- React 18
- Vite
- BroadcastChannel API
- Camera API
- Vibration API
- CSS3 (animations, gradients)

## ⚠️ Notes Importantes

- Le fichier `questions.json` DOIT être placé dans `/public/`
- Format exact requis pour les questions (voir document fourni)
- L'algorithme évite les thèmes consécutifs automatiquement
- Les joueurs ne voient JAMAIS leur score (uniquement le host)

## 🎨 Personnalisation

Modifier les couleurs dans `styles.css`:
- Couleur principale: `#c41e3a` (rouge Noël)
- Couleur secondaire: `#2a9d8f` (vert)
- Fond dégradé: `#1a472a` → `#2d5a3d`

## 📄 License

Projet personnel - Usage libre

---

🎅 Joyeux Quiz de Noël! 🎄
