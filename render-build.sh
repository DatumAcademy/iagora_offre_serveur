#!/usr/bin/env bash
# Arrêter le script en cas d'erreur
set -o errexit

# Installer les dépendances
npm install

# Vous pouvez décommenter si vous avez une étape de build spécifique
# npm run build

# Gestion du cache Puppeteer
PUPPETEER_CACHE_DIR="${PUPPETEER_CACHE_DIR:-$XDG_CACHE_HOME/puppeteer}"

if [[ -d "$XDG_CACHE_HOME/puppeteer" ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  cp -R "$XDG_CACHE_HOME/puppeteer" "$PUPPETEER_CACHE_DIR"
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R "$PUPPETEER_CACHE_DIR" "$XDG_CACHE_HOME/puppeteer"
fi
