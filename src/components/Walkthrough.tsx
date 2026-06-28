import { useEffect, useState } from "react";

export type TourTab = "profiles" | "press" | "visual" | "manual";

interface Step {
  title: string;
  body: string;
  tab?: TourTab;
}

const STEPS: Step[] = [
  {
    title: "Welcome aboard SkyWriter",
    body: "Your PR & asset studio for virtual airlines. This quick tour walks through the flight deck — you can reopen it any time from the “?” icon in the top bar.",
  },
  {
    title: "1 · Build an airline identity",
    body: "Start in Profiles. Set the name, ICAO, and a “vibe”, then add hubs, fleet, destinations, brand assets (livery, logo, alliance) and cabin specs. The richer the profile, the better the AI output. Switch between multiple airlines with the dropdown.",
    tab: "profiles",
  },
  {
    title: "2 · Write press releases",
    body: "Pick a topic, output channel and length, jot a short brief, and optionally attach “ingredient” images the AI will analyse. Toggle hard word/character limits for social posts. Generate a piece, then keep generating to chain a continuous thread (great for emergency updates).",
    tab: "press",
  },
  {
    title: "3 · Generate visuals",
    body: "The Visual Asset Engine feeds your livery and logo to the image model as references, then renders a 16:9 marketing photo from your scene description. Save any result straight to your device.",
    tab: "visual",
  },
  {
    title: "4 · Browse the Timeline",
    body: "Every generation is filed into a collapsible thread tree on the right. Copy text, download images, or activate/release a chain link directly from there.",
  },
  {
    title: "5 · Save your work + add a key",
    body: "Data lives in memory only — use Export (Profiles tab) for a .json backup, and the amber banner will remind you. Finally, open the ⚙ gear and paste a free Google Gemini API key to enable generation. You’re cleared for takeoff!",
    tab: "manual",
  },
];

interface Props {
  onClose: () => void;
  onNavigate: (tab: TourTab) => void;
}

export default function Walkthrough({ onClose, onNavigate }: Props) {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const isFirst = i === 0;
  const isLast = i === STEPS.length - 1;

  useEffect(() => {
    if (step.tab) onNavigate(step.tab);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="modal-backdrop">
      <div className="tour-card">
        <div className="tour-badge">✈</div>
        <h2 className="tour-title">{step.title}</h2>
        <p className="tour-body">{step.body}</p>

        <div className="tour-dots">
          {STEPS.map((_, idx) => (
            <span
              key={idx}
              className={"tour-dot" + (idx === i ? " active" : "")}
              onClick={() => setI(idx)}
            />
          ))}
        </div>

        <div className="tour-actions">
          <button className="link-btn" onClick={onClose}>
            Skip tour
          </button>
          <div className="row gap">
            {!isFirst && (
              <button className="btn ghost" onClick={() => setI((n) => n - 1)}>
                Back
              </button>
            )}
            {isLast ? (
              <button className="btn primary" onClick={onClose}>
                Get started
              </button>
            ) : (
              <button className="btn primary" onClick={() => setI((n) => n + 1)}>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
