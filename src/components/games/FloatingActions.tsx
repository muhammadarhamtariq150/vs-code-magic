import { useState } from "react";
import { Phone, MessageCircle, Send, Headphones, Mail } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "7XBETOFFICAIL@proton.me";

const FloatingActions = () => {
  const { playClick } = useSound();
  const [open, setOpen] = useState(false);

  const handleSupportClick = () => {
    playClick();
    setOpen(true);
  };

  const copyEmail = async () => {
    playClick();
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
    } catch {}
  };

  return (
    <>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
        <button
          className="floating-action bg-green-500 hover:bg-green-600 text-white"
          style={{ animationDelay: "0s" }}
          onClick={handleSupportClick}
          aria-label="Customer Support"
          title="Customer Support"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          className="floating-action bg-blue-500 hover:bg-blue-600 text-white"
          style={{ animationDelay: "0.1s" }}
          onClick={handleSupportClick}
          aria-label="Message"
          title="Message"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <button
          className="floating-action bg-sky-400 hover:bg-sky-500 text-white"
          style={{ animationDelay: "0.2s" }}
          onClick={handleSupportClick}
          aria-label="Telegram"
          title="Telegram"
        >
          <Send className="w-5 h-5" />
        </button>
        <button
          className="floating-action bg-red-500 hover:bg-red-600 text-white"
          style={{ animationDelay: "0.3s" }}
          onClick={handleSupportClick}
          aria-label="Support"
          title="Support"
        >
          <Headphones className="w-5 h-5" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-center">Contact Customer Support</DialogTitle>
            <DialogDescription className="text-center">
              Please reach out to us via email at:
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-block text-lg font-semibold text-primary break-all"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={copyEmail}>Copy Email</Button>
            <Button onClick={() => { playClick(); setOpen(false); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingActions;
