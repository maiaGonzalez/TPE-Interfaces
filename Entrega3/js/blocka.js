const canvas = document.querySelector("#blocka-canvas");
const ctx = canvas.getContext("2d");

const playButton = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 60,
};
let botonAyuda = null;

const helpButton = {
  x: 0,
  y: 0,
  radius: 60,
};

let mostrarInstrucciones = false;

// Variables globales

let gameState = "menu"; // menu, cargando, seleccion-dificultad, seleccion-imagen, jugando
let imagenSeleccionada = null;
let imagenOriginal = null; // global
let spinnerAngle = 0;
let imagenesListas = 0;
let dificultadSeleccionada = null;
let piezas = [];
let tiempoLimite = null;
let tiempoTranscurrido = 0;
let intervaloTemporizador = null;
let juegoCompletado = false;
let records = {}; // Récords por nivel
let nivelActual = 1; // Contador de niveles
let filtrosActivos = true;
let cantidadAyudas = 1;
let piezaResaltada = null;
let tiempoResaltado = 0;
let botonPlayJuego = null;
let juegoListo = false;
const FILTROS_DISPONIBLES = [
  "grayscale", // Escala de grises
  "brightness", // Brillo reducido al 30%
  "invert", // Negativo
  "blur",
];

let filtroActual = "";

// Opciones de dificultad globales
const opcionesDificultad = [
  {
    nivel: "Fácil",
    cuadros: 4,
    filas: 2,
    columnas: 2,
    descripcion: "2x2",
    tiempoLimite: null,
  },
  {
    nivel: "Medio+",
    cuadros: 6,
    filas: 2,
    columnas: 3,
    descripcion: "2x3",
    tiempoLimite: 40000,
  },
  {
    nivel: "Medio++",
    cuadros: 8,
    filas: 2,
    columnas: 4,
    descripcion: "2x4",
    tiempoLimite: 40000,
  },
  {
    nivel: "Medio",
    cuadros: 9,
    filas: 3,
    columnas: 3,
    descripcion: "3x3",
    tiempoLimite: 40000,
  },
  {
    nivel: "Difícil",
    cuadros: 16,
    filas: 4,
    columnas: 4,
    descripcion: "4x4",
    tiempoLimite: 30000,
  },
  {
    nivel: "Sorpresa",
    cuadros: 16,
    filas: 4,
    columnas: 4,
    descripcion: "4x4",
    tiempoLimite: 30000,
  },
];

const backgroundImage = new Image();
backgroundImage.src = "assets/images/blocka.png";

let imagenCargada = false;

backgroundImage.onload = function () {
  imagenCargada = true;
  console.log("✅ Imagen de fondo cargada");
};

const imagenes = [
  { src: "assets/images/dino1.jpg", loaded: false },
  { src: "assets/images/dino2.jpg", loaded: false },
  { src: "assets/images/dino3.jpg", loaded: false },
  { src: "assets/images/dino4.jpg", loaded: false },
  { src: "assets/images/dino5.jpg", loaded: false },
  { src: "assets/images/dino6.jpg", loaded: false },
];

// Cargar imágenes
imagenes.forEach((img, index) => {

   const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 40;

    // Texto "Cargando..."
    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Cargando juego", centerX, centerY - 80);
  const image = new Image();
  image.src = img.src;

  image.onload = () => {
    img.loaded = true;
    img.element = image; // para usar en el juego

    // Crear una nueva imagen para original
    const original = new Image();
    original.src = img.src; // mismo src
    original.onload = () => {
      img.original = original; // versión limpia ya cargada
    };
    console.log(`✅ Imagen cargada: ${img.src}`);
   

    imagenesListas++;

    if (imagenesListas === imagenes.length) {
      console.log("✅ Todas las imágenes cargadas");
      todasLasImagenesCargadas();
    }
  };

  image.onerror = () => {
    console.error(`❌ Error cargando: ${img.src}`);
  };
});

//funciones de dibujo de ui

function drawUi() {
  // Fondo
  if (gameState !== "menu") {
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "seleccion-dificultad") {
    seleccionarNivelDeDificultad();
  } else if (gameState === "seleccion-imagen") {
    mostrarSeleccionImagenes();
  } else if (gameState === "listo-para-jugar") {
    // ← NUEVO
    mostrarListoParaJugar();
  } else if (gameState === "jugando") {
    mostarGame();
  } else if (gameState === "victoria") {
    mostrarPantallaVictoria();
  } else if (gameState === "derrota") {
    // ⬅️ AGREGAR
    mostrarPantallaDerrota();
  } else if (gameState === "final-dificultad") {
    mostrarPantallaFinalDificultad();
  }
}

function mostrarPantallaFinalDificultad() {
  // Limpiar canvas
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título principal
  ctx.fillStyle = "#FFD700"; // dorado
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("¡FELICITACIONES!", canvas.width / 2, 80);

  // Mensaje de logro
  ctx.fillStyle = "#00ff00";
  ctx.font = "bold 36px Arial";
  ctx.fillText(
    "¡Completaste todos los niveles de esta dificultad!",
    canvas.width / 2,
    150
  );

  // Mostrar imagen final o trofeo
  const imgSize = 300;
  const imgX = canvas.width / 2 - imgSize / 2;
  const imgY = 200;

  // Si querés, mostrar la última imagen sin filtros
  if (imagenSeleccionada.loaded && imagenSeleccionada.original) {
    ctx.drawImage(imagenSeleccionada.original, imgX, imgY, imgSize, imgSize);
  }

  // Botón volver al menú
  const btnWidth = 300;
  const btnHeight = 70;
  const btnX = canvas.width / 2 - btnWidth / 2;
  const btnY = canvas.height - 120;

  window.botonMenuFinal = {
    x: btnX,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
  };

  ctx.fillStyle = "#555555";
  ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 3;
  ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial";
  ctx.fillText("VOLVER AL MENÚ", canvas.width / 2, btnY + 44);

  // Cambiar estado
  gameState = "final-dificultad";
}

function drawMenu() {
  // Dibujar imagen de fondo difuminada
  if (imagenCargada) {
    console.log("✅ Dibujando imagen difuminada");
    ctx.filter = "blur(8px)";
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
    ctx.fillStyle = "rgba(30, 30, 30, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    console.log("⏳ Imagen aún no cargada, usando fallback");
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (mostrarInstrucciones) {
    mostrarPantallaInstrucciones();
    return;
  }

  // Posicionar botones
  playButton.x = canvas.width / 2 - 80;
  playButton.y = canvas.height / 2;

  helpButton.x = canvas.width / 2 + 80;
  helpButton.y = canvas.height / 2;

  // Dibujar botón de PLAY
  drawPlayButton(playButton.x, playButton.y, playButton.radius);

  // Dibujar botón de INSTRUCCIONES
  drawHelpButton(helpButton.x, helpButton.y, helpButton.radius);

  // Título del juego
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px Arial";
  ctx.textAlign = "center";
  ctx.fillText("BLOCKA", canvas.width / 2, 100);

  // Texto instructivo
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Toca PLAY para comenzar o ? para ver instrucciones",
    canvas.width / 2,
    canvas.height - 50
  );
}

