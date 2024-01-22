const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const port = 3000;

app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/weather", async (req, res) => {
  try {
    const cityName = req.body.city;

    // Запрос к OpenWeatherMap API
    const weatherApiKey = "ace1ffcc9ac4cab7456a6d14fdc483e7";
    const weatherApiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherApiKey}`;
    const weatherResponse = await fetch(weatherApiUrl);
    const weatherData = await weatherResponse.json();

    console.log("Requested weather for:", cityName);
    console.log("Weather data:", weatherData);
    const apiKey = "bG/ihNFebjjUh5fQeZseCw==OFnRunQwztiKgww2";
    const apiNinjasUrl = "https://api.api-ninjas.com/v1/city?name=";
    // Запрос к API Ninjas
    const apiNinjasResponse = await fetch(`${apiNinjasUrl}${cityName}`, {
      headers: {
        "X-Api-Key": apiKey,
      },
    });
    const apiNinjasData = await apiNinjasResponse.json();

    console.log("API Ninjas data:", apiNinjasData);

    // Извлекаем необходимые данные из API Ninjas
    const cityInfo =
      apiNinjasData.map((city) => ({
        isCapital: city.is_capital,
        population: city.population,
      }))[0] || {};

    // Генерируем HTML с вставленными данными и картой
    const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link
                rel="stylesheet"
                href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
              />
              <link rel="stylesheet" href="../static/styles.css" />
              <title>Weather Application</title>
            </head>
            <body>
              <div class="container mt-5">
                <h1 class="mb-4">Weather Application</h1>
                <form action="/weather" method="post">
                  <div class="form-group">
                    <label for="city">Enter city:</label>
                    <input
                      type="text"
                      class="form-control"
                      id="city"
                      name="city"
                      required
                    />
                  </div>
                  <button type="submit" class="btn btn-primary">Submit</button>
    
                  ${
                    weatherData
                      ? `
                        <h2 class="mt-4">Weather in ${weatherData.name}</h2>
                        <p>Temperature: ${(
                          weatherData.main.temp - 273.15
                        ).toFixed(2)}°C</p>
                        <p>Description: ${
                          weatherData.weather[0].description
                        }</p>
                        <p>Coordinates: ${weatherData.coord.lon}, ${
                          weatherData.coord.lat
                        }</p>
                        <p>Feels-like Temperature: ${(
                          weatherData.main.feels_like - 273.15
                        ).toFixed(2)}°C</p>
                        <p>Humidity: ${weatherData.main.humidity}%</p>
                        <p>Pressure: ${weatherData.main.pressure} hPa</p>
                        <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
                        <p>Country Code: ${weatherData.sys.country}</p>
                        ${
                          weatherData.rain
                            ? `<p>Rain Volume (last 3 hours): ${weatherData.rain["3h"]} mm</p>`
                            : "<p>No rain data available</p>"
                        }
                        ${
                          cityInfo.isCapital !== undefined
                            ? `<p>Is Capital: ${
                                cityInfo.isCapital ? "Yes" : "No"
                              }</p>`
                            : "<p>No city information available</p>"
                        }
                        ${
                          cityInfo.population !== undefined
                            ? `<p>Population: ${cityInfo.population}</p>`
                            : "<p>No city information available</p>"
                        }
                        <div style="height: 300px; width: 100%;">
                          <iframe
                            width="100%"
                            height="100%"
                            frameborder="0"
                            scrolling="no"
                            marginheight="0"
                            marginwidth="0"
                            src="https://www.openstreetmap.org/export/embed.html?bbox=${
                              weatherData.coord.lon - 1
                            },${weatherData.coord.lat - 1},${
                          weatherData.coord.lon + 1
                        },${weatherData.coord.lat + 1}&amp;layer=mapnik"
                          ></iframe>
                        </div>
                      `
                      : "<p>No weather data available</p>"
                  }
                </form>
              </div>
              <footer class="mt-5">
                <p>Grents Artem | SE-2205</p>
              </footer>
            </body>
          </html>
        `;

    // Отправляем сгенерированный HTML
    res.send(htmlContent);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.send("<p>Error fetching weather data</p>");
  }
});
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
