let sentence = '';
let beads = [];
let lastTypedTime = 0;
let idleTime = 5000;
let isDisplayingBeads = false;
let beadIndex = 0;
let letterIndex = 0;
let displaySpeed = 5;

var host = '127.0.0.1:8080'; // Your WebSocket server
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

    // If idle time has passed, start displaying beads
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
            beads.push(bead); // Add bead to the beads array
            sentence = '';
            lastTypedTime = millis();
            isDisplayingBeads = false;
        }
    } else {
        sentence += key; // Build the sentence as the user types
        lastTypedTime = millis();
    }
}

function sendText() {
    let text = sentence;
    if (socket.readyState === 1) {
        socket.send(text); // Send text to the WebSocket server
        console.log("Sent: " + text);
    } else {
        console.log("Socket not ready.");
    }
    return text;
}

function openHandler() {
    console.log("Connected to socket server at " + host);
}

function messageHandler(event) {
    var msg = event.data;
    console.log("Received sentiment value: ", msg);

    // Parse the sentiment score
    let sentimentScore = parseFloat(msg);
    if (isNaN(sentimentScore)) {
        console.error("Invalid sentiment value received:", msg);
        sentimentScore = 0; // Default to neutral if invalid sentiment
    }

    // Create beads based on sentiment score
    createBeadsBasedOnSentiment(sentimentScore);
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

    console.log("Created bead:", bead);
    beads.push(bead); // Push the created bead to the beads array
    beadIndex = beads.length - 1;
    letterIndex = 0; // Reset letterIndex to start from the first letter of the new bead
}

function displayBeads() {
    fill(0);
    
    // Loop through all beads up to beadIndex
    for (let i = 0; i <= beadIndex; i++) {
        let currentBead = beads[i];
        
        // If the bead is fully displayed, continue with the next bead
        if (i === beadIndex) {
            if (frameCount % displaySpeed === 0 && letterIndex < currentBead.length) {
                letterIndex++; // Gradually reveal the current bead
            }
            let displayString = currentBead.substring(0, letterIndex);
            text(displayString, width / 2, height / 2 + (i * 30)); // Display the current bead
        } else {
            text(currentBead, width / 2, height / 2 + (i * 30)); // Display all fully revealed beads
        }

        // Move to the next bead when the current one is fully revealed
        if (letterIndex >= currentBead.length && i === beadIndex) {
            beadIndex++;
            letterIndex = 0;
        }
    }

    // Stop displaying beads once all have been typed out
    if (beadIndex >= beads.length) {
        isDisplayingBeads = false;
    }
}
