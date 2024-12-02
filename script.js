// Replace these with your bot's API token and chat ID
const telegramToken = '7700260562:AAEDkB1YsEeNfOAtsstVX_PcqKKwvZrBWWA';
const chatId = '1446987860'; // Replace with your actual chat ID

let log = []; // Stores local log (optional for display)
let totalHours = 0; // Default total hours
let lastClockIn = null; // Timestamp for the current session

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

// Function to fetch the latest Clock In and Clock Out from Telegram
async function fetchLastSessionState() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramToken}/getUpdates`);
        const data = await response.json();

        if (data.ok) {
            const messages = data.result.reverse(); // Start from the latest message
            for (const message of messages) {
                const text = message.message.text;

                if (text.startsWith("Clock In at")) {
                    const match = text.match(/Clock In at (.+)/);
                    if (match) {
                        lastClockIn = new Date(match[1]);
                        console.log(`Fetched Last Clock In: ${lastClockIn}`);
                        break;
                    }
                }

                if (text.startsWith("Clock Out at")) {
                    lastClockIn = null; // Reset Clock In since Clock Out occurred last
                    console.log("Last action was Clock Out.");
                    break;
                }
            }
        } else {
            console.error('Failed to fetch updates from Telegram:', data);
        }
    } catch (error) {
        console.error('Error fetching updates from Telegram:', error);
    }
}

// Function to fetch total hours from Telegram
async function fetchTotalHours() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${telegramToken}/getUpdates`);
        const data = await response.json();

        if (data.ok) {
            const messages = data.result.reverse(); // Start from the latest message
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

    await fetchLastSessionState(); // Fetch the most recent Clock In or Clock Out
    await fetchTotalHours(); // Fetch the stored total hours

    // Enable buttons based on the last session state
    if (lastClockIn) {
        console.log("Last session state: Clocked In.");
        clockInBtn.disabled = true;
        clockOutBtn.disabled = false;
    } else {
        console.log("Last session state: Clocked Out.");
        clockInBtn.disabled = false;
        clockOutBtn.disabled = true;
    }

    updateLogDisplay(); // Update the UI
})();
