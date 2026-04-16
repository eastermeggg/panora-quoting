import { Lock, ShieldCheck } from "lucide-react";

export function SecurityTrustBar() {
  return (
    <div className="inline-flex items-center gap-3.5 bg-panora-green-light/70 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-panora-green-dark" />
        <span className="text-[11px] font-medium text-panora-green-dark leading-4">
          Chiffrement AES-256
        </span>
      </div>
      <div className="w-px h-3 bg-panora-green-dark/20" />
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] leading-3">🇫🇷</span>
        <span className="text-[11px] font-medium text-panora-green-dark leading-4">
          Hébergé en France
        </span>
      </div>
      <div className="w-px h-3 bg-panora-green-dark/20" />
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-panora-green-dark" />
        <span className="text-[11px] font-medium text-panora-green-dark leading-4">
          Conforme RGPD
        </span>
      </div>
    </div>
  );
}
