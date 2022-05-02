import * as winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;
const myFormat = printf(({ level, message, timestamp }) => {
    const colorizer = colorize();
    const level_str = colorizer.colorize(level, `[${level.toUpperCase()}]:`);
    return `${level_str} ${timestamp}: ${message}`;
});

export const logger = winston.createLogger({
    format: combine(timestamp({ format: "YYYY/MM/DD HH:mm:ss" }), myFormat),
    transports: [new winston.transports.Console()],
});
