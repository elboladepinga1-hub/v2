interface EmailData {
  to: string;
  subject: string;
  data: any;
}

export const sendConfirmationEmail = async ({ to, subject, data }: EmailData) => {
  try {
    // In a real application, this would send the email through your backend
    // For now, we'll just simulate the email sending
    console.log('Sending confirmation email to:', to);
    console.log('Subject:', subject);
    console.log('Data:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};