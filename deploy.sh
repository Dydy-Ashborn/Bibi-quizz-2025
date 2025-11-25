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
# Remplacez <USERNAME>/<REPO> par vos informations
# git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

cd -

echo "✅ Build terminé! Prêt pour le déploiement GitHub Pages"
echo "📝 N'oubliez pas de mettre à jour l'URL du dépôt dans deploy.sh"
