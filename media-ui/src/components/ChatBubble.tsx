/* ===============================================================
          Individual chat message bubble component
   =============================================================== */

   import React from "react";
   import { ChatMessage } from "./ChatBotUI";
   
   /** ====================================================================
    * Presents a single chat message in a bubble, aligned left or right
    * depending on sender. Includes a bounce-in animation for new messages.
    ======================================================================= */
    
   const ChatBubble: React.FC<ChatMessage> = ({ sender, text, timestamp }) => {
     /** determine alignment based on sender */
     const isUser = sender === "user";
   
     /** render the bubble with animation and timestamp */
     return (
       <div
         className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-bounce-in`}
       >
         <div
           className={`max-w-[70%] p-3 rounded-lg shadow-md ${
             isUser ? "bg-blue-200 text-gray-800" : "bg-gray-200 text-gray-800"
           }`}
         >
           <p className="text-sm">{text}</p>
           <span className="text-xs text-gray-500 mt-1 block">{timestamp}</span>
         </div>
         <style jsx>{`
           @keyframes bounce-in {
             0% {
               opacity: 0;
               transform: translateY(10px) scale(0.95);
             }
             60% {
               opacity: 1;
               transform: translateY(-5px) scale(1.02);
             }
             100% {
               opacity: 1;
               transform: translateY(0) scale(1);
             }
           }
           .animate-bounce-in {
             animation: bounce-in 0.4s ease-in-out;
           }
         `}</style>
       </div>
     );
   };
   
   export default ChatBubble;
   