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

// Player data during the game
let gamePlayers = [];
let gameInterval;

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

// Start the game
function start() {
    // Clear canvas
    ctx.clearRect(0, 0, canv.width, canv.height);

    // Initialize players with non-colliding positions
    gamePlayers = playerKeys
        .filter((keys) => keys.left && keys.right)
        .map((keys, index) => ({
            x: 100 + Math.random() * (canv.width - 200),  // Start from a valid position
            y: 100 + Math.random() * (canv.height - 200),
            angle: Math.random() * Math.PI * 2,
            color: `hsl(${(index / players) * 360}, 100%, 50%)`,
            keys,
            speed: 1.5, // Reduced speed
            turnSpeed: 0.05, // Smoother turns
            trail: [{ x: 100 + Math.random() * (canv.width - 200), y: 100 + Math.random() * (canv.height - 200) }], // Initial position
            growing: true, // Flag to indicate the player is growing
        }));

    // Begin the game loop
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 16); // ~60 FPS
}

// Update game state
function updateGame() {
    ctx.clearRect(0, 0, canv.width, canv.height); // Clear canvas each frame

    for (let player of gamePlayers) {
        // Draw the trail (except for the head)
        for (let i = 1; i < player.trail.length; i++) {
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(player.trail[i].x, player.trail[i].y, 3, 0, Math.PI * 2); // Thinner trail
            ctx.fill();
        }

        // Draw the head (white front)
        const head = player.trail[0];
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(head.x, head.y, 4, 0, Math.PI * 2); // Head is slightly bigger
        ctx.fill();

        // Movement logic
        const { left, right } = player.keys;
        if (keyPressed[left]) player.angle -= player.turnSpeed; // Turn left
        if (keyPressed[right]) player.angle += player.turnSpeed; // Turn right

        // Update position (move forward)
        const newHead = {
            x: head.x + player.speed * Math.cos(player.angle),
            y: head.y + player.speed * Math.sin(player.angle),
        };

        // Add new head to the trail
        player.trail.unshift(newHead);

        // Check for collision with the trail (body collision) or other players
        if (checkCollisions(player)) {
            endGame();
            return;
        }

        // Collision detection with canvas edges
        if (newHead.x < 0 || newHead.x > canv.width || newHead.y < 0 || newHead.y > canv.height) {
            endGame();
            return;
        }

        // If the player is still growing, do not remove the last segment
        if (!player.growing) {
            player.trail.pop(); // Remove the last segment to simulate movement
        } else {
            // After the first movement, stop growing
            player.growing = false;
        }
    }
}

// Check if player collides with its own trail or another player's trail
function checkCollisions(player) {
    // Check collision with its own trail (excluding the head)
    for (let i = 1; i < player.trail.length; i++) {
        const segment = player.trail[i];
        if (Math.abs(player.trail[0].x - segment.x) < 5 && Math.abs(player.trail[0].y - segment.y) < 5) {
            return true; // Collision with self
        }
    }

    // Check collision with other players' trails
    for (let otherPlayer of gamePlayers) {
        if (otherPlayer === player) continue; // Skip self
        for (let segment of otherPlayer.trail) {
            if (Math.abs(player.trail[0].x - segment.x) < 5 && Math.abs(player.trail[0].y - segment.y) < 5) {
                return true; // Collision with another player's trail
            }
        }
    }

    return false;
}

// Key press tracking
const keyPressed = {};
document.addEventListener("keydown", (event) => (keyPressed[event.key] = true));
document.addEventListener("keyup", (event) => (keyPressed[event.key] = false));

// End the game
function endGame() {
    clearInterval(gameInterval);
    alert("Game Over!");
}

// Initialization
function update() {
    calculatePlayerPositions();
    drawPlayerSelection();
}

update();
