# JIRO SUSHI · Franquicias landing — nginx estático
FROM nginx:1.27-alpine

# Config nginx (SPA + cache + no-cache para config.js)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Contenido estático
COPY public/ /usr/share/nginx/html/

# Entrypoint: reemplaza __API_URL__ del config.js con la env var API_URL
COPY docker-entrypoint.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

EXPOSE 80
