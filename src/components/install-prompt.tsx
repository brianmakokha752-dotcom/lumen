import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "lumen-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const ios = "standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return media || ios;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function isAndroidDevice() {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [hidden, setHidden] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === "1") return;

    setIos(isIosDevice());
    setAndroid(isAndroidDevice());
    setHidden(false);

    function onPrompt(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setHidden(false);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;

  async function install() {
    if (!deferred) {
      setGuideOpen(true);
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") dismiss();
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
    setGuideOpen(false);
  }

  const steps = ios
    ? [
        "This only works in Safari — not Chrome, and not inside Grok.",
        "Tap the Share button (square with an arrow) at the bottom of Safari.",
        "Scroll the list and tap Add to Home Screen, then Add.",
      ]
    : android
      ? [
          "Open this page in Chrome.",
          "Tap the three dots (⋮) at the top right.",
          "Tap Install app or Add to Home Screen, then Install.",
        ]
      : [
          "Open this same link on your phone.",
          "iPhone: Safari → Share → Add to Home Screen.",
          "Android: Chrome → ⋮ → Install app.",
        ];

  return (
    <>
      <div
        className={cn(
          "border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-start gap-3">
          <button
            type="button"
            onClick={() => void install()}
            className="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-left"
          >
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Share className="size-4" strokeWidth={2.25} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Add Lumen to your home screen</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {deferred
                  ? "Tap here, then Install. It opens like any other app."
                  : "Tap here for the 3 steps. Apple does not allow a one-tap install."}
              </span>
            </span>
          </button>
          <Button size="sm" className="mt-0.5 shrink-0" onClick={() => void install()}>
            {deferred ? "Install" : "How"}
          </Button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Dismiss install hint"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Home Screen</DialogTitle>
            <DialogDescription>
              Phones block websites from installing themselves. You have to use the browser menu once.
            </DialogDescription>
          </DialogHeader>
          <ol className="grid gap-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-snug">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            After that, a green Lumen check sits with your other apps.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
