import { useContext } from 'react';
import { UserActivityContext } from '../providers/UserActivityProvider';

export function useUserActivities() {
  const context = useContext(UserActivityContext);
  
  if (context === undefined) {
    throw new Error('useUserActivities must be used within a UserActivityProvider');
  }
  
  return context;
}
