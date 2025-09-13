import { env } from "@/env";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const message = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully:", message);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
