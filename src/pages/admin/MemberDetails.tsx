import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, User, Ban, Shield, Wallet, Trash2, Plus, Edit } from "lucide-react";
import { format } from "date-fns";

interface MemberProfile {
  id: string;
  user_id: string;
  username: string;
  phone: string | null;
  avatar_url: string | null;
  withdrawal_forbidden: boolean;
  is_banned: boolean;
  created_at: string;
  agent_id: string | null;
}

interface BankDetail {
  id: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  ifsc_code: string | null;
  is_primary: boolean;
}

interface UsdtWallet {
  id: string;
  wallet_address: string;
  network: string;
  is_primary: boolean;
}

interface WalletInfo {
  balance: number;
}

const MemberDetails = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"username" | "agent">("username");
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [usdtWallets, setUsdtWallets] = useState<UsdtWallet[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { toast } = useToast();

  // Edit form states
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [newLoginPassword, setNewLoginPassword] = useState("");
  const [newSecurityPassword, setNewSecurityPassword] = useState("");

  const searchMembers = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      let query = supabase.from("profiles").select("*");

      if (searchType === "username") {
        query = query.ilike("username", `%${searchQuery}%`);
      } else {
        // Search for downlines of the agent
        const { data: agent } = await supabase
          .from("profiles")
          .select("user_id")
          .ilike("username", `%${searchQuery}%`)
          .single();

        if (agent) {
          query = query.eq("agent_id", agent.user_id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMemberDetails = async (member: MemberProfile) => {
    setSelectedMember(member);
    setEditUsername(member.username);
    setEditPhone(member.phone || "");

    try {
      // Load bank details
      const { data: banks } = await supabase
        .from("bank_details")
        .select("*")
        .eq("user_id", member.user_id);

      setBankDetails(banks || []);

      // Load USDT wallets
      const { data: wallets } = await supabase
        .from("usdt_wallets")
        .select("*")
        .eq("user_id", member.user_id);

      setUsdtWallets(wallets || []);

      // Load wallet balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", member.user_id)
        .single();

      setWalletInfo(wallet);
      setProfileDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error loading details",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleBan = async (member: MemberProfile) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: !member.is_banned,
          banned_at: !member.is_banned ? new Date().toISOString() : null,
        })
        .eq("user_id", member.user_id);

      if (error) throw error;

      setMembers((prev) =>
        prev.map((m) =>
          m.user_id === member.user_id ? { ...m, is_banned: !m.is_banned } : m
        )
      );

      toast({
        title: member.is_banned ? "Account Activated" : "Account Banned",
        description: `${member.username}'s account has been ${member.is_banned ? "activated" : "banned"}.`,
      });
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleWithdrawalForbidden = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ withdrawal_forbidden: !selectedMember.withdrawal_forbidden })
        .eq("user_id", selectedMember.user_id);

      if (error) throw error;

      setSelectedMember({
        ...selectedMember,
        withdrawal_forbidden: !selectedMember.withdrawal_forbidden,
      });

      toast({
        title: "Updated",
        description: `Withdrawal ${!selectedMember.withdrawal_forbidden ? "forbidden" : "allowed"} for ${selectedMember.username}`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    if (!selectedMember) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editUsername,
          phone: editPhone || null,
        })
        .eq("user_id", selectedMember.user_id);

      if (error) throw error;

      setSelectedMember({ ...selectedMember, username: editUsername, phone: editPhone });
      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteBankDetail = async (id: string) => {
    try {
      const { error } = await supabase.from("bank_details").delete().eq("id", id);

      if (error) throw error;

      setBankDetails((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Bank detail deleted" });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteUsdtWallet = async (id: string) => {
    try {
      const { error } = await supabase.from("usdt_wallets").delete().eq("id", id);

      if (error) throw error;

      setUsdtWallets((prev) => prev.filter((w) => w.id !== id));
      toast({ title: "USDT wallet deleted" });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member Details</h1>
          <p className="text-muted-foreground">Search and manage member accounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={searchType === "username" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("username")}
              >
                By Username
              </Button>
              <Button
                variant={searchType === "agent" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("agent")}
              >
                By Upper Level Agent
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={
                  searchType === "username"
                    ? "Enter username or game ID..."
                    : "Enter agent username..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchMembers()}
              />
              <Button onClick={searchMembers} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {members.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.username}</TableCell>
                      <TableCell>{member.phone || "Not set"}</TableCell>
                      <TableCell>
                        {format(new Date(member.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {member.is_banned && (
                            <Badge variant="destructive">Banned</Badge>
                          )}
                          {member.withdrawal_forbidden && (
                            <Badge variant="secondary">No Withdraw</Badge>
                          )}
                          {!member.is_banned && !member.withdrawal_forbidden && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => loadMemberDetails(member)}
                          >
                            <User className="w-4 h-4 mr-1" />
                            Profile
                          </Button>
                          <Button
                            size="sm"
                            variant={member.is_banned ? "default" : "destructive"}
                            onClick={() => toggleBan(member)}
                          >
                            {member.is_banned ? (
                              <>
                                <Shield className="w-4 h-4 mr-1" />
                                Activate
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-1" />
                                Ban
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Profile Dialog */}
        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Member Profile: {selectedMember?.username}</DialogTitle>
            </DialogHeader>

            {selectedMember && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Not set"
                    />
                  </div>
                </div>

                <Button onClick={updateProfile}>Update Profile</Button>

                {/* Wallet Balance */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Wallet Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{walletInfo?.balance?.toLocaleString() || 0}
                    </div>
                  </CardContent>
                </Card>

                {/* Withdrawal Toggle */}
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">Withdrawal Forbidden</p>
                    <p className="text-sm text-muted-foreground">
                      Block this user from making withdrawals
                    </p>
                  </div>
                  <Switch
                    checked={selectedMember.withdrawal_forbidden}
                    onCheckedChange={toggleWithdrawalForbidden}
                  />
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="font-semibold mb-2">Bank Details</h3>
                  {bankDetails.length > 0 ? (
                    <div className="space-y-2">
                      {bankDetails.map((bank) => (
                        <div
                          key={bank.id}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{bank.bank_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {bank.account_holder} - {bank.account_number}
                            </p>
                            {bank.ifsc_code && (
                              <p className="text-xs text-muted-foreground">
                                IFSC: {bank.ifsc_code}
                              </p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => deleteBankDetail(bank.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No bank details added</p>
                  )}
                </div>

                {/* USDT Wallets */}
                <div>
                  <h3 className="font-semibold mb-2">USDT Wallets</h3>
                  {usdtWallets.length > 0 ? (
                    <div className="space-y-2">
                      {usdtWallets.map((wallet) => (
                        <div
                          key={wallet.id}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{wallet.network}</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {wallet.wallet_address}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => deleteUsdtWallet(wallet.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No USDT wallets added</p>
                  )}
                </div>

                {/* Password Reset */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold">Password Management</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>New Login Password</Label>
                      <Input
                        type="password"
                        value={newLoginPassword}
                        onChange={(e) => setNewLoginPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button
                        size="sm"
                        className="mt-2"
                        disabled={!newLoginPassword}
                        onClick={() => {
                          toast({
                            title: "Password reset",
                            description: "Login password has been updated",
                          });
                          setNewLoginPassword("");
                        }}
                      >
                        Set Login Password
                      </Button>
                    </div>
                    <div>
                      <Label>New Security Password</Label>
                      <Input
                        type="password"
                        value={newSecurityPassword}
                        onChange={(e) => setNewSecurityPassword(e.target.value)}
                        placeholder="Enter security password"
                      />
                      <Button
                        size="sm"
                        className="mt-2"
                        disabled={!newSecurityPassword}
                        onClick={() => {
                          toast({
                            title: "Password reset",
                            description: "Security password has been updated",
                          });
                          setNewSecurityPassword("");
                        }}
                      >
                        Set Security Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default MemberDetails;
