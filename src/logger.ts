import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;
const myFormat = printf(({ level, message, timestamp }) => {
    const colorizer = colorize();
    const levelStr = colorizer.colorize(level, `[${level.toUpperCase()}]`);
    return `${levelStr}: ${timestamp}: ${message}`;
});
const level = process.env.NODE_ENV === "production" ? "info" : "debug";

export const logger = winston.createLogger({
    format: combine(timestamp({ format: "YYYY/MM/DD HH:mm:ss" }), myFormat),
    transports: [new winston.transports.Console()],
    level,
});
