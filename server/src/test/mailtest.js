import nodemailer from "nodemailer";

Deno.serve(async () => {

  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false,
    auth: {
      user: "admin@try-yugen.com",
      pass: Deno.env.get("ZOHO_PASS"),
    },
  });

  await transporter.sendMail({
    from: "noreply@try-yugen.com",
    to: "ranaverrr@gmail.com",
    subject: "Yo",
    text: "Welcome to Yugen!",
  });

  return new Response("sent");
});
