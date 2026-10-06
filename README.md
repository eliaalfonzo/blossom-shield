# Blossom Shield

**Kit de seguridad digital personal** — tres herramientas de ciberseguridad que funcionan de verdad, directo en el navegador y sin servidor propio.

> React + TypeScript + Vite · lógica pura con pruebas · sin cuentas, sin cookies, sin almacenamiento.

🌐 **[Visita Blossom Shield](https://blossom-shield.vercel.app)**

## Herramientas

### 1. ¿Me filtraron?

Revisa si una contraseña apareció en filtraciones reales usando la API de [Have I Been Pwned](https://haveibeenpwned.com/API/v3#PwnedPasswords) con el modelo **k-anonymity**:

1. El navegador calcula el SHA-1 de la contraseña (Web Crypto).
2. Solo se envían los **primeros 5 caracteres** del hash.
3. El servicio devuelve todos los sufijos que empiezan igual.
4. La comparación final se hace **en el navegador**: el servicio nunca sabe qué contraseña se buscaba.

Además se envía `Add-Padding: true` para ocultar cuántas coincidencias reales hay, y se muestra una estimación de entropía con tiempos de adivinanza (ataque en línea y con base de datos robada).

### 2. Generador

Frases de contraseña (palabras en español) y contraseñas aleatorias con:

* `crypto.getRandomValues` y **muestreo por rechazo** para evitar el sesgo de módulo.
* Mezcla Fisher–Yates criptográfica y garantía de al menos un carácter de cada tipo elegido.
* Cálculo de entropía real a partir del alfabeto o de la lista de palabras.

### 3. Detector de enlaces sospechosos

Analiza **el texto** de un enlace (sin abrirlo) con reglas explicables: dominios que imitan marcas (distancia de Levenshtein y sustituciones tipo `paypa1`), marcas escondidas en subdominios, truco del `@`, IP en lugar de dominio, punycode, acortadores, terminaciones de riesgo, puertos raros, enlaces dentro de enlaces y palabras típicas de fraude.

Muestra qué parte de la dirección es el **dominio real**.

## Seguridad y privacidad por diseño

* Ninguna contraseña se envía completa, se guarda o se registra.
* Sin `localStorage`, cookies, analíticas ni rastreadores.
* `vercel.json` aplica una CSP estricta: la **única** conexión externa permitida es `api.pwnedpasswords.com`.
* Fuentes autoalojadas vía npm (`@fontsource-variable`), sin pedir nada a terceros.
* SHA-1 se usa solo por compatibilidad con el protocolo del servicio, no para proteger datos.

## Estructura

```text
src/
├─ core/       lógica pura, sin React ni DOM, con pruebas (node:test)
│  ├─ random.ts · sha1.ts · pwned.ts · entropy.ts
│  ├─ generator.ts · wordlist.ts
│  └─ urlInspector.ts · brands.ts
├─ features/   pantallas: Home, BreachChecker, Generator, LinkInspector
├─ ui/         componentes reutilizables (controles, avisos, ilustración)
├─ App.tsx     navegación por hash (#/breach) · styles.css
```

La capa `core` recibe sus dependencias por parámetro (por ejemplo, `fetch` y la fuente de aleatoriedad), así que se prueba sin red.

## Cómo ejecutarlo

Requiere **Node 22+**.

```bash
npm install

npm run dev        # desarrollo
npm test           # pruebas de la lógica (40 pruebas)
npm run typecheck  # TypeScript estricto
npm run build      # genera ./dist
```

## Limitaciones

* La estimación de entropía es optimista: no detecta palabras ni patrones (por eso la revisión de filtraciones es la prueba clave).
* El detector de enlaces usa reglas y una lista corta de marcas; no reemplaza un servicio de reputación ni el sentido común.
* El dominio "registrable" se calcula de forma aproximada, sin la lista pública de sufijos completa.

---

**Autora: Elia**

