# Layout Testing Strategy - Playwright Geometric Validation

## Filosofía

**No confíes en tus ojos. Confía en las matemáticas.**

Los tests de layout tradicionales fallan porque:
- Screenshots son frágiles (cambios de font, OS, etc.)
- Visual diff requiere mantenimiento constante
- Los humanos vemos lo que queremos ver

**Solución: Mediciones geométricas objetivas**

## Estrategia de Validación

### 1. Herramientas Core

```javascript
// getBoundingClientRect() retorna:
{
  x: 150,        // Distancia desde el borde izquierdo del viewport
  y: 200,        // Distancia desde el borde superior
  width: 360,    // Ancho del elemento
  height: 360,   // Alto del elemento
  top: 200,      // = y
  right: 510,    // = x + width
  bottom: 560,   // = y + height
  left: 150      // = x
}
```

### 2. Relaciones Espaciales Clave

| Requisito | Aserción | Lógica |
|-----------|----------|--------|
| "A está a la derecha de B" | `A.left > B.right` | El borde izquierdo de A está después del borde derecho de B |
| "A está dentro de B" | `A.left >= B.left && A.right <= B.right` | Los bordes de A no exceden los de B |
| "A ocupa N% de B" | `A.width >= B.width * N` | El ancho de A es al menos N% del de B |
| "No hay overflow horizontal" | `scrollWidth <= viewportWidth` | El contenido no excede el viewport |

### 3. Por Qué Cada Aserción

#### ✅ `carousel.left > title.right`
**Valida:** El carrusel está visualmente a la derecha del título

**Por qué funciona:**
- Si `carousel.left = 500` y `title.right = 300`
- Entonces el carrusel EMPIEZA (left=500) DESPUÉS de que el título TERMINA (right=300)
- Esto significa que no hay overlap horizontal y el carrusel está a la derecha

**Falla cuando:**
- El carrusel está encima del título (mobile mal configurado)
- El float no funciona y el carrusel pushea el título hacia abajo

#### ✅ `talks.width >= container.width * 0.5`
**Valida:** El texto de las charlas usa el espacio disponible

**Por qué funciona:**
- En desktop, si el carrusel ocupa ~30% + márgenes ~10% = 40% ocupado
- El texto DEBE ocupar al menos 50% para usar el espacio restante
- Si ocupa menos, significa que algo está mal con el layout

**Threshold dinámico:**
```javascript
const isMobile = viewport.width < 768;
const threshold = isMobile ? 0.80 : 0.50;  // Mobile necesita más %
```

#### ✅ `scrollWidth <= viewportWidth + 1`
**Valida:** No hay scroll horizontal

**Por qué funciona:**
- `scrollWidth` = ancho total del contenido (incluso lo oculto)
- `viewportWidth` = ancho visible de la ventana
- Si `scrollWidth > viewportWidth`, hay contenido que causa scroll horizontal
- Tolerancia de 1px para subpixel rounding

### 4. Viewports Usados

```javascript
// playwright.config.js
projects: [
  {
    name: 'desktop',
    use: { ...devices['Desktop Chrome'] }  // 1920x1080
  },
  {
    name: 'mobile',
    use: { ...devices['iPhone 12'] }       // 390x844
  },
]
```

**Por qué estos:**
- Desktop Chrome: Viewport común, representa monitors modernos
- iPhone 12: Viewport mobile popular, ~390px width

**Ambos proyectos ejecutan los MISMOS tests** con las MISMAS aserciones.
Las aserciones se adaptan automáticamente detectando el viewport.

## Comandos de Ejecución

### Ejecutar todos los tests
```bash
npm test
```

### Modo UI (interactivo, recomendado para desarrollo)
```bash
npm run test:ui
```
- Muestra el navegador
- Step-by-step debugging
- Inspección visual + mediciones

### Modo headed (ver el navegador)
```bash
npm run test:headed
```
- Útil para ver qué está pasando visualmente
- Los tests siguen siendo objetivos

### Ejecutar solo un test específico
```bash
npx playwright test -g "carousel is positioned to the right"
```

### Ejecutar solo un viewport
```bash
npx playwright test --project=desktop
npx playwright test --project=mobile
```

### Debug mode
```bash
npx playwright test --debug
```
- Pausa la ejecución
- Permite inspeccionar el DOM
- Ver los valores de getBoundingClientRect() en tiempo real

## Interpretando los Resultados

### ✅ Test pasa
```
✓ carousel is positioned to the right of title (desktop) (234ms)
✓ carousel is positioned to the right of title (mobile) (189ms)
```
**Significado:** El requisito se cumple en ambos viewports.

### ❌ Test falla
```
✗ carousel is positioned to the right of title (mobile) (189ms)

  expect(received).toBeGreaterThan(expected)

  Expected: > 300
  Received: 150
```

**Interpretación:**
- `carousel.left = 150` (el carrusel empieza en x=150)
- `title.right = 300` (el título termina en x=300)
- **Problema:** El carrusel está DETRÁS del título (x=150 < x=300)
- **Diagnóstico:** El float no funciona en mobile, el carrusel se posiciona encima