function drawHelpButton(x, y, radius) {
  // Círculo azul
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#3498db";
  ctx.fill();
  ctx.closePath();

  // Borde
  ctx.strokeStyle = "#2980b9";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Símbolo de interrogación (?)
  ctx.fillStyle = "white";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", x, y);
}

function mostrarPantallaInstrucciones() {
  // Fondo
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título
  ctx.fillStyle = "#3498db";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("CÓMO JUGAR", canvas.width / 2, 80);

  // Contenido de instrucciones
  const instrucciones = [
    "Completa el rompecabezas rotando todas las piezas",
    "hasta formar la imagen original.",
    "",
    "CONTROLES",
    "",
    "• Click izquierdo: Girar pieza hacia la izquierda (↺)",
    "• Click derecho: Girar pieza hacia la derecha (↻)",
    "",
    "MODOS DE JUEGO",
    "",

    "• Fácil (2x2): Sin límite de tiempo",
    "• Medio (3x3): 40 segundos",
    "• Difícil (4x4): 30 segundos",
    "",
    "AYUDA",
    "",

    "Tienes 1 ayuda por nivel que corrige",
    "una pieza automáticamente.",
    "Usar ayuda resta 5 segundos en Medio/Difícil.",
    "",
    "",

    "¡Buena suerte!",
  ];

  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.textAlign = "left";

  let y = 140;
  instrucciones.forEach((linea) => {
    // Títulos en negrita y centrados
    if (
      linea.includes("🎯") ||
      linea.includes("🖱️") ||
      linea.includes("⏱️") ||
      linea.includes("💡") ||
      linea.includes("🏆")
    ) {
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#3498db";
      ctx.fillText(linea, canvas.width / 2, y);
      ctx.font = "20px Arial";
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
    } else if (linea === "") {
      // Línea vacía (espacio)
      y += 10;
      return;
    } else {
      // Contenido normal
      const margenIzq = 100;
      ctx.fillText(linea, margenIzq, y);
    }
    y += 30;
  });

  // Botón VOLVER
  const btnWidth = 200;
  const btnHeight = 60;
  const btnX = canvas.width / 2 - btnWidth / 2;
  const btnY = canvas.height - 100;

  // Guardar coordenadas del botón
  window.botonVolverInstrucciones = {
    x: btnX,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
  };

  ctx.fillStyle = "#27ae60";
  ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
  ctx.strokeStyle = "#2ecc71";
  ctx.lineWidth = 3;
  ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("VOLVER", canvas.width / 2, btnY + 38);
}

function seleccionarNivelDeDificultad() {
  // Limpiar canvas
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("BLOCKA", canvas.width / 2, 100);

  // Subtítulo
  ctx.font = "24px Arial";
  ctx.fillStyle = "#cccccc";
  ctx.fillText("Selecciona la dificultad", canvas.width / 2, 160);

  const espacioY = 80;
  const inicioY = 220;

  opcionesDificultad.forEach((opcion, index) => {
    const y = inicioY + index * espacioY;
    const rectX = canvas.width / 2 - 200;
    const rectY = y - 35;
    const rectWidth = 400;
    const rectHeight = 60;

    // Guardar coordenadas para clicks
    opcion.x = rectX;
    opcion.y = rectY;
    opcion.width = rectWidth;
    opcion.height = rectHeight;

    // Botón normal
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    ctx.strokeStyle = "#4a4a4a";
    ctx.lineWidth = 2;
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

    // Borde de debug
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(opcion.x, opcion.y, opcion.width, opcion.height);

    // Texto
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "left";
    ctx.fillText(opcion.nivel, rectX + 20, y);

    ctx.fillStyle = "#888888";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.fillText(opcion.descripcion, rectX + rectWidth - 20, y);
  });

  // Instrucción
  ctx.fillStyle = "#666666";
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Haz clic en una opción para comenzar",
    canvas.width / 2,
    canvas.height - 40
  );
}

function animarSeleccionImagen() {
  let contador = 0;
  const duracion = 120; // frames de animación (más rápido y suave que setInterval)
  let indiceActual = 0;

  function animar() {
    // Limpiar canvas
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Seleccionando imagen al azar...", canvas.width / 2, 50);

    // Configuración de la grilla
    const cols = 3;
    const imgWidth = 150;
    const imgHeight = 150;
    const padding = 20;
    const startX =
      (canvas.width - (cols * imgWidth + (cols - 1) * padding)) / 2;
    const startY = 100;

    imagenes.forEach((img, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (imgWidth + padding);
      const y = startY + row * (imgHeight + padding);

      // Resaltar la imagen actual en la animación
      const esActual = index === indiceActual;

      ctx.fillStyle = esActual ? "#00aa00" : "#34495e";
      ctx.fillRect(x, y, imgWidth, imgHeight);

      // Dibujar imagen si está cargada
      if (img.loaded && img.element) {
        ctx.drawImage(img.element, x, y, imgWidth, imgHeight);

        // Overlay verde si es la actual
        if (esActual) {
          ctx.fillStyle = "rgba(0, 255, 0, 0.4)";
          ctx.fillRect(x, y, imgWidth, imgHeight);
        }
      }

      // Borde
      ctx.strokeStyle = esActual ? "#00ff00" : "#27ae60";
      ctx.lineWidth = esActual ? 5 : 2;
      ctx.strokeRect(x, y, imgWidth, imgHeight);
    });

    // Barra de progreso
    const barWidth = 300;
    const barHeight = 20;
    const barX = canvas.width / 2 - barWidth / 2;
    const barY = canvas.height - 100;

    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#00ff00";
    ctx.fillRect(barX, barY, (contador / duracion) * barWidth, barHeight);

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    contador++;

    // Cambiar índice cada 2-3 frames (más rápido al principio, más lento al final)
    const velocidad = contador < duracion * 0.7 ? 2 : 4;
    if (contador % velocidad === 0) {
      indiceActual = Math.floor(Math.random() * imagenes.length);
    }

    if (contador < duracion) {
      requestAnimationFrame(animar);
    } else {
      if (!imagenSeleccionada) {
        const indiceAleatorio = Math.floor(Math.random() * imagenes.length);
        imagenSeleccionada = imagenes[indiceAleatorio];
      }

      console.log(`✅ Imagen final seleccionada: ${imagenSeleccionada.src}`);

      // Mostrar imagen grande
      mostrarImagenGrandeYComenzar();
    }
  }

  animar();
}
function mostrarSeleccionImagenes() {
  // Limpiar canvas
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Dale a comenzar para elegir una imagen al azar",
    canvas.width / 2,
    50
  );

  // Configuración de la grilla (2 filas x 3 columnas)
  const cols = 3;
  const rows = 2;
  const imgWidth = 150;
  const imgHeight = 150;
  const padding = 20;
  const startX = (canvas.width - (cols * imgWidth + (cols - 1) * padding)) / 2;
  const startY = 100;

  imagenes.forEach((img, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + col * (imgWidth + padding);
    const y = startY + row * (imgHeight + padding);

    // Guardar coordenadas para detectar clicks
    img.x = x;
    img.y = y;
    img.width = imgWidth;
    img.height = imgHeight;

    // Resaltar si está seleccionada
    const esSeleccionada = imagenSeleccionada === img;

    // Dibujar rectángulo de fondo
    ctx.fillStyle = esSeleccionada ? "#2c5f2d" : "#34495e";
    ctx.fillRect(x, y, imgWidth, imgHeight);

    // Dibujar imagen si está cargada
    if (img.loaded && img.element) {
      ctx.drawImage(img.element, x, y, imgWidth, imgHeight);
    } else {
      // Mostrar "Cargando..." si no está lista
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Cargando...", x + imgWidth / 2, y + imgHeight / 2);
    }

    // Borde (verde brillante si está seleccionada)
    ctx.strokeStyle = esSeleccionada ? "#00ff00" : "#27ae60";
    ctx.lineWidth = esSeleccionada ? 4 : 2;
    ctx.strokeRect(x, y, imgWidth, imgHeight);

    // Checkmark si está seleccionada
    if (esSeleccionada) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fillRect(x, y, imgWidth, imgHeight);

      ctx.fillStyle = "#00ff00";
      ctx.font = "bold 60px Arial";
      ctx.textAlign = "center";
      ctx.fillText("✓", x + imgWidth / 2, y + imgHeight / 2 + 20);
    }
  });

  // Botón de COMENZAR (siempre visible)
  const btnY = canvas.height - 140;
  const btnX = canvas.width / 2 - 150;
  const btnWidth = 300;
  const btnHeight = 60;

  // Guardar coordenadas del botón comenzar globalmente
  window.botonComenzarImagen = {
    x: btnX,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
  };

  // Dibujar botón comenzar
  ctx.fillStyle = "#00aa00";
  ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 3;
  ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("COMENZAR", canvas.width / 2, btnY + 40);
}

