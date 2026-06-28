import { useEffect, useRef, useState } from "react";

const LINES = [
  "KXGroup Avionics BIOS v4.21 ............ OK",
  "Initializing flight deck subsystems ..... OK",
  "Mounting profile datastore (volatile) ... OK",
  "Calibrating brand vibe matrix ........... OK",
  "Linking multimodal copy engine .......... OK",
  "Spooling reference-image renderer ....... OK",
  "Verifying API uplink .................... STANDBY",
  "Loading Timeline Explorer ............... OK",
  "SkyWriter ready. Welcome aboard.",
];

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (shown >= LINES.length) {
      if (doneRef.current) return;
      doneRef.current = true;
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((s) => s + 1), 230);
    return () => clearTimeout(t);
  }, [shown, onDone]);

  return (
    <div className="boot" onClick={onDone}>
      <div className="boot-inner">
        <pre>
          {LINES.slice(0, shown).map((l, i) => (
            <div key={i} className="boot-line">
              <span className="boot-prompt">›</span> {l}
            </div>
          ))}
          {shown < LINES.length && <span className="boot-cursor">▋</span>}
        </pre>
        <div className="boot-skip">click to skip</div>
      </div>
    </div>
  );
}
