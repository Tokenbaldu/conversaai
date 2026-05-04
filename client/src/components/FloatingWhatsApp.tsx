import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function FloatingWhatsApp() {
  const [whatsappLink, setWhatsappLink] = useState<string>("https://wa.me/5511999999999"); // Default link
  const [isLoading, setIsLoading] = useState(true);

  // Fetch WhatsApp support link from settings
  const { data: settings } = trpc.settings.getAll.useQuery();

  useEffect(() => {
    setIsLoading(false);
    if (settings?.whatsapp_support_link) {
      setWhatsappLink(settings.whatsapp_support_link);
    }
  }, [settings]);

  const handleClick = () => {
    // Ensure the link is a valid WhatsApp URL
    let url = whatsappLink;
    if (!url.startsWith("https://wa.me/") && !url.startsWith("http")) {
      // If it's just a phone number, convert to WhatsApp link
      const phoneNumber = url.replace(/\D/g, "");
      url = `https://wa.me/${phoneNumber}`;
    }
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center animate-pulse"
      title="Fale conosco no WhatsApp"
      aria-label="WhatsApp support"
    >
      <MessageCircle size={28} />
    </button>
  );
}
