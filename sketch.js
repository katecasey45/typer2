let sentence = '';
let beads = [];
let lastTypedTime = 0;
let idleTime = 10000;
let isDisplayingBeads = false;
let beadIndex = 0;
let letterIndex = 0;
let displaySpeed = 5;

var host = '127.0.0.1:8080';
var socket;

function setup() {
    createCanvas(600, 400);
    textSize(20);
    textAlign(CENTER, CENTER);
    textFont("Courier New");

    socket = new WebSocket('ws://' + host);
    socket.onopen = openHandler;
    socket.onmessage = messageHandler;
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
            let bead = sendText();
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

function sendText() {
    let text = sentence;

    if (socket.readyState == 1) {
        socket.send(text);
        console.log("Sent: " + text);
    } else {
        console.log("Socket not ready.");
    }
}

function openHandler() {
    console.log("Connected to socket server at " + host);
}

function messageHandler(event) {
    var msg = event.data;
    if (msg != 0) {
        console.log("Received sentiment value: " + msg);
        createBeadsBasedOnSentiment(parseFloat(msg));
    } else {
        console.log("That statement came back as neutral  ╰(*°▽°*)╯");
        createBeadsBasedOnSentiment(0);
    }
}

function createBeadsBasedOnSentiment(score) {
    let bead = '';

    if (score > 0) {
        bead = "yellow bead";
    } else if (score < 0) {
        bead = "blue bead";
    } else {
        bead = "grey bead";
    }

    beads.push(bead);
    beadIndex = beads.length - 1;
    letterIndex = 0;
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
