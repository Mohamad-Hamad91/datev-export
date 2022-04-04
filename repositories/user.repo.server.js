const User = require("../models/user.model.server");
const env = require("../config/environment");
const bcrypt = require("bcryptjs");
const sendMail = require("../config/mailer.config").sendMail;
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const { Op } = require("sequelize");
const Role = require("../models/role.model.server").getRole();

module.exports.fetchAll = function () {
  return new Promise(async (resolve, reject) => {
    const users = await User.getUser().findAll({
      where: {
        deleted: false,
      },
    });
    resolve(users);
  });
};

module.exports.fetch = function (
  search = "_",
  orderBy = "username",
  order = "DESC",
  limit = 50,
  offset = 0
) {
  return new Promise(async (resolve, reject) => {
    const user = await User.getUser().findAll({
      where: {
        [Op.or]: [
          {
            username: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            firstname: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            lastname: {
              [Op.like]: "%" + search + "%",
            },
          },
          {
            email: {
              [Op.like]: "%" + search + "%",
            },
          },
        ],
      },
      offset: offset,
      limit: limit,
      order: [[orderBy, order]],
    });
    resolve(user);
  }); // end of promise
};

module.exports.fetchAllManagers = async function () {
  const managers = await User.getUser().findAll({
    attributes: [
      "id",
      "organisationId",
      "title",
      "firstname",
      "lastname",
      "email",
      "username",
    ],
    include: [
      {
        model: Role,
        attributes: ["name"],
        required: true,
        where: {
          name: "Manager",
        },
      },
    ],
  });

  return managers;
};

module.exports.getUsersByOrganisationId = async function (id) {
  const users = await User.getUser().findAll({
    where: {
      OrganisationId: id,
      deleted: false,
    },
    include: Role,
  });
  return users;
};

/**
 * check if user exist based on username for authentication
 * the user must be not delted nor expired
 * @param {String} username
 */
module.exports.existUser = function (username) {
  return new Promise(async (resolve, reject) => {
    const user = await User.getUser().findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                username: username,
              },
              {
                email: username,
              },
            ],
          },
          {
            deleted: false,
          },
          {
            [Op.or]: [
              {
                expireDate: {
                  [Op.gt]: new Date(),
                },
              },
              {
                expireDate: null,
              },
            ],
          },
        ],
      },
      include: Role,
    });

    resolve(user && user.dataValues ? user.dataValues : null);
  }); // end of promise
}; // end of exist user

module.exports.insert = function (user) {
  return new Promise(async (resolve, reject) => {
    const password = randomstring.generate(10);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    user.password = hashedPassword;

    const result = await User.getUser().create(user);

    // generate a signed son web token with the contents of user object and return it in the response
    let d = new Date();
    d.setHours(d.getHours() + 6);
    const tokenPayload = {
      email: user.email,
      expire: d,
      id: result.dataValues.id,
    };
    const token = jwt.sign(tokenPayload, env.jwtSecret);

    const mail = {
      from: env.mailerUser,
      to: user.email,
      subject: "Confirmation Mail",
      html: ` 
                <div>
                <h3> Willkommen bei venator - portal! </h3 >
                <p> Sie bekommen diese Email, weil Sie registriert wurden und ein neues Passwort für Ihr Konto festlegen sollen.</p>
                <p> -----------------------------------------------------------------------------------------</p>
                <p> Rufen Sie bitte den folgenden Link
                <a href="${env.resetPassLink + token}"> ${
        env.resetPassLink + token
      } </a> auf, um den Prozess abzuschließen.</p>
                <p><b> Hinweis: </b> für Ihre  Sicherheit läuft der Link in 6 Stunden ab. </p>
                <p> Wir wünschen Ihnen viel Erfolg bei der Arbeit mit venator-portal. </p>
                <br>
                <p> Mit freundlichen Grüßen </p><p> Venator Consulting GmbH </p>
                </div>`,
      text:
        "Dear " +
        user.firstname +
        " " +
        user.lastname +
        " please click the next link and set " +
        "your password to login to your account: " +
        env.resetPassLink +
        token,
    };

    const mailRes = await sendMail(mail);
    console.log(mailRes);
    // if manager create schema
    // if (user.role === 'Manager') {
    //     Posting.syncPosting('posting_' + result.dataValues.id);
    //     Accounts.syncAccounts('accounts_' + result.dataValues.id);
    // }

    resolve(result);
  }); // end of promise
}; // end of create/ register new user

module.exports.resetPassword = (data) => {
  return new Promise(async (resolve, reject) => {
    jwt.verify(data.token, env.jwtSecret, async function (err, decoded) {
      if (err) reject(err);
      if (decoded) {
        const email = decoded.email;
        const expire = decoded.expire;
        const now = new Date();
        if (now.getTime() > Date.parse(expire)) reject("registeration expired");

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(data.password, salt);

        const result = await User.getUser().update(
          {
            password: hashedPassword,
            reseted: true,
          },
          {
            where: {
              email: email,
            },
          }
        );
        resolve("updated successfully");
      } else {
        reject("error: invalid token!");
      }
    });
  });
};

module.exports.changePassword = async function (email, password) {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const result = await User.getUser().update(
    {
      password: hashedPassword,
      reseted: true,
    },
    {
      where: {
        email: email,
      },
    }
  );
  return result;
};

module.exports.createDefaultAdmin = function (role) {
  return new Promise(async (resolve, reject) => {
    // const password = randomstring.generate(10);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(env.defaultAdminPassword, salt);
    const user = User.getUser();
    const createdUser = await user.create({
      username: env.defaultAdminUsername,
      password: hashedPassword,
      firstname: "Admin",
      lastname: "Admin",
      email: env.defaultAdminEmail,
      RoleId: role.id,
    });
    // const result = await createdUser.addRole(role);
    resolve(createdUser);
  }); // end of promise
};

/**
 * update user object, you can use for update basic info or change passowrd,
 * just pass the data you want to update
 * @param {*} user User object or part of it
 * @param {*} userId to use in where close
 */
module.exports.update = function (user, userId) {
  return new Promise(async (resolve, reject) => {
    const result = await User.getUser().update(user, {
      where: {
        id: userId,
      },
    });
    resolve(result);
  });
}; // end of update user

module.exports.softDelete = function (userId) {
  return new Promise(async (resolve, reject) => {
    const result = await User.getUser().update(
      {
        deleted: true,
      },
      {
        where: {
          id: userId,
        },
      }
    );
    resolve(result);
  });
};

// TO-DO prefer to use soft delete and expire date instead
/**
 * @deprecated prefer to use soft delete and expire date instead
 * @param {*} userId
 */
module.exports.delete = function (userId) {
  return new Promise(async (resolve, reject) => {
    const result = await User.getUser().destroy({
      where: {
        id: userId,
      },
    });
    resolve(result);
  });
};
