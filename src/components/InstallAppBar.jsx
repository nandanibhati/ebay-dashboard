import { useEffect, useState } from "react";
import { Download, Link2, Check } from "lucide-react";

// Chrome/Edge/Android fire `beforeinstallprompt` when the page qualifies as
// an installable PWA. It has to be captured and stashed — calling
// `.prompt()` only works on that original event, and only once.
export default function InstallAppBar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(
    typeof window !== "undefined" &&
      window.matchMedia?.("(display-mode: standalone)").matches
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log(error);
    }
  };

  if (installed && !deferredPrompt) {
    return null;
  }

  return (
    <div
      className="w-full flex flex-wrap items-center justify-center gap-2.5 px-4 py-2.5 text-xs sm:text-sm font-semibold"
      style={{ background: "linear-gradient(135deg, #0F172A 0%, #111827 100%)", color: "#E2E8F0" }}
    >
      <span className="hidden sm:inline text-slate-400 font-medium">
        Install Driftline Workspace as an app on your device
      </span>

      {deferredPrompt && (
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg, #F4B400, #F59E0B)", color: "#0F172A" }}
        >
          <Download size={13} className="stroke-[2.5]" />
          Install App
        </button>
      )}

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
      >
        {copied ? (
          <>
            <Check size={13} className="stroke-[2.5] text-emerald-400" />
            Copied!
          </>
        ) : (
          <>
            <Link2 size={13} className="stroke-[2.5]" />
            Copy Link
          </>
        )}
      </button>
    </div>
  );
}
