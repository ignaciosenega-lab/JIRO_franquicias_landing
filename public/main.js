(function () {
  // Año en el footer
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Menú mobile (hamburguesa)
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    var close = function () {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = !document.body.classList.contains('nav-open');
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Cerrar al hacer click en un link
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    // Cerrar con Escape
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  var form = document.getElementById('leadForm');
  var note = document.getElementById('formNote');
  if (!form || !note) return;

  var API_URL = (window.__ENV__ && window.__ENV__.API_URL) || '';
  // Guard: si docker-entrypoint no reemplazó el placeholder, no dejo enviar.
  if (!API_URL || API_URL.indexOf('__API_URL__') !== -1) {
    console.warn('[JIRO Franquicias] API_URL no configurada. El formulario está deshabilitado.');
  }

  function setNote(msg, kind) {
    note.textContent = msg || '';
    note.className = 'form-note' + (kind ? ' ' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!API_URL || API_URL.indexOf('__API_URL__') !== -1) {
      setNote('Configuración pendiente. Escribinos a franquicias@jirosushi.com.ar', 'error');
      return;
    }
    var fd = new FormData(form);
    var payload = {
      nombre:   String(fd.get('nombre')   || '').trim(),
      email:    String(fd.get('email')    || '').trim(),
      telefono: String(fd.get('telefono') || '').trim(),
      ciudad:   String(fd.get('ciudad')   || '').trim(),
      mensaje:  String(fd.get('mensaje')  || '').trim(),
    };
    if (!payload.nombre || !payload.email) {
      setNote('Nombre y email son obligatorios.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setNote('El email no es válido.', 'error');
      return;
    }
    var btn = form.querySelector('.form-submit');
    var spinner = btn.querySelector('.btn-spinner');
    btn.disabled = true;
    if (spinner) spinner.hidden = false;
    setNote('Enviando…');

    fetch(API_URL.replace(/\/$/, '') + '/api/franchise-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (res.status === 201 || res.status === 200) return res.json().catch(function(){ return {}; });
        return res.json().then(function (j) { throw new Error(j.error || 'No pudimos enviar tu mensaje.'); });
      })
      .then(function () {
        setNote('¡Gracias! Te vamos a contactar en las próximas 48 hs.', 'ok');
        form.reset();
      })
      .catch(function (err) {
        setNote(err.message || 'Ocurrió un error. Probá de nuevo o escribinos por mail.', 'error');
      })
      .finally(function () {
        btn.disabled = false;
        if (spinner) spinner.hidden = true;
      });
  });
})();
