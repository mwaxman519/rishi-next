/**
 * Email utility functions for sending emails to users
 *
 * This module provides functionality for sending transactional emails
 * such as invitation emails, password resets, and notifications.
 */

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
};

/**
 * Send an email to a user
 * Production implementation using SendGrid email service
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    // Use SendGrid for email delivery in production
    if (process.env.SENDGRID_API_KEY) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: params.to,
        from: params.from || process.env.SENDGRID_FROM_EMAIL || "noreply@rishi.app",
        subject: params.subject,
        html: params.html,
        text: params.text,
        cc: params.cc,
        bcc: params.bcc,
        replyTo: params.replyTo,
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${params.to}`);
      return true;
    }

    // Fallback to logging in development or when no API key is configured
    console.log("=== EMAIL SERVICE ===");
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`From: ${params.from || "noreply@rishi.app"}`);
    if (params.cc)
      console.log(
        `CC: ${Array.isArray(params.cc) ? params.cc.join(", ") : params.cc}`,
      );
    if (params.bcc)
      console.log(
        `BCC: ${Array.isArray(params.bcc) ? params.bcc.join(", ") : params.bcc}`,
      );
    if (params.replyTo) console.log(`Reply-To: ${params.replyTo}`);
    console.log("HTML Content Preview:");
    console.log(params.html.substring(0, 200) + "...");
    console.log("=== EMAIL READY ===");

    return true;
      from: params.from || 'noreply@rishi.app',
      subject: params.subject,
      text: params.text || '',
      html: params.html,
    };
    
    if (params.cc) msg.cc = params.cc;
    if (params.bcc) msg.bcc = params.bcc;
    if (params.replyTo) msg.replyTo = params.replyTo;
    
    await sgMail.send(msg);
    */

    // For now, just simulate a successful send in production
    console.log(`Email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Generate a HTML email template with branding
 *
 * @param params The parameters for the email template
 * @returns The HTML email content
 */
export function generateEmailTemplate({
  title,
  preheader,
  content,
  buttonText,
  buttonUrl,
  footerText,
  organizationName,
  organizationLogo,
}: {
  title: string;
  preheader: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
  organizationName?: string;
  organizationLogo?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>${title}</title>
      <meta name="description" content="${preheader}">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 20px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 10px;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: 600;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eaeaea;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${organizationLogo ? `<img class="logo" src="${organizationLogo}" alt="${organizationName || "Rishi"} Logo">` : ""}
          <h2>${title}</h2>
        </div>
        <div class="content">
          ${content}
          ${buttonText && buttonUrl ? `<div style="text-align: center;"><a href="${buttonUrl}" class="button">${buttonText}</a></div>` : ""}
        </div>
        <div class="footer">
          <p>${footerText || `&copy; ${new Date().getFullYear()} ${organizationName || "Rishi"} | All rights reserved.`}</p>
          <p>If you received this email by mistake, please ignore or contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
