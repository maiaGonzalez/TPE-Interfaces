# 📋 FLUJO DEL JUEGO PEG SOLITAIRE

## 📊 1️⃣ INICIO DEL JUEGO

```
Usuario abre pegSolitaire.html
    ↓
Se muestra menú inicial con opciones de fichas
    ↓
Usuario hace click en "Jugar"
    ↓
Se oculta menú y se muestra canvas
    ↓
Se crea el tablero 7×7 en forma de cruz
    ↓
Se colocan 32 fichas (todas excepto el centro)
    ↓
Se inicia cronómetro (5 minutos = 300 segundos)
    ↓
Se activan los event listeners del canvas
    ↓
Juego listo para jugar ✅
```

**Archivos involucrados:**
- `pegSolitaire.html` - Interfaz
- `game.js` - Clase Game (lógica principal)
- `tablero.js` - Clase Tablero (estructura del juego)
- `casilla.js` - Clase Casilla (celdas individuales)
- `pieza.js` - Clase Pieza (fichas del juego)

---

## 🎮 2️⃣ CUANDO MUEVES UNA FICHA (Drag & Drop)

### **Paso 1: MOUSE DOWN (Presionas el botón)**

```javascript
// Función: onMouseDown(e) en game.js

Usuario hace click en una ficha
    ↓
Se detecta la posición del click (x, y)
    ↓
Se busca qué casilla fue clickeada (obtenerCasillaEnPosicion)
    ↓
¿Hay ficha en esa casilla?
    ├─ SÍ:
    │   ├─ this.arrastrando = true
    │   ├─ this.fichaArrastrada = casilla
    │   ├─ this.fichaSeleccionada = casilla
    │   ├─ Guardar posición original: pieza.xOriginal, pieza.yOriginal
    │   ├─ Buscar movimientos válidos (obtenerMovimientosValidos)
    │   │  └─ Solo saltos: arriba, abajo, izquierda, derecha (NO diagonal)
    │   ├─ casilla.seleccionada = true (marcada amarilla)
    │   ├─ this.movimientosValidos = [...] (casillas verdes)
    │   └─ Redibujar canvas
    │
    └─ NO: No hacer nada
```

**Código relevante:**
```javascript
onMouseDown(e) {
    if (!this.juegoActivo || this.animando) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const casilla = this.tablero.obtenerCasillaEnPosicion(x, y);

    if (casilla && casilla.tienePieza()) {
      this.arrastrando = true;
      this.fichaArrastrada = casilla;
      this.fichaSeleccionada = casilla;
      this.movimientosValidos = this.tablero.obtenerMovimientosValidos(casilla);
      casilla.seleccionada = true;

      const pieza = casilla.obtenerPieza();
      pieza.xOriginal = pieza.x;
      pieza.yOriginal = pieza.y;

      this.posicionMouse = { x, y };
      this.dibujar();
    }
}
```

---

### **Paso 2: MOUSE MOVE (Mueves el ratón)**

```javascript
// Función: onMouseMove(e) en game.js

Usuario mantiene presionado y mueve el mouse
    ↓
¿Se está arrastrando una ficha? (this.arrastrando === true)
    ├─ SÍ:
    │   ├─ Obtener nueva posición del mouse (x, y)
    │   ├─ Actualizar posición X de la ficha: pieza.x = x
    │   ├─ Actualizar posición Y de la ficha: pieza.y = y
    │   ├─ La ficha sigue al cursor en tiempo real
    │   ├─ this.posicionMouse = { x, y }
    │   └─ Redibujar canvas (this.dibujar())
    │
    └─ NO: No hacer nada
```

**Código relevante:**
```javascript
onMouseMove(e) {
    if (!this.arrastrando || !this.fichaArrastrada) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pieza = this.fichaArrastrada.obtenerPieza();
    pieza.x = x;
    pieza.y = y;

    this.posicionMouse = { x, y };
    this.dibujar();
}
```

---

### **Paso 3: MOUSE UP (Sueltas el botón)**

