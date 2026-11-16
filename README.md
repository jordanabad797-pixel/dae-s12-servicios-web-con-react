# Servicios web con React — Axios, CORS y los tres estados

Repositorio del laboratorio **extra de la semana 12** de Desarrollo de Aplicaciones Empresariales (DAE).
La pantalla de **cuestionarios** de React consume la API del curso (la de la semana 8) con Axios: lista, crea y elimina.
Faltan **tres piezas** que escribes tú, contra pruebas: el **módulo cliente de la API**, la **política de CORS** y el
**hook del listado**. Después revisas las mismas tres piezas «escritas por una IA»: se ven bien, compilan y tienen
**cinco fallos** típicos. Además hay un **cliente sin pantalla** (`examctl`) que llama a la misma API desde la terminal.

Todo es **local**: no hace falta Django. La red es simulada (un adaptador de Axios en `src/lib/`), con retardo, con un
servidor que se puede «apagar» y con la comprobación de CORS que haría el navegador. Para probar contra la API real del
laboratorio 8, ver «Con la API real» más abajo. **Este extra sustituye al Lab 12 oficial: se entrega en la tarea «Lab #12» del campus, en lugar de la guía regular.**

La guía del laboratorio (con su rúbrica) está en el campus virtual; aquí está el código.

## Puesta en marcha

Necesitas **Node 20.19 o superior** (o Node 22.12 o superior): `node -v`. En PowerShell:

```powershell
npm install
npm run dev        # abre la dirección que imprime (http://localhost:5173); déjalo corriendo
```

Al empezar, la pantalla se queda en «Cargando cuestionarios…» para siempre: el hook es un esqueleto. En **otra terminal**:

```powershell
npm test           # tu código (src/client): 67 pruebas, 46 fallan al empezar
```

## Las partes del laboratorio

Cada archivo tiene comentarios `TODO` con lo que debes hacer. Después de cada parte, su comando:

| Parte | Archivo | Qué escribes | Comando |
|---|---|---|---|
| 1 | `src/client/api.js` | El módulo cliente: dirección base en un solo sitio, `listExams`, `createExam`, `deleteExam` y `describeError` | `npm test -- api` |
| 2 | `src/client/cors.js` | La política de CORS: solo el origen `http://localhost:5173` | `npm test -- cors` |
| 3 | `src/client/useExams.js` | Los tres estados del listado, `reload`, la limpieza que **cancela** la petición, `remove` y `create` sin doble envío | `npm test -- useExams` |
| 4 | `src/ai/` | Revisar el cliente «escrito por una IA»: clasificar sus **5 fallos** con evidencia y arreglarlos | `npm run test:ai` |
| 5 | `cli/examctl.mjs` | Usar el cliente sin pantalla y revisar su contrato (códigos de salida, `--yes`, `cors-check`) | `npm run api` y `npm run examctl -- list` |
| 6 | tu entregable | La tabla de la pantalla (qué se ve en cada estado) y la tabla de uso de IA | — |

`App`, `ExamList`, el panel de la red simulada, la red simulada, el cliente `examctl` y las pruebas ya están escritos:
**no los cambies**.

## El cliente sin pantalla

`examctl` es la misma API sin React: sirve a un script o a un agente. Necesita un servidor; arranca el simulado en una
terminal y usa el cliente en otra:

```powershell
npm run api                                              # API simulada en http://127.0.0.1:8800/api
npm run examctl -- list --json                           # JSON en stdout; los mensajes para personas, en stderr
npm run examctl -- create "Examen final" --json
npm run examctl -- delete 3 --yes                        # sin --yes no borra
npm run examctl -- cors-check --origin http://localhost:5173
npm run examctl -- cors-check --origin https://sitio-malo.example
```

| Código | Significa |
|---|---|
| 0 | Bien |
| 2 | Uso incorrecto (comando u opción desconocidos) |
| 3 | Sin conexión o tiempo agotado |
| 4 | Datos no válidos (la API respondió 400) |
| 5 | No existe (404) |
| 6 | Error del servidor (5xx) |
| 7 | CORS rechaza el origen |
| 8 | Falta `--yes` en un comando que borra |
| 9 | CORS acepta cualquier origen (comodín): demasiado permisivo |

`npm run api -- --wildcard` arranca la API simulada con el comodín (`CORS_ALLOW_ALL_ORIGINS = True`): `cors-check`
sale con 9. Las pruebas del cliente (`src/test/cli.test.js`) pasan en todos los modos: no dependen de tu código.

## Con la API real

Para usar la API de Django del laboratorio 8 en lugar de la simulada, crea un archivo `.env.local` con
`VITE_API_URL=http://localhost:8000/api` y autoriza `http://localhost:5173` en `CORS_ALLOWED_ORIGINS` (el paso 1 del Lab 12
oficial). Con esa variable la aplicación no instala la red simulada y el panel «Red simulada» desaparece. Las pruebas no
usan nunca esa variable. El contrato que se simula es el de la API de cuestionarios: `GET /exams/`, `POST /exams/` y
`DELETE /exams/<id>/`, con la barra final.

## AGENTS.md: si usas un agente

