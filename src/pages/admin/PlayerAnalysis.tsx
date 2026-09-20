import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const PlayerAnalysis = () => {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in again.");

      const { data, error } = await supabase.functions.invoke("analyze-players", {
        body: userId.trim() ? { user_id: userId.trim() } : {},
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAnalysis((data as any).analysis as string);
    } catch (e: any) {
      toast.error(e?.message || "Could not generate the analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Player Analysis
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Summarises deposits, withdrawals and betting patterns of the last 30 days and flags
            risky accounts.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Run analysis</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Optional: single member user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Button onClick={runAnalysis} disabled={loading} className="sm:w-48">
              {loading ? "Analysing..." : "Analyse players"}
            </Button>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="py-6 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        )}

        {analysis && !loading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
                {analysis}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default PlayerAnalysis;
