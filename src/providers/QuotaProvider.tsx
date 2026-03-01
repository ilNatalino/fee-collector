import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { mockQuotas } from '@/src/data/mockPayments';
import { UserQuota } from '@/src/types/quota';

type QuotaContextValue = {
  quotas: UserQuota[];
  addPaidQuota: (name: string, amount: number) => void;
};

const QuotaContext = createContext<QuotaContextValue | undefined>(undefined);

const createQuotaId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function QuotaProvider({ children }: PropsWithChildren) {
  const [quotas, setQuotas] = useState<UserQuota[]>(() => mockQuotas);

  const addPaidQuota = useCallback((name: string, amount: number) => {
    setQuotas((currentQuotas) => [
      {
        id: createQuotaId(),
        name,
        amountDue: amount,
        hasPaid: true,
        insertedDate: new Date().toISOString(),
      },
      ...currentQuotas,
    ]);
  }, []);

  const value = useMemo(
    () => ({
      quotas,
      addPaidQuota,
    }),
    [quotas, addPaidQuota],
  );

  return <QuotaContext.Provider value={value}>{children}</QuotaContext.Provider>;
}

export function useQuotaContext(): QuotaContextValue {
  const context = useContext(QuotaContext);
  if (!context) {
    throw new Error('useQuotaContext must be used inside QuotaProvider');
  }

  return context;
}