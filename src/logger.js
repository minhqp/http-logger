const onHeaders = require('on-headers');
const onFinished = require('on-finished');
const winstonLogger = require('./winston');

const LEVEL = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
};

const logger = () => (req, res, next) => {
  const logFields = {
    'log.level': undefined,
    message: undefined,
    req: {},
    res: {
      responseTime: '-',
    },
  };

  const start = process.hrtime.bigint();

  onHeaders(res, () => {
    const end = process.hrtime.bigint();
    const responseTime = Number(end - start) * 1e-6;
    logFields.res.responseTime = Number(responseTime.toFixed(3));
  });

  onFinished(res, () => {
    const logLevel = res.statusCode < 500 ? LEVEL.info : LEVEL.error;
    logFields['log.level'] = logLevel.toUpperCase();

    logFields.req.method = req.method;
    logFields.req.url = req.originalUrl || req.url;
    logFields.req.ip = req.headers['x-real-ip'] || req.ip || '-';
    logFields.req.user = req.user;

    logFields.res.statusCode = res.headersSent ? res.statusCode : '-';

    const message = `${logFields.req.method} ${logFields.req.url}`;

    winstonLogger[logLevel](message, logFields);
  });

  next();
};

module.exports = logger;
