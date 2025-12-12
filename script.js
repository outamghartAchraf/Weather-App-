
const API_KEY = "8e9a860984781283f78cd5f2aa25fe1d";

// Search weather
document.getElementById("search-btn").addEventListener("click", () => {
    const city = document.getElementById("city-input").value.trim();
    if (!city) return showError("Please enter a city name");
    getWeather(city);
});
document.getElementById("city-input").addEventListener("keypress", e => { if(e.key==='Enter') document.getElementById("search-btn").click(); });

// Fetch weather
async function getWeather(city) {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
        const data = await res.json();
         
        if (data.cod !== 200) return showError("City not found!");

        document.getElementById("city-name").textContent = data.name;
        document.getElementById("temp").textContent = Math.round(data.main.temp)+"°C";
        document.getElementById("humidity").textContent = data.main.humidity+"%";
        document.getElementById("wind-speed").textContent = Math.round(data.wind.speed)+" km/h";
        document.getElementById("pressure").textContent = data.main.pressure;
        document.getElementById("condition").textContent = data.weather[0].description ;
        //document.getElementById("min-temp").textContent = " Min Temperature - "+Math.round(data.main.temp_min)+"°C";
       // document.getElementById("max-temp").textContent = " Max Temperature - "+Math.round(data.main.temp_max)+"°C";
        document.getElementById("weather-icon").innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].description}">`;

        
        autoThemeByTime(data.weather[0].icon);

        getDayWeek(data.coord.lat, data.coord.lon);

    } catch(err) { showError("Problem fetching weather data"); console.error(err); }
}

// Weekly forecast
async function getDayWeek(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();
        console.log(data);
        const weeklyDiv = document.getElementById("weekly");
        weeklyDiv.innerHTML = "";
        
        document.getElementById("min-temp").textContent =
        "Min Temperature - " + Math.round(data.list[0].main.temp_min) + "°C";

        document.getElementById("max-temp").textContent =
        "Max Temperature - " + Math.round(data.list[0].main.temp_max) + "°C";
         
        // code for sunrise and sunset
        const sunrise = new Date(data.city.sunrise* 1000);
        const sunset = new Date(data.city.sunset* 1000);

    // Format  time
    const options = { hour: "2-digit", minute: "2-digit" };

    const sunriseTime = sunrise.toLocaleTimeString("en-US", options);
    const sunsetTime = sunset.toLocaleTimeString("en-US", options);

    document.getElementById("sunrise").textContent =  sunriseTime
    document.getElementById("sunset").textContent =  sunsetTime

        

        //data.list[0].main.aqi
        document.getElementById("air_d").textContent = data.list[0].visibility / 1000 + " km"
         
        const WeekDays = data.list.filter((item, i) => i % 8 === 0).slice(0, 6);

        WeekDays.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

            weeklyDiv.innerHTML += `
                <div class="day-card">
                    <div class="day-name">${dayName}</div>
                    <div class="day-icon">
                        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png">
                    </div>
                    <div class="day-temp">${Math.round(item.main.temp)}°C</div>
                </div>
            `;
        });

    } catch (err) {
        document.getElementById("weekly").innerHTML = "<p>Problem loading forecast</p>";
    }
}


// Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
    const body = document.body;
    const toggle = document.getElementById("theme-toggle");
    if (body.classList.contains("day-theme")) {
        body.classList.replace("day-theme", "night-theme");
        toggle.innerHTML = `<i class="fa-solid fa-sun"></i>`;
        document.querySelector('.fa-sun').computedStyleMap.color = "yellow";

    } else {
        body.classList.replace("night-theme", "day-theme");
         toggle.innerHTML = ` <i class="fa-solid fa-moon"></i>`;
       
    }
});

// Update day
function updateCurrentDay() {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    document.getElementById("current-day").textContent = days[new Date().getDay()];
}

// Error message
function showError(msg) {
    const errorDiv = document.getElementById("error-message");
    errorDiv.textContent = msg;
    errorDiv.classList.add("show");
    setTimeout(() => errorDiv.classList.remove("show"), 3000);
}


function autoThemeByTime(icon) {
    const isDay = icon.includes("d");  

    const body = document.body;
    const toggle = document.getElementById("theme-toggle");

    
    body.classList.remove("day-theme", "night-theme");

    if (isDay) {
        body.classList.add("day-theme");
        toggle.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    } else {
        body.classList.add("night-theme");
        toggle.innerHTML = `<i class="fa-solid fa-moon"></i>`;
    }
}


async function getWeatherGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                       
                    const resWeather = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
                    const dataWeather = await resWeather.json();
                  

                    if (dataWeather.cod === 200) {
                               
                        getWeather(dataWeather.name);

                        document.getElementById("min-temp").textContent =
                            "Min Temperature - " + Math.round(dataWeather.main.temp_min) + "°C";
                        document.getElementById("max-temp").textContent =
                            "Max Temperature - " + Math.round(dataWeather.main.temp_max) + "°C";

     
                        getDayWeek(lat, lon);
                    } else {
                        console.warn("Unable to get weather for GPS coordinates");
                        getWeather("Beni Mellal"); 
                    }
                } catch (err) {
                    console.error("Error fetching weather data:", err);
                    getWeather("Beni Mellal"); 
                }
            } 
        );
    } else {
        console.warn("Geolocation not supported, using default city.");
        getWeather("Beni Mellal"); 
    }
}

document.getElementById('gps-btn').addEventListener("click", getWeatherGPS);

// Load default city
window.addEventListener("load", ()=>{ updateCurrentDay(); getWeather("rabat");  document.body.classList.replace("night-theme", "day-theme"); });
 






 