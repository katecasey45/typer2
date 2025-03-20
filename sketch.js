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
            beads.push(bead); // Add the bead to the array
            sentence = ''; // Reset the sentence
            lastTypedTime = millis(); // Reset idle time
            isDisplayingBeads = false; // Stop displaying while new sentence is typed
        }
    } else {
        sentence += key; // Append the typed key to the sentence
        lastTypedTime = millis(); // Reset idle time
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
    return text; // Return the sentence as a bead
}

function openHandler() {
    console.log("Connected to socket server at " + host);
}

function messageHandler(event) {
    var msg = event.data;
    if (msg != 0) {
        console.log("Received sentiment value: " + msg);
        createBeadsBasedOnSentiment(parseFloat(msg)); // Create bead based on sentiment
    } else {
        console.log("That statement came back as neutral  ╰(*°▽°*)╯");
        createBeadsBasedOnSentiment(0); // Create neutral bead
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

    // Push bead to the beads array
    beads.push(bead);

    // Start from the last added bead
    beadIndex = beads.length - 1;
    letterIndex = 0;
}

function displayBeads() {
    fill(0); // Set text color to black

    // Loop through all beads up to beadIndex
    for (let i = 0; i <= beadIndex; i++) {
        let currentBead = beads[i];

        // Make sure currentBead is a valid string
        if (typeof currentBead !== 'string') {
            console.error("Invalid bead at index " + i);
            continue; // Skip invalid beads
        }

        // If we are typing the current bead
        if (i === beadIndex) {
            // Gradually reveal characters for the current bead
            if (frameCount % displaySpeed === 0 && letterIndex < currentBead.length) {
                letterIndex++;
            }
            let displayString = currentBead.substring(0, letterIndex);
            text(displayString, width / 2, height / 2 + (i * 30));
        } else {
            // Display already fully typed beads
            text(currentBead, width / 2, height / 2 + (i * 30));
        }

        // Move to the next bead once the current one is fully typed
        if (letterIndex >= currentBead.length && i === beadIndex) {
            beadIndex++;
            letterIndex = 0;
        }
    }

    // If all beads are typed, stop displaying them
    if (beadIndex >= beads.length) {
        isDisplayingBeads = false;
    }
}

