'use strict';

const W_W = innerWidth;
const W_H = innerHeight;

let maxSide, minSide;
if (W_W > W_H) {
    maxSide = W_W;
    minSide = W_H;
} else {
    maxSide = W_H;
    minSide = W_W;
}

const maxElements = 12;
const side = Math.floor(maxSide / maxElements);

const elementsInWidth = Math.floor(W_W / side);
const elementsInHeight = Math.floor(W_H / side);

let points = 0;
let time = 0;