```javascript
// Función: onMouseUp(e) en game.js

Usuario suelta el botón del mouse (o sale del canvas)
    ↓
¿Se estaba arrastrando? (this.arrastrando === true)
    ├─ SÍ:
    │   ├─ Detectar dónde soltó la ficha (x, y)
    │   ├─ Buscar casilla en esa posición
    │   ├─ ¿Es un movimiento válido?
    │   │  (¿La casilla destino está en movimientosValidos?)
    │   │
    │   ├─ SÍ (MOVIMIENTO CORRECTO ✅):
    │   │   ├─ Ejecutar movimiento: realizarMovimiento()
    │   │   ├─ Mover ficha al destino
    │   │   ├─ ELIMINAR la ficha que fue saltada ❌
    │   │   ├─ Incrementar this.movimientos++
    │   │   ├─ Actualizar piezasRestantes
    │   │   ├─ Actualizar interfaz (actualizarStats)
    │   │   ├─ Deseleccionar ficha
    │   │   ├─ Verificar fin del juego (verificarFinJuego)
    │   │   └─ Redibujar canvas
    │   │
    │   └─ NO (MOVIMIENTO INCORRECTO ❌):
    │       ├─ Regresar ficha a posición original
    │       │  pieza.x = pieza.xOriginal
    │       │  pieza.y = pieza.yOriginal
    │       ├─ Deseleccionar ficha
    │       ├─ Limpiar movimientos válidos (verdes desaparecen)
    │       └─ Redibujar canvas
    │
    ├─ this.arrastrando = false
    ├─ this.fichaArrastrada = null
    └─ this.deseleccionarFicha()
    
└─ NO: No hacer nada
```

**Código relevante:**
```javascript
onMouseUp(e) {
    if (!this.arrastrando || !this.fichaArrastrada) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const casilla = this.tablero.obtenerCasillaEnPosicion(x, y);
    const pieza = this.fichaArrastrada.obtenerPieza();

    // Verificar si es un movimiento válido
    const movimientoValido = this.movimientosValidos.find(
      (m) => m.destino === casilla
    );

    if (movimientoValido) {
      // Movimiento válido - ejecutar
      this.realizarMovimiento(movimientoValido);
    } else {
      // Movimiento inválido - regresar pieza a su lugar
      pieza.x = pieza.xOriginal;
      pieza.y = pieza.yOriginal;
    }

    // Limpiar estado de arrastre
    this.arrastrando = false;
    this.fichaArrastrada = null;
    this.deseleccionarFicha();
    this.dibujar();
}
```

---

### **MOUSE LEAVE (Bonus: Sales del canvas mientras arrastras)**

```javascript
// Evento: this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));

Usuario arrasta ficha y su cursor SALE del canvas
    ↓
Se dispara el evento mouseleave
    ↓
Se ejecuta onMouseUp(e) automáticamente
    ↓
La ficha regresa a su posición original
    ↓
Se limpia el estado de arrastre
```

---

## ✅ 3️⃣ MOVIMIENTOS VÁLIDOS - REGLAS

### **¿Cuándo un movimiento es válido?**

```javascript
// Función: obtenerMovimientosValidos(casilla) en tablero.js

Una ficha puede saltar SOLO si cumplen TODAS estas condiciones:

1. ✓ Hay una ficha adyacente en la dirección (arriba, abajo, izq, der)
   └─ NO diagonal (solo 4 direcciones)

2. ✓ Hay un espacio vacío al otro lado de esa ficha (2 casillas de distancia)

3. ✓ El salto es en línea recta (ARRIBA, ABAJO, IZQUIERDA, DERECHA)

Direcciones permitidas:
├─ Arriba:    df = -2, dc = 0  (salta -2 filas)
├─ Abajo:     df = +2, dc = 0  (salta +2 filas)
├─ Izquierda: df = 0,  dc = -2 (salta -2 columnas)
└─ Derecha:   df = 0,  dc = +2 (salta +2 columnas)
```

### **Ejemplo visual**

```
Antes del movimiento:
┌───┬───┬───┐
│ O │ X │ · │   O = Tu ficha (Origen)
├───┼───┼───┤   X = Ficha enemiga (Saltada)
│   │   │   │   · = Espacio vacío (Destino)
└───┴───┴───┘

Después del movimiento:
┌───┬───┬───┐
│ · │ · │ O │   La ficha saltó 2 espacios
├───┼───┼───┤   La ficha X fue eliminada
│   │   │   │
└───┴───┴───┘

Resultado:
├─ Tu ficha está en el destino
├─ La ficha enemiga fue eliminada
└─ Piezas restantes: -1
```

### **Código de búsqueda de movimientos válidos**

