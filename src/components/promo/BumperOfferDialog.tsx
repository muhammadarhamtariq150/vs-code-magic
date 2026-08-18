import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Sparkles } from "lucide-react";

interface BannerData {
  enabled: boolean;
  title: string;
  subtitle: string;
  highlight: string;
  description: string;
  cta_text: string;
}

const STORAGE_KEY = "bumper_offer_seen_date";

const BumperOfferDialog = ({ onCta }: { onCta?: () => void }) => {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("promo_banners")
        .select("enabled, title, subtitle, highlight, description, cta_text")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!data || !data.enabled) return;

      const today = new Date().toDateString();
      if (localStorage.getItem(STORAGE_KEY) === today) return;

      setBanner(data as BannerData);
      setOpen(true);
      localStorage.setItem(STORAGE_KEY, today);
    };

    load();
  }, []);

  if (!banner) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm border-0 p-0 overflow-hidden bg-transparent shadow-none">
        <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-yellow-400 via-pink-500 to-primary">
          <div className="relative rounded-2xl bg-gradient-to-br from-[hsl(340_80%_28%)] via-[hsl(280_70%_25%)] to-[hsl(190_80%_20%)] px-6 py-8 text-center overflow-hidden">
            <Sparkles className="absolute top-3 left-3 w-5 h-5 text-yellow-300/80 animate-pulse" />
            <Sparkles className="absolute bottom-4 right-4 w-4 h-4 text-yellow-200/70 animate-pulse" />

            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center shadow-lg animate-bounce">
              <Gift className="w-8 h-8 text-background" />
            </div>

            <p className="text-xs font-bold tracking-[0.25em] text-yellow-300 uppercase">
              {banner.title}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-primary-foreground">
              {banner.subtitle}
            </h2>
            <p className="mt-2 text-4xl font-black bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent drop-shadow">
              {banner.highlight}
            </p>
            <p className="mt-3 text-sm text-primary-foreground/85 leading-relaxed">
              {banner.description}
            </p>

            <Button
              className="mt-6 w-full h-11 font-bold text-base bg-gradient-to-r from-yellow-400 to-orange-500 text-background hover:opacity-90"
              onClick={() => {
                setOpen(false);
                onCta?.();
              }}
            >
              {banner.cta_text}
            </Button>
            <button
              className="mt-3 text-xs text-primary-foreground/60 hover:text-primary-foreground/90 underline"
              onClick={() => setOpen(false)}
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BumperOfferDialog;
