let sentence = '';
let beads = []; // Array to store each sentence as a bead
let lastTypedTime = 0;
let idleTime = 8000; // Idle time before display starts
let isDisplayingBeads = false;
let beadIndex = 0; // Keeps track of the current bead being displayed
let letterIndex = 0; // Tracks how many letters have been typed for the current bead
let displaySpeed = 5; // Speed of the typing animation

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

    // Start displaying beads after idle time exceeds
    if (millis() - lastTypedTime > idleTime) {
        isDisplayingBeads = true;
    }

    // Display beads if it's time
    if (isDisplayingBeads) {
        displayBeads();
    }
}

function keyTyped() {
    if (key === '.' || key === '?' || key === '!') {
        if (sentence.length > 0) {
            let bead = sendText();  // Create a bead
            beads.push(bead);  // Add bead to beads array
            sentence = '';  // Reset sentence
            lastTypedTime = millis();  // Reset idle time
            isDisplayingBeads = false;  // Stop displaying while new sentence is typed
        }
    } else {
        sentence += key;  // Append typed character to sentence
        lastTypedTime = millis();  // Reset idle time
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
    return text; // Return the text to create the bead
}

function openHandler() {
    console.log("Connected to socket server at " + host);
}

function messageHandler(event) {
    var msg = event.data;
    console.log("Received sentiment value: ", msg); // Log the raw received sentiment

    // Parse the sentiment value and ensure it's a valid number
    let sentimentScore = parseFloat(msg);
    if (isNaN(sentimentScore)) {
        console.error("Invalid sentiment value received:", msg); // Handle invalid sentiment values
        sentimentScore = 0;  // Default to neutral if invalid sentiment
    }

    // Proceed to create the bead based on valid sentiment
    createBeadsBasedOnSentiment(sentimentScore);
}

function createBeadsBasedOnSentiment(score) {
    let bead = '';

    // Ensure the score is valid and handle appropriately
    if (score > 0) {
        bead = "yellow bead";
    } else if (score < 0) {
        bead = "blue bead";
    } else {
        bead = "grey bead";
    }

    // Ensure the bead is a valid string before pushing it to the array
    if (typeof bead !== 'string' || bead.trim() === '') {
        console.error("Invalid bead created: ", bead); // Log if an invalid bead is created
        return; // Skip adding the invalid bead
    }

    console.log("Bead created:", bead); // Log the created bead
    beads.push(bead);
    beadIndex = beads.length - 1;
    letterIndex = 0;
}

function displayBeads() {
    fill(0);

    // Log beads array to check for any undefined values
    console.log("Beads array: ", beads);

    // Draw all beads up to beadIndex
    for (let i = 0; i < beadIndex; i++) {
        let currentBead = beads[i];
        
        if (currentBead === undefined || currentBead === null) {
            console.error("Invalid bead at index " + i);
            continue; // Skip this invalid bead
        }

        text(currentBead, width / 2, height / 2 + (i * 30));
    }

    let currentBead = beads[beadIndex];

    if (currentBead === undefined || currentBead === null) {
        console.error("Invalid bead at beadIndex: " + beadIndex);
        return; // Skip drawing this bead if it's invalid
    }

    let displayString = currentBead.substring(0, letterIndex);
    text(displayString, width / 2, height / 2 + (beadIndex * 30));

    // Increment letterIndex for typing effect
    if (frameCount % displaySpeed === 0 && letterIndex < currentBead.length) {
        letterIndex++;
    }

    // When a bead is fully typed, move to the next one
    if (letterIndex >= currentBead.length) {
        beadIndex++;
        letterIndex = 0;
    }

    // Stop displaying beads when all beads are typed out
    if (beadIndex >= beads.length) {
        isDisplayingBeads = false;
    }
}