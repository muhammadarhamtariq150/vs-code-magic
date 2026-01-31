import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Profile {
  username: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  security_password_hash: string | null;
}

const PersonalInfo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit dialogs
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, phone, avatar_url, created_at, security_password_hash")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleOpenEdit = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      if (editField === "username") {
        if (!editValue.trim()) {
          toast({ title: "Error", description: "Username cannot be empty", variant: "destructive" });
          return;
        }
        const { error } = await supabase
          .from("profiles")
          .update({ username: editValue.trim() })
          .eq("user_id", user.id);
        if (error) throw error;
        setProfile(prev => prev ? { ...prev, username: editValue.trim() } : null);
        toast({ title: "Success", description: "Username updated successfully" });
      } else if (editField === "phone") {
        const { error } = await supabase
          .from("profiles")
          .update({ phone: editValue.trim() || null })
          .eq("user_id", user.id);
        if (error) throw error;
        setProfile(prev => prev ? { ...prev, phone: editValue.trim() || null } : null);
        toast({ title: "Success", description: "Mobile number updated successfully" });
      } else if (editField === "loginPassword") {
        if (newPassword !== confirmPassword) {
          toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
          return;
        }
        if (newPassword.length < 6) {
          toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast({ title: "Success", description: "Login password updated successfully" });
      } else if (editField === "securityPassword") {
        if (newPassword !== confirmPassword) {
          toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
          return;
        }
        if (newPassword.length < 4) {
          toast({ title: "Error", description: "Security password must be at least 4 characters", variant: "destructive" });
          return;
        }
        const { error } = await supabase
          .from("profiles")
          .update({ security_password_hash: newPassword })
          .eq("user_id", user.id);
        if (error) throw error;
        setProfile(prev => prev ? { ...prev, security_password_hash: newPassword } : null);
        toast({ title: "Success", description: "Security password updated successfully" });
      }
      setEditField(null);
    } catch (error: any) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: error.message || "Failed to save changes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Generate a numeric UID from user ID
  const uid = user?.id ? parseInt(user.id.replace(/-/g, '').slice(0, 8), 16).toString().slice(0, 6) : "000000";

  const InfoRow = ({ 
    label, 
    value, 
    isSet = true, 
    onClick,
    showArrow = true 
  }: { 
    label: string; 
    value: string; 
    isSet?: boolean; 
    onClick?: () => void;
    showArrow?: boolean;
  }) => (
    <div 
      className={`flex items-center justify-between py-4 border-b border-border/20 ${onClick ? 'cursor-pointer active:bg-secondary/30' : ''}`}
      onClick={onClick}
    >
      <span className="text-foreground font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${isSet ? 'text-foreground' : 'text-muted-foreground'}`}>
          {value}
        </span>
        {showArrow && onClick && (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border/30">
        <div className="flex items-center justify-center h-14 relative px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="absolute left-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Personal Info</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <InfoRow 
          label="Username" 
          value={loading ? "..." : profile?.username || "Unset"} 
          isSet={!!profile?.username}
          onClick={() => handleOpenEdit("username", profile?.username || "")}
        />
        
        <InfoRow 
          label="UID" 
          value={uid} 
          showArrow={false}
        />
        
        <InfoRow 
          label="Real name" 
          value="Unset" 
          isSet={false}
          onClick={() => toast({ title: "Info", description: "Real name verification coming soon" })}
        />
        
        <InfoRow 
          label="Mobile" 
          value={profile?.phone || "Unset"} 
          isSet={!!profile?.phone}
          onClick={() => handleOpenEdit("phone", profile?.phone || "")}
        />
        
        <InfoRow 
          label="Email" 
          value={user?.email || "Unset"} 
          isSet={!!user?.email}
          showArrow={false}
        />
        
        <InfoRow 
          label="Login Password" 
          value="••••••" 
          onClick={() => handleOpenEdit("loginPassword", "")}
        />
        
        <InfoRow 
          label="Security Password" 
          value={profile?.security_password_hash ? "••••••" : "Unset"} 
          isSet={!!profile?.security_password_hash}
          onClick={() => handleOpenEdit("securityPassword", "")}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editField} onOpenChange={(open) => !open && setEditField(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editField === "username" && "Edit Username"}
              {editField === "phone" && "Edit Mobile Number"}
              {editField === "loginPassword" && "Change Login Password"}
              {editField === "securityPassword" && (profile?.security_password_hash ? "Change Security Password" : "Set Security Password")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {(editField === "username" || editField === "phone") && (
              <div className="space-y-2">
                <Label>{editField === "username" ? "Username" : "Mobile Number"}</Label>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={editField === "username" ? "Enter username" : "Enter mobile number"}
                  type={editField === "phone" ? "tel" : "text"}
                />
              </div>
            )}
            
            {(editField === "loginPassword" || editField === "securityPassword") && (
              <>
                {editField === "loginPassword" && (
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={`Enter new ${editField === "securityPassword" ? "security " : ""}password`}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditField(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalInfo;
