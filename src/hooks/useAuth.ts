
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserRole, Permission } from '@/lib/types';
import { ROLES_CONFIG, USER_ROLES_AVAILABLE } from '@/config/roles';

// Chave para localStorage
const USER_ROLE_STORAGE_KEY = 'ac3dstudio_user_role';

export function useAuth() {
  // Tenta carregar o perfil do localStorage, ou usa 'admin' como padrão inicial ANTES do useEffect.
  // Isso evita que o valor padrão 'admin' seja usado brevemente se outro perfil estiver no localStorage.
  const getInitialRole = (): UserRole => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem(USER_ROLE_STORAGE_KEY) as UserRole | null;
      if (storedRole && USER_ROLES_AVAILABLE.includes(storedRole)) {
        return storedRole;
      }
    }
    return 'admin'; // Padrão se nada for encontrado ou se estiver no servidor
  };
  
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(getInitialRole());
  const [isLoadingRole, setIsLoadingRole] = useState(true); // Começa como true até o useEffect rodar

  useEffect(() => {
    // Este useEffect sincroniza com o localStorage após a montagem inicial no cliente.
    // A lógica principal de carregamento já foi feita em getInitialRole.
    // Apenas define isLoadingRole para false.
    const roleFromStorage = localStorage.getItem(USER_ROLE_STORAGE_KEY) as UserRole | null;
    if (roleFromStorage && USER_ROLES_AVAILABLE.includes(roleFromStorage)) {
        if (currentUserRole !== roleFromStorage) { // Sincroniza se houver discrepância (improvável com getInitialRole)
            setCurrentUserRole(roleFromStorage);
        }
    } else if (!roleFromStorage && currentUserRole !== 'admin') { // Se não há nada no storage, garante que é 'admin'
        localStorage.setItem(USER_ROLE_STORAGE_KEY, 'admin');
         if (currentUserRole !== 'admin') setCurrentUserRole('admin'); // Atualiza se o estado inicial não foi admin por algum motivo
    }
    setIsLoadingRole(false);
  }, [currentUserRole]); // Adicionado currentUserRole para re-executar se mudar externamente (pouco provável aqui)

  const setUserRole = useCallback((role: UserRole) => {
    if (USER_ROLES_AVAILABLE.includes(role)) {
      setCurrentUserRole(role);
      localStorage.setItem(USER_ROLE_STORAGE_KEY, role);
    } else {
      console.warn(`Tentativa de definir um perfil inválido: ${role}`);
    }
  }, []);

  const hasPermission = useCallback((permissionToCheck?: Permission): boolean => {
    if (!permissionToCheck) return true; // Se não requer permissão, permite acesso
    if (isLoadingRole) return false; // Não conceder permissão enquanto o perfil está carregando

    const roleConfig = ROLES_CONFIG[currentUserRole];
    return roleConfig?.permissions.includes(permissionToCheck) ?? false;
  }, [currentUserRole, isLoadingRole]);

  return {
    currentUserRole,
    setUserRole,
    currentRoleConfig: ROLES_CONFIG[currentUserRole],
    isLoadingRole,
    hasPermission,
    availableRoles: USER_ROLES_AVAILABLE.map(role => ({ value: role, label: ROLES_CONFIG[role].name })),
  };
}
