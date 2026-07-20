import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppData } from './AppDataContext';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'executive';
  department: string;
  avatar_url: string;
}

type DemoRoleUnion = 'Super Admin' | 'IT Department' | 'Admin Department' | 'Sales Team' | 'QA Team' | 'QMS Team';

const MOCK_PROFILES: Record<DemoRoleUnion, UserProfile> = {
  'Super Admin': {
    id: 1,
    name: 'Super Admin',
    email: 'super@meteoric.com',
    role: 'admin',
    department: 'Corporate Administration',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Super'
  },
  'IT Department': {
    id: 2,
    name: 'IT Director',
    email: 'it@meteoric.com',
    role: 'admin',
    department: 'IT Operations',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=IT'
  },
  'Admin Department': {
    id: 3,
    name: 'Admin Manager',
    email: 'admin@meteoric.com',
    role: 'manager',
    department: 'General Services',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin'
  },
  'Sales Team': {
    id: 4,
    name: 'Sales Head',
    email: 'sales@meteoric.com',
    role: 'manager',
    department: 'Global Exports',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sales'
  },
  'QA Team': {
    id: 5,
    name: 'QA Lead Auditor',
    email: 'qa@meteoric.com',
    role: 'manager',
    department: 'Quality Lab',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=QA'
  },
  'QMS Team': {
    id: 6,
    name: 'QMS Officer',
    email: 'qms@meteoric.com',
    role: 'executive',
    department: 'Regulatory Compliance',
    avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=QMS'
  }
};

interface AuthContextType {
  user: UserProfile;
  logout: () => void;
  hasModuleAccess: (module: string) => boolean;
  hasActionPermission: (module: string, action?: 'view' | 'create' | 'edit' | 'delete') => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { demoRole } = useAppData();
  const [user, setUser] = useState<UserProfile>(MOCK_PROFILES[demoRole]);

  // Sync user profile when demoRole changes in navbar
  useEffect(() => {
    setUser(MOCK_PROFILES[demoRole]);
  }, [demoRole]);

  const logout = () => {
    // Non-functional for demo, just prints to console
    console.log('Demo Logout triggered');
  };

  const hasModuleAccess = (moduleName: string) => {
    // Executive role has restricted settings
    if (user.role === 'executive' && moduleName === 'settings') {
      return false;
    }
    return true;
  };

  const hasActionPermission = (moduleName: string, action: 'view' | 'create' | 'edit' | 'delete' = 'view') => {
    if (action === 'view') return hasModuleAccess(moduleName);

    // Only Admin can delete
    if (action === 'delete') {
      return user.role === 'admin';
    }

    // Admin and Manager can create and edit
    if (action === 'create' || action === 'edit') {
      return user.role === 'admin' || user.role === 'manager';
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, logout, hasModuleAccess, hasActionPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
export default AuthContext;
