/** Palabras cortas y comunes en español, sin tildes ni ñ para que sean fáciles de escribir. */
const RAW = `
abeja aguila ardilla ballena burro caballo cabra cangrejo canario cebra cerdo ciervo cocodrilo conejo
cuervo delfin elefante erizo foca gallina gato gaviota gorila hormiga jirafa koala leon lobo loro
mariposa mono nutria oso oveja paloma panda pato perro pinguino pulpo rana raton tigre tortuga vaca zorro
arena arroyo bosque brisa campo cascada cielo colina costa cueva desierto estrella isla jardin lago
lluvia luna mar monte nube nieve oceano pradera rio roca selva sol tierra trueno valle viento volcan
arbol bambu cactus cereza ciruela coco fresa girasol hoja hierba jazmin lavanda limon mango manzana
melon naranja nuez olivo palma pera pino rosa semilla tomate tulipan uva zanahoria
aceituna arroz azucar bizcocho cafe canela caramelo chocolate churro empanada galleta helado huevo
jamon leche mantequilla miel pan pastel pizza queso sopa taco tarta tortilla vainilla
abanico anillo balon bandera barco bicicleta bolsa botella brujula cadena cama campana camino carta
casa cohete corona cuaderno cuchara espejo faro globo guitarra lampara lapiz libro llave maleta mapa
mesa moneda motor paraguas pelota piano pincel puerta radio reloj ropa silla sombrero tambor tazon
telefono tijera tren trompeta ventana violin zapato
aldea barrio castillo ciudad escuela fabrica granja hotel iglesia mercado museo palacio parque pueblo
puente puerto plaza teatro torre
aventura baile broma cancion cuento dibujo dragon duende fantasma fiesta fuego hada juego magia mision
musica pirata poema premio tesoro viaje
amarillo azul blanco dorado gris morado negro plateado rojo rosado turquesa verde violeta
alegre amable brillante bonito calmo claro dulce feliz fuerte gentil grande lento libre listo lindo
ligero limpio rapido sabio suave tierno valiente veloz
bailar caminar cantar correr dibujar dormir escribir jugar leer nadar pintar saltar sonreir volar
brazo corazon mano nariz ojo pie ayer hora mes noche semana tarde
`;

export const WORDS: readonly string[] = Array.from(new Set(RAW.split(/\s+/).filter((w) => w.length >= 3)));
