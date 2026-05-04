"use client";

import { useState } from "react";
import { Play, Pause } from "lucide-react";

interface VideoPlaceholderProps {
  isLive?: boolean;
}

export function VideoPlaceholder({ isLive = false }: VideoPlaceholderProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      onClick={() => setPlaying(!playing)}
      className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer group"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <div className="relative w-12 h-12 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors backdrop-blur-sm">
        {playing ? (
          <Pause className="w-5 h-5 text-white fill-white" />
        ) : (
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center gap-2">
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] text-white/80 font-medium">LIVE</span>
          </div>
        )}
        {!isLive && (
          <span className="text-[11px] text-white/60">Replay session agent</span>
        )}
        <div className="flex-1" />
        <span className="text-[11px] text-white/40">0:00 / 2:34</span>
      </div>
    </div>
  );
}
