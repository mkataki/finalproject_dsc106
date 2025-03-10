document.addEventListener("DOMContentLoaded", function () {
    const peachGif = document.getElementById("peachGif");
    const nextButton = document.getElementById("next-button");

    // Retrieve the selected zone from localStorage
    let selectedZone = localStorage.getItem("selectedZone");

    // Set Peach's speed based on Zone 2 settings
    if (selectedZone === "zone2") {
        let animationSpeed = 8; // Adjust speed for Zone 2 running pace
        peachGif.style.animation = `run-animation ${animationSpeed}s infinite linear`;
    }

    // Event listener for "Next" button to navigate to yourturn.html
    nextButton.addEventListener("click", function () {
        window.location.href = "yourturn.html"; // Move to your turn page
    });
});
