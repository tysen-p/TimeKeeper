// Load existing log from localStorage or initialize an empty array
let log = JSON.parse(localStorage.getItem("workLog")) || [];

// Function to update the log display
function updateLogDisplay() {
    const logDisplay = document.getElementById("logDisplay");
    logDisplay.innerHTML = log.length
        ? log.map(entry => `<p>${entry}</p>`).join("")
        : "<p>No records yet!</p>";
}

// Function to handle Clock In
document.getElementById("clockInBtn").addEventListener("click", () => {
    const timestamp = new Date().toLocaleString(); // Get current date and time
    log.push(`Clock In at ${timestamp}`);
    localStorage.setItem("workLog", JSON.stringify(log)); // Save updated log to localStorage
    updateLogDisplay(); // Immediately update the log display
});

// Function to handle Clock Out
document.getElementById("clockOutBtn").addEventListener("click", () => {
    const timestamp = new Date().toLocaleString(); // Get current date and time
    log.push(`Clock Out at ${timestamp}`);
    localStorage.setItem("workLog", JSON.stringify(log)); // Save updated log to localStorage
    updateLogDisplay(); // Immediately update the log display
});

// Function to clear the log
document.getElementById("clearLogBtn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all logs?")) {
        log = []; // Clear the log array
        localStorage.removeItem("workLog"); // Remove data from localStorage
        updateLogDisplay(); // Update the log display to show it's empty
    }
});

// Initialize the log display on page load
updateLogDisplay();
