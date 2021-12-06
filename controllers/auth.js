const { response } = require("express");
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const { generateJWT } = require('../helpers/jwt')

exports.login = async (req, res = response) => {
    const { email, password } = req.body;

    try {
        const userDB = await User.findOne({email});
        if (!userDB) {
            return res.status(404).json({
                ok: false,
                msg: 'Email invalid'
            });
        }
        // password verification
        const validPassword = bcrypt.compareSync(password, userDB.password)

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Password invalid'
            });
        }

        // generate token JWT
        const token = await generateJWT( userDB._id );

        res.json({
            ok: true,
            token,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Please comunicate with the administrator"
        })
    }
};

// exports.signup = async (req, res = response) => {
//     const { email, password } = req.body;
//     try {
//         const emailExist = await User.findOne({email});

//         if (emailExist && emailExist.password) {
//             return res.status(400).json({
//                 ok: false,
//                 msg: 'There is already one user with that email'
//             })
//         };
//         const user = new User({email, password})

//         if (password) {
//             // Encrypt the password
//           const salt = bcrypt.genSaltSync();
//           user.password = bcrypt.hashSync(password, salt)
//         }
//         await user.save();

//         res.status(200).json({
//             ok: true,
//             user
//         })

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             ok: false,
//             msg: "Please comunicate with the administrator"
//         })
//     }
// };

exports.renewToken = async (req, res = response) => {
    const uid = req.uid;

    const user = await User.findById(uid, 'email role');

    // generate JWT only Admin
    const token = await generateJWT(uid);

    res.json({
        ok: true,
        token,
        user
    })
}