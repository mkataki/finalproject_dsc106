document.addEventListener("DOMContentLoaded", function () {
    const nextButton = document.getElementById("next-button");

    nextButton.addEventListener("click", function () {
        window.location.href = "tracker.html"; // Move to tracker page
    });
});

//timeline bar
function navigateToPage(page) {
    window.location.href = page;  // This will navigate to the specified page.
}