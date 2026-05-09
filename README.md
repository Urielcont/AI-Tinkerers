# VoxTriage

Demo de hackathon construido con `Next.js`, `CopilotKit`, `AG-UI` y `A2UI`.

La app simula un flujo de pre-consulta en sala de espera:
- recibe transcript por voz o texto manual,
- ejecuta triage con `CopilotKit` sobre un runtime `Gemini-first`,
- actualiza estado clínico con acciones frontend,
- renderiza una superficie principal con `A2UI`,
- y degrada a un fallback visual si el payload declarativo falla.

## Stack

- `Next.js 16` con `App Router`
- `React 19`
- `Tailwind CSS 4`
- `@copilotkit/react-core`
- `@copilotkit/runtime`
- `@a2ui/react` + `@a2ui/web_core`
- `Gemini` sobre `Vertex AI + ADC` por defecto
- `Vitest` + `Testing Library`

## Variables de entorno

Copia `.env.example` y completa:

```bash
GEMINI_PROVIDER=vertex
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_VERSION=v1
GOOGLE_CLOUD_PROJECT=...
GOOGLE_CLOUD_LOCATION=us-central1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Modo recomendado para este proyecto:
- `vertex`: usa créditos de Google Cloud mediante ADC.
- `developer`: usa `GEMINI_API_KEY` o `GOOGLE_API_KEY`.

Si quieres usar los créditos de Google Cloud en local, prepara ADC así:

```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

También puedes usar un service account con `GOOGLE_APPLICATION_CREDENTIALS`.

## Comandos

```bash
npm install
npm run dev
```

Verificaciones:

```bash
npm test
npm run lint
npm run build
```

## Flujo de demo

1. Habla con el botón de voz o pega texto en el transcript.
2. Usa uno de los tres scripts de jurado para pruebas rápidas.
3. Pulsa `ANALIZAR`.
4. El agente actualiza urgencia, zona corporal, checklist y follow-up.
5. El panel derecho intenta renderizar la superficie A2UI; si no puede, muestra el resumen de contingencia.

## Notas de implementación

- El runtime vive en `src/app/api/copilotkit/route.ts`.
- La UI principal vive en `src/components/voxtriage-app.tsx`.
- Los contratos tipados, el builder de A2UI y la capa Gemini/Vertex viven en `src/lib/`.
- El proyecto usa `webpack` en scripts de `Next` por compatibilidad con dependencias transitivas actuales de `CopilotKit`.
