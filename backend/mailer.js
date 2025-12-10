import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,     // your gmail
    pass: process.env.EMAIL_PASS,     // your gmail app password
  },
});

// Function to send OTP email
async function sendOtp(toEmail, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your OTP Verification Code",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent to:", toEmail);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

// Export the function
export default sendOtp;
