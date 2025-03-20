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

    beads.push(bead);
    beadIndex = beads.length - 1;
    letterIndex = 0;

    console.log("Bead created:", bead); // Log the created bead
}

function displayBeads() {
    fill(0);  // Set text color to black

    // Loop through all beads, display them letter by letter
    for (let i = 0; i < beads.length; i++) {
        let currentBead = beads[i];

        // Debugging: Log each bead before processing
        console.log("Current bead at index", i, ":", currentBead);

        // Ensure currentBead is a valid string
        if (typeof currentBead !== 'string' || currentBead === '') {
            console.error("Invalid bead at index " + i);
            continue;  // Skip invalid beads
        }

        // If we are typing the current bead
        if (i === beadIndex) {
            // Gradually reveal characters for the current bead
            if (frameCount % displaySpeed === 0 && letterIndex < currentBead.length) {
                letterIndex++;
            }
            let displayString = currentBead.substring(0, letterIndex);
            text(displayString, width / 2, height / 2 + (i * 30));  // Display the current bead
        } else {
            // Display already fully typed beads
            text(currentBead, width / 2, height / 2 + (i * 30));
        }

        // Move to the next bead once the current one is fully typed
        if (letterIndex >= currentBead.length && i === beadIndex) {
            beadIndex++;  // Move to the next bead
            letterIndex = 0;  // Reset letter index for the next bead
        }
    }

    // Stop displaying beads when all beads are typed out
    if (beadIndex >= beads.length) {
        isDisplayingBeads = false;
    }
}


