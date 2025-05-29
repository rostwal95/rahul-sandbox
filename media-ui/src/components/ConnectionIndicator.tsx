/* ===============================================================
                Connection status dot and label
   =============================================================== */

   import React from "react";

   /** ======================================================================
    * @prop connected           – true if websocket is connected
    * @prop connectedColor?     – CSS color for connected state (default green)
    * @prop disconnectedColor?  – CSS color for disconnected (default red)
    * @prop textColor?          – CSS color for status text
    ==========================================================================*/
   interface ConnectionIndicatorProps {
     connected: boolean;
     connectedColor?: string;
     disconnectedColor?: string;
     textColor?: string;
   }
   
   /** ========================================================================
    * Displays a colored dot and label indicating websocket connection:
    *  • green dot & “Connected” when online
    *  • red dot & “Disconnected” when offline
    *  • customizable colors via props
    ==========================================================================*/
   const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
     connected,
     connectedColor    = "#22C55E",
     disconnectedColor = "#EF4444",
     textColor         = "var(--text-header)",
   }) => (
     <div className="flex items-center gap-2">
       <span
         className="w-3 h-3 rounded-full"
         style={{ backgroundColor: connected ? connectedColor : disconnectedColor }}
         aria-label={connected ? "connection-ok" : "connection-lost"}
       />
       <span className="text-sm" style={{ color: textColor }}>
         {connected ? "Connected" : "Disconnected"}
       </span>
     </div>
   );
   
   export default ConnectionIndicator;
   