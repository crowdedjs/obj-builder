import Canvas  from 'canvas';
import fs from 'fs';

const canvas = Canvas.createCanvas(200, 200);
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';
ctx.fillRect(0,0,100, 100);
const pngBuf = canvas.toBuffer('image/png');

fs.writeFileSync('test.png', pngBuf);