```javascript
obtenerMovimientosValidos(casillaOrigen) {
    const movimientos = [];
    const fila = casillaOrigen.fila;
    const col = casillaOrigen.col;

    // Direcciones: arriba, abajo, izquierda, derecha
    const direcciones = [
      { df: -2, dc: 0, mf: -1, mc: 0 }, // Arriba
      { df: 2, dc: 0, mf: 1, mc: 0 },   // Abajo
      { df: 0, dc: -2, mf: 0, mc: -1 }, // Izquierda
      { df: 0, dc: 2, mf: 0, mc: 1 },   // Derecha
    ];

    direcciones.forEach((dir) => {
      const filaDestino = fila + dir.df;
      const colDestino = col + dir.dc;
      const filaSaltada = fila + dir.mf;
      const colSaltada = col + dir.mc;

      // Verificar límites
      if (this.esPosicionValida(filaDestino, colDestino) &&
          this.esPosicionValida(filaSaltada, colSaltada)) {
        
        const casillaDestino = this.casillas[filaDestino][colDestino];
        const casillaSaltada = this.casillas[filaSaltada][colSaltada];

        // Verificar: destino vacío Y casilla saltada con pieza
        if (casillaDestino && !casillaDestino.tienePieza() &&
            casillaSaltada && casillaSaltada.tienePieza()) {
          
          movimientos.push({
            destino: casillaDestino,
            saltada: casillaSaltada,
          });
        }
      }
    });

    return movimientos;
}
```

---

## ❌ 4️⃣ MOVIMIENTO INCORRECTO - QUÉ PASA

### **Casos donde el movimiento es INVÁLIDO**

```javascript
Usuario intenta mover ficha a:

Caso 1: Una casilla ocupada (hay otra ficha)
    ├─ ❌ Movimiento incorrecto
    ├─ Razón: Destino no está vacío
    └─ Resultado: Ficha vuelve a su lugar original

Caso 2: Un espacio sin casilla saltada
    ├─ ❌ Movimiento incorrecto
    ├─ Razón: No hay ficha que saltar (solo 1 casilla de distancia)
    └─ Resultado: Ficha vuelve a su lugar original

Caso 3: Una casilla no válida (fuera del tablero)
    ├─ ❌ Movimiento incorrecto
    ├─ Razón: La posición no existe en el patrón del tablero
    └─ Resultado: Ficha vuelve a su lugar original

Caso 4: Un área fuera del canvas
    ├─ ❌ Movimiento incorrecto
    ├─ Razón: Soltaste fuera del área de juego
    ├─ Acción: Se dispara mouseleave → onMouseUp()
    └─ Resultado: Ficha vuelve a su lugar original

Caso 5: En diagonal
    ├─ ❌ Movimiento incorrecto
    ├─ Razón: Solo se permite en 4 direcciones (arriba, abajo, izq, der)
    └─ Resultado: Ficha vuelve a su lugar original
```

### **Lógica de rechazo**

```javascript
// En onMouseUp()
const movimientoValido = this.movimientosValidos.find(
  (m) => m.destino === casilla
);

if (movimientoValido) {
    // ✅ Aceptado: ejecutar movimiento
    this.realizarMovimiento(movimientoValido);
} else {
    // ❌ Rechazado: regresar ficha
    pieza.x = pieza.xOriginal;
    pieza.y = pieza.yOriginal;
}
```

---

## 🏁 5️⃣ FIN DEL JUEGO - CONDICIONES

### **¿Cuándo termina el juego?**

```javascript
// Función: verificarFinJuego() en game.js

El juego termina cuando UNA de estas condiciones se cumple:

Condición 1: ¡VICTORIA PERFECTA! 🏆
    ├─ Quedan exactamente 1 ficha
    ├─ Posición: Centro del tablero (ideal)
    └─ Puntuación: Máxima

Condición 2: ¡EXCELENTE! ⭐
    ├─ Quedan 2-3 fichas
    ├─ Razón: Casi lograstes victoria
    └─ Puntuación: Muy buena

Condición 3: ¡BUEN INTENTO! 👍
    ├─ Quedan 4-5 fichas
    ├─ Razón: Hicistes buen esfuerzo
    └─ Puntuación: Aceptable

Condición 4: SIN MOVIMIENTOS DISPONIBLES 😞
    ├─ Razón: hayMovimientosDisponibles() retorna false
    ├─ Significa: No puedes hacer más saltos
    └─ Resultado: Juego termina (pierdes)

Condición 5: TIEMPO AGOTADO ⏰
    ├─ Razón: this.tiempoRestante <= 0
    ├─ Cronómetro: Llegó a 0 segundos
    └─ Resultado: Juego termina (pierdes)
```

