
"use client";

import { useState } from "react";

function WeatherDetail({ label, value, unit = "" }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-800">
        {value ?? "--"}{unit}
      </p>
    </div>
  );
}

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    if (!city.trim()) {
      setError("Ingresa el nombre de una ciudad.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const response = await fetch("/api/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city: city.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "No fue posible consultar el clima."
        );
      }

      setWeather(result.data);
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <section className="mx-auto max-w-3xl">

        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800">
            Weather App
          </h1>

          <p className="mt-2 text-slate-500">
            Consulta el clima de cualquier ciudad.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ej. Managua"
            aria-label="Nombre de la ciudad"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Consultando..." : "Buscar"}
          </button>
        </form>

        {loading && (
          <p role="status" className="mt-6 text-center text-slate-500">
            Consultando información meteorológica...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700"
          >
            {error}
          </div>
        )}

        {weather && (
          <div className="mt-8 space-y-6">

            {/* Clima actual */}
            <article className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">
                  {weather.city}, {weather.country}
                </h2>

                {weather.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                    alt={weather.description}
                    className="mx-auto h-28 w-28"
                  />
                )}

                <p className="text-6xl font-bold text-slate-800">
                  {weather.temperature.toFixed(1)}°C
                </p>

                <p className="mt-2 capitalize text-slate-500">
                  {weather.description}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Sensación térmica: {weather.feelsLike}°C
                </p>
              </div>

              {/* Información adicional */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <WeatherDetail
                  label="Temperatura mínima"
                  value={weather.tempMin}
                  unit="°C"
                />

                <WeatherDetail
                  label="Temperatura máxima"
                  value={weather.tempMax}
                  unit="°C"
                />

                <WeatherDetail
                  label="Humedad"
                  value={weather.humidity}
                  unit="%"
                />

                <WeatherDetail
                  label="Viento"
                  value={weather.windSpeed}
                  unit=" km/h"
                />

                <WeatherDetail
                  label="Presión atmosférica"
                  value={weather.pressure}
                  unit=" hPa"
                />

                <WeatherDetail
                  label="Visibilidad"
                  value={weather.visibility}
                  unit=" km"
                />
              </div>

              {/* Amanecer y atardecer */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <WeatherDetail
                  label="Amanecer"
                  value={
                    weather.sunrise
                      ? new Date(weather.sunrise * 1000).toLocaleTimeString(
                          "es-NI",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "--"
                  }
                />

                <WeatherDetail
                  label="Atardecer"
                  value={
                    weather.sunset
                      ? new Date(weather.sunset * 1000).toLocaleTimeString(
                          "es-NI",
                          { hour: "2-digit", minute: "2-digit" }
                        )
                      : "--"
                  }
                />
              </div>
            </article>

            {/* Pronóstico */}
            <article className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-800">
                Pronóstico de los próximos días
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
                {weather.forecast?.map((day) => (
                  <div
                    key={day.date}
                    className="rounded-xl bg-slate-50 p-3 text-center"
                  >
                    <p className="text-sm font-medium text-slate-600">
                      {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                        "es-NI",
                        { weekday: "short", day: "numeric" }
                      )}
                    </p>

                    {day.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                        alt={day.description}
                        className="mx-auto h-16 w-16"
                      />
                    )}

                    <p className="font-semibold text-slate-800">
                      {day.tempMax}° / {day.tempMin}°
                    </p>

                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {day.description}
                    </p>

                    <p className="mt-2 text-xs text-blue-600">
                      Lluvia: {day.precipitationProbability}%
                    </p>
                  </div>
                ))}
              </div>
            </article>

          </div>
        )}
      </section>
    </main>
  );
}
