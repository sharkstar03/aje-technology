# AJE Technology

Sitio web oficial de **AJE Technology, S.A.**, empresa panameña de transformación digital.

**AJE: Automatiza, Junta y Escala.**

Dirección pública: https://ajetechnologypa.com/

## Contenido

El sitio es estático (HTML, CSS y JavaScript, sin backend propio).

- `index.html` — página principal
- `gracias.html` — confirmación del formulario (se sirve en `/gracias`)
- `404.html` — página no encontrada
- `sitemap.xml` y `robots.txt`

El formulario envía a [FormSubmit](https://formsubmit.co/ajetechnologypa@gmail.com) y redirige a `/gracias`.

Las animaciones (red de partículas, fijado de "Así trabajamos", inclinación 3D) se apagan solas si el visitante pide menos movimiento o el equipo es lento.

## Vista local

Desde la raíz del repositorio:

```bash
npx wrangler dev
```

Abre http://localhost:8787

## Publicación

El sitio corre en **Cloudflare Workers** como recursos estáticos, configurado en [`wrangler.jsonc`](wrangler.jsonc), con los dominios `ajetechnologypa.com` y `www.ajetechnologypa.com`.

`.assetsignore` evita que se publiquen `.git`, `.github`, este README y la configuración.

Cada cambio en `main` se publica solo con Cloudflare Workers Builds. Para publicar a mano: `npx wrangler deploy`.

El correo `contacto@ajetechnologypa.com` se reenvía a `ajetechnologypa@gmail.com` con Cloudflare Email Routing.
