let sentence = '';
let beads = [];
let lastTypedTime = 0;
let idleTime = 8000;
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
        console.log("Sent:" + text);
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

    beads = [bead];  // Clear the previous beads for a new sentence
    beadIndex = 0;   // Reset the beadIndex for the new sentence
    letterIndex = 0; // Reset the letterIndex for the new sentence
}

function displayBeads() {
    fill(0);

    // Loop through all the beads up to beadIndex
    for (let i = 0; i < beads.length; i++) {
        let currentBead = beads[i];  // Correctly access each bead in the array

        if (i === beadIndex) {
            // Only reveal the current bead's text character by character
            if (frameCount % displaySpeed === 0 && letterIndex < currentBead.length) {
                letterIndex++;
            }
            let displayString = currentBead.substring(0, letterIndex);
            text(displayString, width / 2, height / 2 + (i * 30));
        } else {
            // Display all fully typed beads
            text(currentBead, width / 2, height / 2 + (i * 30));
        }

        // When the current bead is fully typed, move to the next one
        if (letterIndex >= currentBead.length && i === beadIndex) {
            beadIndex++;
            letterIndex = 0;
        }
    }

    // Stop displaying beads when all beads are typed out
    if (beadIndex >= beads.length) {
        isDisplayingBeads = false;
    }
}
