/* ========================================================================
   ChatApp.tsx – top-level wrapper for configuration and chat UI
   ========================================================================*/
   import React, { useState } from "react";
   import ChatBotUI, { ChatMessage } from "./ChatBotUI";
   import ChatMetricsPanel from "./ChatMetricsPannel";
   import { LatencyMetrics } from "./LatencyMetricsDisplay";
   import ConfigScreen, { Config } from "./ConfigScreen";
   
   /** =====================================================================
    * Manages high-level view switching between configuration and chat,
    * and lifts chat messages & latency metrics up for external display.
    *  • Shows ConfigScreen until user submits settings
    *  • Renders ChatBotUI + ChatMetricsPanel once configured
    *  • Provides reset to re-configure / tear down active call
    =======================================================================*/
   const ChatApp: React.FC = () => {
     /* =====================================================================
      *                        local state
      * ====================================================================*/
     const [cfg, setCfg] = useState<Config | null>(null);
     const [msgs, setMsgs] = useState<ChatMessage[]>([]);
     const [lat, setLat] = useState<LatencyMetrics>({ dialogues: [] });
   
     /* ======================================================================
      *                      configuration handler
      * =====================================================================*/
     const handleCfg = (c: Config) => {
       setCfg(c);
       setMsgs([]);
       setLat({ dialogues: [] });
     };
   
     /* =======================================================================
      *                         reset / cleanup
      * ======================================================================*/
     const reset = () => {
       setCfg(null);
       setMsgs([]);
       setLat({ dialogues: [] });
     };
   
     /* ========================================================================
      *                           render
      * ========================================================================*/
     return (
       <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
         {!cfg ? (
           <ConfigScreen onSubmit={handleCfg} />
         ) : (
           <>
             <ChatBotUI
               config={cfg}
               onResetConfig={reset}
               onMessagesUpdate={setMsgs}
               onMetricsUpdate={setLat}
             />
             <ChatMetricsPanel messages={msgs} latencyMetrics={lat} />
           </>
         )}
       </div>
     );
   };
   
   export default ChatApp;
   