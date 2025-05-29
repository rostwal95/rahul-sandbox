/* ===============================================================
          Context provider for dark/light theme
   =============================================================== */

   import React, { createContext, useContext, useState, useEffect } from "react";

   /** ====================================================================
    * Describes the shape of theme context:
    *  • isDarkMode     – whether dark mode is enabled
    *  • toggleDarkMode – function to toggle the mode
    ======================================================================= */
   interface ThemeContextType {
     isDarkMode: boolean;
     toggleDarkMode: () => void;
   }
   
   const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
   
   /** ====================================================================
    * React Context provider that:
    *  • initializes `isDarkMode` based on OS preference
    *  • toggles `dark` class on <body>
    *  • provides `isDarkMode` and `toggleDarkMode` to consumers
    *
    * @param props.children – app components requiring theme context
    ======================================================================= */
   export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
     children,
   }) => {
     const [isDarkMode, setIsDarkMode] = useState(false);
   
     useEffect(() => {
       const prefersDark = window.matchMedia(
         "(prefers-color-scheme: dark)"
       ).matches;
       setIsDarkMode(prefersDark);
       document.body.classList.toggle("dark", prefersDark);
     }, []);
   
     const toggleDarkMode = () => {
       setIsDarkMode((prev) => {
         const newMode = !prev;
         document.body.classList.toggle("dark", newMode);
         return newMode;
       });
     };
   
     return (
       <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
         {children}
       </ThemeContext.Provider>
     );
   };
   
   /** ====================================================================
    * Custom hook to consume ThemeContext, throws if used outside provider.
    *
    * @returns ThemeContextType
    ======================================================================= */
   export const useTheme = () => {
     const context = useContext(ThemeContext);
     if (!context) {
       throw new Error("useTheme must be used within a ThemeProvider");
     }
     return context;
   };
   