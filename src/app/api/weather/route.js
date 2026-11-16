
import { NextResponse } from "next/server";
//import { getCurrentWeather } from "../../../services/weatherServices";
import { getWeatherByCity } from "../../../services/weatherServices";
import { WeatherError } from "../../../libs/weatherErrors";

export async function POST(request) {
  let body;

  // 1. Leer y validar el JSON recibido
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "El cuerpo de la solicitud no contiene un JSON válido.",
        code: "INVALID_BODY",
      },
      { status: 400 }
    );
  }

  const city = body?.city;

  if (typeof city !== "string" || !city.trim()) {
    return NextResponse.json(
      {
        message: "Debes ingresar el nombre de una ciudad.",
        code: "EMPTY_CITY",
      },
      { status: 400 }
    );
  }

  // 2. Consultar nuestro servicio
  try {
    const weather = await getWeatherByCity(city);

    return NextResponse.json(
      {
        success: true,
        data: weather,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof WeatherError) {
      const statusCodes = {
        EMPTY_CITY: 400,
        CITY_NOT_FOUND: 404,
        INVALID_API_KEY: 500,
        WEATHER_API_ERROR: 502,
        NETWORK_ERROR: 503,
      };

      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        {
          status: statusCodes[error.code] ?? 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Ocurrió un error inesperado.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
