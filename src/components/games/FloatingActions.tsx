import { Phone, MessageCircle, Send, Headphones } from "lucide-react";
import { useSound } from "@/hooks/useSound";

const FloatingActions = () => {
  const { playClick } = useSound();
  
  const actions = [
    { icon: <Phone className="w-5 h-5" />, color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
    { icon: <MessageCircle className="w-5 h-5" />, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
    { icon: <Send className="w-5 h-5" />, color: 'bg-sky-400', hoverColor: 'hover:bg-sky-500' },
    { icon: <Headphones className="w-5 h-5" />, color: 'bg-red-500', hoverColor: 'hover:bg-red-600' },
  ];

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
      {actions.map((action, index) => (
        <button
          key={index}
          className={`floating-action ${action.color} ${action.hoverColor} text-white`}
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => playClick()}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
};

export default FloatingActions;
