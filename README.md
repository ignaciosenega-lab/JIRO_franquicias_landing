# JIRO SUSHI · Franquicias landing

Landing estática (nginx) para captar postulantes a franquicia. El formulario postea a
`POST /api/franchise-leads` de **JIRO_FQC_API**, y los leads se ven/gestionan desde el
panel admin (**JIRO_FQC → Expansión → Leads / Prospectos**).

## Contenido

```
public/
  index.html    # markup
  styles.css    # tema negro + lime (mismo del admin)
  config.js     # window.__ENV__.API_URL — se reescribe en el arranque del contenedor
  main.js       # handler del formulario
Dockerfile
nginx.conf
docker-entrypoint.sh
```

## Deploy — paso a paso

### 1. Push a un repo nuevo

```bash
cd JIRO_franquicias_landing
git init
git add .
git commit -m "Initial landing"
gh repo create ignaciosenega-lab/JIRO_franquicias_landing --public --source=. --remote=origin --push
```

(o creá el repo desde github.com y `git remote add origin ... && git push -u origin main`)

### 2. Backend — asegurar que el API acepte el nuevo origen

En el servicio de **JIRO_FQC_API** en Easypanel, agregar la env var:

```
LANDING_URL=https://franquicias.jirosushi.com.ar
```

Redeploy del API. (El CORS ya está preparado para admitirla; sin esa env se rechaza.)

### 3. Nuevo servicio en Easypanel para la landing

- **Type:** App
- **Source:** GitHub → repo `JIRO_franquicias_landing`, branch `main`
- **Build:** Dockerfile (auto-detectado)
- **Env vars:**
  ```
  API_URL=https://<host-donde-vive-el-API>
  ```
  (ej: `https://api.jirosushi.com.ar` — usar el mismo host donde ya vive JIRO_FQC_API)
- **Port:** 80

### 4. Dominio

- En Easypanel → servicio de la landing → **Domains** → agregar `franquicias.jirosushi.com.ar`.
- Easypanel te muestra el destino (una IP o hostname).
- En tu panel de DNS (donde está `jirosushi.com.ar`) creá el registro:
  - **Tipo:** A o CNAME
  - **Nombre:** `franquicias`
  - **Valor:** lo que muestra Easypanel
  - **TTL:** 300s

Esperá 5-30 min a la propagación. Easypanel se ocupa del cert SSL automáticamente (Let's Encrypt).

### 5. Verificación

1. Abrir `https://franquicias.jirosushi.com.ar` → ver la landing.
2. Completar el formulario → tiene que decir "¡Gracias! …".
3. En el admin (**JIRO_FQC**) → Expansión → tab **Leads / Prospectos** → aparece el nuevo lead con estado `Nuevo`.

Si el form no envía, abrir DevTools → Console. Errores típicos:
- **`Origen no permitido`**: falta `LANDING_URL` en el API o mal escrita.
- **`Configuración pendiente`**: el contenedor arrancó sin `API_URL`, o quedó `__API_URL__` sin reemplazar.
- **`Failed to fetch`**: el API está caído o CORS bloqueó la request.

## Dev local

```bash
# 1) API corriendo en http://localhost:4000 (repo JIRO_FQC_API con npm run dev)
# 2) Sustituir API_URL manualmente en public/config.js:
#    API_URL: "http://localhost:4000"
# 3) Servir la carpeta public/ con cualquier server estático:
npx serve public
```

Después de probar, restaurar `config.js` a `"__API_URL__"` antes de commitear.
