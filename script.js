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
const dateText = document.getElementById("date");
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
        <div class="p-3 hover:bg-slate-100 rounded-xl cursor-pointer border-b last:border-none recent-item">
        ${city}
        </div>
        `,
    )
    .join("");
};

dateText.innerText = new Date().toDateString();

// ERROR HANDLING
const showError = (msg) => {
  errorText.innerText = msg;
  errorDiv.classList.remove("opacity-0");
  setTimeout(() => errorDiv.classList.add("opacity-1"), 4000);
};

// EVENT LISTENERS
cityInput.addEventListener("focus", updateDropdownUI);
cityInput.addEventListener("click", () => dropdown.classList.toggle("hidden"));

// FETCH API
const fetchWeather = async (query, isCoords = false) => {
  const baseUrl = "https://api.openweathermap.org/data/2.5";
  const url = isCoords
    ? `${baseUrl}/weather?lat=${query.lat}&lon=${query.lon}&units=metric&appid=${apiKey}`
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
  if (city) {
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
          lon: position.coords.longitude,
        };
        fetchWeather(coords, true);
      },
      () => showError("Location access denied"),
    );
  } else {
    showError("Location not supported by browser");
  }
});

// ENTER KEY SEARCH
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// MAIN DISPLAY
const displayCurrentWeather = (data) => {
  cityName.innerText = data.name;
  mainTemp.innerText = `${Math.round(data.main.temp)}°C`;
  humidityVal.innerText = `${data.main.humidity}%`;
  windVal.innerText = `${data.wind.speed} km/h`;
  feelVal.innerText = `${Math.round(data.main.temp)}°C`;
  conditionText.innerText = data.weather[0].main;
};

// 5-DAYS FORECAST DATA
const fetchForecast = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const dailyData = data.list.filter((reading) =>
      reading.dt_txt.includes("12:00:00"),
    );

    displayForecast(dailyData);
  } catch (err) {
    console.error("Error fetching forecast:", err);
  }
};

// DAILY DISPLAY CARDS
const displayForecast = (days) => {
  const container = document.getElementById("displaySection");
  container.innerHTML = "";

  days.forEach((day) => {
    const date = new Date(day.dt * 1000).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

    // Cards
    container.innerHTML += `
            <div class=" w-[30vw] md:w-[13vw] bg-[#ffffff4d] boxShadow p-4 rounded-2xl text-center hover:scale-[1.07] hover:bg-[#ffffff7d] transition-all">
            <p class="text-xs text-slate-700 font-medium">${date}</p>
            <img src="${iconUrl}" alt="weather" class="w-12 h-12 mx-auto my-2">
            <p class="text-xl font-bold">${Math.round(day.main.temp)}°C</p>
            <div class="flex flex-col gap-1 mt-3 text-[10px] text-slate-800">
            <span><i class="fas fa-wind mr-1"></i>${day.wind.speed}km/h</span>
            <span><i class="fas fa-tint mr-1"></i>${day.main.humidity}%</span>
            </div>
            </div>
        `;
  });
};

dropdown.addEventListener("click", (e) => {
  if (e.target.classList.contains("recent-item")) {
    const city = e.target.innerText.trim();
    cityInput.value = city;
    dropdown.classList.add("hidden");
    fetchWeather(city);
  }
});