function mostarGame() {
  // Limpiar canvas
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!dificultadSeleccionada || !imagenSeleccionada) {
    console.error("❌ Faltan datos para iniciar el juego");
    return;
  }

  // Las piezas ya deberían estar inicializadas
  if (piezas.length === 0) {
    console.error("❌ Las piezas no están inicializadas");
    return;
  }

  // Temporizador
  let colorTemporizador = "#00ff00"; // Verde por defecto
  if (tiempoLimite) {
    const porcentajeRestante = (tiempoTranscurrido / tiempoLimite) * 100;

    if (porcentajeRestante <= 20) colorTemporizador = "#ff0000"; // Rojo crítico
    else if (porcentajeRestante <= 50) colorTemporizador = "#ff9900"; // Naranja advertencia
  }
  ctx.fillStyle = colorTemporizador;
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";

  // Temporizador
  ctx.fillText(formatearTiempo(tiempoTranscurrido), canvas.width / 2, 50);

  // ====== JUEGO ======
  // Dibujar todas las piezas
  dibujarPiezas();

  // ====== PIE DE PANTALLA ======
  // Instrucciones
  ctx.fillStyle = "#888";
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    `Click izquierdo: girar ← | Click derecho: girar →`,
    canvas.width / 2,
    canvas.height - 25
  );

  // 🎯 Botón de AYUDA
  const anchoBoton = 120;
  const altoBoton = 40;
  const xBoton = 20;
  const yBoton = canvas.height - altoBoton - 70;

  // Fondo del botón
  ctx.fillStyle = cantidadAyudas > 0 ? "#007bff" : "#555555";
  ctx.fillRect(xBoton, yBoton, anchoBoton, altoBoton);

  // Borde
  ctx.strokeStyle = cantidadAyudas > 0 ? "white" : "#777777";
  ctx.lineWidth = 2;
  ctx.strokeRect(xBoton, yBoton, anchoBoton, altoBoton);

  // Texto del botón
  ctx.fillStyle = "white";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    cantidadAyudas > 0 ? "AYUDA" : "SIN AYUDAS",
    xBoton + anchoBoton / 2,
    yBoton + altoBoton / 2
  );

  // Guardar coordenadas globales
  botonAyuda = { x: xBoton, y: yBoton, ancho: anchoBoton, alto: altoBoton };
}

function mostrarImagenGrandeYComenzar() {
  // Limpiar canvas
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título
  ctx.fillStyle = "#00ff00";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("¡Imagen seleccionada!", canvas.width / 2, 80);

  // Mostrar la imagen bien grande
  const bigImgSize = 400;
  const bigImgX = canvas.width / 2 - bigImgSize / 2;
  const bigImgY = canvas.height / 2 - bigImgSize / 2;

  if (imagenSeleccionada.loaded && imagenSeleccionada.element) {
    ctx.shadowColor = "rgba(0, 255, 0, 0.5)";
    ctx.shadowBlur = 20;

    ctx.drawImage(
      imagenSeleccionada.element,
      bigImgX,
      bigImgY,
      bigImgSize,
      bigImgSize
    );

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  // Borde brillante
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 6;
  ctx.strokeRect(bigImgX, bigImgY, bigImgSize, bigImgSize);

  // Mensaje de inicio
  ctx.fillStyle = "#ffffff";
  ctx.font = "28px Arial";
  ctx.fillText("Preparando el juego...", canvas.width / 2, canvas.height - 60);

  // Después de 3 segundos, cambiar al estado "listo-para-jugar"
  setTimeout(() => {
    gameState = "listo-para-jugar";
    drawUi();
  }, 3000);
}

function mostrarListoParaJugar() {
  // Limpiar canvas
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!dificultadSeleccionada || !imagenSeleccionada) {
    console.error("❌ Faltan datos para iniciar el juego");
    return;
  }

  // Si es la primera vez, inicializar las piezas
  if (piezas.length === 0) {
    inicializarPiezas();
    // La función inicializarPiezas() llamará a drawUi() cuando termine
    return; // ⬅️ Salir aquí, esperamos a que termine
  }

  // ⬇️ SI NO ESTÁ LISTO, MOSTRAR SPINNER ⬇️
  if (!juegoListo) {
    // Título
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Preparando...", canvas.width / 2, 50);

    // Mostrar spinner de carga
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 40;

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Aplicando filtros...", centerX, centerY - 80);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(spinnerAngle);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
    ctx.strokeStyle = "#27ae60";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.restore();

    spinnerAngle += 0.1;

    // Seguir animando el spinner
    requestAnimationFrame(() => drawUi());
    return; // ⬅️ No continuar hasta que esté listo
  }

  // ⬇️ SI YA ESTÁ LISTO, MOSTRAR EL JUEGO CON BOTÓN PLAY ⬇️

  // Título
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("¡PREPÁRATE!", canvas.width / 2, 50);

  // Dibujar todas las piezas (pero sin iniciar temporizador)
  dibujarPiezas();

  // Overlay semi-transparente
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Botón de PLAY gigante en el centro
  const playSize = 120;
  const playX = canvas.width / 2;
  const playY = canvas.height / 2;

  // Guardar coordenadas globales
  botonPlayJuego = {
    x: playX,
    y: playY,
    radius: playSize,
  };

  // Dibujar botón de play
  drawPlayButton(playX, playY, playSize);

  // Texto instructivo
  ctx.fillStyle = "#ffffff";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Haz clic en PLAY para comenzar",
    canvas.width / 2,
    canvas.height - 80
  );

  // Mostrar dificultad
  ctx.fillStyle = "#00ff00";
  ctx.font = "24px Arial";
  ctx.fillText(
    `Dificultad: ${dificultadSeleccionada.nivel} (${dificultadSeleccionada.descripcion})`,
    canvas.width / 2,
    canvas.height - 40
  );

  // Si hay límite de tiempo, mostrarlo
  if (dificultadSeleccionada.tiempoLimite) {
    ctx.fillStyle = "#ff9900";
    ctx.font = "20px Arial";
    ctx.fillText(
      `⏱️ Tiempo límite: ${formatearTiempo(
        dificultadSeleccionada.tiempoLimite
      )}`,
      canvas.width / 2,
      canvas.height - 10
    );
  }
}

