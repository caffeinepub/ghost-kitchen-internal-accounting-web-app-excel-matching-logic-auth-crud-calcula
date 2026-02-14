import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole, type UserInfo } from '../backend';
import { Principal } from '@dfinity/principal';

// Query to list all users (admin only)
export function useListUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserInfo[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listUsers();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// Mutation to change a user's role (admin only)
export function useChangeUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userPrincipal, newRole }: { userPrincipal: string; newRole: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(userPrincipal);
      await actor.changeUserRole(principal, newRole);
    },
    onSuccess: () => {
      // Invalidate users list to refresh the table
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Invalidate caller role in case the current user's role was changed
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}
