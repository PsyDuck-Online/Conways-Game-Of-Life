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
const fileSelector = document.getElementById('file-selector');
// Botones
const newGameBtn = document.getElementById('new-game');
const updateBtn = document.getElementById('update-rules');
const playBtn = document.getElementById('pause-play');
const nextGenBtn = document.getElementById('next-generation');
const saveFileBtn = document.getElementById('save-file');
const loadFileBtn = document.getElementById('load-file');
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
// Grafica
const lineDiv = document.getElementById('chart');
var layout = {
    title: {
        text: 'Densidad de poblacion',
        font: {
            family: 'Courier New, monospace',
            size: 16
        },
        xref: 'paper',
        x: 0.05
    },
    xaxis: {
        title: {
            text: 'Generacion',
            font: {
                family: 'Courier New, monospace',
                size: 18                
            }
        },
    },
    yaxis: {
        title: {
            text: 'Poblacion',
            font: {
                family: 'Courier New, monospace',
                size: 18
            }
        }
    }

}
// Lector de archivos
var reader = new FileReader;

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
saveFileBtn.addEventListener('click', saveFile);
loadFileBtn.addEventListener('click', loadFile);
/***************/
/** FUNCIONES **/
/***************/
// -------------------------------
// ---- Funciones principales ----
// -------------------------------
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
    Plotly.purge(lineDiv);
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
    // Graficamos
    Plotly.plot(lineDiv, [{
        y: [poblacion],
        x: [generacion],
        name: 'Densidad de poblacion',
        type: 'line'
    }],layout);
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
    Plotly.extendTraces(lineDiv, {
        y: [[poblacion]],
        x: [[generacion]]
    }, [0]);
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

function saveFile() {
    guardarArchivo(guardarJuego(), introducirNombreTxt());
}

function loadFile() {
    let file = fileSelector.files[0];
    reader.readAsText(file);

    reader.onload = cargarPreset;
}

// -------------------------------
// ---- Funciones Secundarias ----
// -------------------------------

function cargarPreset() {
    let result = reader.result;
    let lineas = result.split('\n');

    for (let i = 0; i < lineas.length - 1; i++) {
        if (i === 0) {
            let cabecera = lineas[i].split(' ');

            canvasSize = parseInt(cabecera[0]);
            canvasSizeElem.value = canvasSize;

            sMin = parseInt(cabecera[1]);
            sMinElem.value = sMin;

            sMax = parseInt(cabecera[2]);
            sMaxElem.value = sMax;

            bMin = parseInt(cabecera[3]);
            bMinElem.value = bMin;

            bMax = parseInt(cabecera[4]);
            bMaxElem.value = bMax;

            newGamePreset();
        } else {
            let linea = lineas[i].split('');
            for (let x = 0; x < canvasSize; x++) {
                poblacion += parseInt(linea[x]);
                tablero[i - 1][x] = new Cell(x, i - 1, parseInt(linea[x]), sMin, sMax, bMin, bMax);
            }
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
    // Graficamos
    Plotly.plot(lineDiv, [{
        y: [poblacion],
        x: [generacion],
        type: 'line'
    }]);
}

function guardarArchivo(contenido, nombre) {
    if (nombre === './CANCEL')
        return
    const a = document.createElement('a');
    const archivo = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(archivo);
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
}

function guardarJuego() {
    let contenido;
    // Agregamos las cabeceras del jueg(canvasSize, s min, s max, b min, b max)
    contenido = canvasSize.toString() + " " + sMin.toString() + " " + sMax.toString() + " " + bMin.toString() + " " + bMax.toString() + "\n";
    // Agregamos el contenido del tablero
    for (let y = 0; y < canvasSize; y++) {
        for (let x = 0; x < canvasSize; x++) {
            contenido += tablero[y][x].estado.toString();
        }
        contenido += "\n";
    }
    return contenido
}

function introducirNombreTxt() {
    let nombre = prompt('Introduce el nombre de la configuracion:');
    if (nombre == null || nombre == '') {
        nombre = './CANCEL';
    } else {
        nombre += ".txt";
    }

    return nombre;
}

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

function newGamePreset() {
    // Paramos el juego si ya hay uno corriendo y reiniciamos los datos
    if (playing === true) {
        play();
    }
    // Reiniciamos los datos 
    generacion = 0;
    poblacion = 0;
    Plotly.purge(lineDiv);
    // Creamos el tablero
    tablero = new Array(canvasSize);
    for (let i = 0; i < canvasSize; i++) {
        tablero[i] = new Array(canvasSize);
    }
}