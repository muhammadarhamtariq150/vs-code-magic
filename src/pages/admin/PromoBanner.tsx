import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Banner {
  id: string;
  enabled: boolean;
  title: string;
  subtitle: string;
  highlight: string;
  description: string;
  cta_text: string;
}

const PromoBanner = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("promo_banners")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) toast.error("Failed to load banner");
      if (data) setBanner(data as Banner);
      setLoading(false);
    };
    load();
  }, []);

  const update = (key: keyof Banner, value: string | boolean) =>
    setBanner((prev) => (prev ? { ...prev, [key]: value } as Banner : prev));

  const save = async () => {
    if (!banner) return;
    setSaving(true);
    const { error } = await supabase
      .from("promo_banners")
      .update({
        enabled: banner.enabled,
        title: banner.title,
        subtitle: banner.subtitle,
        highlight: banner.highlight,
        description: banner.description,
        cta_text: banner.cta_text,
      })
      .eq("id", banner.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
      return;
    }
    toast.success("Promo banner updated");
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promo Banner</h1>
          <p className="text-sm text-muted-foreground">
            Edit the bumper offer popup shown to users when they open the website.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Offer Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading || !banner ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium text-foreground">Show banner</p>
                    <p className="text-xs text-muted-foreground">
                      Popup appears once per day for each visitor
                    </p>
                  </div>
                  <Switch
                    checked={banner.enabled}
                    onCheckedChange={(v) => update("enabled", v)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Top label</Label>
                  <Input value={banner.title} onChange={(e) => update("title", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input value={banner.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Highlight (big text)</Label>
                  <Input value={banner.highlight} onChange={(e) => update("highlight", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={banner.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button text</Label>
                  <Input value={banner.cta_text} onChange={(e) => update("cta_text", e.target.value)} />
                </div>

                <Button onClick={save} disabled={saving} className="w-full">
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PromoBanner;
