import { Phone, MessageCircle, Send, Headphones } from "lucide-react";
import { useSound } from "@/hooks/useSound";

const FloatingActions = () => {
  const { playClick } = useSound();

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">

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
