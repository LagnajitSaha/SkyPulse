import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const apiKey = process.env.WEATHER_API_KEY;
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Helper Function ===
function getWeatherCategory(description, isDay) {
  const desc = description.toLowerCase();

  if (!isDay || isDay === "no") return "night";
  if (desc.includes("sun") || desc === "clear") return "sunny";
  if (desc.includes("partly")) return "partly-cloudy";
  if (desc.includes("cloud") || desc.includes("overcast")) return "cloudy";
  if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("shower")) return "rain";
  if (desc.includes("thunder")) return "thunderstorm";
  if (desc.includes("snow") || desc.includes("sleet") || desc.includes("hail")) return "snow";
  if (desc.includes("fog") || desc.includes("mist") || desc.includes("haze")) return "fog";
  if (desc.includes("wind")) return "windy";

  return "clear"; // fallback
}

// === Middleware ===
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// === Routes ===
app.get("/", (req, res) => {
  res.render("index", { weather: null, error: null, category: "" });
});

app.post("/weather", async (req, res) => {
  const city = req.body.city;
  const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${city}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (!data.location) {
      return res.render("index", {
        weather: null,
        error: "City not found!",
        category: ""
      });
    }

    const weather = {
      city: data.location.name,
      country: data.location.country,
      localTime: data.location.localtime,
      latitude: data.location.lat,
      longitude: data.location.lon,
      temperature: data.current.temperature,
      description: data.current.weather_descriptions[0],
      icon: data.current.weather_icons[0],
      windSpeed: data.current.wind_speed,
      pressure: data.current.pressure,
      humidity: data.current.humidity,
      isDay: data.current.is_day,
      sunrise: data.current.astro?.sunrise,
      sunset: data.current.astro?.sunset,
      moonrise: data.current.astro?.moonrise,
      moonset: data.current.astro?.moonset
    };

    const category = getWeatherCategory(weather.description, weather.isDay);

    res.render("index", { weather, error: null, category });
  } catch (error) {
    res.render("index", {
      weather: null,
      error: "Could not fetch weather data.",
      category: ""
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
