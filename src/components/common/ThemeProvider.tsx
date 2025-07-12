import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useAuth();
  
  const getFullImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path}`;
  };

  useEffect(() => {
    if (theme) {
      // Apply CSS custom properties for dynamic theming
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.primaryColor);
      root.style.setProperty('--color-secondary', theme.secondaryColor);
      
      // Apply background image if available
      if (theme.backgroundPath) {
        const fullUrl = getFullImageUrl(theme.backgroundPath);
        if (fullUrl) {
          root.style.setProperty('--background-image', `url(${fullUrl})`);
        }
      }
      
      // Update Tailwind primary colors
      root.style.setProperty('--color-primary-600', theme.primaryColor);
      root.style.setProperty('--color-primary-700', theme.primaryColor);
    }
  }, [theme]);

  // Get school info for title updates
  const { school } = useAuth();
  
  // Update document title and favicon based on school info
  useEffect(() => {
    // Update document title
    if (school?.name) {
      document.title = `${school.name} - Management System`;
    }
    
    // Update favicon if school logo is available
    if (theme?.logoPath) {
      const favicon = document.getElementById('favicon') as HTMLLinkElement;
      if (favicon) {
        const fullLogoUrl = getFullImageUrl(theme.logoPath);
        if (fullLogoUrl) {
          favicon.href = fullLogoUrl;
          favicon.type = 'image/png'; // Assuming uploaded logos are PNG/JPG
        }
      }
    }
  }, [theme, school]);

  return <>{children}</>;
};

export default ThemeProvider;