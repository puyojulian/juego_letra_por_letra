# Hangman App — Juego del Ahorcado

## Descripción general

**Hangman App** es un juego interactivo del Ahorcado (juego de adivinar palabras letra por letra) desarrollado como aplicación web de una sola página (SPA). El juego está completamente en español, incluyendo las palabras, categorías, interfaz de usuario y niveles de dificultad. Cuenta con una interfaz moderna, responsiva y con soporte para modo oscuro.

## Objetivo o problema que resuelve

Proporcionar una implementación moderna, atractiva y accesible del clásico juego del Ahorcado en español, jugable directamente desde el navegador sin necesidad de instalación de software adicional. Sirve como ejercicio educativo y de entretenimiento.

## Tecnologías utilizadas

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.x | Biblioteca principal de UI (componentes funcionales + hooks) |
| **TypeScript** | ~5.8 | Tipado estático sobre JavaScript |
| **Vite** | 6.x | Bundler y servidor de desarrollo |
| **Tailwind CSS** | 4.x | Framework de utilidades CSS (integrado vía plugin de Vite) |
| **Lucide React** | 0.546.x | Iconos SVG (usado para los íconos de sol/luna del toggle de tema) |
| **Motion** | 12.x | Biblioteca de animaciones (declarada como dependencia) |

> **Nota:** El archivo `package.json` incluye dependencias adicionales como `@google/genai`, `express`, `dotenv` y `better-sqlite3`, pero **no se encontraron evidencias de uso** en el código fuente del frontend. Es posible que sean residuos de un template base o estén destinadas a funcionalidades futuras (backend, generación de palabras con IA, etc.). Esto se indica como **suposición**.

## Estructura del repositorio

```
├── index.html              # Punto de entrada HTML (SPA)
├── metadata.json           # Metadatos del proyecto (nombre, descripción)
├── package.json            # Dependencias y scripts npm
├── pnpm-lock.yaml          # Lockfile del gestor de paquetes pnpm
├── tsconfig.json           # Configuración del compilador TypeScript
├── vite.config.ts          # Configuración de Vite (plugins, alias, env vars)
└── src/
    ├── main.tsx            # Punto de entrada React (renderiza <App />)
    ├── App.tsx             # Componente raíz: layout, toggle dark mode, routing de vistas
    ├── index.css           # Estilos globales (importación Tailwind + variante dark)
    ├── components/
    │   ├── GameConfig.tsx  # Pantalla de selección de dificultad
    │   ├── GameBoard.tsx   # Tablero principal del juego (orquesta la partida)
    │   ├── HangmanVisual.tsx # Representación SVG animada del ahorcado
    │   ├── Keyboard.tsx    # Teclado virtual en pantalla + captura de teclas físicas
    │   └── WordDisplay.tsx # Visualización de la palabra (letras adivinadas/ocultas)
    ├── data/
    │   └── words.ts        # Diccionario estático de palabras por dificultad y categoría
    ├── services/
    │   └── wordService.ts  # Servicio de selección aleatoria de palabras
    └── types/
        └── game.ts         # Tipos e interfaces TypeScript del dominio del juego
```

## Arquitectura y componentes principales

La aplicación sigue una arquitectura basada en **componentes React funcionales** con gestión de estado local mediante `useState` y `useEffect`. No utiliza estado global ni bibliotecas de gestión de estado externas.

### Diagrama de componentes

```
App
├── GameConfig          (vista: selección de dificultad)
└── GameBoard           (vista: partida en curso)
    ├── HangmanVisual   (dibujo SVG del ahorcado)
    ├── WordDisplay     (representación visual de la palabra)
    └── Keyboard        (teclado interactivo)
```

### Descripción de componentes

