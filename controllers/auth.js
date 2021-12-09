const { response } = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const asyncWrapper = require("../middlewares/async");
const { generateJWT } = require("../helpers/jwt");

exports.login = asyncWrapper(async (req, res = response) => {
  const { email, password } = req.body;

  const userDB = await User.findOne({ email });
  if (!userDB) {
    return next(createCustomError("Email invalid", 404));
  }
  // password verification
  const validPassword = bcrypt.compareSync(password, userDB.password);

  if (!validPassword) {
    return next(createCustomError("Password invalid", 404));
  }

  // generate token JWT
  const token = await generateJWT(userDB._id);

  res.json({
    ok: true,
    token,
  });
});
// this route is not avaible, the users do not have to signup for use the app
exports.signup = asyncWrapper( async (req, res = response) => {
    const { email, password } = req.body;
        const emailExist = await User.findOne({email});

        if (emailExist && emailExist.password) {
            return next(createCustomError("There is already one user with that email", 400));
        };
        const user = new User({email, password})

        if (password) {
            // Encrypt the password
          const salt = bcrypt.genSaltSync();
          user.password = bcrypt.hashSync(password, salt)
        }
        await user.save();

        res.status(200).json({
            ok: true,
            user
        })
});

exports.renewToken = asyncWrapper( async (req, res = response) => {
  const uid = req.uid;

  const user = await User.findById(uid, "email role");

  // generate JWT only Admin
  const token = await generateJWT(uid);

  res.json({
    ok: true,
    token,
    user,
  });
});
