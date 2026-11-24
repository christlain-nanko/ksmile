"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "ksmile-pwa-dismissed-at";
const DISMISS_DAYS = 14;

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

function wasDismissedRecently() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function PwaProvider() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone() || wasDismissedRecently()) return;

    // Enregistrement du service worker (critère d’installabilité Chrome)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* ignore */
      });
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (isMobile()) setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS : pas de beforeinstallprompt → proposition manuelle après un court délai
    if (isIos() && isMobile()) {
      const t = window.setTimeout(() => setVisible(true), 1800);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
    setIosHelp(false);
  }

  async function install() {
    if (iosHelp) {
      dismiss();
      return;
    }
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") {
        setVisible(false);
        return;
      }
      dismiss();
      return;
    }
    if (isIos()) {
      setIosHelp(true);
      return;
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Installer Ksmile"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-lg border border-ksmile-line bg-white p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="flex gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/pwa-192.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-lg border border-ksmile-line"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ksmile-ink">Installer Ksmile</p>
            <p className="mt-0.5 text-sm text-ksmile-muted">
              Ajoutez l’app sur votre écran d’accueil pour ouvrir le catalogue
              plus vite, comme une application.
            </p>
          </div>
        </div>

        {iosHelp ? (
          <div className="mt-3 rounded-md bg-ksmile-surface p-3 text-sm text-ksmile-ink">
            <p className="font-semibold">Sur iPhone / iPad (Safari)</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-ksmile-muted">
              <li>
                Appuyez sur <strong>Partager</strong> (carré avec flèche).
              </li>
              <li>
                Choisissez <strong>Sur l’écran d’accueil</strong>.
              </li>
              <li>
                Validez avec <strong>Ajouter</strong>.
              </li>
            </ol>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={install} className="flex-1 sm:flex-none">
            {iosHelp ? "OK, compris" : deferred ? "Télécharger / Installer" : "Comment installer"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={dismiss}
            className="flex-1 sm:flex-none"
          >
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  );
}
