/* ========================================================================
                Pulsating mic button component
   =======================================================================*/

   import React from "react";

   /** ====================================================================
    * @prop active – whether the mic is currently active (pulsing red)
    * @prop onClick – click handler to toggle mic state
    ======================================================================= */
   interface MicButtonProps {
     active: boolean;
     onClick: () => void;
   }
   
   /** ====================================================================
    * Renders a circular button representing the microphone state,
    * animating (pulse + scale) when active.
    *
    * @param props – MicButtonProps
    * @returns JSX.Element
    ======================================================================= */
   const MicButton: React.FC<MicButtonProps> = ({ active, onClick }) => {
     return (
       <button
         onClick={onClick}
         className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300
           ${
             active
               ? "bg-red-500 animate-pulse scale-110"
               : "bg-gray-400 hover:bg-gray-500 hover:scale-105"
           }`}
       >
         <svg
           xmlns="http://www.w3.org/2000/svg"
           className="h-6 w-6 text-white"
           fill="none"
           viewBox="0 0 24 24"
           stroke="currentColor"
         >
           <path
             strokeLinecap="round"
             strokeLinejoin="round"
             strokeWidth={2}
             d="M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3z"
           />
           <path
             strokeLinecap="round"
             strokeLinejoin="round"
             strokeWidth={2}
             d="M19 10a7 7 0 11-14 0"
           />
         </svg>
       </button>
     );
   };
   
   export default MicButton;
   