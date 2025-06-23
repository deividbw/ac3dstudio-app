c"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserRole, Permission } from '@/lib/types';
import { ROLES_CONFIG, USER_ROLES_AVAILABLE } from '@/config/roles';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Chave para localStorage (fallback)
const USER_ROLE_STORAGE_KEY = 'ac3dstudio_user_role';

export function useAuth() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('admin');
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Função para obter role do usuário do Supabase ou localStorage
  const getInitialRole = (): UserRole => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem(USER_ROLE_STORAGE_KEY) as UserRole | null;
      if (storedRole && USER_ROLES_AVAILABLE.includes(storedRole)) {
        return storedRole;
      }
    }
    return 'admin';
  };

  // Autenticação com Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsLoadingAuth(false);

        if (session?.user) {
          // Aqui você pode buscar o role do usuário do Supabase
          // Por enquanto, vamos usar o localStorage como fallback
          const roleFromStorage = localStorage.getItem(USER_ROLE_STORAGE_KEY) as UserRole | null;
          if (roleFromStorage && USER_ROLES_AVAILABLE.includes(roleFromStorage)) {
            setCurrentUserRole(roleFromStorage);
          } else {
            // Se não há role salvo, assume admin (você pode implementar lógica diferente)
            setCurrentUserRole('admin');
            localStorage.setItem(USER_ROLE_STORAGE_KEY, 'admin');
          }
        } else {
          // Usuário não autenticado, usa role padrão
          setCurrentUserRole(getInitialRole());
        }
        setIsLoadingRole(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const setUserRole = useCallback((role: UserRole) => {
    if (USER_ROLES_AVAILABLE.includes(role)) {
      setCurrentUserRole(role);
      localStorage.setItem(USER_ROLE_STORAGE_KEY, role);
    } else {
      console.warn(`Tentativa de definir um perfil inválido: ${role}`);
    }
  }, []);

  const hasPermission = useCallback((permissionToCheck?: Permission): boolean => {
    if (!permissionToCheck) return true;
    if (isLoadingRole || isLoadingAuth) return false;

    const roleConfig = ROLES_CONFIG[currentUserRole];
    return roleConfig?.permissions.includes(permissionToCheck) ?? false;
  }, [currentUserRole, isLoadingRole, isLoadingAuth]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return {
    user,
    currentUserRole,
    setUserRole,
    currentRoleConfig: ROLES_CONFIG[currentUserRole],
    isLoadingRole: isLoadingRole || isLoadingAuth,
    hasPermission,
    availableRoles: USER_ROLES_AVAILABLE.map(role => ({ value: role, label: ROLES_CONFIG[role].name })),
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
}
