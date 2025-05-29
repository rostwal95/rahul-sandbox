/* ===============================================================
           Dark/light mode toggle with tooltip
   =============================================================== */

   import React from "react";
   import { Moon, Sun } from "lucide-react";
   import * as Tooltip from "@radix-ui/react-tooltip";
   import { useTheme } from "./ThemeContext";
   
   /** ====================================================================
    * Renders a tooltip-wrapped button that toggles between dark and
    * light mode using ThemeContext.
    *
    * @returns JSX.Element
    ======================================================================= */
   const SettingsToggle: React.FC = () => {
     const { isDarkMode, toggleDarkMode } = useTheme();
   
     return (
       <Tooltip.Provider>
         <Tooltip.Root>
           <Tooltip.Trigger asChild>
             <button
               onClick={toggleDarkMode}
               className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
             >
               {isDarkMode ? (
                 <Sun className="w-5 h-5 text-yellow-400" />
               ) : (
                 <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
               )}
             </button>
           </Tooltip.Trigger>
           <Tooltip.Portal>
             <Tooltip.Content
               className="bg-teal-800 text-white text-sm rounded-md px-3 py-2"
               sideOffset={5}
             >
               Toggle {isDarkMode ? "Light" : "Dark"} Mode
               <Tooltip.Arrow className="fill-teal-800" />
             </Tooltip.Content>
           </Tooltip.Portal>
         </Tooltip.Root>
       </Tooltip.Provider>
     );
   };
   
   export default SettingsToggle;
   