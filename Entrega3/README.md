# TP-INTERFACES Ejercicio entregable N°3:
Videojuego BLOCKA
Blocka es un juego de rompecabezas basado en imágenes. Al iniciar el nivel, la blocka aparece en pantalla con una interfaz limpia.
El usuario debe rotar cada subimagen de la blocka hasta que las cuatro partes estén de forma correcta y conformen la imagen final. 

Para rotar la subimagen, el usuario clickea en ella: si lo hace con el botón derecho la imagen gira hacia la derecha, en cambio si el usuario clickea con el botón izquierdo la imagen gira hacia el lado izquierdo.. 

El nivel muestra un temporizador que se inicia cuando el usuario elige la opción de “Comenzar” y cuando se logra la imagen final, el temporizador se detiene, marcando el récord para ese nivel.
Luego  de ello, el usuario puede volver al Menú Principal o continuar al siguiente nivel, el cual tiene la misma mecánica pero con otra imagen.
Para incrementar la dificultad, la imagen aparece desordenada y con un filtro aplicado. A medida que pasan los niveles, el filtro cambia e incluso puede ser que cada subimagen tenga un filtro distinto. Cuando el usuario termina de armar la imagen, los filtros se quitan y se puede observar la imagen original en RGB.

Funcionalidad general:
1.Los filtros son aplicados en tiempo de carga, en el momento de setup del nivel
2.Existe un banco de imágenes (6 o más) y en el momento de iniciar el nivel, el sistema elige aleatoriamente una imagen 
3.Incluir instrucciones de juego. Elegir la posición, forma de acceso, etc acorde a la mejor UX.
4.El videojuego debe contener al menos tres niveles. Utilizar los filtros: Escala de grises, Brillo (30%), Negativo.
5.El juego debe tener una página propia similar a la que hicieron para el “Peg Solitaire” en TPE2  (mismo diseño) y ejecutar sobre la entrega del TPE2. En la entrega TPE4 realizaran  el “Peg Solitaire”.
a.Tener lugar de ejecución visible
b.Agregar instrucciones del juego
c.Agregar imágenes representativas del juevo

Nota: Todos los puntos son obligatorios para aprobar.
