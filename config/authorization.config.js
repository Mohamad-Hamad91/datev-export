const jwt = require("jsonwebtoken");
const config = require("./environment");
const Exception = require("../helpers/errorHandlers/Exception");
const httpStatus = require("../models/enums/httpStatus");
const errors = require('../models/enums/errors');

module.exports.authorize = function (...allowed) {
  let authorized = false;
  return (req, res, next) => {
    // we have req.user from passport middleware
    // jwt.verify(req.token, config.jwtSecret, function (err, decoded) {
    //   if (!err) {
    // console.log(decoded);
    // req.userinfo = req.user;
    if (!req.user?.userinfo) throw new Exception(httpStatus.FORBIDDEN, errors.forbidden);
    for (let i = 0; i < allowed.length; i++) {
      if (allowed[i] == req.user.userinfo.Role) {
        authorized = true;
        next();
        break;
      }
    }

    if (!authorized) {
      throw new Exception(httpStatus.FORBIDDEN, errors.forbidden);
    }
    // } else {
    //   throw new Exception(httpStatus.FORBIDDEN, errors.forbidden);
    // }
    // });
  };
};

module.exports.extractUserInfo = function () {
  return (req, res, next) => {
    jwt.verify(req.token, config.jwtSecret, function (err, decoded) {
      if (err) throw new Exception(httpStatus.FORBIDDEN, errors.unauthorized);
      req.userinfo = decoded.userinfo;
    });
    next();
  };
};

module.exports.belongToOrganisation = function () {
  return (req, res, next) => {
    // jwt.verify(req.token, config.jwtSecret, function (err, decoded) {
    //   if (err) throw new Exception(httpStatus.FORBIDDEN, errors.unauthorized);
    if (!req.user?.userinfo) throw new Exception(httpStatus.FORBIDDEN, errors.forbidden);
    const userinfo = req.user?.userinfo;
    if (
      ((req.params.id && userinfo.OrganisationId != req.params.id) ||
        (req.query.OrganisationId &&
          userinfo.OrganisationId != req.query.OrganisationId)) &&
      userinfo.Role != "Admin"
    ) {
      throw new Exception(httpStatus.FORBIDDEN, errors.unauthorized);
    } else {
      next();
    }
    // });
  };
};

/**
 * to display anaysis
 * 1 the user must belong to the organisation
 * 2 the procedure must has Analysis set to true
 */
module.exports.canDisplayAnalysis = function () {
  return async (req, res, next) => {
    // jwt.verify(req.token, config.jwtSecret, async function (err, decoded) {
    //   if (err) throw new Exception(httpStatus.FORBIDDEN, errors.unauthorized);
    if (!req.user?.userinfo) throw new Exception(httpStatus.FORBIDDEN, errors.forbidden);
    const userinfo = req.user?.userinfo;
    if (!req.params.orgId)
      throw new Exception(httpStatus.BAD_REQUEST, errors.organisation_id_is_required);
    if (!req.params.prcId)
      throw new Exception(httpStatus.BAD_REQUEST, errors.procedure_id_is_required);
    if (userinfo.OrganisationId != req.params.orgId && userinfo.Role != "Admin")
      throw new Exception(httpStatus.FORBIDDEN, errors.unauthorized);
    const prc = await require("../repositories/procedure.repo.server").fetchOne(+req.params.prcId);
    // if (prcs.length !== 1)
    //   next(
    //     new Exception(httpStatus.UNAUTHORIZED, "procedure_id_is_required")
    //   );
    if (!prc || !prc.analysis)
      next(new Exception(httpStatus.UNAUTHORIZED, errors.procedure_analysis_disabled));
    next();
    // });
  };
};
