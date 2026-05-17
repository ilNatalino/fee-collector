import { useGroups } from './useGroups';

export function useGroupCommands() {
  const {
    createGroup,
    deleteGroup,
    recordPayment,
    deletePayment,
    editPayment,
  } = useGroups();

  return {
    createGroup,
    deleteGroup,
    recordPayment,
    deletePayment,
    editPayment,
  };
}