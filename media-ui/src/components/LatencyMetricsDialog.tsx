/* ===============================================================
   LatencyMetricsDialog.tsx – modal for real-time metrics display
   =============================================================== */

   import React from "react";
   import * as Dialog from "@radix-ui/react-dialog";
   import { X } from "lucide-react";
   import LatencyMetricsDisplay, { LatencyMetrics } from "./LatencyMetricsDisplay";
   
   /** ====================================================================
    * @prop open           – whether the dialog is currently open
    * @prop onClose        – callback to close the dialog
    * @prop latencyMetrics – real-time latency metrics to display
    ======================================================================= */
   interface LatencyMetricsDialogProps {
     open: boolean;
     onClose: () => void;
     latencyMetrics: LatencyMetrics;
   }
   
   /** ======================================================================
    * A Radix UI dialog overlay that shows the LatencyMetricsDisplay
    * component. Controlled by the `open` prop and closed via `onClose`.
    *
    * @param props – dialog props
    * @returns JSX.Element
    ======================================================================= */
   const LatencyMetricsDialog: React.FC<LatencyMetricsDialogProps> = ({
     open,
     onClose,
     latencyMetrics,
   }) => {
     return (
       <Dialog.Root open={open} onOpenChange={onClose}>
         <Dialog.Overlay className="bg-black bg-opacity-50 fixed inset-0" />
         <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-xl transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 focus:outline-none">
           <Dialog.Title className="text-lg font-bold text-gray-800 mb-2">
             Real-time Latency Metrics
           </Dialog.Title>
           <Dialog.Description className="text-sm text-gray-600 mb-4">
             Monitor call_start, dialogue, and call_end latencies in real time.
           </Dialog.Description>
           <div className="max-h-96 overflow-auto">
             <LatencyMetricsDisplay latencyMetrics={latencyMetrics} />
           </div>
           <Dialog.Close asChild>
             <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
               <X className="w-5 h-5" />
             </button>
           </Dialog.Close>
         </Dialog.Content>
       </Dialog.Root>
     );
   };
   
   export default LatencyMetricsDialog;
   