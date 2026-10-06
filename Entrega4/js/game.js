class Game {
  constructor(ctx, width, height, config, canvas, menuInicio, gameUI) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.config = config;
    this.canvas = canvas;
    this.menuInicio = menuInicio;
    this.gameUI = gameUI;

    // Estado del juego
    this.tablero = null;
    this.fichaSeleccionada = null;
    this.movimientosValidos = [];
    this.piezasRestantes = 32;
    this.movimientos = 0;
    this.tiempoRestante = 60;
    this.timerInterval = null;
    this.juegoActivo = true;
    this.animando = false;

    // Guardar referencia global
    window.juegoActual = this;

    // Inicializar
    this.inicializar();
  }

  inicializar() {
    // Crear tablero con las configuraciones
    this.tablero = new Tablero(this.ctx, this.width, this.height, this.config);

    // Contar piezas iniciales
    this.piezasRestantes = this.tablero.contarPiezas();

    // Configurar eventos
    this.configurarEventos();

    // Iniciar timer
    this.iniciarTimer();

    // Actualizar stats iniciales
    this.actualizarStats();

    // Dibujar
    this.dibujar();
  }

  configurarEventos() {
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e));
    this.canvas.addEventListener("mouseleave", (e) => this.onMouseUp(e));
  }

  // ¿Cuándo se activa? Cuando presionas (haces click) el botón del mouse sobre el canvas.¿Qué hace en el juego?
  // Detecta si clickeaste una ficha
  // Si hay ficha, la "agarra" (empieza a arrastrarla)
  // Guarda que estás arrastrando (this.arrastrando = true)
  // Calcula los movimientos válidos
  // Marca la casilla como seleccionada (amarilla)
  // Analogía: Es como cuando agarras una ficha física con tu mano.
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

      // Guardar posición original de la pieza
      const pieza = casilla.obtenerPieza();
      pieza.xOriginal = pieza.x;
      pieza.yOriginal = pieza.y;

      this.posicionMouse = { x, y };
      this.dibujar();
    }
  }

  // ¿Cuándo se activa? Cada vez que mueves el mouse sobre el canvas (mientras esté presionado o no).
  // ¿Qué hace en el juego?

  // Si estás arrastrando una ficha (this.arrastrando === true)
  // Actualiza la posición de la ficha para que siga al cursor
  // Redibuja todo para ver la ficha moviéndose

  // Analogía: Es como mover tu mano con la ficha agarrada. La ficha se mueve contigo.

  onMouseMove(e) {
    if (!this.arrastrando || !this.fichaArrastrada) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Mover la pieza con el mouse
    const pieza = this.fichaArrastrada.obtenerPieza();
    pieza.x = x;
    pieza.y = y;

    this.posicionMouse = { x, y };
    this.dibujar();
  }

  // Cuándo se activa? Cuando sueltas el botón del mouse.
  // ¿Qué hace en el juego?
  // Detecta dónde soltaste la ficha
  // Verifica si es un movimiento válido (una casilla verde)
  // Si es válido: Ejecuta el movimiento (salta y elimina ficha)
  // Si NO es válido: Regresa la ficha a su posición original
  // Limpia el estado de arrastre (this.arrastrando = false)

  // Analogía: Es cuando sueltas la ficha. Si la soltaste en un lugar válido, el movimiento se hace. Si no, vuelve a su lugar.
  // y ademas esta mouseLeave que es usa la misma funcion que mouseUp para que si se sale del canvas se suelte la ficha
  // this.canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
  //
  // ¿Cuándo se activa?** Cuando el cursor sale del área del canvas (mientras estás arrastrando).

  // ¿Qué hace en el juego?
  // - Ejecuta lo mismo que `mouseup`
  // - Cancela el arrastre si sacas el mouse del canvas
  // - Regresa la ficha a su lugar original

  // **Analogía:** Si estás moviendo la ficha y tu mano sale de la mesa, la ficha vuelve automáticamente a su lugar.

  // ---

  // ## **Flujo completo del drag and drop:**
  // ```
  // 1. mousedown (presiono)
  //    ↓
  //    - Detecto la ficha clickeada
  //    - arrastrando = true
  //    - Guardo posición original
  //    - Muestro movimientos válidos (verdes)

  // 2. mousemove (muevo el mouse)
  //    ↓
  //    - Si arrastrando === true:
  //      - Actualizo posición de la pieza al cursor
  //      - Redibujo todo

  // 3. mouseup (suelto) o mouseleave (salgo del canvas)
  //    ↓
  //    - Detecto dónde solté
  //    - ¿Es movimiento válido?
  //      → SÍ: ejecuto movimiento
  //      → NO: regreso pieza a su lugar
  //    - arrastrando = false
  //    - Limpio selección
  // ```
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

  seleccionarFicha(casilla) {
    this.fichaSeleccionada = casilla;
    this.movimientosValidos = this.tablero.obtenerMovimientosValidos(casilla);

    // Marcar casilla como seleccionada
    casilla.seleccionada = true;
  }

  deseleccionarFicha() {
    if (this.fichaSeleccionada) {
      this.fichaSeleccionada.seleccionada = false;
      this.fichaSeleccionada = null;
    }
    this.movimientosValidos = [];
  }

 realizarMovimiento(movimiento) {
  // Extraer las casillas saltadas (puede ser array o singular)
  const casillaSaltada = movimiento.saltadas || movimiento.saltada;
  
  // Ejecutar movimiento en el tablero
  const exito = this.tablero.moverPieza(
    this.fichaSeleccionada,
    movimiento.destino,
    casillaSaltada  // <-- Pasar el valor correcto
  );

  if (exito) {
    // Actualizar estadísticas
    this.movimientos++;
    this.piezasRestantes = this.tablero.contarPiezas();
    this.actualizarStats();

    // Deseleccionar
    this.deseleccionarFicha();

    // Verificar fin del juego
    setTimeout(() => this.verificarFinJuego(), 100);
  }
}

  verificarFinJuego() {
    this.piezasRestantes = this.tablero.contarPiezas();
    // Verificar si hay movimientos disponibles
    const hayMovimientos = this.tablero.hayMovimientosDisponibles();

    if (!hayMovimientos || this.piezasRestantes === 1 || this.tiempoRestante <= 0) {
      console.log("No hay más movimientos disponibles.");
      this.juegoActivo = false;
      this.detenerTimer();
      this.finalizarJuego();
    }
  }

  finalizarJuego() {
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Dibujar fondo
    this.dibujarFondo();

    // Overlay semi-transparente
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Calcular dimensiones del panel
    const panelWidth = Math.min(this.width * 0.8, 500);
    const panelHeight = Math.min(this.height * 0.7, 400);
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;

    // Determinar título y color según resultado

    let titulo = "";
    let icono = "";
    let gradient;
    let glowColor; // <-- color string para shadowColor

    if (this.piezasRestantes === 1) {
      titulo = "¡VICTORIA PERFECTA!";
      icono = "🏆";
      glowColor = "#FFD700"; // dorado para glow
      gradient = this.ctx.createLinearGradient(
        panelX,
        panelY,
        panelX,
        panelY + panelHeight
      );
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "#FFA500");
    } else if (this.piezasRestantes <= 3) {
      titulo = "¡EXCELENTE!";
      icono = "⭐";
      glowColor = "#00ff88"; // verde neón para glow
      gradient = this.ctx.createLinearGradient(
        panelX,
        panelY,
        panelX,
        panelY + panelHeight
      );
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "#00cc66");
    } else if (this.piezasRestantes <= 5) {
      titulo = "¡BUEN INTENTO!";
      icono = "👍";
      glowColor = "#4488ff"; // azul para glow
      gradient = this.ctx.createLinearGradient(
        panelX,
        panelY,
        panelX,
        panelY + panelHeight
      );
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "#2266dd");
    } else {
      titulo = "FIN DEL JUEGO";
      icono = "🎮";
      glowColor = "#ff4444"; // rojo para glow
      gradient = this.ctx.createLinearGradient(
        panelX,
        panelY,
        panelX,
        panelY + panelHeight
      );
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "#cc2222");
    }

    // Dibujar panel principal con sombra luminosa tipo "neón"
    this.ctx.save();

    // Fondo oscuro con leve degradado
    const fondoGradient = this.ctx.createLinearGradient(
      panelX,
      panelY,
      panelX,
      panelY + panelHeight
    );
    fondoGradient.addColorStop(0, "#14142b");
    fondoGradient.addColorStop(1, "#0b0b20");

    // Sombra luminosa del color del resultado
    this.ctx.shadowColor = glowColor;
    this.ctx.shadowBlur = 60;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Relleno del panel (sin borde)
    this.ctx.fillStyle = fondoGradient;
    this.ctx.beginPath();
    this.ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 12);
    this.ctx.fill();

    this.ctx.restore();

    // Dibujar contenido
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Título
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 48px Arial";
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    this.ctx.shadowBlur = 10;
    this.ctx.fillText(titulo, this.width / 2, panelY + 70);

    // Icono
    this.ctx.font = "80px Arial";
    this.ctx.fillText(icono, this.width / 2, panelY + 150);

    // Estadísticas
    this.ctx.font = "24px Arial";
    this.ctx.fillText(
      `Fichas restantes: ${this.piezasRestantes}`,
      this.width / 2,
      panelY + 230
    );
    this.ctx.fillText(
      `Movimientos: ${this.movimientos}`,
      this.width / 2,
      panelY + 265
    );
    this.ctx.fillText(
      `Tiempo: ${formatTime(this.tiempoRestante)}`,
      this.width / 2,
      panelY + 300
    );

    this.ctx.restore();

    // Dibujar botones
    this.dibujarBotonesFinJuego(panelX, panelY, panelWidth, panelHeight);
  }

  dibujarBotonesFinJuego(panelX, panelY, panelWidth, panelHeight) {
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonSpacing = 20;
    const buttonY = panelY + panelHeight - 80;

    // Definir botones
    const btnReintentar = {
      x: this.width / 2 - buttonWidth - buttonSpacing / 2,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      text: "REINTENTAR",
      color: "#4CAF50",
    };

    const btnMenu = {
      x: this.width / 2 + buttonSpacing / 2,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      text: "MENÚ",
      color: "#2196F3",
    };

    // Dibujar botones
    [btnReintentar, btnMenu].forEach((btn) => {
      this.ctx.save();

      // Sombra
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetY = 4;

      // Botón
      this.ctx.fillStyle = btn.color;
      this.ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

      // Borde
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

      // Texto
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 18px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.shadowBlur = 5;
      this.ctx.fillText(
        btn.text,
        btn.x + btn.width / 2,
        btn.y + btn.height / 2
      );

      this.ctx.restore();
    });

    // Configurar eventos de click
    const clickHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Click en REINTENTAR
      if (
        x >= btnReintentar.x &&
        x <= btnReintentar.x + btnReintentar.width &&
        y >= btnReintentar.y &&
        y <= btnReintentar.y + btnReintentar.height
      ) {
        this.canvas.removeEventListener("click", clickHandler);
        this.canvas.removeEventListener("mousemove", hoverHandler);
        this.reiniciar();
      }

      // Click en MENÚ
      if (
        x >= btnMenu.x &&
        x <= btnMenu.x + btnMenu.width &&
        y >= btnMenu.y &&
        y <= btnMenu.y + btnMenu.height
      ) {
        this.canvas.removeEventListener("click", clickHandler);
        this.canvas.removeEventListener("mousemove", hoverHandler);
        this.detener();
        volverMenu();
      }
    };

    // Efecto hover
    const hoverHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const sobreBoton =
        (x >= btnReintentar.x &&
          x <= btnReintentar.x + btnReintentar.width &&
          y >= btnReintentar.y &&
          y <= btnReintentar.y + btnReintentar.height) ||
        (x >= btnMenu.x &&
          x <= btnMenu.x + btnMenu.width &&
          y >= btnMenu.y &&
          y <= btnMenu.y + btnMenu.height);

      this.canvas.style.cursor = sobreBoton ? "pointer" : "default";
    };

    this.canvas.addEventListener("click", clickHandler);
    this.canvas.addEventListener("mousemove", hoverHandler);
  }

  dibujar() {
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Dibujar fondo
    this.dibujarFondo();

    // Dibujar tablero (sin la ficha arrastrada)
    for (let fila = 0; fila < this.tablero.filas; fila++) {
      for (let col = 0; col < this.tablero.columnas; col++) {
        const casilla = this.tablero.casillas[fila][col];
        if (casilla) {
          // Si es la ficha arrastrada, dibujar solo la casilla vacía
          if (this.arrastrando && casilla === this.fichaArrastrada) {
            casilla.dibujarSolo(); // Nuevo método en Casilla
          } else {
            casilla.dibujar();
          }
        }
      }
    }

    // Dibujar movimientos válidos
    if (this.fichaSeleccionada && this.movimientosValidos.length > 0) {
      this.dibujarMovimientosValidos();
    }

    // Dibujar la ficha arrastrada encima de todo
    if (this.arrastrando && this.fichaArrastrada) {
      const pieza = this.fichaArrastrada.obtenerPieza();
      pieza.dibujar();
    }
  }

  dibujarFondo() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, this.config.fondo.color1);
    gradient.addColorStop(1, this.config.fondo.color2);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  dibujarMovimientosValidos() {
    // Usar el tiempo para crear el efecto de pulso
    const tiempo = Date.now() / 1000; // Tiempo en segundos
    const pulso = Math.sin(tiempo * 3) * 0.5 + 0.5; // Oscila entre 0 y 1

    this.movimientosValidos.forEach((movimiento) => {
      const casilla = movimiento.destino;

      this.ctx.save();

      // Círculo interior con pulso
      const radioInterior = casilla.radio * (0.3 + pulso * 0.3); // Varía entre 0.3 y 0.6
      this.ctx.globalAlpha = 0.6;
      this.ctx.fillStyle = "#00ff00";
      this.ctx.beginPath();
      this.ctx.arc(casilla.x, casilla.y, radioInterior, 0, Math.PI * 2);
      this.ctx.fill();

      // Anillo exterior fijo (sin pulso)
      const radioBorde = casilla.radio + 4; // Fijo (puedes ajustar el valor)
      this.ctx.globalAlpha = 1; // opacidad completa
      this.ctx.strokeStyle = "#00ff00";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(casilla.x, casilla.y, radioBorde, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.restore();
    });

    // Redibujar continuamente para mantener la animación
    if (this.juegoActivo && this.movimientosValidos.length > 0) {
      requestAnimationFrame(() => this.dibujar());
    }
  }

  iniciarTimer() {
    this.tiempoRestante = 4000000000000000;
    this.actualizarStats();

    this.timerInterval = setInterval(() => {
      if (this.juegoActivo) {
        this.tiempoRestante--;
        this.actualizarStats();

        // Si llega a 0, terminar juego automáticamente
        if (this.tiempoRestante <= 0) {
          this.tiempoRestante = 0;
          this.detenerTimer();
          this.juegoActivo = false;
          this.piezasRestantes = this.tablero.contarPiezas(); // ← AGREGAR ESTA LÍNEA
          this.finalizarJuego();
        }
      }
    }, 1000);
  }

  detenerTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  actualizarStats() {
    actualizarStats(
      this.piezasRestantes,
      this.movimientos,
      this.tiempoRestante
    );
  }

  reiniciar() {
    // Detener timer anterior
    this.detenerTimer();

    // Resetear variables
    this.fichaSeleccionada = null;
    this.movimientosValidos = [];
    this.movimientos = 0;
    this.tiempoRestante = 60;
    this.juegoActivo = true;
    this.animando = false;

    // Reinicializar tablero
    this.tablero.reiniciar();
    this.piezasRestantes = this.tablero.contarPiezas();

    // Reiniciar timer
    this.iniciarTimer();

    // Actualizar stats
    this.actualizarStats();

    // Redibujar
    this.dibujar();
  }

  detener() {
    this.juegoActivo = false;
    this.detenerTimer();

    // Limpiar eventos
    this.canvas.replaceWith(this.canvas); //.cloneNode(true));

    this.fichaSeleccionada = null;
    this.movimientosValidos = [];
    // Actualizar referencia al canvas
    //this.canvas = document.querySelector("#canvas");
  }
}
