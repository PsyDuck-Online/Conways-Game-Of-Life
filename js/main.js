/** VARIABLES **/

import Cell from "./Cell.js";

// Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
// Parametros
const canvasSizeElem = document.getElementById('canvas-size');
const cellSizeElem = document.getElementById('cell-size');
const frameRateElem = document.getElementById('frame-rate');
const lifePercentElem = document.getElementById('life-percent');
const sMinElem = document.getElementById('s_min');
const sMaxElem = document.getElementById('s_max');
const bMinElem = document.getElementById('b_min');
const bMaxElem = document.getElementById('b_max');
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

/** EVENT LISTENERS **/
document.addEventListener('DOMContentLoaded', loadGameOfLifeDefaultValues);
newGameBtn.addEventListener('click', newGame);
updateBtn.addEventListener('click', updateRules);
playBtn.addEventListener('click', play);
nextGenBtn.addEventListener('click', nextGen);
canvas.addEventListener('mousedown', e => {
    let coordenadas = getCursorPosition(e);
    tablero[coordenadas[1]][coordenadas[0]].invertirEstado();
    dibujarTablero();
    console.log("x: " + coordenadas[0] + " y: " + coordenadas[1]);
});

/**  FUNCIONES **/
function loadGameOfLifeDefaultValues() {
    canvasSizeElem.value = 100;
    cellSizeElem.value = 5;
    frameRateElem.value = 30;
    lifePercentElem.value = 0.05;
    sMinElem.value = 2;
    sMaxElem.value = 3;
    bMinElem.value = 3;
    bMaxElem.value = 3;

    playing = false;
    updateRules();
}

function imprimirDatos() {
    poblacionElem.innerText = poblacion;
    generacionElem.innerText = generacion;
}

function newGame() {

    // Paramos el juego si ya hay uno corriendo y reiniciamos los datos
    if (playing === true) {
        play();
    }
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

    console.log(tablero[0][0].vecinos);

    dibujarTablero();
    imprimirDatos();
}

function updateRules() {
    // Detenemos el juego anterior
    if (playing === true) {
        play();
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
    // Limpiamos el canvas
    canvas.width = canvasSize * cellSize;
    canvas.height = canvasSize * cellSize;
}

function play() {
    playing = !playing;

    console.log(playing);

    if (playing) {
        gameInterval = setInterval(() => {

            dibujarTablero();
            imprimirDatos();

            generacion += 1;
            poblacion = 0;

            for (let y = 0; y < canvasSize; y++) {
                for (let x = 0; x < canvasSize; x++) {
                    tablero[y][x].siguienteCiclo();                    
                    poblacion += tablero[y][x].estado;
                }
            }

            for(let y = 0; y < canvasSize; y++) {
                for(let x = 0; x < canvasSize; x++) {
                    tablero[y][x].mutar();
                }
            }



        }, 1000 / frameRate);
    } else {
        clearInterval(gameInterval);
    }
}

function dibujarTablero() {
    canvas.width = canvas.width;
    canvas.height = canvas.height;
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            ctx.fillStyle = tablero[y][x].estado == 1 ? '#ffffff' : '#000000';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function nextGen() {
    console.log('Next Generation');
}

function getCursorPosition(event) {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((event.clientX - rect.left) / cellSize);
    let y = Math.floor((event.clientY - rect.top) / cellSize);

    return [x, y];
}