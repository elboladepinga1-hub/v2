import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../auth/LoginModal';

const AdminGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAdmin, loading, refreshClaims } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (isAdmin) setShowLogin(false);
      else setShowLogin(true);
    }
  }, [user, isAdmin, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Verificando acesso...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <>
        {showLogin && (
          <LoginModal
            isOpen={true}
            onClose={async () => {
              setShowLogin(false);
            }}
            initialMode={'login'}
            adminOnly={true}
            onSuccess={async () => {
              await refreshClaims();
            }}
          />
        )}
      </>
    );
  }

  return children;
};

export default AdminGuard;
