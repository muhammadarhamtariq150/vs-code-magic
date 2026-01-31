import { ArrowLeft, User, Phone, Mail, Shield, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  username: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

const PersonalInfo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit states
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, phone, avatar_url, created_at")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setNewUsername(data?.username || "");
        setNewPhone(data?.phone || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveUsername = async () => {
    if (!user || !newUsername.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername.trim() })
        .eq("user_id", user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, username: newUsername.trim() } : null);
      setEditingUsername(false);
      toast({ title: "Success", description: "Username updated successfully" });
    } catch (error) {
      console.error("Error updating username:", error);
      toast({ title: "Error", description: "Failed to update username", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhone = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ phone: newPhone.trim() || null })
        .eq("user_id", user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, phone: newPhone.trim() || null } : null);
      setEditingPhone(false);
      toast({ title: "Success", description: "Phone number updated successfully" });
    } catch (error) {
      console.error("Error updating phone:", error);
      toast({ title: "Error", description: "Failed to update phone number", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const memberId = user?.id?.slice(0, 8).toUpperCase() || "N/A";

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Personal Info</h1>
        </div>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold">{profile?.username || "Player"}</h2>
          <p className="text-sm text-muted-foreground">ID: {memberId}</p>
        </div>

        {/* Info Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Username */}
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div className="flex items-center gap-3 flex-1">
                <User className="w-5 h-5 text-primary shrink-0" />
                {editingUsername ? (
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    className="h-8"
                  />
                ) : (
                  <div>
                    <span className="text-muted-foreground text-sm">Username</span>
                    <p className="font-medium">{loading ? "..." : profile?.username || "N/A"}</p>
                  </div>
                )}
              </div>
              {editingUsername ? (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={handleSaveUsername} disabled={saving}>
                    <Save className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditingUsername(false); setNewUsername(profile?.username || ""); }}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <Button size="icon" variant="ghost" onClick={() => setEditingUsername(true)}>
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-muted-foreground text-sm">Email</span>
                  <p className="font-medium text-sm">{user?.email || "N/A"}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Verified</span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div className="flex items-center gap-3 flex-1">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                {editingPhone ? (
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="h-8"
                    type="tel"
                  />
                ) : (
                  <div>
                    <span className="text-muted-foreground text-sm">Phone</span>
                    <p className="font-medium">{profile?.phone || "Not Set"}</p>
                  </div>
                )}
              </div>
              {editingPhone ? (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={handleSavePhone} disabled={saving}>
                    <Save className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditingPhone(false); setNewPhone(profile?.phone || ""); }}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <Button size="icon" variant="ghost" onClick={() => setEditingPhone(true)}>
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
            </div>

            {/* Member ID (read-only) */}
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-muted-foreground text-sm">Member ID</span>
                  <p className="font-medium">{memberId}</p>
                </div>
              </div>
            </div>

            {/* Joined Date (read-only) */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5" />
                <div>
                  <span className="text-muted-foreground text-sm">Joined</span>
                  <p className="font-medium text-sm">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalInfo;
