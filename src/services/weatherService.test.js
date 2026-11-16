// @vitest-environment node
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import { http, HttpResponse } from "msw";
import { server } from "../tests/server";
import { getWeatherByCity } from "./weatherServices";

const GEO_URL =
  "https://api.openweathermap.org/geo/1.0/direct";

const WEATHER_URL =
  "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
  "https://api.openweathermap.org/data/2.5/forecast";

beforeEach(() => {
  vi.stubEnv("OPENWEATHER_API_KEY", "test-api-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getWeatherByCity", () => {
  it("debe devolver el clima actual y pronóstico correctamente", async () => {
    server.use(
      http.get(GEO_URL, () => {
        return HttpResponse.json([
          {
            name: "Managua",
            lat: 12.1364,
            lon: -86.2514,
            country: "NI",
          },
        ]);
      }),

      http.get(WEATHER_URL, () => {
        return HttpResponse.json({
          name: "Barrio Santo Domingo",
          sys: {
            country: "NI",
            sunrise: 1763290000,
            sunset: 1763330000,
          },
          main: {
            temp: 30,
            feels_like: 33,
            temp_min: 28,
            temp_max: 32,
            humidity: 70,
            pressure: 1012,
          },
          wind: {
            speed: 2,
          },
          visibility: 10000,
          weather: [
            {
              description: "cielo despejado",
              icon: "01d",
            },
          ],
        });
      }),

      http.get(FORECAST_URL, () => {
        return HttpResponse.json({
          city: {
            timezone: -21600,
          },
          list: [
            {
              dt: 1794873600,
              main: {
                temp: 29,
                temp_min: 27,
                temp_max: 31,
              },
              pop: 0.2,
              weather: [
                {
                  description: "cielo despejado",
                  icon: "01d",
                },
              ],
            },
          ],
        });
      })
    );

    const result = await getWeatherByCity("Managua");

    expect(result).toMatchObject({
      city: "Managua",
      country: "NI",
      temperature: 30,
      feelsLike: 33,
      tempMin: 28,
      tempMax: 32,
      humidity: 70,
      pressure: 1012,
      windSpeed: 7.2,
      visibility: 10,
      description: "cielo despejado",
      icon: "01d",
    });

    expect(result.forecast).toHaveLength(1);

    expect(result.forecast[0]).toMatchObject({
      tempMin: 27,
      tempMax: 31,
      precipitationProbability: 20,
    });
  });

  it("debe lanzar CITY_NOT_FOUND cuando la ciudad no existe", async () => {
    server.use(
      http.get(GEO_URL, () => {
        return HttpResponse.json([]);
      })
    );

    await expect(getWeatherByCity("CiudadInventada"))
      .rejects.toMatchObject({
        code: "CITY_NOT_FOUND",
      });
  });

  it("debe lanzar EMPTY_CITY cuando el nombre está vacío", async () => {
    await expect(getWeatherByCity("   "))
      .rejects.toMatchObject({
        code: "EMPTY_CITY",
      });
  });

  it("debe lanzar INVALID_API_KEY cuando la API Key no es válida", async () => {
    server.use(
      http.get(GEO_URL, () => {
        return HttpResponse.json(
          { cod: 401, message: "Invalid API key" },
          { status: 401 }
        );
      })
    );

    await expect(getWeatherByCity("Managua"))
      .rejects.toMatchObject({
        code: "INVALID_API_KEY",
      });
  });

  it("debe lanzar NETWORK_ERROR cuando falla la conexión", async () => {
    server.use(
      http.get(GEO_URL, () => {
        return HttpResponse.error();
      })
    );

    await expect(getWeatherByCity("Managua"))
      .rejects.toMatchObject({
        code: "NETWORK_ERROR",
      });
  });
});
