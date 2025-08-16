// Auth removed - simplified mock auth for demo purposes
export function useAuth() {
  return {
    user: { id: "system", name: "Demo User", email: "demo@cuewise.app" },
    isLoading: false,
    isAuthenticated: true,
  };
}