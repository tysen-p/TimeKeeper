// Replace with your bot's API token and chat ID
const telegramToken = '7700260562:AAEDkB1YsEeNfOAtsstVX_PcqKKwvZrBWWA';
const chatId = '1446987860'; // Replace with your actual chat ID

let log = []; // Stores the local log (optional for display)
let totalHours = 0; // Default total hours
let lastClockIn = null; // Timestamp for the current session

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

// Function to fetch total hours from Telegram (sent as a message)
async function fetchTotalHours() {
    const response = await fetch(`https://api.telegram.org/bot${telegramToken}/getUpdates`);
    const data = await response.json();

    if (data.ok) {
        // Look for the latest message from the bot containing "Total Hours"
        const messages = data.result.reverse();
        for (const message of messages) {
            if (message.message.text.startsWith("Total Hours Worked:")) {
                const match = message.message.text.match(/([\d.]+) hours/);
                if (match) {
                    totalHours = parseFloat(match[1]);
                    console.log(`Fetched Total Hours: ${totalHours}`);
                    return;
                }
            }
        }
    } else {
        console.error('Failed to fetch updates from Telegram.');
    }
}

// Function to update the log display
function updateLogDisplay() {
    const logDisplay = document.getElementById("logDisplay");
    logDisplay.innerHTML = log.length
        ? log.map(entry => `<p>${entry}</p>`).join("")
        : "<p>No records yet!</p>";
}

// Clock In functionality
document.getElementById("clockInBtn").addEventListener("click", () => {
    const timestamp = new Date();
    lastClockIn = timestamp;
    log.push(`Clock In: ${timestamp.toLocaleString()}`);
    updateLogDisplay();
    sendToTelegram(`Clock In at ${timestamp.toLocaleString()}`);
});

// Clock Out functionality
document.getElementById("clockOutBtn").addEventListener("click", () => {
    if (!lastClockIn) {
        alert("Please Clock In first!");
        return;
    }

    const timestamp = new Date();
    const workedHours = (timestamp - lastClockIn) / (1000 * 60 * 60); // Convert milliseconds to hours
    totalHours += workedHours; // Add to the cumulative total
    lastClockIn = null; // Reset Clock In

    log.push(`Clock Out: ${timestamp.toLocaleString()} (Worked ${workedHours.toFixed(2)} hours)`);
    updateLogDisplay();

    // Update total hours in Telegram
    sendToTelegram(`Clock Out at ${timestamp.toLocaleString()}\nWorked ${workedHours.toFixed(2)} hours this session.\nTotal Hours Worked: ${totalHours.toFixed(2)} hours`);
});

// Fetch total hours on demand
document.getElementById("sendFullLogBtn")?.addEventListener("click", () => {
    sendToTelegram(`Total Hours Worked: ${totalHours.toFixed(2)} hours`);
});

// Initialize the app and fetch total hours from Telegram
(async function init() {
    await fetchTotalHours(); // Fetch the stored total hours
    updateLogDisplay(); // Update the UI
})();
