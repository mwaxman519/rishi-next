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
      
      const fromEmail = params.from || process.env.SENDGRID_FROM_EMAIL;
      if (!fromEmail) {
        throw new Error(&quot;SENDGRID_FROM_EMAIL environment variable is required when from parameter is not provided&quot;);
      }

      const msg = {
        to: params.to,
        from: fromEmail,
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
    console.log(&quot;=== EMAIL SERVICE ===&quot;);
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    const fromEmail = params.from || process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error(&quot;SENDGRID_FROM_EMAIL environment variable is required when from parameter is not provided&quot;);
    }
    console.log(`From: ${fromEmail}`);
    if (params.cc)
      console.log(
        `CC: ${Array.isArray(params.cc) ? params.cc.join(&quot;, &quot;) : params.cc}`,
      );
    if (params.bcc)
      console.log(
        `BCC: ${Array.isArray(params.bcc) ? params.bcc.join(&quot;, &quot;) : params.bcc}`,
      );
    if (params.replyTo) console.log(`Reply-To: ${params.replyTo}`);
    console.log(&quot;HTML Content Preview:&quot;);
    console.log(params.html.substring(0, 200) + &quot;...&quot;);
    console.log(&quot;=== EMAIL READY ===&quot;);

    return true;
  } catch (error) {
    console.error(&quot;Error sending email:&quot;, error);
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
    <html lang=&quot;en&quot;>
    <head>
      <meta charset=&quot;UTF-8&quot;>
      <meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1.0&quot;>
      <meta http-equiv=&quot;X-UA-Compatible&quot; content=&quot;ie=edge&quot;>
      <title>${title}</title>
      <meta name=&quot;description&quot; content=&quot;${preheader}&quot;>
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
      <div class=&quot;container&quot;>
        <div class=&quot;header&quot;>
          ${organizationLogo ? `<img class=&quot;logo&quot; src=&quot;${organizationLogo}&quot; alt=&quot;${organizationName || &quot;Organization&quot;} Logo&quot;>` : "&quot;}
          <h2>${title}</h2>
        </div>
        <div class=&quot;content&quot;>
          ${content}
          ${buttonText && buttonUrl ? `<div style=&quot;text-align: center;&quot;><a href=&quot;${buttonUrl}&quot; class=&quot;button&quot;>${buttonText}</a></div>` : &quot;&quot;}
        </div>
        <div class=&quot;footer&quot;>
          <p>${footerText || `&copy; ${new Date().getFullYear()} ${organizationName || &quot;Organization"} | All rights reserved.`}</p>
          <p>If you received this email by mistake, please ignore or contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
