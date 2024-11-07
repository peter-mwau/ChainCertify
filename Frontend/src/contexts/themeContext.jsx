import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const DarkModeContext = createContext();


export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true)
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false)
    }
  }, [isDarkMode]);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

DarkModeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};