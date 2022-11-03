import Cell from "./Cell.js";
/***************/
/** VARIABLES **/
/***************/

// Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
var colorVivo;
var colorMuerto;
// Parametros
const canvasSizeElem = document.getElementById('canvas-size');
const cellSizeElem = document.getElementById('cell-size');
const frameRateElem = document.getElementById('frame-rate');
const lifePercentElem = document.getElementById('life-percent');
const sMinElem = document.getElementById('s_min');
const sMaxElem = document.getElementById('s_max');
const bMinElem = document.getElementById('b_min');
const bMaxElem = document.getElementById('b_max');
const colorVivoElem = document.getElementById('color-vivo');
const colorMuertoElem = document.getElementById('color-muerto');
// Botones
const newGameBtn = document.getElementById('new-game');
const updateBtn = document.getElementById('update-rules');
const playBtn = document.getElementById('pause-play');
const nextGenBtn = document.getElementById('next-generation');
// Datos
const poblacionElem = document.getElementById('poblacion');
const generacionElem = document.getElementById('generacion');
// Valores
var canvasSize;
var cellSize;
var frameRate;
var lifePercent;
var sMin, sMax;
var bMin, bMax;
var poblacion, generacion;
// Variables logicas del tablero
var tablero;
var playing;
var gameInterval;

/*********************/
/** EVENT LISTENERS **/
/*********************/
document.addEventListener('DOMContentLoaded', loadGameOfLifeDefaultValues);
newGameBtn.addEventListener('click', newGame);
updateBtn.addEventListener('click', updateRules);
playBtn.addEventListener('click', play);
nextGenBtn.addEventListener('click', nextGen);
canvas.addEventListener('mousedown', e => cambiarEstadoCelula(e));

cellSizeElem.addEventListener('change', updateRules);
/***************/
/** FUNCIONES **/
/***************/

// ---- Funciones principales ----

function loadGameOfLifeDefaultValues() {
    canvasSizeElem.value = 100;
    cellSizeElem.value = 5;
    frameRateElem.value = 30;
    lifePercentElem.value = 0.05;
    sMinElem.value = 2;
    sMaxElem.value = 3;
    bMinElem.value = 3;
    bMaxElem.value = 3;
    colorVivoElem.value = '#ffffff';
    colorMuertoElem.value = '#000000';

    playing = false;

    updateRules();
}

function newGame() {

    // Paramos el juego si ya hay uno corriendo y reiniciamos los datos
    if (playing === true) {
        play();
    }
    // Reiniciamos los datos 
    generacion = 0;
    poblacion = 0;
    // Creamos el tablero
    tablero = new Array(canvasSize);
    for (let i = 0; i < canvasSize; i++) {
        tablero[i] = new Array(canvasSize);
    }
    // Llenamos el tablero de celulas
    let estado;
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            estado = Math.random() < lifePercent ? 1 : 0;
            poblacion += estado;
            tablero[y][x] = new Cell(x, y, estado, sMin, sMax, bMin, bMax);
        }
    }
    // Agregamos a los vecinos
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            tablero[y][x].agregarVecinos(tablero);
        }
    }
    // Imprimimos los resultados
    imprimirTablero();
    imprimirDatos();
}

function updateRules() {
    var needNewGame = false; // Variable para comprobar la necesidad de hacer un nuevo juego
    // Detenemos el juego anterior
    if (playing === true) {
        play();
    }
    // Comprobamos el cambio del tamaño del canvas y de las reglas del juego
    if (canvasSizeElem.value != canvasSize || sMinElem.value != sMin || sMaxElem.value != sMax || bMinElem.value != bMin || bMaxElem.value != bMax) {
        needNewGame = true;
    }


    // Actualizamos los valores
    canvasSize = canvasSizeElem.value;
    cellSize = cellSizeElem.value;
    frameRate = frameRateElem.value;
    lifePercent = lifePercentElem.value;
    sMin = sMinElem.value;
    sMax = sMaxElem.value;
    bMin = bMinElem.value;
    bMax = bMaxElem.value;
    colorVivo = colorVivoElem.value;
    colorMuerto = colorMuertoElem.value;
    // Limpiamos el canvas
    canvas.width = canvasSize * cellSize;
    canvas.height = canvasSize * cellSize;

    // Si se cambio el tamaño del canvas o las reglas se crea un nuevo juego
    if (needNewGame === true)
        newGame();

    imprimirTablero();
}

function play() {
    playing = !playing;
    if (playing) {
        gameInterval = setInterval(nextGen, 1000 / frameRate);
    } else {
        clearInterval(gameInterval);
    }
}

function nextGen() {
    generacion += 1;
    poblacion = 0;

    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            tablero[y][x].siguienteCiclo();
            poblacion += tablero[y][x].estado;
        }
    }

    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            tablero[y][x].mutar();
        }
    }

    imprimirTablero();
    imprimirDatos();
}

function cambiarEstadoCelula(e) {
    let coordenadas = getCursorPosition(e);
    // Actualiza el contador de poblacion
    if (tablero[coordenadas[1]][coordenadas[0]].estado === 1) {
        poblacion -= 1;
    } else {
        poblacion += 1;
    }
    // Invierte el estado de la celula
    tablero[coordenadas[1]][coordenadas[0]].invertirEstado();
    // Imprime los resultados
    imprimirTablero();
    imprimirDatos();
}
// ---- Funciones Secundarias ----



function imprimirDatos() {
    poblacionElem.innerText = poblacion;
    generacionElem.innerText = generacion;
}

function imprimirTablero() {
    canvas.width = canvas.width;
    canvas.height = canvas.height;
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            ctx.fillStyle = tablero[y][x].estado == 1 ? colorVivo : colorMuerto;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function getCursorPosition(event) {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((event.clientX - rect.left) / cellSize);
    let y = Math.floor((event.clientY - rect.top) / cellSize);

    return [x, y];
}