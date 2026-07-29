#!/bin/sh
set -e

# Inyecta la variable de entorno API_URL dentro de config.js reemplazando el placeholder.
# Esto permite usar la misma imagen en distintos entornos sin rebuild.
CONFIG="/usr/share/nginx/html/config.js"

if [ -f "$CONFIG" ]; then
  if [ -z "${API_URL:-}" ]; then
    echo "[entrypoint] ⚠ Falta API_URL. El formulario no va a poder enviar mensajes."
  else
    echo "[entrypoint] Inyectando API_URL=${API_URL} en config.js"
    # Escapa & y \ para sed
    ESCAPED=$(printf '%s' "$API_URL" | sed -e 's/[\/&]/\\&/g')
    sed -i "s|__API_URL__|${ESCAPED}|g" "$CONFIG"
  fi
fi

