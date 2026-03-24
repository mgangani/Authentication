import sendgridTransport from "nodemailer-sendgrid-transport";
import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY,
      },
    }),
  );
  return transporter.sendMail({
    to: email,
    from: "mgangani@codewinglet.com",
    subject: subject,
    html: html,
  });
};
