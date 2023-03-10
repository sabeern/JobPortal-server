const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const formValidator = require('../config/loginValidation');
const nodemailer = require('nodemailer');
const otpModel = require('../models/otpModel');
const { db } = require('../models/userModel');
//Checking the user exist or not for curresponding email
const userExistCheck = async (req, res, next) => {
  const { userName } = req.body;
  try {
    const userExist = await userModel.findOne({ userName });
    if (userExist) {
      res.status(401).send({ errMsg: 'User already exist' });
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({ errMsg: 'Internal server error' });
  }
}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.SENDER_PASSWORD
  }
});
//After checking user exist, sending otp to user
const signup = async (req, res) => {
  let { userName, userType, password } = req.body;
  userName = userName.trim();
  password = password.trim();
  const validateData = { userName, password };
  const response = formValidator.validateUser(validateData);
  if (response.error) {
    res.status(401).send({ errMsg: 'Entered data not valid' });
    return;
  }
  const userEmail = userName;//'nsabeer007@gmail.com'
  const Otp = Math.floor(1000 + Math.random() * 9999);
  const mailOptions = {
    from: process.env.SENDER_MAIL,
    to: userName,
    subject: 'Job solutions email verification',
    html: `<p>use this code for Job Solutions email verification <b>${Otp}</b></p>`
  }
  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      res.status(401).send({ errMsg: 'Otp sending failed' });
    } else {
      const newOtp = new otpModel({
        userEmail: userName,
        userOtp: Otp,
        otpExpiry: Date.now() + (1000 * 60 * 2)
      });
      try {
        newOtp.save();
        res.status(200).send({ msg: 'Please enter the otp' });
      } catch (err) {
        res.status(200).send({ errMsg: 'User registration failed' });
      }

    }
  });
}
//Validate Otp and after success inserting user details
const validateOtp = async (req, res) => {
  const { userName, userType, password, userOtp } = req.body;
  try {
    await otpModel.deleteMany({ otpExpiry: { $lt: new Date() } });
  } catch (err) {
    res.status(500).send({ errMsg: 'Internal server error' });
    return;
  }
  try {
    const otpVerification = await otpModel.findOne({ userEmail: userName, userOtp });
    if (otpVerification) {
      try {
        const hashPassword = await bcrypt.hash(password, Number(process.env.SALT));
        const user = new userModel({ userName, userType, password: hashPassword });
        await user.save();
        res.status(200).send({ msg: 'Signup successfull' });
      } catch (err) {
        res.status(401).send({ errMsg: 'Signup failed' });
      }
    } else {
      res.status(401).send({ errMsg: 'OTP verification failed' });
    }
  } catch (err) {
    res.status(500).send({ errMsg: 'Internal server error' });
  }
}
//Sending otp for reseting password
const forgotSendOtp = async (req, res) => {
  const { userName } = req.body;
  let user;
  try {
    user = await userModel.findOne({ userName });
  } catch (err) {
    res.status(500).send({ errMsg: 'Inernal server error' });
    return;
  }
  if (!user) {
    res.status(401).send({ errMsg: 'User not exist' });
    return;
  }
  const userEmail = userName;//'nsabeer007@gmail.com'
  const Otp = Math.floor(1000 + Math.random() * 9999);
  const mailOptions = {
    from: process.env.SENDER_MAIL,
    to: userName,
    subject: 'Job solutions email verification',
    html: `<p>use this code for Job Solutions email verification <b>${Otp}</b></p>`
  }
  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      res.status(401).send({ errMsg: 'Otp sending failed' });
    } else {
      const newOtp = new otpModel({
        userEmail: userName,
        userOtp: Otp,
        otpExpiry: Date.now() + (1000 * 60 * 2)
      });
      try {
        newOtp.save();
        res.status(200).send({ msg: "Please Enter Otp", userId: user._id });
      } catch (err) {
        res.status(401).send({ errMsg: 'Password changing failed' });
      }
    }
  });
}
//Checking reset password otp and after success giving option to password change
const resetOtpValidate = async (req, res) => {
  const { userName, userOtp } = req.body;
  try {
    await otpModel.deleteMany({ otpExpiry: { $lt: new Date() } });
  } catch (err) {
    res.status(500).send({ errMsg: 'Internal server error' });
    return;
  }
  const otpVerification = await otpModel.findOne({ userEmail: userName, userOtp });
  if (otpVerification) {
    res.status(200).send({ msg: 'Otp verified' });
  } else {
    res.status(401).send({ errMsg: 'OTP verification failed' });
  }
}
//Updating new password of user
const updatePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;
    const encryptPassword = await bcrypt.hash(password, Number(process.env.SALT));
    await userModel.findByIdAndUpdate(userId, { password: encryptPassword });
    res.status(200).send({ msg: 'Updated successfully' });
  } catch (err) {
    res.status(500).send({ errMsg: 'Internal server error' });
  }
}

module.exports = { signup, userExistCheck, validateOtp, forgotSendOtp, resetOtpValidate, updatePassword };