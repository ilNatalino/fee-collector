import { createContext, useCallback, useEffect, useState } from 'react';
import { mockUserActivities } from '../data/mockUserActivities';
import { UpdateUserActivityInput, UserActivity } from '../types/userActivity';

type UserActivityContextType = {
  activities: UserActivity[];
  isLoading: boolean;
  deleteActivityById: (id: string) => Promise<void>;
  updateActivityById: (id: string, payload: UpdateUserActivityInput) => Promise<void>;
};

export const UserActivityContext = createContext<UserActivityContextType | undefined>(undefined);

export function UserActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setActivities(mockUserActivities);
      setIsLoading(false);
    }, 500);
  }, []);

  const deleteActivityById = useCallback(async (id: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  }, []);

  const updateActivityById = useCallback(async (id: string, payload: UpdateUserActivityInput) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? { ...activity, memberName: payload.memberName, amount: payload.amount }
          : activity
      )
    );
  }, []);

  const value = {
    activities,
    isLoading,
    deleteActivityById,
    updateActivityById,
  };

  return <UserActivityContext.Provider value={value}>{children}</UserActivityContext.Provider>;
}
