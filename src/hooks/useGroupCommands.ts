import { useGroups } from './useGroups';

export function useGroupCommands() {
  const {
    createGroup,
    deleteGroup,
    addMembership,
    recordPayment,
    markMembershipAsPaid,
    deletePayment,
    editPayment,
  } = useGroups();

  return {
    createGroup,
    deleteGroup,
    addMembership,
    recordPayment,
    markMembershipAsPaid,
    deletePayment,
    editPayment,
  };
}