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

    // Only add bead if it's valid (non-empty string)
    if (bead && bead.trim() !== "") {
        beads.push(bead);
    }

    console.log("Bead created: ", bead);
    console.log("Current beads: ", beads);
}

function displayBeads() {
    fill(0);

    // Ensure that beadIndex is within bounds of beads array
    if (beadIndex >= beads.length) {
        console.log("All beads displayed.");
        isDisplayingBeads = false;
        return;
    }

    // Only increment letterIndex if the current bead exists and it's not fully displayed
    if (beads[beadIndex] && frameCount % displaySpeed === 0 && letterIndex < beads[beadIndex].length) {
        letterIndex++;
    }

    // Loop through all the beads up to beadIndex
    for (let i = 0; i < beadIndex; i++) {
        let currentBead = beads[i];
        if (currentBead) {
            text(currentBead, width / 2, height / 2 + (i * 30));
        }
    }

    // Handle the current bead (check if it's valid first)
    let currentBead = beads[beadIndex];
    if (currentBead) {
        let displayString = currentBead.substring(0, letterIndex);
        text(displayString, width / 2, height / 2 + (beadIndex * 30));
    }

    // Once the current bead is fully displayed, move to the next bead
    if (currentBead && letterIndex >= currentBead.length) {
        beadIndex++;  // Only move to next bead if the current one is fully displayed
        letterIndex = 0;
    }
}