function mostrarPantallaVictoria() {
  // Limpiar canvas
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título de felicitaciones
  ctx.fillStyle = "#FFD700"; // Dorado
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("¡FELICITACIONES!", canvas.width / 2, 80);

  ctx.fillStyle = "#00ff00";
  ctx.font = "bold 36px Arial";
  ctx.fillText("¡Completaste el nivel!", canvas.width / 2, 130);

  // Mostrar la imagen completa SIN filtros
  const imgSize = 300;
  const imgX = canvas.width / 2 - imgSize / 2;
  const imgY = 160;

  if (imagenSeleccionada.loaded && imagenSeleccionada.original) {
    ctx.shadowColor = "rgba(0, 255, 0, 0.6)";
    ctx.shadowBlur = 30;
    ctx.drawImage(imagenSeleccionada.original, imgX, imgY, imgSize, imgSize); // <-- ORIGINAL
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 5;
  ctx.strokeRect(imgX, imgY, imgSize, imgSize);

  // Tiempo final
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px Arial";
  ctx.fillText(
    `⏱️ Tiempo: ${formatearTiempo(tiempoTranscurrido)}`,
    canvas.width / 2,
    imgY + imgSize + 50
  );

  // Guardar y mostrar récord
  const nivelKey = `${dificultadSeleccionada.nivel}-${nivelActual}`;

  if (!records[nivelKey] || tiempoTranscurrido < records[nivelKey]) {
    records[nivelKey] = tiempoTranscurrido;
    ctx.fillStyle = "#FFD700"; // Dorado
    ctx.font = "bold 28px Arial";
    ctx.fillText("🏆 ¡NUEVO RÉCORD!", canvas.width / 2, imgY + imgSize + 90);
  } else {
    ctx.fillStyle = "#888888";
    ctx.font = "24px Arial";
    ctx.fillText(
      `Récord anterior: ${formatearTiempo(records[nivelKey])}`,
      canvas.width / 2,
      imgY + imgSize + 90
    );
  }

  // Botones
  const btnWidth = 280;
  const btnHeight = 70;
  const btnY = canvas.height - 120;
  const espacioEntreBotones = 40;

  // Botón VOLVER AL MENÚ
  window.botonMenu = {
    x: canvas.width / 2 - btnWidth - espacioEntreBotones / 2,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
  };

  ctx.fillStyle = "#555555";
  ctx.fillRect(botonMenu.x, botonMenu.y, botonMenu.width, botonMenu.height);
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 3;
  ctx.strokeRect(botonMenu.x, botonMenu.y, botonMenu.width, botonMenu.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Arial";
  ctx.fillText(
    "VOLVER AL MENÚ",
    botonMenu.x + botonMenu.width / 2,
    botonMenu.y + 44
  );

  // Botón SIGUIENTE NIVEL
  window.botonSiguiente = {
    x: canvas.width / 2 + espacioEntreBotones / 2,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
  };

  ctx.fillStyle = "#00aa00";
  ctx.fillRect(
    botonSiguiente.x,
    botonSiguiente.y,
    botonSiguiente.width,
    botonSiguiente.height
  );
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    botonSiguiente.x,
    botonSiguiente.y,
    botonSiguiente.width,
    botonSiguiente.height
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Arial";
  ctx.fillText(
    "SIGUIENTE NIVEL ➡️",
    botonSiguiente.x + botonSiguiente.width / 2,
    botonSiguiente.y + 44
  );

  // Cambiar estado
  gameState = "victoria";
}

function mostrarPantallaDerrota() {
  ctx.fillStyle = "#1e1e1e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título de derrota
  ctx.fillStyle = "#ff0000";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("¡TIEMPO AGOTADO!", canvas.width / 2, 100);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Arial";
  ctx.fillText("No completaste el nivel a tiempo", canvas.width / 2, 160);

  // Mostrar la imagen (parcialmente resuelta)
  const imgSize = 300;
  const imgX = canvas.width / 2 - imgSize / 2;
  const imgY = 200;

  if (imagenSeleccionada.loaded && imagenSeleccionada.original) {
    ctx.shadowColor = "rgba(0, 255, 0, 0.6)";
    ctx.shadowBlur = 30;
    ctx.drawImage(imagenSeleccionada.original, imgX, imgY, imgSize, imgSize);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 5;
  ctx.strokeRect(imgX, imgY, imgSize, imgSize);

  // Botones
  const btnWidth = 280;
  const btnHeight = 70;
  const btnY = canvas.height - 120;
  const espacioEntreBotones = 40;

  // Botón VOLVER AL MENÚ
  window.botonMenu = {
    x: canvas.width / 2 - btnWidth - espacioEntreBotones / 2,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
  };

  ctx.fillStyle = "#555555";
  ctx.fillRect(botonMenu.x, botonMenu.y, botonMenu.width, botonMenu.height);
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 3;
  ctx.strokeRect(botonMenu.x, botonMenu.y, botonMenu.width, botonMenu.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Arial";
  ctx.fillText(
    "VOLVER AL MENÚ",
    botonMenu.x + botonMenu.width / 2,
    botonMenu.y + 44
  );

  // Botón REINTENTAR
  window.botonReintentar = {
    x: canvas.width / 2 + espacioEntreBotones / 2,
    y: btnY,
    width: btnWidth,
    height: btnHeight,
  };

  ctx.fillStyle = "#ff6600";
  ctx.fillRect(
    botonReintentar.x,
    botonReintentar.y,
    botonReintentar.width,
    botonReintentar.height
  );
  ctx.strokeStyle = "#ff9900";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    botonReintentar.x,
    botonReintentar.y,
    botonReintentar.width,
    botonReintentar.height
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Arial";
  ctx.fillText(
    "REINTENTAR 🔄",
    botonReintentar.x + botonReintentar.width / 2,
    botonReintentar.y + 44
  );

  // Cambiar estado
  gameState = "derrota";
}

//funciones de manejo de click

canvas.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  if (gameState === "menu") handleMenuClick(mouseX, mouseY);
  else if (gameState === "seleccion-dificultad")
    handleDificultadClick(mouseX, mouseY);
  else if (gameState === "seleccion-imagen") handleImagenClick(mouseX, mouseY);
  else if (gameState === "listo-para-jugar")
    // ← NUEVO
    handleListoParaJugarClick(mouseX, mouseY);
  else if (gameState === "jugando") {
    handleGameClick(mouseX, mouseY, "izquierdo");
  } else if (gameState === "victoria") {
    handleVictoriaMenuClick(mouseX, mouseY);
  } else if (gameState === "derrota") {
    handleDerrotaClick(mouseX, mouseY);
  } else if (gameState === "final-dificultad") {
    handleFinalDificultadClick(mouseX, mouseY);
  }

  // Event listener para click derecho
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (gameState === "jugando") {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      handleGameClick(mouseX, mouseY, "derecho"); // Click derecho
    }
  });
});

