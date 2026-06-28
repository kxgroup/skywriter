import { useRef } from "react";
import type { StoredImage } from "../types";
import { fileToStoredImage } from "../lib/storage";

interface Props {
  label: string;
  value: StoredImage | null;
  onChange: (img: StoredImage | null) => void;
}

export default function ImageUpload({ label, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    onChange(await fileToStoredImage(file));
  }

  return (
    <div className="image-upload">
      <label className="field-label">{label}</label>
      <div
        className="dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          <img src={value.dataUrl} alt={value.name} />
        ) : (
          <span className="dropzone-hint">Click or drop image</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />
      {value && (
        <button className="link-btn" onClick={() => onChange(null)}>
          Remove
        </button>
      )}
    </div>
  );
}