### **Código de verificación**

```javascript
verificarFinJuego() {
    this.piezasRestantes = this.tablero.contarPiezas();
    
    // Verificar si hay movimientos disponibles
    const hayMovimientos = this.tablero.hayMovimientosDisponibles();

    // ¿Alguna condición de fin de juego?
    if (!hayMovimientos || 
        this.piezasRestantes === 1 || 
        this.tiempoRestante <= 0) {
        
        console.log("No hay más movimientos disponibles.");
        this.juegoActivo = false;
        this.detenerTimer();
        this.finalizarJuego(); // Mostrar pantalla de fin
    }
}
```

### **Pantalla de fin - Determinación de resultado**

```javascript
finalizarJuego() {
    // Se muestra overlay semi-transparente
    // Se dibuja panel con resultado
    
    let titulo = "";
    let icono = "";
    let color = "";

    if (this.piezasRestantes === 1) {
        titulo = "¡VICTORIA PERFECTA!";
        icono = "🏆";
        color = "#FFD700"; // Dorado
    } 
    else if (this.piezasRestantes <= 3) {
        titulo = "¡EXCELENTE!";
        icono = "⭐";
        color = "#00ff88"; // Verde neón
    } 
    else if (this.piezasRestantes <= 5) {
        titulo = "¡BUEN INTENTO!";
        icono = "👍";
        color = "#4488ff"; // Azul
    } 
    else {
        titulo = "DERROTA";
        icono = "😞";
        color = "#ff4444"; // Rojo
    }
    
    // Mostrar resultado en pantalla
    // Mostrar botones: Reiniciar, Menú Principal
}
```

---

## 🎨 6️⃣ FLUJO VISUAL DEL CANVAS

### **Estados de las casillas**

```
Estado 1: SELECCIONADA (Amarilla) 🟨
    ├─ Color: Amarillo/dorado
    ├─ Significa: Esta es la ficha que estás moviendo
    ├─ Cuándo aparece: Cuando haces click en una ficha
    └─ Cuándo desaparece: Cuando sueltas

Estado 2: MOVIMIENTOS VÁLIDOS (Verde) 🟩
    ├─ Color: Verde brillante
    ├─ Significa: Puedes mover tu ficha aquí
    ├─ Cuándo aparecen: Cuando seleccionas una ficha
    ├─ Cantidad: 1-4 casillas verdes máximo
    └─ Cuándo desaparecen: Cuando deseleccionas o terminas movimiento

Estado 3: NORMAL (Gris/Original) ⚪
    ├─ Color: Gris/azul oscuro
    ├─ Significa: Casilla normal sin ficha
    ├─ Cuándo aparece: Siempre (excepto cuando está seleccionada)
    └─ Cuándo desaparece: Nunca (es estado por defecto)

Estado 4: FICHA (Con imagen) 🎮
    ├─ Imagen: Configurable (tema espacial)
    ├─ Ubicación: Centro de la casilla
    ├─ Cuándo aparece: En casillas ocupadas
    ├─ Cuándo desaparece: Cuando es saltada/eliminada
    └─ Animación: Se mueve con el cursor si la arrastras
```

### **Ejemplo visual durante el juego**

