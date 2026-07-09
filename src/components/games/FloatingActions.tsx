import { Phone, MessageCircle, Send, Headphones } from "lucide-react";
import { toast } from "sonner";
import { useSound } from "@/hooks/useSound";

const SUPPORT_EMAIL = "7XBETOFFICAIL@proton.me";

const FloatingActions = () => {
  const { playClick } = useSound();

  const handleSupportClick = () => {
    playClick();
    toast("Contact us via email", {
      description: `Please reach out at ${SUPPORT_EMAIL}`,
    });
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
      {/* WhatsApp */}
      <button
        className="floating-action bg-green-500 hover:bg-green-600 text-white"
        style={{ animationDelay: "0s" }}
        onClick={handleSupportClick}
        aria-label="Customer Support"
        title="Customer Support"
      >
        <Phone className="w-5 h-5" />
      </button>

      {/* Message */}
      <button
        className="floating-action bg-blue-500 hover:bg-blue-600 text-white"
        style={{ animationDelay: "0.1s" }}
        onClick={handleSupportClick}
        aria-label="Message"
        title="Message"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Telegram */}
      <button
        className="floating-action bg-sky-400 hover:bg-sky-500 text-white"
        style={{ animationDelay: "0.2s" }}
        onClick={handleSupportClick}
        aria-label="Telegram"
        title="Telegram"
      >
        <Send className="w-5 h-5" />
      </button>

      {/* Support */}
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
  );
};

export default FloatingActions;