- **`App`** — Componente raíz. Gestiona el estado de configuración (`GameConfiguration | null`) y el toggle de modo oscuro. Si no hay configuración, muestra `GameConfig`; si la hay, muestra `GameBoard`.
- **`GameConfig`** — Pantalla inicial. Presenta tres botones para seleccionar la dificultad (fácil, media, difícil). Al seleccionar, emite un objeto `GameConfiguration` con la dificultad y el número máximo de intentos.
- **`GameBoard`** — Componente central del juego. Mantiene el estado de la partida: palabra actual, letras adivinadas y estado del juego (playing/won/lost). Orquesta la lógica de adivinanza y muestra un modal overlay al ganar o perder.
- **`HangmanVisual`** — Renderiza un SVG del ahorcado con partes del cuerpo que aparecen progresivamente según la proporción de fallos vs. intentos máximos. Incluye expresiones faciales (neutral y "muerto").
- **`Keyboard`** — Teclado virtual con las 27 letras del alfabeto español (incluye Ñ). También captura eventos de teclado físico (`keydown`) para permitir jugar sin hacer clic.
- **`WordDisplay`** — Muestra la palabra como una serie de casillas. Las letras adivinadas se revelan con animación de escala; las no adivinadas al final de la partida se muestran en rojo.

### Capa de datos y servicios

- **`words.ts`** — Diccionario estático con 36 palabras organizadas en 3 niveles de dificultad (12 por nivel), cada una con su categoría semántica.
- **`wordService.ts`** — Exporta `getRandomWord(difficulty)` que selecciona una palabra aleatoria del nivel indicado.
- **`game.ts`** — Define los tipos `Difficulty`, `GameConfiguration`, `GameState` y `WordData`.

## Flujo de funcionamiento

1. **Inicio**: El usuario abre la aplicación y ve la pantalla de bienvenida con tres opciones de dificultad.
2. **Selección de dificultad**: Al hacer clic en un nivel, se genera un objeto `GameConfiguration` con la dificultad y los intentos permitidos.
3. **Inicio de partida**: `GameBoard` se monta, invoca `getRandomWord()` para obtener una palabra aleatoria del nivel seleccionado, y muestra la categoría como pista.
4. **Adivinanza**: El jugador selecciona letras mediante el teclado virtual en pantalla o presionando teclas del teclado físico.
   - Si la letra está en la palabra → se revela en `WordDisplay`.
   - Si la letra **no** está en la palabra → se añade al contador de fallos y se dibuja una nueva parte del ahorcado.
5. **Fin de partida**:
   - **Victoria**: Todas las letras de la palabra fueron adivinadas → se muestra modal "¡Has ganado!".
   - **Derrota**: Los fallos alcanzan el máximo de intentos → se muestra modal "¡Has perdido!" junto con la palabra correcta.
6. **Reinicio**: Desde el modal, el jugador puede "Jugar de nuevo" (misma dificultad, nueva palabra) o "Cambiar dificultad" (volver a la pantalla de selección).

## Reglas y lógica del juego

### Niveles de dificultad

| Nivel | Longitud de palabras | Intentos máximos |
|---|---|---|
| Fácil | 4–5 letras | 8 |
| Medio | 6–8 letras | 6 |
| Difícil | 9+ letras | 4 |

### Reglas de juego

- El jugador adivina **una letra a la vez** del alfabeto español (A–Z + Ñ).
- Cada letra solo puede seleccionarse **una vez** (se deshabilita tras ser usada).
- Las letras correctas se revelan en todas las posiciones donde aparecen.
- Las letras incorrectas incrementan el contador de fallos y se muestran como "letras falladas".
- El dibujo del ahorcado se construye proporcionalmente: cada parte aparece cuando la proporción `fallos / intentosMáximos` supera un umbral fijo (0, 0.25, 0.375, 0.5, 0.625, 0.75, 1.0), lo que hace que el componente visual se adapte dinámicamente a cualquier número de intentos.
- Se muestra la **categoría** de la palabra como pista durante toda la partida.

## Cómo ejecutar el proyecto

### Prerrequisitos

- **Node.js** (versión compatible con Vite 6.x, recomendado ≥ 18)
- **pnpm** (el lockfile es `pnpm-lock.yaml`)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/AndresIsCoding/juego_letra_por_letra.git
cd juego_letra_por_letra

