// Config runtime. La imagen Docker reemplaza __API_URL__ con el valor de la env var API_URL
// al arrancar (ver docker-entrypoint.sh). Para dev local, poné acá la URL de tu API.
window.__ENV__ = {
  API_URL: "__API_URL__"
};
