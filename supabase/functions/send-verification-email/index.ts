import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  username: string;
  otp_code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username, otp_code }: VerificationEmailRequest = await req.json();

    console.log(`Sending verification email to ${email} with code ${otp_code}`);

    const emailResponse = await resend.emails.send({
      from: "VS-Code-Magic <onboarding@resend.dev>",
      to: [email],
      subject: "Your Verification Code - VS Code Magic",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2d2d4a;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px;">🎮</span>
                      </div>
                      <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">VS Code Magic</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <p style="margin: 0 0 10px; font-size: 18px; color: #ffffff;">Hello <strong style="color: #f97316;">${username}</strong>! 👋</p>
                      <p style="margin: 0 0 30px; font-size: 16px; color: #a0a0a0; line-height: 1.6;">
                        Thanks for signing up! Please use the verification code below to complete your registration:
                      </p>
                    </td>
                  </tr>
                  
                  <!-- OTP Code -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px; padding: 25px; text-align: center;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                        <div style="font-size: 42px; font-weight: bold; color: #ffffff; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                          ${otp_code}
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Instructions -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6; text-align: center;">
                        Enter this code in the app to verify your email address.<br>
                        This code will expire in <strong style="color: #f97316;">10 minutes</strong>.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Warning -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px;">
                        <p style="margin: 0; font-size: 13px; color: #ef4444; text-align: center;">
                          ⚠️ If you didn't request this code, please ignore this email.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #0f0f1a; padding: 25px 40px; text-align: center; border-top: 1px solid #2d2d4a;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        © 2024 VS Code Magic. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
