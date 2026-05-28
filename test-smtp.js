require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  console.log("Iniciando...");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true, // INJECT DEBUG
    logger: true // INJECT LOGGER
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // manda pra ele mesmo pra testar
      subject: "Teste SMTP TCC",
      text: "Teste"
    });
    console.log("SUCESSO:", info.messageId);
  } catch (err) {
    console.error("ERRO:", err);
  }
}
test();
