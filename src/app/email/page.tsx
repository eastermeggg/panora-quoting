"use client";

import { useState } from "react";
import {
  Search,
  Star,
  Paperclip,
  ArrowLeft,
  Reply,
  Forward,
  MoreHorizontal,
  Inbox,
  Send,
  FileText,
  Trash2,
  Archive,
  Clock,
  ChevronDown,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { emailInboxMock, quotingEmail } from "@/data/mock";
import { useRouter } from "next/navigation";

export default function EmailPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>("1");
  const [showForwardModal, setShowForwardModal] = useState(false);
  const router = useRouter();

  const handleForward = () => {
    setShowForwardModal(true);
  };

  const handleSendForward = () => {
    router.push("/quoting/preparation");
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Email sidebar */}
      <div className="w-[220px] bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Email client logo */}
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-gray-800">Mail</span>
        </div>

        {/* Compose button */}
        <div className="px-3 mb-3">
          <button className="btn-primary w-full rounded-full py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Nouveau message
          </button>
        </div>

        {/* Folders */}
        <nav className="px-2 space-y-0.5 flex-1">
          {[
            { icon: Inbox, label: "Boîte de réception", count: 2, active: true },
            { icon: Star, label: "Favoris", count: 1 },
            { icon: Send, label: "Envoyés" },
            { icon: FileText, label: "Brouillons" },
            { icon: Archive, label: "Archives" },
            { icon: Trash2, label: "Corbeille" },
          ].map((folder) => (
            <button
              key={folder.label}
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm w-full text-left",
                folder.active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <folder.icon className="w-4 h-4" />
              <span className="flex-1">{folder.label}</span>
              {folder.count && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    folder.active ? "text-blue-700" : "text-gray-400"
                  )}
                >
                  {folder.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Storage indicator */}
        <div className="p-4 text-xs text-gray-400">
          2,4 Go utilisés sur 15 Go
        </div>
      </div>

      {/* Email list */}
      <div className="w-[360px] border-r border-gray-200 flex flex-col">
        {/* Search bar */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les emails..."
              className="w-full bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto">
          {emailInboxMock.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelectedEmail(email.id)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                selectedEmail === email.id && "bg-blue-50 border-l-2 border-l-blue-600",
                email.unread && "bg-white"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "text-sm truncate flex-1",
                    email.unread ? "font-semibold text-gray-900" : "text-gray-600"
                  )}
                >
                  {email.from}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {email.date}
                </span>
              </div>
              <p
                className={cn(
                  "text-sm truncate",
                  email.unread ? "font-medium text-gray-800" : "text-gray-500"
                )}
              >
                {email.subject}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400 truncate flex-1">
                  {email.preview}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  {email.hasAttachments && (
                    <Paperclip className="w-3 h-3 text-gray-400" />
                  )}
                  {email.starred && (
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Email detail */}
      <div className="flex-1 flex flex-col">
        {selectedEmail === "1" ? (
          <>
            {/* Email header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ArrowLeft className="w-4 h-4 text-gray-500" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 flex-1">
                  {quotingEmail.subject}
                </h2>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Star className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <span className="text-purple-700 font-semibold text-sm">
                    MD
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {quotingEmail.fromName}
                    </span>
                    <span className="text-sm text-gray-400">
                      &lt;{quotingEmail.from}&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
                    <span>à moi</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
                <span className="text-sm text-gray-400 shrink-0">
                  {quotingEmail.date}
                </span>
              </div>
            </div>

            {/* Email body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                {quotingEmail.body}
              </div>

              {/* Attachments */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-3">
                  {quotingEmail.attachments.length} pièces jointes
                </p>
                <div className="flex flex-wrap gap-2">
                  {quotingEmail.attachments.map((att) => (
                    <div
                      key={att.name}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {att.name}
                        </p>
                        <p className="text-xs text-gray-400">{att.size}</p>
                      </div>
                      <Download className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-gray-200 flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-panora-text-secondary bg-white border border-panora-border rounded-full hover:bg-panora-btn-secondary transition-colors">
                <Reply className="w-4 h-4" />
                Répondre
              </button>
              <button
                onClick={handleForward}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-colors font-medium"
              >
                <Forward className="w-4 h-4" />
                Transférer à Panora
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-panora-text-secondary bg-white border border-panora-border rounded-full hover:bg-panora-btn-secondary transition-colors">
                <Clock className="w-4 h-4" />
                Rappel
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Sélectionnez un email pour le lire</p>
            </div>
          </div>
        )}
      </div>

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[520px] overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">
                  Transférer à l&apos;assistant cotation
                </h3>
                <button
                  onClick={() => setShowForwardModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500">
                L&apos;email et ses pièces jointes seront envoyés à Panora pour créer
                automatiquement une cotation.
              </p>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">De</div>
                <div className="text-sm text-gray-700">
                  {quotingEmail.fromName} &lt;{quotingEmail.from}&gt;
                </div>
              </div>

              <div className="bg-panora-green-light rounded-lg p-3">
                <div className="text-xs text-panora-green/70 mb-1">À</div>
                <div className="text-sm text-panora-green font-medium">
                  cotation+a7f3b2@panora.co
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Objet</div>
                <div className="text-sm text-gray-700">
                  Fwd: {quotingEmail.subject}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Pièces jointes</div>
                <div className="space-y-1">
                  {quotingEmail.attachments.map((att) => (
                    <div
                      key={att.name}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                      <span>{att.name}</span>
                      <span className="text-xs text-gray-400">{att.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowForwardModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSendForward}
                className="btn-primary flex items-center gap-2 px-5 py-2 text-sm rounded-full transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                Envoyer à Panora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
