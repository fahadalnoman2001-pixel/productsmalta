"use client";
import { useState } from "react";

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const mainImage = images[selectedIdx] || images[0] || "https://picsum.photos/seed/def/600/600";

  return (
    <div>
      <div className="relative aspect-square bg-white rounded-xl overflow-hidden border border-ink-100 p-4 flex items-center justify-center mb-3 group">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-contain transition duration-300 group-hover:scale-105"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-2">
          {images.slice(0, 8).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIdx(i)}
              className={`aspect-square rounded-lg overflow-hidden bg-white border p-1 transition cursor-pointer flex items-center justify-center ${
                selectedIdx === i
                  ? "border-brand-500 ring-2 ring-brand-200"
                  : "border-ink-100 hover:border-ink-300 opacity-75 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
