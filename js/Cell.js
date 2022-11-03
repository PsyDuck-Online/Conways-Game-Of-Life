export default class Cell {
    constructor(x, y, estado, sMin, sMax, bMin, bMax) {
        this.x = x;
        this.y = y;
        this.estado = estado;
        this.estadoSig = this.estado;

        this.sMin = sMin;
        this.sMax = sMax;
        this.bMin = bMin;
        this.bMax = bMax;

        this.vecinos = [];
    }

    agregarVecinos(tablero) {
        let xVecino;
        let yVecino;
        let N = tablero.length;

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                xVecino = (this.x + j + N) % N;
                yVecino = (this.y + i + N) % N;

                if (i != 0 || j != 0) {
                    this.vecinos.push(tablero[yVecino][xVecino]);
                }
            }
        }
    }

    siguienteCiclo() {
        let suma = 0;
        for (let i = 0; i < this.vecinos.length; i++) {
            suma += this.vecinos[i].estado;
        }

        this.estadoSig = this.estado;

        if (suma < 2 || suma > 3) {
            this.estadoSig = 0;
        }
        if (suma === 3) {
            this.estadoSig = 1;
        }
    }

    mutar() {
        this.estado = this.estadoSig;
    }

    invertirEstado() {
        if (this.estado === 1) {
            this.estado = 0;
        } else {
            this.estado = 1;
        }
    }
}