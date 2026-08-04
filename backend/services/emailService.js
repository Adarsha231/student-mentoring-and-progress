const nodemailer = require('nodemailer');

/**
 * Create SMTP / Gmail transporter
 */
const createTransporter = () => {
  const emailUser = process.env.GMAIL_USER || process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return null;
};

/**
 * Send Gmail Email Notification to Mentee when Mentor schedules a meeting
 */
async function sendMeetingScheduledEmail({
  menteeEmail,
  menteeName,
  mentorName,
  date,
  time,
  mode,
  meetingLink,
  title,
  agenda,
}) {
  const recipient = menteeEmail || 'student@mentoring.edu';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0f17; color: #e2e8f0; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #2a364f;">
      <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #2a364f;">
        <h2 style="color: #3b82f6; margin: 0; font-size: 20px;">🎓 Student Mentoring System</h2>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Academic Progress Portal</p>
      </div>

      <div style="padding: 20px 0;">
        <h3 style="color: #ffffff; margin-top: 0;">📅 New Mentoring Session Scheduled</h3>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Hello <strong>${menteeName}</strong>,<br/>
          Your faculty mentor, <strong>${mentorName}</strong>, has scheduled a 1-on-1 mentoring session with you.
        </p>

        <div style="background-color: #141a26; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <p style="margin: 6px 0; font-size: 14px;"><strong>Session Title:</strong> ${title || 'Mentoring Session'}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Date:</strong> 📅 ${date}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Time:</strong> ⏰ ${time}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Mode:</strong> 📌 ${mode}</p>
          ${agenda ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Agenda:</strong> ${agenda}</p>` : ''}
          ${meetingLink ? `<p style="margin: 12px 0 4px 0;"><a href="${meetingLink}" target="_blank" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 13px;">Join Online Session →</a></p>` : ''}
        </div>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
          Please make sure to arrive on time. If you need to reschedule or have questions, please reach out to your faculty mentor prior to the session.
        </p>
      </div>

      <div style="border-top: 1px solid #2a364f; padding-top: 16px; text-align: center; color: #64748b; font-size: 11px;">
        <p style="margin: 0;">Automated notification from Student Mentoring System • Do not reply directly to this email.</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();

    if (transporter) {
      const info = await transporter.sendMail({
        from: `"Mentoring System" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
        to: recipient,
        subject: `📅 Mentoring Session Scheduled: ${title || 'Academic Counseling'} (${date})`,
        html: htmlContent,
      });

      console.log(`[Email Notification] ✉️ Gmail notification sent to ${recipient} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[Email Notification (Simulation)] ✉️ Gmail notification prepared for ${recipient}:`);
      console.log(`  To: ${recipient}`);
      console.log(`  Subject: 📅 Mentoring Session Scheduled with ${mentorName} on ${date} at ${time}`);
      console.log(`  (Note: Add GMAIL_USER & GMAIL_APP_PASSWORD to .env to deliver real emails via Gmail SMTP)`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`[Email Notification Error] Failed to send email to ${recipient}:`, error.message);
    return { success: false, error: error.message };
  }
/**
 * Send Gmail Verification OTP Email
 */
async function sendVerificationOtpEmail({ email, name, otp }) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0b0f17; color: #e2e8f0; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #2a364f;">
      <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #2a364f;">
        <h2 style="color: #10b981; margin: 0; font-size: 20px;">🛡️ Gmail Verification Code</h2>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Student Mentoring System</p>
      </div>

      <div style="padding: 20px 0; text-align: center;">
        <p style="color: #cbd5e1; font-size: 14px; text-align: left;">
          Hello <strong>${name || 'Student'}</strong>,<br/>
          Use the following 6-digit verification code to verify your Gmail address on the Student Mentoring Portal:
        </p>

        <div style="background-color: #141a26; padding: 20px; border-radius: 12px; border: 1px border-emerald-500/30; margin: 24px 0; display: inline-block; width: 80%;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #34d399;">${otp}</span>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 8px; margin-bottom: 0;">Code expires in 10 minutes</p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: left;">
          If you did not request this verification code, please ignore this message or report it to your department HOD.
        </p>
      </div>

      <div style="border-top: 1px solid #2a364f; padding-top: 14px; text-align: center; color: #64748b; font-size: 11px;">
        <p style="margin: 0;">Automated Gmail Verification • Student Mentoring System</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();

    if (transporter) {
      const info = await transporter.sendMail({
        from: `"Mentoring Security" <${process.env.GMAIL_USER || process.env.SMTP_USER}>`,
        to: email,
        subject: `🔑 Your Gmail Verification Code is: ${otp}`,
        html: htmlContent,
      });

      console.log(`[Gmail Verification] ✉️ OTP sent to ${email} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[Gmail Verification (Simulation)] ✉️ Verification OTP generated for ${email}: OTP = ${otp}`);
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`[Gmail Verification Error] Failed to send OTP to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendMeetingScheduledEmail, sendVerificationOtpEmail };