```
Tablero sin seleccionar nada:
┌────┬────┬────┬────┬────┬────┬────┐
│    │    │ 🎮 │ 🎮 │ 🎮 │    │    │
├────┼────┼────┼────┼────┼────┼────┤
│    │    │ 🎮 │ 🎮 │ 🎮 │    │    │
├────┼────┼────┼────┼────┼────┼────┤
│ 🎮 │ 🎮 │ 🎮 │ 🎮 │ 🎮 │ 🎮 │ 🎮 │
├────┼────┼────┼────┼────┼────┼────┤
│ 🎮 │ 🎮 │ 🎮 │    │ 🎮 │ 🎮 │ 🎮 │  (Centro vacío)
├────┼────┼────┼────┼────┼────┼────┤
│ 🎮 │ 🎮 │ 🎮 │ 🎮 │ 🎮 │ 🎮 │ 🎮 │
├────┼────┼────┼────┼────┼────┼────┤
│    │    │ 🎮 │ 🎮 │ 🎮 │    │    │
├────┼────┼────┼────┼────┼────┼────┤
│    │    │ 🎮 │ 🎮 │ 🎮 │    │    │
└────┴────┴────┴────┴────┴────┴────┘

Después de seleccionar una ficha:
┌────┬────┬────┬────┬────┬────┬────┐
│    │    │ 🎮 │ 🎮 │ 🎮 │    │    │
├────┼────┼────┼────┼────┼────┼────┤
│    │    │ 🎮 │ 🎮 │ 🎮 │    │    │
├────┼────┼────┼────┼────┼────┼────┤
│ 🎮 │ 🎮 │ 🎮 │🟨 │ 🟩 │ 🎮 │ 🎮 │  (Amarilla = tu ficha)
├────┼────┼────┼────┼────┼────┼────┤  (Verde = destino válido)
│ 🎮 │ 🎮 │ 🎮 │ 🟩 │ 🎮 │ 🎮 │ 🎮 │
├────┼────┼────┼────┼────┼────┼────┤
│ 🎮 │ 🎮 │ 🎮 │ 🎮 │ 🎮 │ 🎮 │ 🎮 │
├────┼────┼────┼────┼────┼────┼────┤
│    │    │ 🎮 │ 🎮 │ 🎮 │    │    │
├────┼────┼────┼────┼────┼────┼────┤
│    │    │ 🎮 │ 🎮 │ 🎮 │    │    │
└────┴────┴────┴────┴────┴────┴────┘
```

---

## 💾 7️⃣ ESTRUCTURA DE DATOS CLAVE

### **En Game.js**

```javascript
class Game {
    // Contadores
    this.piezasRestantes = 32    // Cantidad de fichas vivas (comienza en 32)
    this.movimientos = 0         // Total de movimientos realizados
    this.tiempoRestante = 300    // Segundos restantes (5 min = 300 seg)
    
    // Estado del juego
    this.juegoActivo = true      // ¿Se puede jugar?
    this.animando = false        // ¿Está en animación?
    this.arrastrando = false     // ¿Está arrastrando una ficha?
    
    // Referencias
    this.fichaSeleccionada = null      // Ficha que tocaste
    this.fichaArrastrada = null        // Ficha que estás moviendo
    this.movimientosValidos = []       // Array de movimientos posibles
    this.tablero = null                // Referencia al tablero
    
    // Timers
    this.timerInterval = null    // Intervalo del cronómetro
}
```

### **En Tablero.js**

```javascript
class Tablero {
    // Configuración
    this.filas = 7             // Alto del tablero
    this.columnas = 7          // Ancho del tablero
    this.tamanoCasilla = 60    // Píxeles por casilla
    
    // Datos
    this.casillas = [][]       // Matriz 7×7 de casillas
    this.patron = [][]         // Patrón de forma de cruz
    
    // La matriz se ve así:
    // casillas[fila][col] = Casilla o null
    //
    // casillas[0][0] = null (fuera del tablero)
    // casillas[0][2] = Casilla (dentro del tablero)
    // casillas[3][3] = Casilla (CENTRO VACÍO)
}
```

### **En Casilla.js**

```javascript
class Casilla {
    this.x, this.y           // Coordenadas del centro
    this.radioCasilla = 25   // Radio en píxeles
    this.fila, this.col      // Posición en la matriz
    this.pieza = null        // Referencia a la Pieza (si existe)
    this.seleccionada = false // ¿Está marcada amarilla?
    
    // Métodos
    tienePieza()             // Retorna true si hay ficha
    colocarPieza(pieza)      // Coloca una ficha
    quitarPieza()            // Quita la ficha
    obtenerPieza()           // Retorna la ficha
    contienePunto(x, y)      // ¿Está el punto (x,y) dentro?
    dibujar()                // Dibuja la casilla
}
```

### **En Pieza.js**

```javascript
class Pieza {
    this.x, this.y           // Posición actual en píxeles
    this.xOriginal           // Posición X original (para revertir)
    this.yOriginal           // Posición Y original (para revertir)
    this.radio = 20          // Tamaño en píxeles
    this.imagen = null       // Imagen de la ficha (tema espacial)
    
    // Métodos
    dibujar()                // Dibuja la ficha con su imagen
}
```

---

## 📊 8️⃣ RESUMEN RÁPIDO

