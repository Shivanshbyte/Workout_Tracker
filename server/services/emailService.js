const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_APP_PASSWORD:",
  process.env.EMAIL_APP_PASSWORD ? "FOUND" : "MISSING"
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"MyyWorkoutTracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "MyyWorkoutTracker - Verify Your Email",

    text: `Your myyWorkoutTracker verification code is ${otp}. This code expires in 10 minutes.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 30px;
        background: #0f172a;
        color: white;
        border-radius: 12px;
      ">

        <h2 style="color: #38bdf8;">
          MyyWorkoutTracker 💪
        </h2>

        <p>
          Use the verification code below to verify your email address.
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          text-align: center;
          padding: 20px;
          margin: 25px 0;
          background: #1e293b;
          border-radius: 10px;
          color: #38bdf8;
        ">
          ${otp}
        </div>

        <p>
          This code will expire in <strong>10 minutes</strong>.
        </p>

        <p style="color: #94a3b8;">
          If you didn't create a MyyWOrkoutTracker account,
          you can safely ignore this email.
        </p>

      </div>
    `,
  });
};

module.exports = {
  sendOTPEmail,
};
