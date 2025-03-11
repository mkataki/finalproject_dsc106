document.addEventListener("DOMContentLoaded", function () {
    const marioGif = document.getElementById("marioGif");
    const nextButton = document.getElementById("next-button");

    // Retrieve the selected zone from localStorage
    let selectedZone = localStorage.getItem("selectedZone");

    // Set Mario's speed based on Zone 3 settings
    if (selectedZone === "zone3") {
        let animationSpeed = 6; // Adjust speed for Zone 3 running pace
        marioGif.style.animation = `run-animation ${animationSpeed}s infinite linear`;
    }

    // Event listener for "Next" button to navigate to scenario2.html
    nextButton.addEventListener("click", function () {
        window.location.href = "scenario2.html"; // Move to Peach's scenario page
    });
});

//timeline bar
function navigateToPage(page) {
    window.location.href = page;  // This will navigate to the specified page.
}