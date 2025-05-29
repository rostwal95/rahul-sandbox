/* ========================================================================
              Exports chat transcript as HTML file
   =======================================================================*/

   import React from "react";

   /** ======================================================================
    * Represents a single chat message with associated metadata.
    *
    * @prop id         – unique identifier for the message
    * @prop sender     – "user" or "Autonomous Agent"
    * @prop text       – the message content
    * @prop timestamp  – formatted timestamp string
    =========================================================================*/
   export interface ChatMessage {
     id: string;
     sender: "user" | "Autonomous Agent";
     text: string;
     timestamp: string;
   }
   
   /** ========================================================================
    * Defines the props for the TranscriptExporter component.
    *
    * @prop messages     – array of ChatMessage objects to include
    * @prop buttonClass  – optional CSS classes for the export button
    ===========================================================================*/
   interface TranscriptExporterProps {
     messages: ChatMessage[];
     buttonClass?: string;
   }
   
   /** ==========================================================================
    * Generates a styled HTML document containing the full chat transcript,
    * creates a Blob URL for it, and triggers a download of "transcript.html".
    *
    * @param props – TranscriptExporterProps
    * @returns JSX.Element – a button that starts the export when clicked
    ============================================================================*/
   const TranscriptExporter: React.FC<TranscriptExporterProps> = ({
     messages,
     buttonClass = "bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-900",
   }) => {
     const exportTranscript = () => {
       const htmlContent = `
         <!DOCTYPE html>
         <html lang="en">
         <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Chat Transcript</title>
           <style>
             body {
               font-family: Arial, sans-serif;
               padding: 20px;
               background-color: #f9fafb;
             }
             .message {
               margin-bottom: 10px;
               padding: 10px;
               border-radius: 8px;
               background-color: #ffffff;
               box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
             }
             .user {
               color: #1E5F74; /* Match ChatBotUI primary color */
               font-weight: bold;
             }
             .agent {
               color: #F28F38; /* Match ChatBotUI secondary color */
               font-weight: bold;
             }
             .timestamp {
               color: #6b7280;
               font-size: 0.9em;
               margin-right: 5px;
             }
           </style>
         </head>
         <body>
           <h1>Chat Transcript</h1>
           ${messages
             .map(
               (m) => `
             <div class="message">
               <span class="timestamp">[${m.timestamp}]</span>
               <span class="${m.sender === "user" ? "user" : "agent"}">${
                 m.sender === "user" ? "You" : "Autonomous Agent"
               }</span>: ${m.text}
             </div>
           `
             )
             .join("\n")}
         </body>
         </html>
       `;
   
       const blob = new Blob([htmlContent], { type: "text/html" });
       const url = URL.createObjectURL(blob);
       const anchor = document.createElement("a");
       anchor.href = url;
       anchor.download = "transcript.html";
       document.body.appendChild(anchor);
       anchor.click();
       document.body.removeChild(anchor);
       URL.revokeObjectURL(url);
     };
   
     return (
       <button onClick={exportTranscript} className={buttonClass}>
         Export Transcript
       </button>
     );
   };
   
   export default TranscriptExporter;
   