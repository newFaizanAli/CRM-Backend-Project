const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { userModel } = require("../models");

const { SECRETKEY } = require("../utilits/const");

const checkAuthHandler = async (req, res) => {
  try {
    const id = req.user.userid;
    const user = await userModel.findById(id);
    if (user) {
      return res.json({
        token: true,
        loginUser: {
          name: user.name,
          type: user.usertype,
          email: user.email,
        },
      });
    }

    // return res.json({ token: true, usertype: req.user.usertype });
  } catch (e) {
    console.log(e.message);
  }
};

const signinHandler = async (req, resp) => {
  try {
    const { email, password } = req.body;
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return resp.json({ message: "incorrect email..", success: false });
    }

    if (existingUser.status === false) {
      return resp.json({
        message:
          "Your account is blocked. Please contact the admin to have it activated.",
        login: false,
        success: false,
      });
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (validPassword) {
      const data = {
        email: email,
        userid: existingUser._id,
        usertype: existingUser.usertype,
      };

      const token = jwt.sign(data, SECRETKEY, { expiresIn: "30m" });

      // const cookiesCredentials = {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   secure: true,
      //   sameSite: "None",
      //   path: "/",
      //   maxAge: 3600000,
      // };

      // resp.cookie("token", token, cookiesCredentials);

      resp.cookie("token", token);

      return resp.json({
        login: true,
        usertype: existingUser.usertype,
        loginUser: {
          name: existingUser.name,
          type: existingUser.usertype,
          email: existingUser.email,
        },
      });
    } else {
      return resp.json({
        message: "Incorrect password",
        login: false,
        success: false,
      });
    }
  } catch (error) {
    console.error(error.message);
  }
};

const signupHandler = async (req, resp) => {
  try {
    let { name, email, usertype, password, status } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      email,
      usertype,
      password: hashpass,
      status
    });

    await user.save();

    return resp.json({ message: "signup successfuly", success: true });
  } catch (e) {
    console.log(e.message);
  }
};

const signoutHandler = (req, resp) => {
  // resp.clearCookie("token", {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "None",
  //   path: "/",
  //   maxAge: 0,
  // });

  // resp.set("Cache-Control", "no-store");
  // resp.set("Pragma", "no-cache");
  // resp.set("Expires", "0");

  resp.cookie("token", "");

  resp.json({ token: false });
};

module.exports = {
  signupHandler,
  signinHandler,
  signoutHandler,
  checkAuthHandler,
};