# Instalar dependencias
pnpm install
```

### Ejecución en desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Build de producción

```bash
pnpm build
```

Los archivos generados se ubican en la carpeta `dist/`.

### Preview del build

```bash
pnpm preview
```

### Otros scripts

| Script | Comando | Descripción |
|---|---|---|
| `clean` | `pnpm clean` | Elimina la carpeta `dist/` |
| `lint` | `pnpm lint` | Verifica tipos TypeScript sin emitir archivos |

## Decisiones de diseño detectadas

1. **Estado local sin global state management**: Toda la lógica de estado se maneja con `useState`/`useEffect` de React, sin Redux, Zustand u otra librería. Apropiado para la escala reducida de la aplicación.
2. **Dibujo SVG proporcional del ahorcado**: El componente `HangmanVisual` usa una proporción (`failedAttempts / maxAttempts`) en lugar de un conteo fijo de partes, lo que permite que el visual funcione correctamente con cualquier número de intentos máximos (4, 6 u 8).
3. **Soporte para teclado físico y virtual**: `Keyboard` registra un listener global de `keydown` además de botones clicables, mejorando la accesibilidad y la experiencia de juego en escritorio.
4. **Modo oscuro manual**: Implementado mediante toggle de clase CSS (`dark`) en `document.documentElement`, aprovechando la variante personalizada `@custom-variant dark` de Tailwind CSS v4.
5. **Palabras estáticas embebidas en código**: Las palabras se definen como un objeto constante en `words.ts` en lugar de ser cargadas desde una API o base de datos, simplificando el despliegue como aplicación puramente estática.
6. **Categoría como pista**: Cada palabra tiene una categoría asociada que se muestra al jugador, añadiendo una capa de ayuda contextual.
7. **Interfaz completamente en español**: Tanto la UI como el contenido (palabras, mensajes, etiquetas) están en español, indicando que el público objetivo es hispanohablante.
8. **Teclado con Ñ**: El array de letras incluye la Ñ, respetando el alfabeto español completo.

## Limitaciones actuales

- **Diccionario limitado**: Solo 36 palabras en total (12 por nivel). Tras varias partidas, las palabras se repiten con frecuencia.
- **Sin persistencia de datos**: No se guarda progreso, estadísticas ni historial de partidas. Cada recarga de página reinicia completamente la aplicación.
- **Posible repetición inmediata de palabras**: La selección aleatoria no impide que la misma palabra aparezca en partidas consecutivas..
- **Palabras sin tildes ni caracteres especiales**: Las palabras en el diccionario están escritas sin acentos (ejemplo: "MURCIELAGO" en lugar de "MURCIÉLAGO", "ARBOL" en lugar de "ÁRBOL"), lo que es una simplificación deliberada para evitar complejidad en la comparación de caracteres.
- **Sin modo multijugador**: El juego es exclusivamente para un jugador.

## Posibles mejoras o extensiones futuras

- **Ampliar el diccionario**: Integrar una API externa o base de datos para obtener palabras dinámicamente, o al menos expandir significativamente la lista estática.
- **Generación de palabras con IA**: La dependencia `@google/genai` (Gemini) ya está declarada y la configuración de Vite expone `GEMINI_API_KEY`. Se podría implementar generación dinámica de palabras mediante la API de Gemini.
- **Sistema de puntuación y estadísticas**: Guardar partidas ganadas/perdidas, rachas, tiempo por partida, utilizando `localStorage` o un backend.
- **Animaciones con Motion**: La dependencia `motion` está instalada pero no se utiliza. Se podrían añadir transiciones más elaboradas en los cambios de vista y el modal de resultado.
- **Soporte de tildes y caracteres especiales**: Manejar letras acentuadas para mayor fidelidad ortográfica.
- **Modo multijugador**: Permitir que un jugador ingrese una palabra para que otro la adivine.
- **Niveles personalizados**: Permitir al usuario configurar el número de intentos o seleccionar categorías específicas.
- **PWA (Progressive Web App)**: Añadir manifest y service worker para permitir uso offline.
- **Tests**: Implementar pruebas unitarias (Vitest) y de componentes (Testing Library) para asegurar la calidad del código.
- **Limpieza de dependencias**: Remover las dependencias no utilizadas del `package.json`.
- **Accesibilidad (WCAG)**: Añadir roles ARIA, gestión de foco y soporte para lectores de pantalla.