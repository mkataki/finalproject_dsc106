let dataset = [];
document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("start-button");

    if (startButton) {
        startButton.addEventListener("click", function () {
            document.getElementById("intro-screen").classList.add("fade-out");
            setTimeout(() => {
                window.location.href = "maxhr.html";  
            }, 1000);
        });
    }
});
let isMetric = true; // Default to metric
document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("toggle-button");
    const heightInput = document.getElementById("height");
    const weightInput = document.getElementById("weight");
    

    // Function to update the button text
    function updateToggleButtonText() {
        toggleButton.textContent = isMetric ? "Switch to Customary" : "Switch to Metric";
    }

    // Function to update placeholders based on unit system
    function updatePlaceholders() {
        const unitLabels = document.querySelectorAll(".unit"); // Select all unit spans
        if (isMetric) {
            unitLabels[0].textContent = "(cm)";  // Height unit
            unitLabels[1].textContent = "(kg)";  // Weight unit
        } else {
            unitLabels[0].textContent = "(inches)";  // Height unit
            unitLabels[1].textContent = "(lbs)";  // Weight unit
        }
    }

    // Function to convert values only when switching to customary
    function convertValues() {
        if (!isMetric) {
            // Convert metric values to customary
            heightInput.value = Math.round(heightInput.value / 2.54); // cm to inches
            weightInput.value = Math.round(weightInput.value * 2.20462); // kg to lbs
        } else {
            // Reset values back to metric (no conversion needed for metric)
            heightInput.value = Math.round(heightInput.value * 2.54); // inches to cm
            weightInput.value = Math.round(weightInput.value / 2.20462); // lbs to kg
        }
    }

    // Toggle button event listener
    toggleButton.addEventListener("click", function () {
        isMetric = !isMetric; // Toggle the unit system
        updateToggleButtonText(); // Update button text
        convertValues(); // Convert input values if switching units
        updatePlaceholders(); // Update Label
        predictHeartRate(); // Recalculate heart rate with updated values (if applicable)
    });

    updateToggleButtonText(); // Initialize button text on page load
    updatePlaceholders(); // Initialize placeholders on page load
});




// Function to remove duplicates by ID
function removeDuplicatesByID(data) {
    const uniqueData = [];
    const seenIDs = new Set();

    data.forEach(row => {
        if (!seenIDs.has(row.ID)) {
            seenIDs.add(row.ID);
            uniqueData.push(row);
        }
    });

    return uniqueData;
}

function updateSpeedLabel() {
    let speed = document.getElementById("speed").value;
    document.getElementById("speedValue").textContent = speed + " km/h";
}

// Load CSV file using D3.js
d3.csv("dataclean.csv", function(row) {
    return {
        time: +row.time,
        speed: +row.Speed,
        HR: +row.HR,
        ID: row.ID,
        age: +row.Age,
        weight: +row.Weight,
        height: +row.Height,
        gender: +row.Sex
    };
}).then(data => {
    dataset = data;
    console.log("CSV loaded successfully! Dataset:", dataset);
}).catch(error => {
    console.error("Error loading CSV file:", error);
    alert("Failed to load CSV file. Please check the console for details.");
});

// Logarithmic Regression coefficients
const logCoefficients = {
    w0: 301.31015653243117,  
    height: -65.773440,
    weight: 18.843343,
    age: -19.021465,
    sex: 9.029210,
    speed: 33.592657,
    time: 14.653400
};

// Function to apply logarithmic transformation
function logTransform(value) {
    return Math.log1p(value);
}

function predictHeartRate() {
    // Retrieve input values
    let height = parseFloat(document.getElementById("height").value);
    let weight = parseFloat(document.getElementById("weight").value);
    const age = parseInt(document.getElementById("age").value);
    const sex = parseInt(document.getElementById("gender").value);
    const speed = parseFloat(document.getElementById("speed").value);
    const time = parseFloat(document.getElementById("time").value) * 60; // Convert minutes to seconds

    // Convert height and weight to metric if they are in customary units
    if (!isMetric) {
        height = height * 2.54; // Convert inches to cm
        weight = weight / 2.20462; // Convert lbs to kg
    }

    // Apply logarithmic transformation for prediction
    const logHeight = logTransform(height);
    const logWeight = logTransform(weight);
    const logAge = logTransform(age);
    const logSpeed = logTransform(speed);
    const logTime = logTransform(time);

    // Predict HR using coefficients
    let estimatedHR =
        logCoefficients.w0 +
        (logCoefficients.height * logHeight) +
        (logCoefficients.weight * logWeight) +
        (logCoefficients.age * logAge) +
        (logCoefficients.sex * sex) +
        (logCoefficients.speed * logSpeed) +
        (logCoefficients.time * logTime);

    // Adjust HR based on speed thresholds
    if (speed < 8) {
        estimatedHR *= 0.65;
    } else if (speed >= 8 && speed <= 12) {
        estimatedHR *= 0.85;
    }

    // Clamp HR between realistic bounds
    estimatedHR = Math.max(40, Math.min(Math.round(estimatedHR), 220));

    // Update predicted HR display
    document.getElementById("predictedHR").textContent = estimatedHR + " bpm";

    // Assign heart rate zone based on predicted HR
    assignHeartRateZone(estimatedHR, age);
}


