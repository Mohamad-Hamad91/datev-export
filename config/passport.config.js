const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportjwt = require("passport-jwt");
const JWTStrategy = passportjwt.Strategy;
const ExtractJWT = passportjwt.ExtractJwt;
const bcrypt = require("bcryptjs");
const config = require("./environment");
const userRepo = require("../repositories/user.repo.server");
const httpStatus = require('../models/enums/httpStatus');
const Exception = require('../helpers/errorHandlers/Exception');
const errors = require('../models/enums/errors');

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async function (username, password, cb) {
      data = {};
      const rows = await userRepo.existUser(username);
      if (!rows || !bcrypt.compareSync(password, rows.password)) {
        //   throw new Exception(httpStatus.UNAUTHORIZED, 'incorrect_username_or_password');
        return cb(null, false, {
          msg: errors.incorrect_username_or_password,
        });
      }
      rows.password = "deleted for security purpose";
      //get roles then return th object
      // Users.getRoles(username)
      //     .then(roles => {
      data.userinfo = rows;
      data.userinfo.Role =
        rows.Role && rows.Role.dataValues ? rows.Role.dataValues.name : null;
      return cb(null, data, {
        message: "Logged In Successfully",
      });
      //     })
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      // jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJWT.fromExtractors([ExtractJWT.fromUrlQueryParameter("token"), ExtractJWT.fromHeader("token"), ExtractJWT.fromAuthHeaderAsBearerToken()]),
      secretOrKey: config.jwtSecret,
    },
    function (jwtPayload, cb) {
      return cb(null, jwtPayload);
    }
  )
);
