import React, { useEffect } from 'react';
import { useSchoolStore } from '../../store/schoolStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useSchoolStore();

  useEffect(() => {
    if (theme) {
      // Apply CSS custom properties for dynamic theming
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.primaryColor);
      root.style.setProperty('--color-secondary', theme.secondaryColor);
      
      // Apply background image if available
      if (theme.backgroundPath) {
        root.style.setProperty('--background-image', `url(${theme.backgroundPath})`);
      }
    }
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;