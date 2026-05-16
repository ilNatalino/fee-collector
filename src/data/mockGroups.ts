import { ActivityEntry, Group, Membership, Payment } from '@/src/types/group';

type PaymentFixture = {
  id: string;
  amountCents: number;
  recordedAt: string;
};

type MembershipFixture = {
  id: string;
  fullName: string;
  joinedAt: string;
  quotaAmountCents: number;
  payments?: PaymentFixture[];
};

const toMemberId = (fullName: string) =>
  `member-${fullName.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '-')}`;

const buildPayments = (
  groupName: string,
  membershipId: string,
  fullName: string,
  payments: PaymentFixture[] = [],
): Payment[] =>
  payments.map((payment) => ({
    ...payment,
    membershipId,
    recordedMemberName: fullName,
    recordedGroupName: groupName,
  }));

const buildMembership = (groupName: string, fixture: MembershipFixture): Membership => ({
  id: fixture.id,
  joinedAt: fixture.joinedAt,
  member: {
    id: toMemberId(fixture.fullName),
    fullName: fixture.fullName,
    createdAt: fixture.joinedAt,
  },
  quota: {
    amountCents: fixture.quotaAmountCents,
  },
  payments: buildPayments(groupName, fixture.id, fixture.fullName, fixture.payments),
});

