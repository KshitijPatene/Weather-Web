// weather codes from open-meteo docs, mapped to a text description + emoji
const weatherCodes = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌦️"],
  61: ["Light rain", "🌧️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "🌨️"],
  80: ["Rain showers", "🌦️"],
  81: ["Rain showers", "🌦️"],
  82: ["Violent rain showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm w/ hail", "⛈️"],
  99: ["Thunderstorm w/ hail", "⛈️"]
};

function getWeather() {
  var city = document.getElementById("cityInput").value;

  if (city == "") {
    document.getElementById("errorMsg").innerText = "Please enter a city name!";
    return;
  }

  document.getElementById("errorMsg").innerText = "";
  document.getElementById("weatherCard").style.display = "none";
  document.getElementById("loading").style.display = "block";

  // step 1: turn the city name into lat/lon using the geocoding api
  fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(city) + "&count=1")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data.results) {
        document.getElementById("loading").style.display = "none";
        document.getElementById("errorMsg").innerText = "City not found, try again?";
        return;
      }

      var place = data.results[0];
      var lat = place.latitude;
      var lon = place.longitude;
      var name = place.name + ", " + place.country;

      // step 2: use lat/lon to actually get the weather
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
        "&current_weather=true&hourly=relativehumidity_2m&timezone=auto";

      fetch(url)
        .then(function (res) {
          return res.json();
        })
        .then(function (weatherData) {
          document.getElementById("loading").style.display = "none";
          showWeather(name, weatherData);
        });
    })
    .catch(function (err) {
      document.getElementById("loading").style.display = "none";
      document.getElementById("errorMsg").innerText = "Something went wrong. Check your internet connection.";
      console.log(err);
    });
}

function showWeather(name, data) {
  var current = data.current_weather;
  var code = current.weathercode;
  var weatherInfo = weatherCodes[code] || ["Unknown", "❓"];

  // grabbing humidity for roughly the current hour from the hourly array
  var currentHour = new Date().getHours();
  var humidity = data.hourly.relativehumidity_2m[currentHour];
  if (humidity === undefined) {
    humidity = data.hourly.relativehumidity_2m[0];
  }

  document.getElementById("cityName").innerText = name;
  document.getElementById("weatherIcon").innerText = weatherInfo[1];
  document.getElementById("temp").innerText = Math.round(current.temperature) + "°C";
  document.getElementById("condition").innerText = weatherInfo[0];
  document.getElementById("humidity").innerText = humidity;
  document.getElementById("wind").innerText = current.windspeed;

  document.getElementById("weatherCard").style.display = "block";
}

// let the user hit enter instead of clicking the button every time
document.getElementById("cityInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    getWeather();
  }
});