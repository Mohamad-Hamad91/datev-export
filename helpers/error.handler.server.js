const sendMail = require("../config/mailer.config").sendMail;
const logger = require("../config/logger.config").logger;
const env = require("../config/environment");

module.exports.errorHandler = async (title, error) => {
  if (error.isCustom !== true) {
    logger.error(
      `${new Date()}:  ${error.msg} -${error.message}:   ${error.stack}`
    );
    await sendMail({
      from: "Venator, Bug reporting",
      to: env.developerMail,
      subject: "exception stack trace",
      html: ` 
        <div>
        <h3> ${title} </h3 >
        <h3> ${error.msg} -${error.message}: </h3 >
        <p> -----------------------------------------------------</p>
        <p> ${error.stack} </p>
        </div>`,
    });
  }
};
