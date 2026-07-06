# Métodos Numéricos · Teoría y Calculadora

Aplicación web interactiva para el curso de Métodos Numéricos (Universidad ECCI).

- 📖 **Teoría**: 19 temas con fórmulas (MathJax), condiciones de convergencia, ejemplo resuelto y paso a paso numérico completo.
- 🧮 **Calculadora**: cada método con botón **Calcular**, **📗 Paso a paso** (solución iteración por iteración con los valores del usuario) y **📘 Ayuda** (panel lateral con la teoría).

## Métodos disponibles

**Corte I:** análisis de errores · aislamiento de raíces · bisección · regla falsa · punto fijo · Newton-Raphson

**Corte II:** Jacobi · Gauss-Seidel · SOR · Newton para sistemas no lineales · interpolación (Lagrange y Newton) · integración (trapecio, Simpson 1/3, Simpson 3/8, Gauss-Legendre)

**Corte III:** diferenciación numérica · segunda derivada · extrapolación de Richardson · EDOs (Euler, RK2, RK4) · sistemas de EDOs (RK4 vectorial)

## Cómo usar

1. Abre `index.html` en tu navegador (funciona como archivo local y en GitHub Pages).
2. Elige **Teoría** o **Calculadora**.
3. En la calculadora: selecciona método, ingresa datos y presiona **Calcular** o **Paso a paso**.

Notas de entrada:
- Las funciones aceptan `^` para potencias y `sin`, `cos`, `tan`, `exp`, `ln`, `sqrt`, `abs`, `pi`, `e`.
- Los campos numéricos aceptan expresiones: `PI`, `sqrt(2)`, `exp(1)`, `1e-6`.
- Las matrices son N×N arbitrarias: una fila por línea, valores separados por espacios.

## Arquitectura

| Archivo | Rol |
|---|---|
| `nm-core.js` | Algoritmos numéricos puros (sin DOM). Compartido por navegador y Node. |
| `data.js` | Definición de temas y calculadoras (parsing de entradas + formato). |
| `theory.js` | Contenido teórico; los ejemplos se calculan ejecutando `nm-core`. |
| `main.js` | Renderizado, gráficos Chart.js, toolbar, panel de ayuda. |
| `test-harness.js` | Validación numérica (Node). |

## Tests

```bash
node test-harness.js
```

92 casos: incluye bisección de x³−4x−9 (raíz 2.7065279545), RK4 de y′=y (y(1)=2.71827974), sistema lineal con solución (0.6739, 0.9942, 0.6274) y al menos un caso por método.

## Tecnologías

- HTML5, CSS3, JavaScript vanilla (sin frameworks)
- [Chart.js 4.4.1](https://www.chartjs.org/) y [MathJax 3.2.2](https://www.mathjax.org/) por CDN (versiones fijadas, con aviso si el CDN no carga)
- Google Fonts: Space Grotesk + JetBrains Mono
- Tema oscuro (GitHub dark) por defecto con modo claro persistente
