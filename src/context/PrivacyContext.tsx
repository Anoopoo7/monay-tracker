import React, { createContext, useContext, useState } from 'react';

interface PrivacyContextType {
  isBalanceVisible: boolean;
  setIsBalanceVisible: React.Dispatch<React.SetStateAction<boolean>>;
  toggleBalanceVisibility: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(false);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  return (
    <PrivacyContext.Provider
      value={{
        isBalanceVisible,
        setIsBalanceVisible,
        toggleBalanceVisibility,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = (): PrivacyContextType => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
