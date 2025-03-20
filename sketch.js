let sentence = '';
let beads = [];
let lastTypedTime = 0;
let idleTime = 5000;
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
    background(255); // Always clear the screen to avoid any sentence being drawn

    // Start displaying beads after idle time
    if (millis() - lastTypedTime > idleTime) {
        isDisplayingBeads = true;
    }

    // Display the beads after a sentence is typed and processed
    if (isDisplayingBeads) {
        displayBeads();
    }
}

function keyTyped() {
    // Handle sentence typing and send when punctuation is typed
    if (key === '.' || key === '?' || key === '!') {
        if (sentence.length > 0) {
            let bead = sendText(); // Send the text as a bead
            beads.push(bead); // Add bead to beads array
            sentence = ''; // Clear the sentence
            lastTypedTime = millis(); // Reset idle time
            isDisplayingBeads = false; // Stop displaying beads while typing a new sentence
        }
    } else {
        sentence += key; // Append the typed key to the sentence
        lastTypedTime = millis(); // Reset idle time
    }
}

function sendText() {
    let text = sentence;
    if (socket.readyState == 1) {
        socket.send(text); // Send the sentence to the server
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
        createBeadsBasedOnSentiment(parseFloat(msg)); // Create bead based on sentiment score
    } else {
        console.log("That statement came back as neutral  ╰(*°▽°*)╯");
        createBeadsBasedOnSentiment(0); // Create a neutral bead
    }
}

function createBeadsBasedOnSentiment(score) {
    let bead = '';

    if (score > 0) {
        bead = "yellow bead"; // Positive sentiment
    } else if (score < 0) {
        bead = "blue bead"; // Negative sentiment
    } else {
        bead = "grey bead"; // Neutral sentiment
    }

    // Push the bead to the beads array
    beads.push(bead);

    // Start from the last added bead
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