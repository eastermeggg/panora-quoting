"use client";

import { Play, ExternalLink } from "lucide-react";
import Link from "next/link";

interface EmailBannerProps {
  subject?: string;
  compact?: boolean;
}

export function EmailBanner({
  subject = "Cotation Panora RC Pro...",
  compact = false,
}: EmailBannerProps) {
  return (
    <div className="flex items-center gap-2 bg-panora-green-light rounded-lg px-3 py-2 text-sm">
      <Play className="w-3.5 h-3.5 text-panora-green fill-panora-green shrink-0" />
      <span className="text-panora-green font-medium shrink-0">
        {compact ? "Initiée par e-mail" : "Cotation initiée par e-mail"}
      </span>
      {!compact && <div className="w-px h-4 bg-panora-green/20" />}
      <span className="text-panora-text-secondary truncate">
        {compact ? subject : `Objet ${subject}`}
      </span>
      <Link
        href="/email"
        className="ml-auto flex items-center gap-1 text-panora-green hover:underline font-medium shrink-0"
      >
        Voir
        <ExternalLink className="w-3 h-3" />
      </Link>
    </div>
  );
}
