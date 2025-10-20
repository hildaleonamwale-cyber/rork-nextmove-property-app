type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log(`[Email] Sending email to ${options.to}`);
  console.log(`[Email] Subject: ${options.subject}`);
  console.log(`[Email] Content: ${options.html.substring(0, 100)}...`);

  return true;
}

export function getBookingConfirmationEmail(params: {
  clientName: string;
  propertyTitle: string;
  date: string;
  time: string;
  agentName: string;
  agentPhone?: string;
  agentEmail?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066ff; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #0066ff; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${params.clientName},</p>
          <p>Your property viewing has been confirmed. We're excited to show you around!</p>
          
          <div class="info-box">
            <h3>Booking Details:</h3>
            <p><strong>Property:</strong> ${params.propertyTitle}</p>
            <p><strong>Date:</strong> ${params.date}</p>
            <p><strong>Time:</strong> ${params.time}</p>
            <p><strong>Agent:</strong> ${params.agentName}</p>
            ${params.agentPhone ? `<p><strong>Contact:</strong> ${params.agentPhone}</p>` : ''}
            ${params.agentEmail ? `<p><strong>Email:</strong> ${params.agentEmail}</p>` : ''}
          </div>
          
          <p>Please arrive on time and bring a valid ID. If you need to reschedule, please contact us at least 24 hours in advance.</p>
          
          <p>Looking forward to seeing you!</p>
          
          <p>Best regards,<br>The Property Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getBookingCancellationEmail(params: {
  clientName: string;
  propertyTitle: string;
  date: string;
  time: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #ff4444; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear ${params.clientName},</p>
          <p>Your property viewing has been cancelled as requested.</p>
          
          <div class="info-box">
            <h3>Cancelled Booking Details:</h3>
            <p><strong>Property:</strong> ${params.propertyTitle}</p>
            <p><strong>Date:</strong> ${params.date}</p>
            <p><strong>Time:</strong> ${params.time}</p>
          </div>
          
          <p>If you'd like to reschedule or book a different viewing, please feel free to browse our available properties and book again.</p>
          
          <p>We hope to assist you in finding your perfect property soon!</p>
          
          <p>Best regards,<br>The Property Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getNewMessageEmail(params: {
  recipientName: string;
  senderName: string;
  messagePreview: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0066ff; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .message-box { background: white; padding: 20px; border-left: 4px solid #0066ff; margin: 20px 0; font-style: italic; }
        .button { background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Message</h1>
        </div>
        <div class="content">
          <p>Hi ${params.recipientName},</p>
          <p>You have a new message from <strong>${params.senderName}</strong>:</p>
          
          <div class="message-box">
            <p>${params.messagePreview}${params.messagePreview.length > 100 ? '...' : ''}</p>
          </div>
          
          <center>
            <a href="#" class="button">View Message</a>
          </center>
          
          <p>Best regards,<br>The Property Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getWelcomeEmail(params: {
  userName: string;
  userEmail: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0066ff 0%, #00ccff 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { background: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .features { display: flex; gap: 20px; margin: 30px 0; }
        .feature { background: white; padding: 20px; border-radius: 8px; flex: 1; text-align: center; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Property Platform!</h1>
        </div>
        <div class="content">
          <p>Hi ${params.userName},</p>
          <p>Thank you for joining our property platform! We're thrilled to have you with us.</p>
          
          <p>Your account has been successfully created with the email: <strong>${params.userEmail}</strong></p>
          
          <h3>What you can do now:</h3>
          <ul>
            <li>Browse thousands of properties</li>
            <li>Save your favorite listings</li>
            <li>Schedule property viewings</li>
            <li>Connect with verified agents</li>
            <li>Get real-time notifications</li>
          </ul>
          
          <center>
            <a href="#" class="button">Start Exploring</a>
          </center>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Happy house hunting!</p>
          
          <p>Best regards,<br>The Property Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
