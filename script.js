// API KEY
const apiKey = "c9e6e31dd1f7b3ec348f16963c8678a5";

// STATES
let currentTemp = 0;

// ELEMENTS
const cityInput = document.getElementById("inputBox");
const dropdown = document.getElementById("dropdownDiv");
const weatherCard = document.getElementById("weatherCard");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");
const cityName = document.getElementById("cityName");
const date = document.getElementById("date");
const mainTemp = document.getElementById("mainTemp");
const conditionText = document.getElementById("conditionText");
const humidityVal = document.getElementById("humidityVal");
const windVal = document.getElementById("windVal");
const feelVal = document.getElementById("feelVal");
const displaySection = document.getElementById("displaySection");
const errorDiv = document.getElementById("errorDiv");
const errorText = document.getElementById("errorText");

// LOCAL STORAGE FOR RECENT CITIES
const saveToRecent = (city) => {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
  updateDropdownUI();
};

const updateDropdownUI = () => {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.length === 0) {
    dropdown.classList.add("hidden");
    return;
  }

  dropdown.innerHTML = cities
    .map(
      (city) => `
        <div class="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700 last:border-none recent-item">
        ${city}
        </div>
        `,
    )
    .join("");
};

// ERROR HANDLING
const showError = (errorText) => {
  errorDiv.classList.remove("translate-y-20");
  setTimeout(() => errorDiv.classList.add("translate-y-20"), 3000);
};

// EVENT LISTENERS
cityInput.addEventListener("focus", updateDropdownUI);
cityInput.addEventListener("click", () => dropdown.classList.toggle("hidden"));

// FETCH API
const fetchWeather = async (MediaQueryList, isCoords = false) => {
  const baseUrl = "https://api.openweathermap.org/data/2.5";
  const url = isCoords ? `${baseUrl}/weather?lat=${query.lat}&lon=${query.lon}&units=metric&appid=${apiKey}`
    : `${baseUrl}/weather?q=${query}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();

        // Update UI
        currentTemp = data.main.temp;
        displayCurrentWeather(data);
        saveToRecent(data.name);

        // Fetch 5 days forecast
        fetchForecast(data.coord.lat, data.coord.lon);

        weatherCard.classList.remove("hidden");
    } catch (err) {
        showError(err.message);
    }
};

// SEARCH BUTTON
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if(city) {
        fetchWeather(city);
    } else {
        showError("Please enter a city name");
    }
});

// LOCATION BUTTON
locBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                fetchWeather(coords, true);
            },
            () => showError("Location access denied")
        );
    } else {
        showError("Location not supported by browser")
    }
});

// ENTER KEY SEARCH
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchBtn.click();
});


