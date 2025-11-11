import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  const ctx = useAuthContext();
  return {
    ...ctx,
    isLogged: !!ctx.user,
    hasRole: (r) => !!ctx.user?.roles?.includes(r)
  };
}
