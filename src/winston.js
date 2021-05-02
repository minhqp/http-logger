const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const colorizer = winston.format.colorize();

const COLOR = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'white',
};
winston.addColors(COLOR);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.printf((info) =>
        colorizer.colorize(
          info.level,
          `${info.timestamp} [${info['log.level']}] ${info.message} ${info.res.statusCode} - ${info.res.responseTime} ms`,
        ),
      ),
    ),
  }),
  new DailyRotateFile({
    dirname: 'logs',
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    format: winston.format.printf((info) => {
      delete info.level;
      return JSON.stringify({
        '@timestamp': new Date().toISOString(),
        ...info,
      });
    }),
  }),
];

const winstonLogger = winston.createLogger({
  transports,
});

module.exports = winstonLogger;
