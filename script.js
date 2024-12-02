// Telegram Bot API token and chat ID (provided by you)
const telegramToken = '7700260562:AAEDkB1YsEeNfOAtsstVX_PcqKKwvZrBWWA';
const chatId = '1446987860'; // Your chat ID

let log = []; // Stores local log (optional for display)
let totalHours = 0; // Default total hours
let lastClockIn = null; // Timestamp for the current session
let lastClockOut = null; // Timestamp for the last Clock Out

// DOM Elements
const clockInBtn = document.getElementById("clockInBtn");
const clockOutBtn = document.getElementById("clockOutBtn");

// Function to send messages to Telegram
function sendToTelegram(message) {
    fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message }),
    }).catch(error => {
        console.error('Error sending to Telegram:', error);
    });
}

// Function to fetch the latest session state from Telegram
async function fetchLastSessionState() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramToken}/getUpdates`);
        const data = await response.json();

        if (data.ok) {
            const messages = data.result.reverse(); // Process messages from latest to oldest
            for (const message of messages) {
                const text = message.message.text;

                // Check for Clock In messages
                if (text.startsWith("Clock In at")) {
                    const match = text.match(/Clock In at (.+)/);
                    if (match) {
                        lastClockIn = new Date(match[1]);
                        console.log(`Found Clock In: ${lastClockIn}`);
                    }
                }

                // Check for Clock Out messages
                if (text.startsWith("Clock Out at")) {
                    const match = text.match(/Clock Out at (.+)/);
                    if (match) {
                        lastClockOut = new Date(match[1]);
                        console.log(`Found Clock Out: ${lastClockOut}`);
                    }
                }

                // Break if both timestamps are found
                if (lastClockIn && lastClockOut) {
                    break;
                }
            }

            // Determine the current session state based on timestamps
            if (lastClockIn && (!lastClockOut || lastClockIn > lastClockOut)) {
                console.log("Last session state: Clocked In.");
                return "Clocked In";
            } else {
                console.log("Last session state: Clocked Out.");
                return "Clocked Out";
            }
        } else {
            console.error('Failed to fetch updates from Telegram:', data);
            return "Unknown";
        }
    } catch (error) {
        console.error('Error fetching updates from Telegram:', error);
        return "Unknown";
    }
}

// Function to fetch total hours from Telegram
async function fetchTotalHours() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramToken}/getUpdates`);
        const data = await response.json();

        if (data.ok) {
            const messages = data.result.reverse(); // Process messages from latest to oldest
            for (const message of messages) {
                if (message.message.text.startsWith("Total Hours Worked:")) {
                    const match = message.message.text.match(/([\d.]+) hours/);
                    if (match) {
                        totalHours = parseFloat(match[1]); // Update totalHours from Telegram
                        console.log(`Fetched Total Hours: ${totalHours}`);
                        return;
                    }
                }
            }
            console.log("No Total Hours message found.");
        } else {
            console.error('Failed to fetch updates from Telegram:', data);
        }
    } catch (error) {
        console.error('Error fetching updates from Telegram:', error);
    }
}

// Function to update the log display in the browser
function updateLogDisplay() {
    const logDisplay = document.getElementById("logDisplay");
    logDisplay.innerHTML = log.length
        ? log.map(entry => `<p>${entry}</p>`).join("")
        : "<p>No records yet!</p>";
}

// Clock In functionality
clockInBtn.addEventListener("click", () => {
    const timestamp = new Date();
    lastClockIn = timestamp; // Save Clock In time
    log.push(`Clock In: ${timestamp.toLocaleString()}`);
    updateLogDisplay();
    sendToTelegram(`Clock In at ${timestamp.toLocaleString()}`);
    clockInBtn.disabled = true; // Disable Clock In
    clockOutBtn.disabled = false; // Enable Clock Out
});

// Clock Out functionality
clockOutBtn.addEventListener("click", () => {
    if (!lastClockIn) {
        alert("Please Clock In first!");
        return;
    }

    const timestamp = new Date();
    const workedHours = (timestamp - lastClockIn) / (1000 * 60 * 60); // Convert milliseconds to hours
    totalHours += workedHours; // Add session hours to the cumulative total
    lastClockIn = null; // Reset Clock In

    log.push(`Clock Out: ${timestamp.toLocaleString()} (Worked ${workedHours.toFixed(2)} hours)`);
    updateLogDisplay();

    // Update total hours in Telegram
    sendToTelegram(`Clock Out at ${timestamp.toLocaleString()}\nWorked ${workedHours.toFixed(2)} hours this session.\nTotal Hours Worked: ${totalHours.toFixed(2)} hours`);
    clockInBtn.disabled = false; // Enable Clock In
    clockOutBtn.disabled = true; // Disable Clock Out
});

// Initialize the app and fetch stored data from Telegram
(async function init() {
    console.log("Initializing app...");
    clockInBtn.disabled = true; // Disable Clock In until data is loaded
    clockOutBtn.disabled = true; // Disable Clock Out until data is loaded

    const sessionState = await fetchLastSessionState(); // Fetch the most recent session state
    await fetchTotalHours(); // Fetch the stored total hours

    // Enable buttons based on the last session state
    if (sessionState === "Clocked In") {
        clockInBtn.disabled = true;
        clockOutBtn.disabled = false;
    } else {
        clockInBtn.disabled = false;
        clockOutBtn.disabled = true;
    }

    updateLogDisplay(); // Update the UI
})();