export const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Regalo di Nozze Luca',
    category: 'home',
    emoji: '🎁',
    createdDate: '2026-03-12T10:00:00.000Z',
    dueDate: '2026-04-20T10:00:00.000Z',
    targetAmountCents: 50000,
    memberships: [
      buildMembership('Regalo di Nozze Luca', { id: 'm1', fullName: 'Giulia Rossi', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m1', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm2', fullName: 'Marco Bianchi', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m2', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm3', fullName: 'Luca Ferri', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m3', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm4', fullName: 'Anna Costa', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m4', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm5', fullName: 'Paolo Conti', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m5', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm6', fullName: 'Sara Leone', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m6', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm7', fullName: 'Marta Riva', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m7', amountCents: 1000, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm8', fullName: 'Davide Neri', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m8', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm9', fullName: 'Elena Moretti', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m9', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm10', fullName: 'Fabio Ricci', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m10', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm11', fullName: 'Chiara Marino', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m11', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm12', fullName: 'Simone Greco', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m12', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm13', fullName: 'Valentina Gallo', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500 }),
      buildMembership('Regalo di Nozze Luca', { id: 'm14', fullName: 'Andrea Bruno', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m14', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm15', fullName: 'Laura Fontana', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m15', amountCents: 500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm16', fullName: 'Matteo Lombardi', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m16', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
      buildMembership('Regalo di Nozze Luca', { id: 'm17', fullName: 'Francesca Villa', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500 }),
      buildMembership('Regalo di Nozze Luca', { id: 'm18', fullName: 'Giovanni Serra', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500 }),
      buildMembership('Regalo di Nozze Luca', { id: 'm19', fullName: 'Roberta Fabbri', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500 }),
      buildMembership('Regalo di Nozze Luca', { id: 'm20', fullName: 'Stefano Pellegrini', joinedAt: '2026-03-12T10:00:00.000Z', quotaAmountCents: 2500, payments: [{ id: 'p-g1-m20', amountCents: 2500, recordedAt: '2026-03-12T10:00:00.000Z' }] }),
    ],
  },
  {
    id: 'g2',
    name: 'Cena Classe',
    category: 'food',
    emoji: '🍽️',
    createdDate: '2026-03-10T10:00:00.000Z',
    dueDate: '2026-03-30T10:00:00.000Z',
    targetAmountCents: 60000,
    memberships: [
      buildMembership('Cena Classe', { id: 'c1', fullName: 'Giulia Rossi', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c1', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c2', fullName: 'Marco Bianchi', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c2', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c3', fullName: 'Luca Ferri', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c3', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c4', fullName: 'Anna Costa', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c4', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c5', fullName: 'Paolo Conti', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c5', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c6', fullName: 'Sara Leone', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c6', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c7', fullName: 'Marta Riva', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c7', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c8', fullName: 'Davide Neri', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c8', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c9', fullName: 'Elena Moretti', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c9', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c10', fullName: 'Fabio Ricci', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c10', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c11', fullName: 'Chiara Marino', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c11', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c12', fullName: 'Simone Greco', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c12', amountCents: 4000, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c13', fullName: 'Valentina Gallo', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000, payments: [{ id: 'p-g2-c13', amountCents: 1500, recordedAt: '2026-03-10T10:00:00.000Z' }] }),
      buildMembership('Cena Classe', { id: 'c14', fullName: 'Andrea Bruno', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000 }),
      buildMembership('Cena Classe', { id: 'c15', fullName: 'Laura Fontana', joinedAt: '2026-03-10T10:00:00.000Z', quotaAmountCents: 4000 }),
    ],
  },
  {
    id: 'g3',
    name: 'Compleanno Sara',
    emoji: '🎂',
    createdDate: '2026-03-05T10:00:00.000Z',
    targetAmountCents: 20000,
    memberships: [
      buildMembership('Compleanno Sara', { id: 'b1', fullName: 'Marco Bianchi', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b1', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
      buildMembership('Compleanno Sara', { id: 'b2', fullName: 'Luca Ferri', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b2', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
      buildMembership('Compleanno Sara', { id: 'b3', fullName: 'Anna Costa', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b3', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
      buildMembership('Compleanno Sara', { id: 'b4', fullName: 'Paolo Conti', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b4', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
      buildMembership('Compleanno Sara', { id: 'b5', fullName: 'Marta Riva', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b5', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
      buildMembership('Compleanno Sara', { id: 'b6', fullName: 'Davide Neri', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b6', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
      buildMembership('Compleanno Sara', { id: 'b7', fullName: 'Elena Moretti', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b7', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
      buildMembership('Compleanno Sara', { id: 'b8', fullName: 'Fabio Ricci', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b8', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
      buildMembership('Compleanno Sara', { id: 'b9', fullName: 'Chiara Marino', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b9', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
      buildMembership('Compleanno Sara', { id: 'b10', fullName: 'Simone Greco', joinedAt: '2026-03-05T10:00:00.000Z', quotaAmountCents: 2000, payments: [{ id: 'p-g3-b10', amountCents: 2000, recordedAt: '2026-03-05T10:00:00.000Z' }] }),
    ],
  },
  {
    id: 'g4',
    name: 'Viaggio Sardegna',
    category: 'travel',
    emoji: '✈️',
    createdDate: '2026-03-01T10:00:00.000Z',
    targetAmountCents: 120000,
    memberships: [
      buildMembership('Viaggio Sardegna', { id: 'v1', fullName: 'Giulia Rossi', joinedAt: '2026-03-01T10:00:00.000Z', quotaAmountCents: 15000, payments: [{ id: 'p-g4-v1', amountCents: 15000, recordedAt: '2026-03-01T10:00:00.000Z' }] }),
      buildMembership('Viaggio Sardegna', { id: 'v2', fullName: 'Marco Bianchi', joinedAt: '2026-03-01T10:00:00.000Z', quotaAmountCents: 15000, payments: [{ id: 'p-g4-v2', amountCents: 15000, recordedAt: '2026-03-01T10:00:00.000Z' }] }),
      buildMembership('Viaggio Sardegna', { id: 'v3', fullName: 'Luca Ferri', joinedAt: '2026-03-01T10:00:00.000Z', quotaAmountCents: 15000, payments: [{ id: 'p-g4-v3', amountCents: 5000, recordedAt: '2026-03-01T10:00:00.000Z' }] }),
      buildMembership('Viaggio Sardegna', { id: 'v4', fullName: 'Anna Costa', joinedAt: '2026-03-01T10:00:00.000Z', quotaAmountCents: 15000, payments: [{ id: 'p-g4-v4', amountCents: 15000, recordedAt: '2026-03-01T10:00:00.000Z' }] }),
      buildMembership('Viaggio Sardegna', { id: 'v5', fullName: 'Paolo Conti', joinedAt: '2026-03-01T10:00:00.000Z', quotaAmountCents: 15000 }),
      buildMembership('Viaggio Sardegna', { id: 'v6', fullName: 'Sara Leone', joinedAt: '2026-03-01T10:00:00.000Z', quotaAmountCents: 15000, payments: [{ id: 'p-g4-v6', amountCents: 15000, recordedAt: '2026-03-01T10:00:00.000Z' }] }),
      buildMembership('Viaggio Sardegna', { id: 'v7', fullName: 'Marta Riva', joinedAt: '2026-03-01T10:00:00.000Z', quotaAmountCents: 15000, payments: [{ id: 'p-g4-v7', amountCents: 15000, recordedAt: '2026-03-01T10:00:00.000Z' }] }),
      buildMembership('Viaggio Sardegna', { id: 'v8', fullName: 'Davide Neri', joinedAt: '2026-03-01T10:00:00.000Z', quotaAmountCents: 15000, payments: [{ id: 'p-g4-v8', amountCents: 10000, recordedAt: '2026-03-01T10:00:00.000Z' }] }),
    ],
  },
];

export const mockActivities: ActivityEntry[] = [
  {
    id: 'a1',
    groupId: 'g2',
    groupName: 'Cena Classe',
    memberName: 'Chiara Marino',
    amountCents: 4000,
    date: '2026-03-15T09:39:00.000Z',
    status: 'confirmed',
  },
  {
    id: 'a2',
    groupId: 'g1',
    groupName: 'Regalo di Nozze Luca',
    memberName: 'Stefano Pellegrini',
    amountCents: 2500,
    date: '2026-03-15T09:23:00.000Z',
    status: 'pending',
  },
  {
    id: 'a3',
    groupId: 'g2',
    groupName: 'Cena Classe',
    memberName: 'Simone Greco',
    amountCents: 4000,
    date: '2026-03-15T08:41:00.000Z',
    status: 'confirmed',
  },
  {
    id: 'a4',
    groupId: 'g1',
    groupName: 'Regalo di Nozze Luca',
    memberName: 'Andrea Bruno',
    amountCents: 2500,
    date: '2026-03-15T07:41:00.000Z',
    status: 'confirmed',
  },
  {
    id: 'a5',
    groupId: 'g3',
    groupName: 'Compleanno Sara',
    memberName: 'Fabio Ricci',
    amountCents: 2000,
    date: '2026-03-14T18:30:00.000Z',
    status: 'confirmed',
  },
  {
    id: 'a6',
    groupId: 'g4',
    groupName: 'Viaggio Sardegna',
    memberName: 'Marta Riva',
    amountCents: 15000,
    date: '2026-03-14T14:10:00.000Z',
    status: 'confirmed',
  },
];
