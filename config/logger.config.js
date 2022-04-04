const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');


const transport = new winston.transports.DailyRotateFile({
    filename: './log/import-log-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  });



  transport.on('rotate', function(oldFilename, newFilename) {
    // do something fun
  });

  const logger = winston.createLogger({
    transports: [
      transport
    ]
  });



module.exports = {
  'logger': logger
};