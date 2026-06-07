import { Phone, MessageCircle, Send, Headphones } from "lucide-react";
import { useSound } from "@/hooks/useSound";

const FloatingActions = () => {
  const { playClick } = useSound();

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
      {/* WhatsApp Customer Support */}
      <a
        href="https://wa.me/923704587950"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-action bg-green-500 hover:bg-green-600 text-white"
        style={{ animationDelay: "0s" }}
        onClick={() => playClick()}
        aria-label="Customer Support on WhatsApp"
        title="Customer Support on WhatsApp"
      >
        <Phone className="w-5 h-5" />
      </a>

      {/* Message */}
      <button
        className="floating-action bg-blue-500 hover:bg-blue-600 text-white"
        style={{ animationDelay: "0.1s" }}
        onClick={() => playClick()}
        aria-label="Message"
        title="Message"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Send */}
      <button
        className="floating-action bg-sky-400 hover:bg-sky-500 text-white"
        style={{ animationDelay: "0.2s" }}
        onClick={() => playClick()}
        aria-label="Send"
        title="Send"
      >
        <Send className="w-5 h-5" />
      </button>

      {/* Support */}
      <button
        className="floating-action bg-red-500 hover:bg-red-600 text-white"
        style={{ animationDelay: "0.3s" }}
        onClick={() => playClick()}
        aria-label="Support"
        title="Support"
      >
        <Headphones className="w-5 h-5" />
      </button>
    </div>
  );
};

export default FloatingActions;