// Attach event listeners
function attachInputListeners() {
    const inputs = ["height", "weight", "age", "gender", "speed", "time"];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener("input", predictHeartRate);
    });
}
document.addEventListener("DOMContentLoaded", attachInputListeners);

function assignHeartRateZone(hr, age) {
    const maxHR = 220 - age; // Maximum heart rate calculation
    const percentageHR = (hr / maxHR) * 100; // HR as a percentage of max HR
    let zone = "";

    // Determine the correct zone based on percentage of max HR
    if (percentageHR < 60) zone = "zone1";
    else if (percentageHR < 70) zone = "zone2";
    else if (percentageHR < 80) zone = "zone3";
    else if (percentageHR < 90) zone = "zone4";
    else zone = "zone5";

    // Update zone display text
    document.getElementById("zoneDisplay").textContent =
        document.getElementById(zone).textContent;

    // Highlight the active zone and show its description
    highlightZone(zone);
}
function highlightZone(activeZone) {
    const zones = document.querySelectorAll(".zone");
    const descriptions = document.querySelectorAll(".zone-info");

    zones.forEach(zone => {
        zone.classList.toggle("highlight", zone.id === activeZone);
    });

    descriptions.forEach(desc => {
        desc.style.display = desc.id === `info-${activeZone}` ? "block" : "none";
    });
}


// Mario GIF handling
let marioGif = document.getElementById("marioGif");
let speedSlider = document.getElementById("speed");
let spriteWidth = 100;  // Width of one frame of the sprite
let totalFrames = 10;   // Total number of frames in the sprite sheet
let currentFrameIndex = 0;  // Index to track the current frame (from 0 to totalFrames-1)
let animationPaused = false;   // To track if the animation is paused
let sliderSpeedValue = parseFloat(speedSlider.value); // Store the speed value at the moment the slider is released

// Function to update the sprite position based on the current frame index
function updateSpritePosition() {
    let framePosition = currentFrameIndex * spriteWidth;
    marioGif.style.backgroundPosition = `-${framePosition}px 0px`;
}

// Pause the animation during the slider drag and freeze the sprite position
speedSlider.addEventListener("mousedown", function () {
    animationPaused = true;
    marioGif.style.animationPlayState = "paused";  // Pause the animation
    currentFrameIndex = getCurrentFrameIndex(); // Save current frame index
});

// For touch devices
speedSlider.addEventListener("touchstart", function () {
    animationPaused = true;
    marioGif.style.animationPlayState = "paused";  // Pause the animation
    currentFrameIndex = getCurrentFrameIndex(); // Save current frame index
});

// During slider input, freeze sprite position without updating background position
speedSlider.addEventListener("input", function () {
    updateSpeedLabel();
    predictHeartRate();
    // Keep the sprite frozen while the slider is being dragged (do not update position)
    if (!animationPaused) {
        currentFrameIndex = getCurrentFrameIndex();
    }
});

// Get the current frame index based on background-position
function getCurrentFrameIndex() {
    let computedStyle = getComputedStyle(marioGif);
    let backgroundPosition = computedStyle.backgroundPosition.split(' ');
    let currentPosition = parseInt(backgroundPosition[0].replace('px', ''), 10);
    return Math.abs(currentPosition) / spriteWidth;  // Convert pixel position to frame index
}

// Resume the animation on slider release with updated speed
function resumeAnimation() {
    if (animationPaused) {
        // Get the speed from the slider when released
        sliderSpeedValue = parseFloat(speedSlider.value);  // Store the current slider value

        // Calculate the new duration based on the slider's speed value
        let newDuration = 9 - (sliderSpeedValue - 3) * 0.2;

        // Set the new animation duration based on the updated speed
        marioGif.style.animation = `run-animation ${newDuration}s infinite linear`;
        marioGif.style.animationPlayState = "running";  // Resume the animation

        // Update the sprite position to the last paused frame index
        updateSpritePosition();

        // Reset animation paused state
        animationPaused = false;
    }
}

// Listen for slider release events to resume the animation
speedSlider.addEventListener("mouseup", function () {
    resumeAnimation();
});

// For touch devices
speedSlider.addEventListener("touchend", function () {
    resumeAnimation();
});

// Update the speed label dynamically as the user drags the slider
speedSlider.addEventListener("input", function () {
    updateSpeedLabel();
    predictHeartRate();
});

// Update speed label
function updateSpeedLabel() {
    let speed = document.getElementById("speed").value;
    document.getElementById("speedValue").textContent = speed + " km/h";
}

// Update Mario/Peach GIF based on gender selection
document.getElementById("gender").addEventListener("change", function () {
    if (this.value === "1") { 
        marioGif.src = "peach.gif"; 
        marioGif.style.transform = "scaleX(-1)"; 
    } else { 
        marioGif.src = "mario.gif"; 
        marioGif.style.transform = "scaleX(1)"; 
    }
});


//timeline bar
function navigateToPage(page) {
    window.location.href = page;  // This will navigate to the specified page.
}
