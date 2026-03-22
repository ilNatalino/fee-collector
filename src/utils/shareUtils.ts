import { Alert, Share } from 'react-native';

export type ShareReminderParams = {
  debtorName: string;
  amount: number;
  eventName: string;
  paymentLink?: string;
};

/**
 * Opens the native share sheet to send a payment reminder.
 */
export const handleShareReminder = async ({
  debtorName,
  amount,
  eventName,
}: ShareReminderParams): Promise<void> => {
  try {
    // Format amount into Euros
    const formattedAmount = new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);

    // Build the base message
    let message = `Hi ${debtorName}! Just a reminder for "${eventName}": your share is ${formattedAmount}.`;

    await Share.share({
      message,
      title: 'Payment Reminder',
    });
  } catch (error) {
    console.error('Error sharing reminder:', error);
    Alert.alert('Share Failed', 'There was an error trying to share the reminder. Please try again.');
  }
};
