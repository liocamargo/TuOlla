# Tu Olla

App de planificación de menú semanal y lista de compras, con login y datos en Firebase (Auth + Firestore). Next.js + React, deploy en Vercel.

## Stack

- Next.js 16 (App Router, TypeScript, sin Tailwind — estilos inline igual que el diseño original)
- Firebase Auth (Google + magic link por email) y Firestore (datos por "household" compartido entre convivientes)

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Las credenciales de Firebase van en `.env.local` (no se commitea). Copiá `.env.example` y completá los valores desde Firebase Console → Configuración del proyecto → Tus apps → Config del SDK.

## Configuración de Firebase (requerida antes de usar la app)

1. **Authentication → Sign-in method**: habilitar los proveedores **Google** y **Email link (passwordless sign-in)**.
2. **Authentication → Settings → Authorized domains**: agregar el dominio de producción (ej. `tu-app.vercel.app`) una vez desplegado. `localhost` ya viene autorizado por defecto.
3. **Firestore → Rules**: pegar el contenido de [`firestore.rules`](./firestore.rules) (las reglas por defecto del proyecto son "denegar todo", hay que reemplazarlas para que la app funcione).
4. **Firestore → Database**: crear la base en modo producción si todavía no existe.

## Modelo de datos

- `users/{uid}` → referencia al household del usuario.
- `households/{householdId}` → un household por dueño (su `householdId` es su propio `uid`).
  - `members/{uid}` — quién pertenece al household.
  - `settings/main` — dieta, alergias, disgustos, comidas habilitadas, porciones.
  - `plan/week` — el menú semanal (día → comida → id de receta).
  - `recipes/{id}` — recetario (semilla + recetas propias).
  - `shoppingItems/{id}` — lista de compras.
  - `templates/{id}` — plantillas de menú guardadas.
- `invites/{email}` → invitación pendiente a un household; se resuelve y borra cuando esa persona inicia sesión por primera vez.

## Deploy en Vercel

1. Importar el repo en [vercel.com/new](https://vercel.com/new).
2. Cargar las mismas variables de `.env.local` como Environment Variables del proyecto en Vercel.
3. Deploy. Después, agregar el dominio de Vercel a los Authorized domains de Firebase Auth (paso 2 de arriba).
