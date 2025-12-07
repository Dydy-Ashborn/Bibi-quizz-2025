#!/usr/bin/env sh

# Arrêter en cas d'erreur
set -e

# Construire
npm run build

# Naviguer dans le dossier de sortie
cd dist

# Créer un nouveau dépôt git
git init
git add -A
git commit -m 'Deploy quiz de Noël'

# Déployer vers GitHub Pages
git push -f git@github.com:dydy-ashborn/Bibi-quizz-2025.git main:gh-pages

cd -

echo "✅ Déployé sur https://dydy-ashborn.github.io/Bibi-quizz-2025/"