// Replace these with your bot's API token and chat ID
const telegramToken = '7700260562:AAEDkB1YsEeNfOAtsstVX_PcqKKwvZrBWWA';
const chatId = '1446987860';

// Function to send messages to Telegram
function sendToTelegram(message) {
    fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message }),
    })
        .then(response => {
            if (response.ok) {
                alert('Log sent to Telegram!');
            } else {
                alert('Failed to send log to Telegram. Check your token and chat ID.');
            }
        })
        .catch(error => {
            console.error('Error sending to Telegram:', error);
            alert('An error occurred while sending to Telegram.');
        });
}

// Function to update the log display in the browser
function updateLogDisplay() {
    const logDisplay = document.getElementById("logDisplay");
    logDisplay.innerHTML = log.length
        ? log.map(entry => `<p>${entry}</p>`).join("")
        : "<p>No records yet!</p>";
}

// Load existing log from localStorage or initialize an empty array
let log = JSON.parse(localStorage.getItem("workLog")) || [];

// Clock In functionality
document.getElementById("clockInBtn").addEventListener("click", () => {
    const timestamp = new Date().toLocaleString();
    const message = `Clock In: ${timestamp}`;
    log.push(message); // Save log locally
    localStorage.setItem("workLog", JSON.stringify(log)); // Save log to localStorage
    updateLogDisplay(); // Update the display
    sendToTelegram(message); // Send log to Telegram
});

// Clock Out functionality
document.getElementById("clockOutBtn").addEventListener("click", () => {
    const timestamp = new Date().toLocaleString();
    const message = `Clock Out: ${timestamp}`;
    log.push(message); // Save log locally
    localStorage.setItem("workLog", JSON.stringify(log)); // Save log to localStorage
    updateLogDisplay(); // Update the display
    sendToTelegram(message); // Send log to Telegram
});

// Send Full Log functionality (Optional)
document.getElementById("sendFullLogBtn")?.addEventListener("click", () => {
    const fullLog = log.join('\n');
    sendToTelegram(`Full Log:\n${fullLog}`);
});

// Initialize the log display on page load
updateLogDisplay();