function handleListoParaJugarClick(mouseX, mouseY) {
  if (!botonPlayJuego) return;

  // Calcular distancia al centro del botón
  const distancia = Math.sqrt(
    Math.pow(mouseX - botonPlayJuego.x, 2) +
      Math.pow(mouseY - botonPlayJuego.y, 2)
  );

  // Si el click está dentro del radio del botón
  if (distancia <= botonPlayJuego.radius) {
    console.log("▶️ ¡Iniciando juego!");

    // Iniciar el temporizador
    iniciarTemporizador();

    // Cambiar al estado de juego
    gameState = "jugando";

    // Redibujar
    drawUi();
  }
}

function handleMenuClick(mouseX, mouseY) {
  // Si estamos mostrando instrucciones
  if (mostrarInstrucciones) {
    // Verificar click en botón VOLVER
    if (window.botonVolverInstrucciones) {
      const btn = window.botonVolverInstrucciones;
      if (
        mouseX >= btn.x &&
        mouseX <= btn.x + btn.width &&
        mouseY >= btn.y &&
        mouseY <= btn.y + btn.height
      ) {
        console.log("🔙 Volviendo al menú principal");
        mostrarInstrucciones = false;
        drawUi();
        return;
      }
    }
    return; // No hacer nada más si está en instrucciones
  }

  // Verificar click en botón PLAY
  const distanciaPlay = Math.sqrt(
    Math.pow(mouseX - playButton.x, 2) + Math.pow(mouseY - playButton.y, 2)
  );

  if (distanciaPlay <= playButton.radius) {
    console.log("✅ Avanzando a selección de dificultad");
    gameState = "seleccion-dificultad";
    drawUi();
    return;
  }

  // Verificar click en botón INSTRUCCIONES
  const distanciaHelp = Math.sqrt(
    Math.pow(mouseX - helpButton.x, 2) + Math.pow(mouseY - helpButton.y, 2)
  );

  if (distanciaHelp <= helpButton.radius) {
    console.log("📖 Mostrando instrucciones");
    mostrarInstrucciones = true;
    drawUi();
    return;
  }
}

function handleDificultadClick(mouseX, mouseY) {
  let encontrado = false;

  console.log(`Click en (${mouseX.toFixed(0)}, ${mouseY.toFixed(0)})`);

  console.log("Botones de dificultad:");
  opcionesDificultad.forEach((opcion) => {
    console.log(
      `  ${opcion.nivel}: x=${opcion.x}-${opcion.x + opcion.width}, y=${
        opcion.y
      }-${opcion.y + opcion.height}`
    );
  });

  for (const opcion of opcionesDificultad) {
    const dentroX = mouseX >= opcion.x && mouseX <= opcion.x + opcion.width;
    const dentroY = mouseY >= opcion.y && mouseY <= opcion.y + opcion.height;

    if (dentroX && dentroY) {
      dificultadSeleccionada = opcion;
      encontrado = true;
      console.log(
        `✅ Seleccionado: ${opcion.nivel} (${opcion.cuadros} cuadros)`
      );
      break; // salir del bucle al encontrar la opción
    }
  }

  if (encontrado) {
    console.log("✅ Avanzando a selección de imagen");
    gameState = "seleccion-imagen";
    drawUi();
  } else {
    console.log("❌ Click fuera de las opciones");
  }
}

function handleImagenClick(mouseX, mouseY) {
  // Primero verificar si se hizo clic en el botón COMENZAR
  if (window.botonComenzarImagen) {
    const btn = window.botonComenzarImagen;
    const dentroBoton =
      mouseX >= btn.x &&
      mouseX <= btn.x + btn.width &&
      mouseY >= btn.y &&
      mouseY <= btn.y + btn.height;

    if (dentroBoton) {
      animarSeleccionImagen();
      // Inicia la animación de selección aleatoria
      return;
    }
  }

  // Si no se hizo clic en el botón, verificar clicks en imágenes (solo para seleccionar, NO para comenzar el juego)
}

function handleGameClick(mouseX, mouseY, tipoClick) {
  // 🚫 No permitir clics si ya ganó
  if (gameState === "victoria") return;

  // 🎯 Primero: comprobar si se clickeó el botón de ayuda

  if (cantidadAyudas > 0) {
    if (
      botonAyuda &&
      mouseX >= botonAyuda.x &&
      mouseX <= botonAyuda.x + botonAyuda.ancho &&
      mouseY >= botonAyuda.y &&
      mouseY <= botonAyuda.y + botonAyuda.alto
    ) {
      obtenerAyuda();
      cantidadAyudas--;

      const penalizacion = 5000; // 5 segundos

      // Solo aplicar penalización si hay límite de tiempo
      if (tiempoLimite !== null) {
        console.log(
          `⏱️ Tiempo restante ANTES de ayuda: ${formatearTiempo(
            tiempoLimite - (Date.now() - tiempoInicio)
          )}`
        );

        // 🎯 SOLUCIÓN: Adelantar el tiempo de inicio
        // Esto hace que la "diferencia" sea mayor, reduciendo tiempoTranscurrido
        tiempoInicio -= penalizacion;

        // Verificar que no se pase del límite
        const nuevaDiferencia = Date.now() - tiempoInicio;
        if (nuevaDiferencia >= tiempoLimite) {
          // Si la penalización hace que se acabe el tiempo, dejar 1 segundo
          tiempoInicio = Date.now() - (tiempoLimite - 1000);
        }

        console.log(
          `⏱️ Tiempo restante DESPUÉS de ayuda: ${formatearTiempo(
            tiempoLimite - (Date.now() - tiempoInicio)
          )}`
        );
      } else {
        console.log("💡 Ayuda usada (sin penalización en modo Fácil)");
      }

      drawUi(); // Redibujar para mostrar cambio inmediato
      return;
    }
  }

  // 🔍 Buscar qué pieza se clickeó
  let piezaClicada = null;
  for (const pieza of piezas) {
    if (
      mouseX >= pieza.x &&
      mouseX <= pieza.x + pieza.ancho &&
      mouseY >= pieza.y &&
      mouseY <= pieza.y + pieza.alto
    ) {
      piezaClicada = pieza;
      break;
    }
  }

  // 🧩 Si clickeó una pieza, girarla
  if (piezaClicada) {
    if (tipoClick === "izquierdo") {
      piezaClicada.rotacionActual -= 90;
    } else if (tipoClick === "derecho") {
      piezaClicada.rotacionActual += 90;
    }

    // Mantener rotación en [0, 360)
    if (piezaClicada.rotacionActual >= 360) piezaClicada.rotacionActual -= 360;
    else if (piezaClicada.rotacionActual < 0)
      piezaClicada.rotacionActual += 360;

    // Redibujar el juego
    drawUi();

    // Verificar si ganó
    if (verificarVictoria()) {
      detenerTemporizador();
      filtrosActivos = false;

      // Si es el último nivel de la dificultad
      if (nivelActual === 6) {
        // suponiendo que 6 es el último nivel
        console.log("🏆 ¡Completaste todos los niveles de esta dificultad!");
        gameState = "final-dificultad";
        drawUi();
      } else {
        gameState = "victoria";
        drawUi();
      }
    }
  }
}

