/* ===============================================================
         Metrics display and transcript exporter
   =============================================================== */

   import React, { useState } from "react";
   import { BarChart2, X } from "lucide-react";
   import LatencyMetricsDisplay, { LatencyMetrics } from "./LatencyMetricsDisplay";
   import TranscriptExporter from "./TranscriptExporter";
   import { ChatMessage } from "./ChatBotUI";
   
   /** ====================================================================
    * @prop latencyMetrics – latency data collected during the call
    * @prop messages      – full list of chat messages for export
    ======================================================================= */
   interface ChatMetricsPanelProps {
     latencyMetrics: LatencyMetrics;
     messages: ChatMessage[];
   }
   
   /** ====================================================================
    * Renders a floating panel in the bottom-right corner:
    *  • Togglable non-modal metrics window displaying latency graphs
    *  • Button to open/close the metrics display
    *  • Transcript export button for saving chat log to file
    ======================================================================== */
   const ChatMetricsPanel: React.FC<ChatMetricsPanelProps> = ({
     latencyMetrics,
     messages,
   }) => {
     const [isOpen, setIsOpen] = useState(false);
   
     return (
       <div className="fixed bottom-4 right-4 flex items-end gap-3">
   
         {isOpen && (
           <div className="fixed bottom-16 right-4 bg-white p-4 rounded-xl shadow-md w-full max-w-xs max-h-[50vh] overflow-auto transition-all duration-300">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-base font-semibold text-gray-800">Metrics</h3>
               <button
                 onClick={() => setIsOpen(false)}
                 className="text-gray-600 hover:text-gray-800"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
             <LatencyMetricsDisplay latencyMetrics={latencyMetrics} />
           </div>
         )}
   
         <button
           onClick={() => setIsOpen(!isOpen)}
           className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:scale-105 flex items-center gap-2"
         >
           <BarChart2 className="w-5 h-5" />
           Latency Metrics
         </button>
   
         <TranscriptExporter
           messages={messages}
           buttonClass="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:scale-105"
         />
       </div>
     );
   };
   
   export default ChatMetricsPanel;
   