/* =======================================================================
   RecordingChips.tsx – download links for recorded audio
   ======================================================================*/

   import React from "react";
   import { Download } from "lucide-react";
   
   /** ====================================================================
    * Represents a recorded audio file to download.
    *
    * @prop label – file name (e.g: "{convId}-mixed.wav")
    * @prop blob  – Blob containing WAV data
    =======================================================================*/
   interface Item { label: string; blob: Blob }
   
   /** ====================================================================
    * @prop files – array of Item objects
    =======================================================================*/
   interface Props { files: Item[] }
   
   /** ====================================================================
    * Displays download buttons for each recorded audio Blob.
    * Buttons appear once files are available.
    *
    * @param props – Props
    * @returns JSX.Element or null
    =======================================================================*/
   const RecordingChips: React.FC<Props> = ({ files }) => {
     const [ready, setReady] = React.useState(false);
   
     React.useEffect(() => {
       if (files.length) setReady(true);
     }, [files]);
   
     if (!ready) return null;
   
     return (
       <>
         {files.map(f => (
           <a
             key={f.label}
             href={URL.createObjectURL(f.blob)}
             download={f.label}
             className="inline-flex items-center gap-1 min-w-[130px]
                        bg-green-600 hover:bg-green-700 text-white px-3 py-1.5
                        rounded-lg shadow-md text-xs"
           >
             <Download className="w-4 h-4 shrink-0" />
             {f.label}
           </a>
         ))}
       </>
     );
   };
   
   export default RecordingChips;
   