function handleDerrotaClick(mouseX, mouseY) {
  // Verificar click en botón VOLVER AL MENÚ
  if (window.botonMenu) {
    const btn = window.botonMenu;
    if (
      mouseX >= btn.x &&
      mouseX <= btn.x + btn.width &&
      mouseY >= btn.y &&
      mouseY <= btn.y + btn.height
    ) {
      console.log("🏠 Volviendo al menú de dificultad");
      reiniciarJuego();
      gameState = "seleccion-dificultad";
      drawUi();
      return;
    }
  }

  // Verificar click en botón REINTENTAR
  if (window.botonReintentar) {
    const btn = window.botonReintentar;
    if (
      mouseX >= btn.x &&
      mouseX <= btn.x + btn.width &&
      mouseY >= btn.y &&
      mouseY <= btn.y + btn.height
    ) {
      console.log("🔄 Reintentando nivel");
      reintentarNivel();
      return;
    }
  }
}

//funciones auxiliares
function reintentarNivel() {
  // Reiniciar pero mantener dificultad e imagen
  piezas = [];
  tiempoInicio = null;
  tiempoTranscurrido = 0;
  juegoCompletado = false;
  filtrosActivos = true;
  filtroActual = null;
  cantidadAyudas = 1;
  if (intervaloTemporizador) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }

  // Restaurar la imagen original (sin filtros)
  imagenSeleccionada.element = imagenSeleccionada.original;

  console.log(
    `🔄 Reintentando - Dificultad: ${dificultadSeleccionada.nivel} - Imagen: ${imagenSeleccionada.src}`
  );

  mostrarImagenGrandeYComenzar();
}

function verificarVictoria() {
  return piezas.every(
    (pieza) => pieza.rotacionActual === pieza.rotacionCorrecta
  );
}

function drawSpinner() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 40;

  // Texto "Cargando..."
  ctx.fillStyle = "white";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Cargando imágenes...", centerX, centerY - 80);

  // Porcentaje de carga
  const porcentaje = Math.round((imagenesListas / imagenes.length) * 100);
  ctx.font = "18px sans-serif";
  ctx.fillText(`${porcentaje}%`, centerX, centerY + 80);

  // Círculo del spinner
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(spinnerAngle);

  // Arco del spinner
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
  ctx.strokeStyle = "#27ae60";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();

  // Incrementar ángulo para animación
  spinnerAngle += 0.1;
}

function handleVictoriaMenuClick(mouseX, mouseY) {
  // Verificar click en botón VOLVER AL MENÚ
  if (window.botonMenu) {
    const btn = window.botonMenu;
    if (
      mouseX >= btn.x &&
      mouseX <= btn.x + btn.width &&
      mouseY >= btn.y &&
      mouseY <= btn.y + btn.height
    ) {
      console.log("🏠 Volviendo al menú de dificultad");
      reiniciarJuego();
      gameState = "seleccion-dificultad";
      drawUi();
      return;
    }
  }

  // Verificar click en botón SIGUIENTE NIVEL
  if (window.botonSiguiente) {
    const btn = window.botonSiguiente;
    if (
      mouseX >= btn.x &&
      mouseX <= btn.x + btn.width &&
      mouseY >= btn.y &&
      mouseY <= btn.y + btn.height
    ) {
      console.log("➡️ Siguiente nivel");
      siguienteNivel();
      return;
    }
  }
}

function handleFinalDificultadClick(mouseX, mouseY) {
  // Verificar click en botón VOLVER AL MENÚ
  if (window.botonMenuFinal) {
    const btn = window.botonMenuFinal;
    if (
      mouseX >= btn.x &&
      mouseX <= btn.x + btn.width &&
      mouseY >= btn.y &&
      mouseY <= btn.y + btn.height
    ) {
      console.log("🏠 Volviendo al menú principal");
      reiniciarJuego(); // reinicia variables y limpia estado
      gameState = "menu"; // o "seleccion-dificultad" según tu flujo
      drawUi();
    }
  }
}

function inicializarPiezas() {
  piezas = [];
  juegoListo = false;

  const esModoSorpresa = dificultadSeleccionada.nivel === "Sorpresa";
  const esModoFacil = dificultadSeleccionada.nivel === "Facil";

  if (esModoSorpresa) {
    console.log("🎲 Modo SORPRESA activado - Filtros aleatorios por pieza");
    inicializarPiezasConFiltrosAleatorios();

  } else {
    const filtro = elegirFiltroRandom();

    aplicarFiltroConImageData(
      imagenSeleccionada.element,
      filtro,
      (imagenFiltrada) => {
        imagenSeleccionada.element = imagenFiltrada;

        const filas = dificultadSeleccionada.filas;
        const columnas = dificultadSeleccionada.columnas;

        // 🎯 CALCULAR TAMAÑO BASADO EN EL ESPACIO DISPONIBLE
        const maxAncho = canvas.width - 100;
        const maxAlto = canvas.height - 200; // Dejar espacio para UI

        // Calcular tamaño de pieza que quepa en el espacio
        const tamañoPiezaAncho = maxAncho / columnas;
        const tamañoPiezaAlto = maxAlto / filas;
        // Usar el menor para que todo quepa
        const tamañoPieza = Math.min(tamañoPiezaAncho, tamañoPiezaAlto);

        // Calcular el área total que ocupará la grilla
        const anchoTotal = columnas * tamañoPieza;
        const altoTotal = filas * tamañoPieza;

        // Centrar la grilla
        const startX = (canvas.width - anchoTotal) / 2;
        const startY = 80;

        const imagenWidth = imagenSeleccionada.element.width;
        const imagenHeight = imagenSeleccionada.element.height;
        const seccionWidth = imagenWidth / columnas;
        const seccionHeight = imagenHeight / filas;

        // Crear piezas
        for (let fila = 0; fila < filas; fila++) {
          for (let col = 0; col < columnas; col++) {
            const rotacionesAleatorias = [0, 90, 180, 270];
            const rotacionAleatoria =
              rotacionesAleatorias[Math.floor(Math.random() * 4)];

            piezas.push({
              id: fila * columnas + col, //id de la piexa
              fila, //fila de la pieza
              col, //columna de la pieza
              x: startX + col * tamañoPieza, //cordenada x de la pieza
              y: startY + fila * tamañoPieza, //cordenada y de la pieza
              ancho: tamañoPieza, //ancho de la pieza
              alto: tamañoPieza, // alto de la pieza
              imgX: col * seccionWidth, //recorte de la imagen original
              imgY: fila * seccionHeight, //recorte de la imagen original
              imgAncho: seccionWidth,
              imgAlto: seccionHeight,
              rotacionActual: rotacionAleatoria,
              rotacionCorrecta: 0,
            });
          }
        }

        console.log(
          `✅ ${piezas.length} piezas inicializadas con filtro "${filtro}"`
        );

        juegoListo = true;
        drawUi();
      }
    );
  }
}

// ----------------------
// Funciones de filtros
// ----------------------
function aplicarGrayscale(r, g, b) {
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  return [gray, gray, gray];
}

function aplicarBrightness(r, g, b, factor = 0.5) {
  return [r * factor, g * factor, b * factor];
}