| Acción | Evento | Qué pasa | Resultado |
|--------|--------|----------|-----------|
| **Click en ficha** | mousedown | Se selecciona y muestra verdes | Ficha marcada 🟨, destinos en 🟩 |
| **Arrastras ficha** | mousemove | Ficha sigue al cursor | Ficha se mueve visualmente |
| **Sueltas en verde** | mouseup | Movimiento válido | ✅ Ficha salta y elimina enemiga |
| **Sueltas en otra parte** | mouseup | Movimiento inválido | ❌ Ficha vuelve a su lugar |
| **Sales del canvas** | mouseleave | Cancela arrastre | ❌ Ficha regresa automáticamente |
| **No hay movimientos** | Verificación | Fin de juego | 😞 Pantalla de derrota |
| **Quedan 1 ficha** | Verificación | Victoria | 🏆 ¡VICTORIA PERFECTA! |
| **Timer = 0** | Tick del timer | Fin de juego | ⏰ Tiempo agotado |

---

## 🔄 9️⃣ CICLO DE DIBUJO (Game Loop)

```javascript
// Función: dibujar() en game.js

Se ejecuta constantemente durante el juego

1. Limpiar canvas
   ctx.clearRect(0, 0, width, height)

2. Dibujar fondo
   ctx.fillStyle = color de fondo
   ctx.fillRect(...)

3. Dibujar tablero
   tablero.dibujar()
   └─ Para cada casilla:
      ├─ Dibujar casilla (círculo)
      ├─ Si hay pieza: dibujar pieza (imagen)
      ├─ Si está seleccionada: resaltar amarilla
      └─ Si es movimiento válido: marcar verde

4. Dibujar información (stats)
   ├─ Tiempo: HH:MM:SS
   ├─ Piezas restantes: número
   └─ Movimientos realizados: número

5. Mostrar instrucciones (si está habilitado)
   ├─ Mostrar texto de ayuda
   ├─ Mostrar controles
   └─ Mostrar objetivo
```

---

## 🎓 📚 RESUMEN DEL FLUJO COMPLETO

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO DEL JUEGO                     │
└─────────────────────────────────────────────────────────────────┘

1. INICIO
   └─ HTML carga
      └─ Se muestra menú inicial
         └─ Usuario selecciona tema de fichas
            └─ Click en "Jugar"

2. PREPARACIÓN
   └─ Se oculta menú
      └─ Se crea tablero 7×7
         └─ Se colocan 32 fichas
            └─ Se inicia cronómetro (5 min)

3. JUEGO ACTIVO (Loop)
   ├─ Usuario hace click (mousedown)
   │  └─ Se selecciona ficha
   │     └─ Se muestran destinos verdes
   │
   ├─ Usuario mueve mouse (mousemove)
   │  └─ Ficha sigue al cursor
   │
   ├─ Usuario suelta (mouseup)
   │  ├─ ¿Movimiento válido?
   │  │  ├─ SÍ → Ejecutar movimiento
   │  │  │     ├─ Mover ficha
   │  │  │     ├─ Eliminar ficha saltada
   │  │  │     └─ Actualizar stats
   │  │  │
   │  │  └─ NO → Regresar ficha a su lugar
   │  │
   │  └─ Verificar fin de juego
   │
   └─ Redibujar canvas
      └─ Volver al paso 3 (hasta que termine)

4. FIN DE JUEGO
   ├─ ¿Quedan 1 ficha?
   │  └─ 🏆 VICTORIA PERFECTA
   │
   ├─ ¿Quedan 2-3 fichas?
   │  └─ ⭐ EXCELENTE
   │
   ├─ ¿Quedan 4-5 fichas?
   │  └─ 👍 BUEN INTENTO
   │
   ├─ ¿Sin movimientos?
   │  └─ 😞 DERROTA
   │
   └─ ¿Tiempo agotado?
      └─ ⏰ TIEMPO AGOTADO

5. PANTALLA DE FIN
   └─ Mostrar resultado
      ├─ Botón: Reiniciar
      ├─ Botón: Menú Principal
      └─ Opción: Compartir resultado
```

---

## 📝 NOTAS IMPORTANTES

- **Tablero:** 7×7 en forma de cruz (no es cuadrado completo)
- **Centro:** Siempre inicia vacío (fila 3, columna 3)
- **Fichas:** Comienzan 32, objetivo es dejar 1
- **Saltos:** Solo en 4 direcciones (arriba, abajo, izquierda, derecha)
- **Diagonal:** NO está permitida
- **Tiempo:** 5 minutos (300 segundos)
- **Draggy Drop:** Si sueltas fuera del tablero, regresa la ficha

---

**Archivo generado:** `FLUJO_PEG_SOLITAIRE.md`  
**Última actualización:** 12 de Noviembre de 2025
