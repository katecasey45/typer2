let sentence = '';
let beads = [];
let lastTypedTime = 0;
let idleTime = 8000;
let isDisplayingBeads = false;
let beadIndex = 0;
let displaySpeed = 5;

let letterIndexes = [];  // Array to track the typing progress for each bead

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

    // Check if idle time has passed and start displaying beads
    if (millis() - lastTypedTime > idleTime) {
        isDisplayingBeads = true;
    }

    // Display beads if required
    if (isDisplayingBeads && beads.length > 0) {
        displayBeads();
    }
}

function keyTyped() {
    if (key === '.' || key === '?' || key === '!') {
        if (sentence.length > 0) {
            let bead = sendText();
            sentence = '';  // Clear sentence after sending it
            beads.push(bead);
            letterIndexes.push(0); // Add a new letterIndex for the new bead
            lastTypedTime = millis();
            isDisplayingBeads = false; // Stop displaying beads after new sentence
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
    letterIndexes.push(0);  // Initialize typing progress for the new bead
}

function displayBeads() {
    fill(0);

    // Loop through all the beads to display each one
    for (let i = 0; i < beads.length; i++) {
        let currentBead = beads[i];

        // Ensure the bead exists and we're still typing it
        if (currentBead && letterIndexes[i] < currentBead.length) {
            // Only increment letterIndex for each bead if it hasn't reached the end of the bead
            if (frameCount % displaySpeed === 0) {
                letterIndexes[i]++;
            }

            // Display the typed part of the current bead (typewriter effect)
            let displayString = currentBead.substring(0, letterIndexes[i]);
            text(displayString, width / 2, height / 2 + (i * 30));
        } else if (currentBead) {
            // If the bead is fully typed, display it fully
            let displayString = currentBead;
            text(displayString, width / 2, height / 2 + (i * 30));
        }
    }

if (beadIndex < beads.length && beads[beadIndex]) { // Check that the bead exists
    // Only move to the next bead if the current one is fully typed
    if (letterIndexes[beadIndex] >= beads[beadIndex].length) {
        beadIndex++;  // Move to the next bead

        // If there are more beads, reset the letter index for the next bead
        if (beadIndex < beads.length) {
            letterIndexes[beadIndex] = 0; // Reset letter index for the new bead
        }
    }
}

    // Stop displaying beads once all have been typed out
    if (beadIndex >= beads.length) {
        isDisplayingBeads = false;
    }
}