function aplicarInvert(r, g, b) {
  return [255 - r, 255 - g, 255 - b];
}

function aplicarSepia(r, g, b) {
  const tr = 0.393 * r + 0.769 * g + 0.189 * b;
  const tg = 0.349 * r + 0.686 * g + 0.168 * b;
  const tb = 0.272 * r + 0.534 * g + 0.131 * b;
  return [Math.min(255, tr), Math.min(255, tg), Math.min(255, tb)];
}

// ----------------------
// Función principal
// ----------------------
function aplicarFiltroConImageData(imagen, filtro, callback) {
  if (!filtro) {
    callback(imagen);
    return;
  }

  // Canvas temporal
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  // Esperar a que la imagen esté cargada
  if (!imagen.complete) {
    imagen.onload = () => aplicarFiltroConImageData(imagen, filtro, callback);
    return;
  }

  tempCanvas.width = imagen.width;
  tempCanvas.height = imagen.height;
  tempCtx.drawImage(imagen, 0, 0);

  const imageData = tempCtx.getImageData(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );
  const data = imageData.data;

  // Recorrer cada píxel y aplicar filtro
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    switch (filtro) {
      case "grayscale":
        [r, g, b] = aplicarGrayscale(r, g, b);
        break;
      case "brightness":
        [r, g, b] = aplicarBrightness(r, g, b, 0.5);
        break;
      case "invert":
        [r, g, b] = aplicarInvert(r, g, b);
        break;
      case "sepia":
        [r, g, b] = aplicarSepia(r, g, b);
        break;
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  tempCtx.putImageData(imageData, 0, 0);

  // Crear nueva imagen con el filtro aplicado
  const nuevaImagen = new Image();
  nuevaImagen.onload = () => callback(nuevaImagen);
  nuevaImagen.src = tempCanvas.toDataURL();
}

function aplicarGrayscale(r, g, b) {
  const gray = 0.3 * r + 0.59 * g + 0.11 * b;
  return [gray, gray, gray];
}

function aplicarBrightness(r, g, b, factor = 0.5) {
  return [r * factor, g * factor, b * factor];
}

function aplicarInvert(r, g, b) {
  return [255 - r, 255 - g, 255 - b];
}

function aplicarSepia(r, g, b) {
  const tr = 0.393 * r + 0.769 * g + 0.189 * b;
  const tg = 0.349 * r + 0.686 * g + 0.168 * b;
  const tb = 0.272 * r + 0.534 * g + 0.131 * b;
  return [Math.min(255, tr), Math.min(255, tg), Math.min(255, tb)];
}


function inicializarPiezasConFiltrosAleatorios() {
  const filas = dificultadSeleccionada.filas;
  const columnas = dificultadSeleccionada.columnas;

  const maxAncho = canvas.width - 100;
  const maxAlto = canvas.height - 200;

  const tamañoPiezaAncho = maxAncho / columnas;
  const tamañoPiezaAlto = maxAlto / filas;
  const tamañoPieza = Math.min(tamañoPiezaAncho, tamañoPiezaAlto);

  const anchoTotal = columnas * tamañoPieza;
  const altoTotal = filas * tamañoPieza;

  const startX = (canvas.width - anchoTotal) / 2;
  const startY = 80;

  const imagenWidth = imagenSeleccionada.element.width;
  const imagenHeight = imagenSeleccionada.element.height;
  const seccionWidth = imagenWidth / columnas;
  const seccionHeight = imagenHeight / filas;

  // Limpiar piezas anteriores
  piezas = [];

  const totalPiezas = filas * columnas;

  console.log('🔄 Iniciando creación de piezas con blur calculado...');

  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      const rotacionesAleatorias = [0, 90, 180, 270];
      const rotacionAleatoria =
        rotacionesAleatorias[Math.floor(Math.random() * 4)];

      // ========== INTENSIDAD DE BLUR ALEATORIA ==========
      const intensidadesBlur = [1, 2, 3, 4, 5];
      const intensidadAleatoria = 
        intensidadesBlur[Math.floor(Math.random() * intensidadesBlur.length)];
      // ==================================================

      console.log(`  📦 Procesando pieza [${fila},${col}] con blur ${intensidadAleatoria}px`);

      // ========== APLICAR BLUR CALCULADO ==========
      const canvasConBlur = extraerYAplicarBlur(
        imagenSeleccionada.element,
        col * seccionWidth,
        fila * seccionHeight,
        seccionWidth,
        seccionHeight,
        intensidadAleatoria
      );
      // ===========================================
 console.log(`✅ Canvas blur creado:`);
      // Crear pieza con blur pre-calculado
      piezas.push({
        id: fila * columnas + col,
        fila,
        col,
        x: startX + col * tamañoPieza,
        y: startY + fila * tamañoPieza,
        ancho: tamañoPieza,
        alto: tamañoPieza,
        imgX: 0,
        imgY: 0,
        imgAncho: seccionWidth,
        imgAlto: seccionHeight,
        rotacionActual: rotacionAleatoria,
        rotacionCorrecta: 0,
        imagenFiltrada: canvasConBlur,  // ← Canvas con blur ya calculado
        nombreFiltro: `Blur ${intensidadAleatoria}px`,
        intensidadBlur: intensidadAleatoria,
      });
    }
  }

  console.log(`✅ ${piezas.length} piezas creadas con blur calculado`);
  juegoListo = true;
  drawUi();
}


function aplicarFiltroAPorcionDeImagen(
  imagen,
  x,
  y,
  ancho,
  alto,
  filtro,
  callback
) {
  // Crear canvas temporal
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = ancho;
  tempCanvas.height = alto;

  // Esperar a que la imagen esté cargada
  if (!imagen.complete) {
    imagen.onload = () =>
      aplicarFiltroAPorcionDeImagen(
        imagen,
        x,
        y,
        ancho,
        alto,
        filtro,
        callback
      );
    return;
  }

  // Dibujar solo la porción de la imagen
  tempCtx.drawImage(
    imagen,
    x,
    y,
    ancho,
    alto, // Fuente: porción a cortar
    0,
    0,
    ancho,
    alto // Destino: canvas completo
  );

  // Obtener píxeles
  const imageData = tempCtx.getImageData(0, 0, ancho, alto);
  const data = imageData.data;

  // Aplicar filtro a cada píxel
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    switch (filtro) {
      case "grayscale":
        [r, g, b] = aplicarGrayscale(r, g, b);
        break;
      case "brightness":
        [r, g, b] = aplicarBrightness(r, g, b, 0.5);
        break;
      case "invert":
        [r, g, b] = aplicarInvert(r, g, b);
        break;
      case "sepia":
        [r, g, b] = aplicarSepia(r, g, b);
        break;
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  // Volver a escribir los píxeles
  tempCtx.putImageData(imageData, 0, 0);

  // Crear nueva imagen
  const nuevaImagen = new Image();
  nuevaImagen.onload = () => callback(nuevaImagen);
  nuevaImagen.src = tempCanvas.toDataURL();
}

function iniciarTemporizador() {
  tiempoInicio = Date.now();

  // Si hay tiempo límite, usar ese; si no, empezar desde 0
  if (dificultadSeleccionada.tiempoLimite) {
    tiempoLimite = dificultadSeleccionada.tiempoLimite;
    tiempoTranscurrido = tiempoLimite;
  } else {
    tiempoLimite = null;
    tiempoTranscurrido = 0;
  }

  intervaloTemporizador = setInterval(() => {
    if (!juegoCompletado) {
      const tiempoActual = Date.now();
      const diferencia = tiempoActual - tiempoInicio;

      if (tiempoLimite) {
        // Modo regresivo (cuenta atrás)
        tiempoTranscurrido = tiempoLimite - diferencia;

        // Si se acabó el tiempo
        if (tiempoTranscurrido <= 0) {
          tiempoTranscurrido = 0;
          detenerTemporizador();
          mostrarPantallaDerrota();
          return;
        }
      } else {
        // Modo normal (cuenta hacia adelante)
        tiempoTranscurrido = diferencia;
      }

      drawUi();
    }
  }, 100);

  console.log(
    tiempoLimite
      ? `⏱️ Temporizador regresivo iniciado: ${formatearTiempo(tiempoLimite)}`
      : "⏱️ Temporizador normal iniciado"
  );
}

function detenerTemporizador() {
  if (intervaloTemporizador) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }
  juegoCompletado = true;
  console.log(
    `⏱️ Temporizador detenido: ${formatearTiempo(tiempoTranscurrido)}`
  );
}

