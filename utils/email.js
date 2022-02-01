const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       password: process.env.EMAIL_PASSWORD
  //     }
  //     // Activate in gmail "less secure app" option
  //   });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //   console.log(transporter);

  // 2) Define the email options
  const mailOptions = {
    from: 'Ayush Garg <hello@ayush.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email

  // console.log(
  await transporter.sendMail(mailOptions);
  // );
};

export default sendEmail;
