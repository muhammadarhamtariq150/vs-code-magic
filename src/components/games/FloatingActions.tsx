import { Phone, MessageCircle, Send, Headphones } from "lucide-react";
import { useSound } from "@/hooks/useSound";

// Pakistan number 03158517738 -> international format 923158517738
const WHATSAPP_NUMBER = "923158517738";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I need help with games7play."
)}`;

const FloatingActions = () => {
  const { playClick } = useSound();

  const handleSupportClick = () => {
    playClick();
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  };

  const buttons = [
    { Icon: Phone, label: "Customer Support", className: "bg-primary hover:bg-primary/90 text-primary-foreground", delay: "0s" },
    { Icon: MessageCircle, label: "Message", className: "bg-secondary hover:bg-secondary/80 text-secondary-foreground", delay: "0.1s" },
    { Icon: Send, label: "Telegram", className: "bg-accent hover:bg-accent/90 text-accent-foreground", delay: "0.2s" },
    { Icon: Headphones, label: "Support", className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground", delay: "0.3s" },
  ];

  return (
    <div className="fixed right-3 bottom-24 flex flex-col gap-2 z-40">
      {buttons.map(({ Icon, label, className, delay }) => (
        <button
          key={label}
          className={`floating-action ${className}`}
          style={{ animationDelay: delay }}
          onClick={handleSupportClick}
          aria-label={label}
          title={label}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
};

export default FloatingActions;
