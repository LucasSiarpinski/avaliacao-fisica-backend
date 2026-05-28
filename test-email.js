const nodemailer = require('nodemailer');
async function test() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log("Success! user:", testAccount.user);
  } catch(e) {
    console.error("Error creating ethereal account:", e.message);
  }
}
test();
