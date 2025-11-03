/**
 * Sends an email (development mode - logs to console).
 * In production, integrate with an email service like SendGrid, AWS SES, or Azure Communication Services.
 * @param to - The recipient's email address.
 * @param subject - The subject line of the email.
 * @param htmlContent - The HTML body of the email.
 */
async function sendEmail(to: string, subject: string, htmlContent: string) {
    console.log(`📧 Simulating email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${htmlContent}`);
    // In a real app, integrate with an email service here
}

export default sendEmail;
