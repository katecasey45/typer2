let sentence = '';
let beads = [];
let lastTypedTime = 0;
let idleTime = 10000;
let beadOptions = ["red bead", "yellow bead", "blue bead"];
let isDisplayingBeads = false;
let beadIndex = 0;
let letterIndex = 0;
let displaySpeed = 5;

function setup() {
createCanvas(600, 400);
textSize(20);
textAlign(CENTER, CENTER);
textFont("Courier New");
}

function draw() {
background(255);

if (millis() - lastTypedTime > idleTime) {
isDisplayingBeads = true;
}

if (isDisplayingBeads) {
displayBeads();
}
}

function keyTyped() {
if (key === '.' || key === '?' || key === '!') {
if (sentence.length > 0) {
let bead = generateBeadWord();
beads.push(bead);
sentence = '';
lastTypedTime = millis();
isDisplayingBeads = false;
}
} else {
sentence += key;
lastTypedTime = millis();
}
}

function generateBeadWord() {
let randomIndex = floor(random(0, beadOptions.length));
return beadOptions[randomIndex];
}

function displayBeads() {
fill(0);

if (frameCount % displaySpeed === 0 && letterIndex < beads[beadIndex].length) {
letterIndex++;
}

for (let i = 0; i < beadIndex; i++) {
let currentBead = beads[i];
text(currentBead, width / 2, height / 2 + (i * 30));
}

let currentBead = beads[beadIndex];
let displayString = currentBead.substring(0, letterIndex);
text(displayString, width / 2, height / 2 + (beadIndex * 30));

if (letterIndex >= currentBead.length) {
beadIndex++;
letterIndex = 0;
}

if (beadIndex >= beads.length) {
isDisplayingBeads = false;
}
}