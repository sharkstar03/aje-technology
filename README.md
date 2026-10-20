# AJE Technology

Sitio web oficial de **AJE Technology, S.A.**, empresa panameña de transformación digital.

**AJE: Automatiza, Junta y Escala.**

Dirección pública: https://sharkstar03.github.io/aje-technology/

## Contenido

El sitio es estático (HTML, CSS y JavaScript, sin backend propio). Las rutas de archivos son relativas para funcionar en GitHub Pages como sitio de proyecto.

- `index.html` — página principal
- `gracias.html` — confirmación del formulario
- `404.html` — página no encontrada
- `sitemap.xml` y `robots.txt`

El formulario envía a [FormSubmit](https://formsubmit.co/ajetechnologypa@gmail.com) y redirige a `gracias.html`.

## Vista local

Desde la raíz del repositorio:

```bash
python3 -m http.server 8000
```

Abre http://localhost:8000

## Publicación

El workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) despliega la rama `main` con `actions/deploy-pages`.

En el repositorio, GitHub Pages debe usar **GitHub Actions** como origen (`build_type: workflow`).

La primera vez que alguien envía el formulario, FormSubmit manda un correo de activación a `ajetechnologypa@gmail.com`. Hay que abrir ese mensaje y confirmar la dirección para que las solicitudes lleguen.
