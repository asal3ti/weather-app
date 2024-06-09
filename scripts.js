/******************************************************************************
 ***
 * WEB422 – Assignment 1
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Maryam Setayeshnia Student ID: 143893220 Date: 2024-05-28
 *
 ******************************************************************************
 **/
document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  const errorDiv = document.getElementById("error");
  const weatherContainer = $("#weatherContainer");
  const pagination = $(".pagination");
  let currentPage = 1;
  const itemsPerPage = 3;
  let locationsData = [];

  // an event for when the user clicks the search button
  searchBtn.addEventListener("click", () => {
    const input = searchBar.value.trim();
    if (input) {
      fetchWeatherData(input);
    } else {
      errorDiv.textContent = "Invalid city name.";
    }
  });
  // having a change event when user interacts with the buttons
  document.querySelectorAll('input[name="unit"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      document.querySelectorAll(".btn-group-toggle label").forEach((label) => {
        label.classList.remove("active");
      });
      if (this.checked) {
        // putting the selected button in an active state
        this.parentElement.classList.add("active");
      }
      displayWeatherData(locationsData);
    });
  });
  // getting user's current location using the navigator object
  window.getLocation = function () {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(showPosition, showError);
    } else {
      errorDiv.textContent = "Geolocation is not supported by this browser.";
    }
  };
  // when the geolocation API retrieves the user's current location
  function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherByLocation(lat, lon);
  }
  // Error-handling for when the geolocation API cannot retrieve user's current position
  function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        displayError("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        displayError("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        displayError("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        displayError("An unknown error occurred.");
        break;
    }
  }
  // fetching data for the user's location
  function fetchWeatherByLocation(lat, lon) {
    console.log("Fetching weather for location:", lat, lon);
    const apiKey = "7ec1f0df97b0f92fc2eb00534f133d29";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        locationsData = [data];
        currentPage = 1; // to display user's locaton on the first page
        displayWeatherData(locationsData);
      })
      .catch((error) => {
        errorDiv.textContent = "An error occurred while fetching the data.";
      });
  }
  // fetching the weather date based on the city or country name recieved
  async function fetchWeatherData(query) {
    const apiKey = "7ec1f0df97b0f92fc2eb00534f133d29";
    const url = `https://api.openweathermap.org/data/2.5/find?q=${query}&units=metric&cnt=10&appid=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      // check to see if the query matched any city
      if (data.count > 0) {
        // fetching the weather date based on each city id
        const cityIds = data.list.map((city) => city.id);
        const weatherData = await Promise.all(
          cityIds.map((id) => fetchWeatherById(id, apiKey))
        );
        locationsData = weatherData;
        currentPage = 1;
        displayWeatherData(locationsData);
        errorDiv.textContent = "";
      } else {
        errorDiv.textContent = "City not found. Please check your input.";
      }
    } catch (error) {
      errorDiv.textContent = "An error occurred while fetching the data.";
    }
  }
  // fetching each city's weather date  based on their id
  function fetchWeatherById(cityId, apiKey) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&units=metric&appid=${apiKey}`;
    console.log(cityId);
    return fetch(weatherUrl).then((response) => response.json());
  }
  // displaying the fetched weather data with pagination
  function displayWeatherData(locations) {
    weatherContainer.empty();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = locations.slice(start, end);
    paginatedItems.forEach((location) => {
      createWeatherCard(location);
    });
    createPagination();
  }
  // cerating weather cards for displaying the weather data
  function createWeatherCard(location) {
    // checking the preferred temperature format enterd by user
    const isMetric =
      document.querySelector('input[name="unit"]:checked').value === "metric";
    const unit = isMetric ? "°C" : "°F";
    // converting the temperatur to fahrenheit if necessary
    const temp = isMetric
      ? location.main.temp.toFixed(1)
      : ((location.main.temp * 9) / 5 + 32).toFixed(1);
    const temp_max = isMetric
      ? location.main.temp_max.toFixed(1)
      : ((location.main.temp_max * 9) / 5 + 32).toFixed(1);
    const temp_min = isMetric
      ? location.main.temp_min.toFixed(1)
      : ((location.main.temp_min * 9) / 5 + 32).toFixed(1);
    const timeDifference = 14400 + location.timezone;
    // convertign to military time format
    const sunrise = formatMilitaryTime(location.sys.sunrise + timeDifference);
    const sunset = formatMilitaryTime(location.sys.sunset + timeDifference);

    const card = `
    <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="card weather-card">
            <div class="card-body text-center">
                <img src="https://openweathermap.org/img/wn/${
                  location.weather[0].icon
                }@2x.png"
                    alt="Weather Icon" class="card-img-top mx-auto d-block">
                <h5 class="card-title">${location.name}, ${
      location.sys.country
    } 
                    <img id="flag" src="http://openweathermap.org/images/flags/${location.sys.country.toLowerCase()}.png"
                    alt="flag" class="flag">
                </h5>
                <p class="card-text" style="font-size: 1.2em;">
                    <span class="badge badge-info">${temp}${unit}</span> 
                    &nbsp;<i>${location.weather[0].description}</i>
                </p>
                <div class="card-text d-flex justify-content-between">
                    <div class="d-flex justify-content-center align-items-center">
                        <box-icon name='water' color='white'></box-icon>
                        <span>Humidity: ${location.main.humidity}</span> 
                    </div>                       
                    <div class="d-flex justify-content-center align-items-center">
                        <box-icon name='wind' color='white'></box-icon>
                        <span>Wind: ${location.wind.speed.toFixed(2)} m/s</span>
                    </div>                     
                </div>
                <div class="card-text d-flex justify-content-between">
                    <div class="d-flex justify-content-center align-items-center">
                        <box-icon name='sun' color='white' ></box-icon>
                        <span>Sunrise: ${sunrise}</span> 
                    </div>                       
                    <div class="d-flex justify-content-center align-items-center">
                        <box-icon name='moon' color='white' ></box-icon>
                        <span>Sunset: ${sunset}</span>
                    </div>                     
                </div>
                <div class="card-text d-flex justify-content-between">
                    <div class="d-flex justify-content-center align-items-center">
                        <box-icon name='up-arrow-alt' color='white'></box-icon>
                        <span>H: ${temp_max}${unit}</span> 
                    </div>                       
                    <div class="d-flex justify-content-center align-items-center">
                        <box-icon name='down-arrow-alt' color='white'></box-icon>
                        <span>L: ${temp_min}${unit}</span>
                    </div>                     
                </div>
                <div class="card-text d-flex justify-content-between">
                <div class="d-flex justify-content-center align-items-center">
                    <box-icon name='collapse-vertical' color='white'></box-icon>
                    <span>Pressure: ${location.main.pressure} hPa</span>
                </div>
            </div>
            <div class="card-text d-flex justify-content-between">
                <div class="d-flex justify-content-center align-items-center">
                    <box-icon name='map-pin' color='white'></box-icon>
                    <span>coords: [${location.coord.lat.toFixed(
                      4
                    )}, ${location.coord.lon.toFixed(4)}]</span>
                </div>
            </div>
            
            </div>
        </div>
    </div>`;

    weatherContainer.append(card);
  }

  function formatMilitaryTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  function createPagination() {
    // clearing previous pagination buttons
    pagination.empty();
    // getting the number of pages needed
    const totalPages = Math.ceil(locationsData.length / itemsPerPage);
    // checking if there is any need for pagination at all
    if (totalPages <= 1) return;

    const prevBtn = $(
      '<span class="page-item btn btn-primary mr-2" id="prev-page">Previous</span>'
    );
    prevBtn.on("click", () => {
      if (currentPage > 1) {
        currentPage--;
        displayWeatherData(locationsData);
      }
    });

    pagination.append(prevBtn);
    // creating buttons for each page item
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = $(
        `<span class="page-item btn btn-light mr-2 ${
          i === currentPage ? "active" : ""
        }">${i}</span>`
      );
      pageBtn.on("click", () => {
        currentPage = i;
        displayWeatherData(locationsData);
      });
      pagination.append(pageBtn);
    }

    const nextBtn = $(
      '<span class="page-item btn btn-primary" id="next-page">Next</span>'
    );
    nextBtn.on("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayWeatherData(locationsData);
      }
    });
    pagination.append(nextBtn);
  }
});
