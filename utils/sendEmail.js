const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "aneeshseth2018@gmail.com",
      pass: "xrszrwpcifwuiohh",
    },
  });
  const mailOptions = {
    from: "aneeshseth2018@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
