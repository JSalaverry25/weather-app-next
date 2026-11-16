
import { WeatherError } from "../libs/weatherErrors";

const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

async function readOpenWeatherResponse(response, errorMessage) {
    if (response.ok) {
        return response.json();
    }

    if (response.status === 401) {
        throw new WeatherError(
            "La API Key no es válida.",
            "INVALID_API_KEY"
        );
    }

    if (response.status === 429) {
        throw new WeatherError(
            "Has alcanzado el límite de consultas.",
            "RATE_LIMITED"
        );
    }

    throw new WeatherError(
        errorMessage,
        "WEATHER_API_ERROR"
    );
}

function buildDailyForecast(forecastData) {
    const timezoneOffset = forecastData.city?.timezone ?? 0;
    const groupedDays = new Map();

    for (const item of forecastData.list ?? []) {
        const localDate = new Date(
            (item.dt + timezoneOffset) * 1000
        );

        const date = localDate.toISOString().slice(0, 10);
        const hour = localDate.getUTCHours();

        if (!groupedDays.has(date)) {
            groupedDays.set(date, {
                date,
                tempMin: Infinity,
                tempMax: -Infinity,
                precipitationProbability: 0,
                entries: [],
            });
        }

        const day = groupedDays.get(date);

        day.tempMin = Math.min(
            day.tempMin,
            item.main.temp_min ?? item.main.temp
        );

        day.tempMax = Math.max(
            day.tempMax,
            item.main.temp_max ?? item.main.temp
        );

        day.precipitationProbability = Math.max(
            day.precipitationProbability,
            item.pop ?? 0
        );

        day.entries.push({ item, hour });
    }

    return Array.from(groupedDays.values())
        .slice(0, 5)
        .map((day) => {
            // Elegimos el registro más cercano al mediodía.
            const representative = day.entries.reduce(
                (selected, candidate) => {
                    return Math.abs(candidate.hour - 12) <
                        Math.abs(selected.hour - 12)
                        ? candidate
                        : selected;
                }
            );

            const weather = representative.item.weather?.[0];

            return {
                date: day.date,
                tempMin: Math.round(day.tempMin),
                tempMax: Math.round(day.tempMax),
                description:
                    weather?.description ?? "Sin descripción",
                icon: weather?.icon ?? null,
                precipitationProbability: Math.round(
                    day.precipitationProbability * 100
                ),
            };
        });
}

export async function getWeatherByCity(city) {
    const normalizedCity =
        typeof city === "string" ? city.trim() : "";

    if (!normalizedCity) {
        throw new WeatherError(
            "Debes ingresar el nombre de una ciudad.",
            "EMPTY_CITY"
        );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        throw new WeatherError(
            "No se encontró la API Key.",
            "INVALID_API_KEY"
        );
    }

    try {
        // 1. Buscar las coordenadas de la ciudad.
        const geoParams = new URLSearchParams({
            q: normalizedCity,
            limit: "1",
            appid: apiKey,
        });

        const geoResponse = await fetch(
            `${GEO_URL}?${geoParams}`
        );

        const locations = await readOpenWeatherResponse(
            geoResponse,
            "No fue posible encontrar la ubicación."
        );

        const [location] = locations;

        if (!location) {
            throw new WeatherError(
                "No encontramos la ciudad ingresada.",
                "CITY_NOT_FOUND"
            );
        }

        // 2. Preparar las consultas meteorológicas.
        const weatherParams = new URLSearchParams({
            lat: String(location.lat),
            lon: String(location.lon),
            appid: apiKey,
            units: "metric",
            lang: "es",
        });

        // 3. Consultar clima actual y pronóstico en paralelo.
        const [currentResponse, forecastResponse] =
            await Promise.all([
                fetch(`${WEATHER_URL}?${weatherParams}`),
                fetch(`${FORECAST_URL}?${weatherParams}`),
            ]);

        const [weatherData, forecastData] = await Promise.all([
            readOpenWeatherResponse(
                currentResponse,
                "No fue posible obtener el clima actual."
            ),
            readOpenWeatherResponse(
                forecastResponse,
                "No fue posible obtener el pronóstico."
            ),
        ]);

        // 4. Transformar los datos.
        return {
            city: location.name ?? normalizedCity,
            country: location.country ?? weatherData.sys.country,

            temperature: weatherData.main.temp,
            feelsLike: weatherData.main.feels_like,
            tempMin: weatherData.main.temp_min,
            tempMax: weatherData.main.temp_max,

            humidity: weatherData.main.humidity,
            pressure: weatherData.main.pressure,

            windSpeed:
                weatherData.wind?.speed != null
                    ? Number((weatherData.wind.speed * 3.6).toFixed(1))
                    : null,

            visibility:
                weatherData.visibility != null
                    ? weatherData.visibility / 1000
                    : null,

            sunrise: weatherData.sys?.sunrise ?? null,
            sunset: weatherData.sys?.sunset ?? null,

            description:
                weatherData.weather[0]?.description ?? "Sin descripción",

            icon: weatherData.weather[0]?.icon ?? null,

            forecast: buildDailyForecast(forecastData),
        };

    } catch (error) {
        if (error instanceof WeatherError) {
            throw error;
        }

        throw new WeatherError(
            "No fue posible conectar con el servicio meteorológico.",
            "NETWORK_ERROR"
        );
    }
}
