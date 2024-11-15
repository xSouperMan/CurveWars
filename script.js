var players = 6; // Number of players
var playerKeys = Array(players).fill(null).map(() => ({ left: null, right: null })); // Keys for each player
var selectedPlayer = null; // Currently selected player

const canv = document.getElementById("canv");
const ctx = canv.getContext("2d");

// Player positions for selection
const playerPositions = [];
const playerWidth = 100;
const playerHeight = 50;
const padding = 20;

// Calculate player rectangles and store their positions
function calculatePlayerPositions() {
    for (let i = 0; i < players; i++) {
        const x = 50;
        const y = 50 + i * (playerHeight + padding);
        playerPositions.push({ x, y, width: playerWidth, height: playerHeight, id: i });
    }
}

// Draw the player selection screen
function drawPlayerSelection() {
    ctx.clearRect(0, 0, canv.width, canv.height); // Clear canvas
    ctx.font = "20px Arial";
    ctx.textAlign = "left";

    for (let { x, y, width, height, id } of playerPositions) {
        // Highlight the selected player
        ctx.fillStyle = selectedPlayer === id ? "green" : "blue";

        // Draw the player rectangle
        ctx.fillRect(x, y, width, height);

        // Draw the player label
        ctx.fillStyle = "white";
        ctx.fillText(`Player ${id + 1}`, x + 10, y + height / 2 + 5);

        // Draw assigned keys or instructions if selected
        if (playerKeys[id].left && playerKeys[id].right) {
            ctx.fillText(`Left: ${playerKeys[id].left}`, x + width + 20, y + 20);
            ctx.fillText(`Right: ${playerKeys[id].right}`, x + width + 20, y + 40);
        } else if (selectedPlayer === id) {
            if (!playerKeys[id].left) {
                ctx.fillText("Select Left Key", x + width + 20, y + 20);
            } else {
                ctx.fillText(`Left: ${playerKeys[id].left}`, x + width + 20, y + 20);
                ctx.fillText("Select Right Key", x + width + 20, y + 40);
            }
        }
    }
}

// Handle canvas click for player selection
canv.addEventListener("click", (event) => {
    const rect = canv.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let { x, y, width, height, id } of playerPositions) {
        if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
            selectedPlayer = id;
            drawPlayerSelection();
            return;
        }
    }
});

// Handle key input for left and right keys
document.addEventListener("keydown", (event) => {
    if (selectedPlayer !== null) {
        const key = event.key;
        if (!playerKeys[selectedPlayer].left) {
            playerKeys[selectedPlayer].left = key;
        } else if (!playerKeys[selectedPlayer].right) {
            playerKeys[selectedPlayer].right = key;
            selectedPlayer = null; // Reset selection after both keys are assigned
        }
        drawPlayerSelection();
    }
});

// Initialization
function update() {
    calculatePlayerPositions();
    drawPlayerSelection();
}

update();


function start() {
    
}