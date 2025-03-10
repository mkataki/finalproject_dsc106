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

// Updated Logarithmic Regression coefficients from Python
const logCoefficients = {
    w0: 301.31015653243117,  // Intercept
    height: -65.773440,
    weight: 18.843343,
    age: -19.021465,
    sex: 9.029210,
    speed: 33.592657,
    time: 14.653400
};

// Function to apply logarithmic transformation
function logTransform(value) {
    return Math.log1p(value);  // log(1 + x) to avoid log(0) issues
}

function predictHeartRate() {
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const age = parseInt(document.getElementById("age").value);
    const sex = parseInt(document.getElementById("gender").value); // Male = 0, Female = 1
    const speed = parseFloat(document.getElementById("speed").value);
    const time = parseFloat(document.getElementById("time").value);

    // Apply log transformation
    const logHeight = logTransform(height);
    const logWeight = logTransform(weight);
    const logAge = logTransform(age);
    const logSpeed = logTransform(speed);
    const logTime = logTransform(time);

    // Predict HR using the Logarithmic Ridge Regression model
    let estimatedHR = 
        logCoefficients.w0 +
        (logCoefficients.height * logHeight) +
        (logCoefficients.weight * logWeight) +
        (logCoefficients.age * logAge) +
        (logCoefficients.sex * sex) +  // No log for categorical variable
        (logCoefficients.speed * logSpeed) +
        (logCoefficients.time * logTime);

    // **Apply Hard-Coded Speed Adjustments**
    if (speed < 8) {
        estimatedHR *= 0.65;  // Reduce HR for walking speeds
    } else if (speed >= 8 && speed <= 12) {
        estimatedHR *= 0.85;  // Reduce HR slightly for jogging speeds
    }
    // Speeds > 12 km/h remain unchanged

    // Ensure HR is within a reasonable range (40-220 bpm)
    estimatedHR = Math.max(40, Math.min(Math.round(estimatedHR), 220));

    // Display predicted HR
    document.getElementById("predictedHR").textContent = estimatedHR + " bpm";

    // Assign heart rate zones dynamically
    assignHeartRateZone(estimatedHR, age);
}


// Function to determine HR zone dynamically based on Max HR formula
function assignHeartRateZone(hr, age) {
    let maxHR = 220 - age; // Standard Max HR formula
    let percentageHR = (hr / maxHR) * 100;

    let zone = "";
    if (percentageHR < 60) zone = "zone1";
    else if (percentageHR < 70) zone = "zone2";
    else if (percentageHR < 80) zone = "zone3";
    else if (percentageHR < 90) zone = "zone4";
    else zone = "zone5";

    document.getElementById("zoneDisplay").textContent = document.getElementById(zone).textContent;
    highlightZone(zone);
}

// Function to highlight the correct HR zone
function highlightZone(activeZone) {
    const zones = document.querySelectorAll(".zone");
    const descriptions = document.querySelectorAll(".zone-info");

    zones.forEach(zone => {
        if (zone.id === activeZone) {
            zone.classList.add("highlight");
        } else {
            zone.classList.remove("highlight");
        }
    });

    descriptions.forEach(desc => {
        if (desc.id === `info-${activeZone}`) {
            desc.style.display = "block";
        } else {
            desc.style.display = "none";
        }
    });
}

// Automatically update HR and zones when speed slider changes
document.getElementById("speed").addEventListener("input", function () {
    updateSpeedLabel();
    predictHeartRate();
});

// Function to update speed label dynamically
function updateSpeedLabel() {
    let speed = document.getElementById("speed").value;
    document.getElementById("speedValue").textContent = speed + " km/h";
}


// Keep track of the running state
let lastSpeed = 5;
let marioGif = document.getElementById("marioGif");

// Function to smoothly update animation speed without restarting
document.getElementById("speed").addEventListener("input", function () {
    let speed = parseFloat(this.value);

    if (speed !== lastSpeed) { 
        let newDuration = 8 - (speed - 3) * 0.5;
        marioGif.style.animationDuration = `${newDuration}s`;
    }

    lastSpeed = speed;
    document.getElementById("speedValue").textContent = speed + " km/h";
});

// Function to update Mario/Peach based on gender selection
document.getElementById("gender").addEventListener("change", function () {
    if (this.value === "1") {
        marioGif.src = "peach.gif";
        marioGif.style.transform = "scaleX(-1)";
    } else {
        marioGif.src = "mario.gif";
        marioGif.style.transform = "scaleX(1)";
    }
});

// Automatically update HR and zones when speed slider changes
document.getElementById("speed").addEventListener("input", function () {
    updateSpeedLabel();
    predictHeartRate();
});

// Function to update animation speed based on slider
document.getElementById("speed").addEventListener("input", function () {
    let speed = parseFloat(this.value);
    let animationSpeed = 6 - (speed - 3) * 0.2; // Adjusting speed dynamically

    let marioGif = document.getElementById("marioGif");
    marioGif.style.animation = `run-animation ${animationSpeed}s infinite linear`;

    document.getElementById("speedValue").textContent = speed + " km/h";
});

// Function to update Mario/Peach based on gender selection
document.getElementById("gender").addEventListener("change", function () {
    let marioGif = document.getElementById("marioGif");

    if (this.value === "1") { // Female selected
        marioGif.src = "peach.gif"; // Change to Peach
        marioGif.style.transform = "scaleX(-1)"; // Flip horizontally
    } else { // Male selected
        marioGif.src = "mario.gif"; // Change back to Mario
        marioGif.style.transform = "scaleX(1)"; // Restore normal orientation
    }
});