import { UserQuota } from '@/src/types/quota';

export const mockQuotas: UserQuota[] = [
  { id: '1', name: 'Giulia Rossi', amountDue: 35, hasPaid: true },
  { id: '2', name: 'Marco Bianchi', amountDue: 35, hasPaid: false },
  { id: '3', name: 'Luca Ferri', amountDue: 35, hasPaid: true },
  { id: '4', name: 'Anna Costa', amountDue: 35, hasPaid: true },
  { id: '5', name: 'Paolo Conti', amountDue: 35, hasPaid: false },
  { id: '6', name: 'Sara Leone', amountDue: 35, hasPaid: true },
  { id: '7', name: 'Marta Riva', amountDue: 35, hasPaid: false },
  { id: '8', name: 'Davide Neri', amountDue: 35, hasPaid: true },
];
