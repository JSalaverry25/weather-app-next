
export class WeatherError extends Error {
    constructor(message, code) {
        super(message);

        this.name = "WeatherError";
        this.code = code;
    }
}
