/* ===============================================================
           microphone, start/end and extra button row
   =============================================================== */

   import React from "react";
   import { Mic, MicOff, PhoneIncoming, PhoneOff } from "lucide-react";
   import clsx from "clsx";
   
   /** ====================================================================
    * callState    – "idle" | "streaming" | "ended"
    * micActive    – whether mic is currently unmuted
    * onStart      – start call handler
    * onEnd        – end call handler
    * onToggleMic  – mute/unmute mic handler
    * micBtnClass  – tailwind classes for mic button
    * startBtnClass– tailwind classes for start button
    * endBtnClass  – tailwind classes for end button
    * extra        – optional extra element (e.g. Kibana link)
    =======================================================================*/
   interface Props {
     callState     : "idle" | "streaming" | "ended";
     micActive     : boolean;
     onStart       : () => void;
     onEnd         : () => void;
     onToggleMic   : () => void;
     micBtnClass   : string;
     startBtnClass : string;
     endBtnClass   : string;
     className?    : string;
     extra?        : React.ReactNode;
   }
   
   /** common button classes */
   const btn =
     "inline-flex items-center justify-center gap-2 rounded-lg shadow-md " +
     "font-medium transition-colors focus:outline-none disabled:opacity-60";
   
   /** ======================================================================
    * Renders the row of controls below the chat:
    *  • idle: full-width Start button
    *  • streaming: mic toggle + extra slot + End button
    *  • ended: mic toggle + extra slot (no End)
    ========================================================================*/

   export const ChatControls: React.FC<Props> = ({
     callState,
     micActive,
     onStart,
     onEnd,
     onToggleMic,
     micBtnClass,
     startBtnClass,
     endBtnClass,
     className,
     extra,
   }) => {
     /** mic toggle button */
     const micBtn = (
       <button
         onClick={onToggleMic}
         className={clsx(btn, micBtnClass, "w-12 h-12")}
         title={micActive ? "Mute mic" : "Un-mute mic"}
       >
         {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
       </button>
     );
   
     /** start call button */
     const startBtn = (
       <button
         onClick={onStart}
         className={clsx(btn, startBtnClass, "flex-1 py-3")}
       >
         <PhoneIncoming className="w-4 h-4" />
         Start&nbsp;Call
       </button>
     );
   
     /** end call button */
     const endBtn = (
       <button
         onClick={onEnd}
         className={clsx(btn, endBtnClass, "px-4 py-2")}
       >
         <PhoneOff className="w-4 h-4" />
         End
       </button>
     );
   
     /** ================================================================
      *       if idle: show only the Start button, full width
      * ================================================================ */
     if (callState === "idle") {
       return (
         <div className={clsx("flex items-center w-full", className)}>
           {React.cloneElement(startBtn, {
             className: clsx(btn, startBtnClass, "w-full py-3"),
           })}
         </div>
       );
     }
   
     /** =====================================================================
      *   if streaming or ended: mic + center extra + (optional) end button
      * =====================================================================*/
     return (
       <div className={clsx("flex items-center justify-between gap-6 w-full", className)}>
         {micBtn}
         <div className="flex-1 flex justify-center">{extra}</div>
         {callState === "streaming" && endBtn}
       </div>
     );
   };
   