function formatearTiempo(milisegundos) {
  const segundosTotales = Math.floor(milisegundos / 1000);
  const minutos = Math.floor(segundosTotales / 60);
  const segundos = segundosTotales % 60;
  const centesimas = Math.floor((milisegundos % 1000) / 10);

  return `${minutos.toString().padStart(2, "0")}:${segundos
    .toString()
    .padStart(2, "0")}.${centesimas.toString().padStart(2, "0")}`;
}

function elegirFiltroRandom() {
  // Solo aplicar filtros en niveles avanzados

  const indice = Math.floor(Math.random() * FILTROS_DISPONIBLES.length);
  return FILTROS_DISPONIBLES[indice];

  // Sin filtro en niveles iniciales
}

function dibujarPiezas() {
  piezas.forEach((pieza) => {
    ctx.save();

    ctx.translate(pieza.x + pieza.ancho / 2, pieza.y + pieza.alto / 2);
    ctx.rotate((pieza.rotacionActual * Math.PI) / 180);

    // Si la pieza tiene su propia imagen filtrada (modo Sorpresa)
    if (pieza.imagenFiltrada) {
      ctx.drawImage(
        pieza.imagenFiltrada,
        pieza.imgX, // Debería ser 0 en modo Sorpresa
        pieza.imgY, // Debería ser 0 en modo Sorpresa
        pieza.imgAncho,
        pieza.imgAlto,
        -pieza.ancho / 2,
        -pieza.alto / 2,
        pieza.ancho,
        pieza.alto
      );
    }
    // Si no, usar la imagen seleccionada (modo normal con filtro único)
    else if (imagenSeleccionada.loaded && imagenSeleccionada.element) {
      ctx.drawImage(
        imagenSeleccionada.element,
        pieza.imgX,
        pieza.imgY,
        pieza.imgAncho,
        pieza.imgAlto,
        -pieza.ancho / 2,
        -pieza.alto / 2,
        pieza.ancho,
        pieza.alto
      );
    }

    ctx.restore();

    // Borde normal
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(pieza.x, pieza.y, pieza.ancho, pieza.alto);

    // Resaltado si es la pieza ayudada
    if (piezaResaltada === pieza) {
      ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
      ctx.fillRect(pieza.x, pieza.y, pieza.ancho, pieza.alto);

      ctx.strokeStyle = "#ffff00";
      ctx.lineWidth = 6;
      ctx.strokeRect(pieza.x, pieza.y, pieza.ancho, pieza.alto);

      ctx.fillStyle = "#ffff00";
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
    }
  });
}

function drawPlayButton(x, y, radius) {
  // Círculo verde
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#27ae60";
  ctx.fill();
  ctx.closePath();

  // Triángulo blanco (símbolo de "play")
  ctx.beginPath();
  ctx.moveTo(x - radius / 3, y - radius / 2.2);
  ctx.lineTo(x + radius / 2, y);
  ctx.lineTo(x - radius / 3, y + radius / 2.2);
  ctx.closePath();
  ctx.fillStyle = "white";
  ctx.fill();
}

function reiniciarJuego() {
  piezas = [];
  tiempoInicio = null;
  tiempoTranscurrido = 0;
  juegoCompletado = false;
  filtrosActivos = true;
  filtroActual = null;
  nivelActual = 1; // Resetear nivel
  cantidadAyudas = 1;
  if (intervaloTemporizador) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }
  imagenSeleccionada = null;
  dificultadSeleccionada = null;

  // Resetear dificultad también
  imagenes.forEach((img) => {
    if (img.original) {
      img.element = img.original;
    }
  });

  console.log("🔄 Juego reiniciado - Volviendo a selección de dificultad");
}

function siguienteNivel() {
  // Incrementar nivel
  nivelActual++;

  // Buscar la siguiente imagen (rotar entre las disponibles)
  const indiceActual = imagenes.indexOf(imagenSeleccionada);
  const siguienteIndice = (indiceActual + 1) % imagenes.length;

  // Reiniciar valores pero MANTENER la dificultad
  piezas = [];
  tiempoInicio = null;
  tiempoTranscurrido = 0;
  juegoCompletado = false;
  filtrosActivos = true;
  filtroActual = null;
  cantidadAyudas = 1;
  if (intervaloTemporizador) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }

  imagenSeleccionada = imagenes[siguienteIndice];

  console.log(
    `📸 Nivel ${nivelActual} - Dificultad: ${dificultadSeleccionada.nivel} - Imagen: ${imagenSeleccionada.src}`
  );

  // Mostrar imagen grande y comenzar
  mostrarImagenGrandeYComenzar();
}

function obtenerAyuda() {
  console.log("💡 Proporcionando ayuda al jugador");

  // Buscar piezas que no estén en la rotación correcta
  const piezasIncorrectas = piezas.filter(
    (p) => p.rotacionActual !== p.rotacionCorrecta
  );

  // Si todas están correctas, no hay nada que ayudar
  if (piezasIncorrectas.length === 0) {
    console.log("🎉 Todas las piezas están correctamente colocadas");
    return;
  }

  // Elegir una pieza incorrecta al azar
  const piezaAyuda =
    piezasIncorrectas[Math.floor(Math.random() * piezasIncorrectas.length)];

  // Corregir su rotación (ponerla bien)
  piezaAyuda.rotacionActual = piezaAyuda.rotacionCorrecta;

  console.log(`✅ Pieza ${piezaAyuda.id} corregida automáticamente`);

  // Marcar esta pieza para resaltarla
  piezaResaltada = piezaAyuda;
  tiempoResaltado = Date.now();

  // Redibujar
  drawUi();

  // Quitar el resaltado después de 2 segundos
  setTimeout(() => {
    piezaResaltada = null;
    drawUi();
  }, 2000);

  // Verificar si con esta ayuda ya ganó
  if (verificarVictoria()) {
    detenerTemporizador();
    filtrosActivos = false;
    mostrarPantallaVictoria();
  }
}

// Manejador único de clicks que delega según el estado

function todasLasImagenesCargadas() {
  drawUi();
}
