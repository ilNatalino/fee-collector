import { UserQuota } from '@/src/types/quota';

export const mockQuotas: UserQuota[] = [
  { id: '1', name: 'Giulia Rossi', amountDue: 35, hasPaid: true, insertedDate: '2026-02-20T09:30:00.000Z' },
  { id: '2', name: 'Marco Bianchi', amountDue: 35, hasPaid: false, insertedDate: '2026-02-21T14:45:00.000Z' },
  { id: '3', name: 'Luca Ferri', amountDue: 35, hasPaid: true, insertedDate: '2026-02-22T08:10:00.000Z' },
  { id: '4', name: 'Anna Costa', amountDue: 35, hasPaid: true, insertedDate: '2026-02-23T17:20:00.000Z' },
  { id: '5', name: 'Paolo Conti', amountDue: 35, hasPaid: false, insertedDate: '2026-02-24T10:05:00.000Z' },
  { id: '6', name: 'Sara Leone', amountDue: 35, hasPaid: true, insertedDate: '2026-02-25T12:40:00.000Z' },
  { id: '7', name: 'Marta Riva', amountDue: 35, hasPaid: false, insertedDate: '2026-02-26T16:15:00.000Z' },
  { id: '8', name: 'Davide Neri', amountDue: 35, hasPaid: true, insertedDate: '2026-02-27T11:55:00.000Z' },
];
