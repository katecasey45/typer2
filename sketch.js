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
    console.log("Drawing...");
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

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(text);
        console.log("Sent: " + text);
    } else {
        console.log("Socket not ready. Retrying...");
        setTimeout(() => sendText(), 1000);
    }
}

function openHandler() {
    console.log("Connected to socket server at " + host);
}

function messageHandler(event) {
    var msg = event.data;
    console.log("Received message: ", msg);

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
    console.log("Bead created: ", bead);
    console.log("Current beads: ", beads);
}

function displayBeads() {
    console.log("Drawing beads... Beads count: " + beads.length);

    if (beads.length === 0) {
        console.log("No beads to display.");
        return;
    }

    fill(0);

    for (let i = 0; i < beads.length; i++) {
        let currentBead = beads[i];

        // Safety check to ensure currentBead is defined before accessing its length
        if (currentBead && i === beadIndex && letterIndex < currentBead.length) {
            if (frameCount % displaySpeed === 0) {
                letterIndex++;
            }
        }

        if (currentBead) {
            let displayString = currentBead.substring(0, letterIndex);
            text(displayString, width / 2, height / 2 + (i * 30));
        }

        if (letterIndex >= currentBead.length && i === beadIndex) {
            beadIndex++;
            letterIndex = 0;
        }
    }

    if (beadIndex >= beads.length) {
        isDisplayingBeads = false;
    }
}