**Cómo debuggear:**
1. Ejecuta con `--headed` para ver el problema
2. Mira los console.logs que imprimen las mediciones
3. Usa dev tools para inspeccionar el CSS aplicado

## Patrón Reutilizable para Futuros Bugs de Layout

### Template de Test

```javascript
import { test, expect } from '@playwright/test';

async function getBoundingBox(page, selector) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  return await element.evaluate(el => el.getBoundingClientRect().toJSON());
}

test.describe('Layout Requirement: [DESCRIPCIÓN]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tu-pagina');
    await page.locator('.elemento-clave').waitFor({ state: 'visible' });
  });

  test('requisito espacial específico', async ({ page }) => {
    const elementA = await getBoundingBox(page, '.element-a');
    const elementB = await getBoundingBox(page, '.element-b');

    // Log para debugging
    console.log(`A: left=${elementA.left}, right=${elementA.right}`);
    console.log(`B: left=${elementB.left}, right=${elementB.right}`);

    // Aserción basada en relación espacial
    expect(elementA.left).toBeGreaterThan(elementB.right);
  });
});
```

### Checklist para Nuevos Tests de Layout

1. **Identifica el requisito espacial**
   - "X debe estar a la derecha de Y"
   - "X debe ocupar N% del ancho"
   - "X no debe hacer overflow"

2. **Traduce a matemática**
   - Derecha de: `X.left > Y.right`
   - Ancho %: `X.width >= Container.width * N`
   - No overflow: `scrollWidth <= viewportWidth`

3. **Añade logging**
   - Imprime las mediciones
   - Ayuda a debuggear cuando falla

4. **Define viewports relevantes**
   - Mobile: < 768px
   - Tablet: 768-1024px
   - Desktop: > 1024px

5. **Añade tolerancia cuando sea necesario**
   - Subpixel rounding: `± 1px`
   - Márgenes flexibles: `± 5px`

## Ventajas de Este Approach

### ✅ Objetivo
- Los números no mienten
- No depende de interpretación visual
- Falsos positivos casi imposibles

### ✅ Determinístico
- Sin timeouts arbitrarios
- Sin race conditions
- Resultados reproducibles

### ✅ Mantenible
- Tests sobreviven cambios de diseño visual
- Solo fallan si el layout realmente está roto
- Fácil de entender qué falló

### ✅ Rápido
- No genera/compara screenshots
- No requiere assets externos
- Ejecuta en segundos

### ✅ Multi-viewport sin esfuerzo
- Mismos tests, múltiples dispositivos
- Detección automática de viewport
- Aserciones adaptables

## Limitaciones y Cuándo NO Usar

### ❌ No usar para:
- Validación de colores exactos
- Verificación de fonts/tipografía
- Animaciones frame-by-frame
- Alineamiento visual subjetivo ("se ve bien")

### ✅ Usar para:
- Posiciones relativas (izquierda/derecha/arriba/abajo)
- Tamaños absolutos o relativos
- Overflow/scroll issues
- Responsive breakpoints
- Float/flex/grid layouts

## Ejemplo Real: Debugging del Bug Actual

### Síntoma
"El carrusel sale encima del título en mobile"

### Hipótesis
El `float: right` no funciona correctamente en mobile.

### Test que lo captura
```javascript
test('carousel is positioned to the right of title', async ({ page }) => {
  const carousel = await getBoundingBox(page, '.photo-carousel');
  const title = await getBoundingBox(page, '.speaking-intro h1');

  expect(carousel.left).toBeGreaterThan(title.right);
});
```

### Resultado Esperado (Mobile)
```
✓ carousel is positioned to the right of title (mobile)
```

### Resultado Real (Si está roto)
```
✗ carousel is positioned to the right of title (mobile)

  Expected: > 50  (title.right)
  Received: 105   (carousel.left)

  Pero 105 > 50, así que ¿por qué falla?

  Oh wait, si el carrusel está ENCIMA del título:
  - title.top = 100, title.bottom = 150
  - carousel.top = 80, carousel.bottom = 260

  El test de "right" pasa, pero VISUALMENTE están encimados.
```

**Lesson Learned:** Necesitas validar AMBAS dimensiones (x e y).

### Test Mejorado
```javascript
test('carousel is positioned to the right of title', async ({ page }) => {
  const carousel = await getBoundingBox(page, '.photo-carousel');
  const title = await getBoundingBox(page, '.speaking-intro h1');

  // Validar posición horizontal
  expect(carousel.left).toBeGreaterThan(title.right);

  // Validar que están en rangos verticales similares (no encimados verticalmente)
  const verticalOverlap = Math.max(0,
    Math.min(carousel.bottom, title.bottom) - Math.max(carousel.top, title.top)
  );
  expect(verticalOverlap).toBeLessThan(50); // Máximo 50px de overlap permitido
});
```

## Conclusión

**Testing de layout = Geometría, no estética.**

Con este patrón:
1. Defines requisitos espaciales objetivos
2. Los traduces a aserciones matemáticas
3. Los validas en múltiples viewports automáticamente
4. Detectas regresiones inmediatamente

**No más "se ve mal" sin pruebas. Ahora tienes números que lo demuestran.**