[`AGENTS.md`](AGENTS.md) es el **contrato del agente**. Solo edita `src/client/` y `src/components/`; no toca las pruebas, la
red simulada ni `package.json`; no borra datos con `examctl` sin que una persona lo ordene; no decide qué orígenes
autoriza CORS ni dónde se recarga la lista. Trae las **cuatro preguntas de revisión del diff**.

## Qué hace cada script

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca la aplicación con recarga en vivo y la red simulada |
| `npm test` | Corre las pruebas contra **tu código** (`src/client`) |
| `npm run test:ai` | Las **mismas pruebas** contra el cliente de la IA (`src/ai`). Deben fallar 25: es el material de la Parte 4 |
| `npm run test:solutions` | Solo existe en la copia del docente (necesita `teacher/solutions/`) |
| `npm run build` | Compila la aplicación en `dist/` |
| `npm run api` | Arranca la API simulada por HTTP (para `examctl`) |
| `npm run examctl -- <comando>` | El cliente sin pantalla |

Los componentes y las pruebas importan el cliente con el alias `@client`, que `vite.config.js` apunta a una carpeta u otra
según el **modo** (`.env.team`, `.env.ai`, `.env.solutions`). La aplicación (`dev` y `build`) siempre usa `src/client`.
Las pruebas **no esperan de verdad**: la red simulada contesta cuando la propia prueba libera la petición, así que son
rápidas (unos 5 segundos) y dan siempre el mismo resultado.

## Estructura

| Ruta | Para qué |
|---|---|
| `src/client/` | **Tuyo (Partes 1 a 3):** `api.js`, `cors.js` y `useExams.js` por completar |
| `src/ai/` | Los mismos tres archivos «escritos por una IA» (Parte 4) |
| `src/components/` | `ExamList` (los tres estados, borrar y alta) y `NetworkPanel`, ya escritos |
| `src/lib/` | La red simulada: `fakeApi.js` (el contrato), `cors.js` (la decisión del navegador) y `fakeNetwork.js` (el adaptador de Axios) |
| `src/test/` | Las pruebas: `api`, `cors`, `useExams`, `ExamList`, `App` y `cli` |
| `cli/` | `examctl.mjs` (el cliente sin pantalla) y `fake-api.mjs` (la API simulada por HTTP) |
| `.env.team`, `.env.ai`, `.env.solutions` | Qué carpeta usa cada modo de pruebas |
| `AGENTS.md` | El contrato del agente y las cuatro preguntas de revisión del diff |

## Resultado del laboratorio (entrega del equipo)

| Verificación | Resultado |
|---|---|
| `npm test` (código del equipo, `src/client`) | **67/67** (al empezar: 46 fallaban) |
| `npm run test:ai` (código de la IA corregido, `src/ai`) | **67/67** (al empezar: 25 fallaban = 5 hallazgos) |
| `npm run build` | Compila sin errores |
| `python manage.py test exams` (backend Django, extra) | **10/10** |

**Decisiones del equipo**

- **CORS:** solo `http://localhost:5173` (esquema + host + puerto exactos, sin barra final, sin comodín y sin credenciales).
  En Django: `CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]`.
- **Lista tras borrar:** se filtra en local **cuando el servidor confirma** (204). No es optimista (si falla, la fila
  se queda y se explica el error) y no vuelve a pedir la lista completa (una petición en vez de dos, sin parpadeo).
- **Doble envío:** guarda con `useRef` (se lee y escribe en el mismo evento) más `saving` para desactivar el botón.

**Los cinco hallazgos del cliente «escrito por una IA»** (un commit por arreglo, etiqueta `ai-original` con el estado inicial):

| # | Hallazgo | Archivo | Fallos antes → después |
|---|---|---|---|
| 1 | CORS con comodín `"*"` | `src/ai/cors.js:2` | 25 → 20 |
| 2 | Error tragado (`console.error` + `status "ready"`) | `src/ai/useExams.js:18-22, 40-43` | 20 → 12 |
| 3 | Petición sin limpieza ni control de la carrera | `src/ai/api.js:11-12`, `src/ai/useExams.js:11-23` | 12 → 7 |
| 4 | La lista no se refresca tras borrar | `src/ai/useExams.js:27-33` | 7 → 3 |
| 5 | Doble envío en `create` | `src/ai/useExams.js:35-46` | 3 → 0 |

Evidencias en [`docs/evidencias/`](docs/evidencias) (salidas de las pruebas y de `examctl`) y capturas en
[`docs/capturas/`](docs/capturas).

## Backend Django (extra)

La carpeta [`backend/`](backend) implementa el mismo contrato con Django REST Framework y `django-cors-headers`:

```powershell
cd backend
python -m venv .venv
.venv\Scriptsctivate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_exams          # los mismos seis cuestionarios de la API simulada
python manage.py test exams          # 10 pruebas: contrato de la API y CORS
python manage.py runserver 8000
```

En otra terminal, en la raíz: crear `.env.local` con `VITE_API_URL=http://localhost:8000/api` y ejecutar `npm run dev`.
El panel «Red simulada» desaparece y la pantalla usa la API real. `examctl` también funciona contra ella:
`npm run examctl -- list --url http://127.0.0.1:8000/api`.

## Convenciones del curso

Código, nombres de variables y comentarios en inglés; explicaciones y entregables en español. Componentes en
PascalCase y hooks con el prefijo `use`.
