import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Plus, Trash2, CreditCard, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type DepositMethod = "usdt" | "easypaisa" | "jazzcash" | "paytm" | "googlepay" | "phonepay" | "binance";

interface PaymentSetting {
  id: string;
  method: DepositMethod;
  is_active: boolean;
  account_name: string;
  account_number: string;
  bank_name: string | null;
  ifsc_code: string | null;
  wallet_address: string | null;
  network: string | null;
  qr_code_url: string | null;
  additional_info: string | null;
}

const methodLabels: Record<DepositMethod, string> = {
  usdt: "USDT",
  easypaisa: "Easypaisa",
  jazzcash: "JazzCash",
  paytm: "Paytm",
  googlepay: "Google Pay",
  phonepay: "PhonePe",
  binance: "Binance Pay",
};

const methodIcons: Record<DepositMethod, string> = {
  usdt: "💰",
  easypaisa: "📱",
  jazzcash: "📲",
  paytm: "💳",
  googlepay: "🔷",
  phonepay: "📞",
  binance: "🟡",
};

const allMethods: DepositMethod[] = ["usdt", "easypaisa", "jazzcash", "paytm", "googlepay", "phonepay", "binance"];

const PaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // New payment form state
  const [newMethod, setNewMethod] = useState<DepositMethod | "">("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newBankName, setNewBankName] = useState("");
  const [newIfscCode, setNewIfscCode] = useState("");
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [newNetwork, setNewNetwork] = useState("");
  const [newAdditionalInfo, setNewAdditionalInfo] = useState("");

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .order("method");

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getAvailableMethods = () => {
    const usedMethods = settings.map((s) => s.method);
    return allMethods.filter((m) => !usedMethods.includes(m));
  };

  const handleAddPayment = async () => {
    if (!newMethod || !newAccountName.trim() || !newAccountNumber.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in method, account name, and account number",
        variant: "destructive",
      });
      return;
    }

    setSaving("new");
    try {
      const { error } = await supabase.from("payment_settings").insert({
        method: newMethod,
        account_name: newAccountName.trim(),
        account_number: newAccountNumber.trim(),
        bank_name: newBankName.trim() || null,
        ifsc_code: newIfscCode.trim() || null,
        wallet_address: newWalletAddress.trim() || null,
        network: newNetwork.trim() || null,
        additional_info: newAdditionalInfo.trim() || null,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Payment method added",
        description: `${methodLabels[newMethod]} has been configured`,
      });

      // Reset form
      setNewMethod("");
      setNewAccountName("");
      setNewAccountNumber("");
      setNewBankName("");
      setNewIfscCode("");
      setNewWalletAddress("");
      setNewNetwork("");
      setNewAdditionalInfo("");
      setDialogOpen(false);
      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Error adding payment method",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleToggleActive = async (setting: PaymentSetting) => {
    setSaving(setting.id);
    try {
      const { error } = await supabase
        .from("payment_settings")
        .update({ is_active: !setting.is_active })
        .eq("id", setting.id);

      if (error) throw error;

      setSettings((prev) =>
        prev.map((s) =>
          s.id === setting.id ? { ...s, is_active: !s.is_active } : s
        )
      );

      toast({
        title: setting.is_active ? "Payment method disabled" : "Payment method enabled",
        description: `${methodLabels[setting.method]} is now ${setting.is_active ? "inactive" : "active"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating setting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (setting: PaymentSetting) => {
    if (!confirm(`Are you sure you want to delete ${methodLabels[setting.method]}?`)) {
      return;
    }

    setSaving(setting.id);
    try {
      const { error } = await supabase
        .from("payment_settings")
        .delete()
        .eq("id", setting.id);

      if (error) throw error;

      setSettings((prev) => prev.filter((s) => s.id !== setting.id));

      toast({
        title: "Payment method deleted",
        description: `${methodLabels[setting.method]} has been removed`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting setting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleUpdateField = async (id: string, field: string, value: string) => {
    setSaving(id);
    try {
      const { error } = await supabase
        .from("payment_settings")
        .update({ [field]: value.trim() || null })
        .eq("id", id);

      if (error) throw error;

      setSettings((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, [field]: value.trim() || null } : s
        )
      );
    } catch (error: any) {
      toast({
        title: "Error updating",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const isCryptoMethod = (method: DepositMethod) => 
    ["usdt", "binance"].includes(method);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payment Settings</h1>
            <p className="text-muted-foreground">
              Configure your receiving accounts for each payment method
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={getAvailableMethods().length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={newMethod} onValueChange={(v) => setNewMethod(v as DepositMethod)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMethods().map((method) => (
                        <SelectItem key={method} value={method}>
                          {methodIcons[method]} {methodLabels[method]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Account Name / Owner</Label>
                  <Input
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Enter account holder name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Number / ID</Label>
                  <Input
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>

                {newMethod && !isCryptoMethod(newMethod as DepositMethod) && (
                  <>
                    <div className="space-y-2">
                      <Label>Bank Name (Optional)</Label>
                      <Input
                        value={newBankName}
                        onChange={(e) => setNewBankName(e.target.value)}
                        placeholder="Enter bank name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>IFSC Code (Optional)</Label>
                      <Input
                        value={newIfscCode}
                        onChange={(e) => setNewIfscCode(e.target.value)}
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </>
                )}

                {newMethod && isCryptoMethod(newMethod as DepositMethod) && (
                  <>
                    <div className="space-y-2">
                      <Label>Wallet Address</Label>
                      <Input
                        value={newWalletAddress}
                        onChange={(e) => setNewWalletAddress(e.target.value)}
                        placeholder="Enter wallet address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Network (e.g., TRC20, ERC20)</Label>
                      <Input
                        value={newNetwork}
                        onChange={(e) => setNewNetwork(e.target.value)}
                        placeholder="Enter network"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Additional Instructions (Optional)</Label>
                  <Textarea
                    value={newAdditionalInfo}
                    onChange={(e) => setNewAdditionalInfo(e.target.value)}
                    placeholder="Any additional info for users"
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleAddPayment}
                  disabled={saving === "new"}
                  className="w-full"
                >
                  {saving === "new" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Payment Method
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {settings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Payment Methods Configured
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first payment method to start receiving deposits
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {settings.map((setting) => (
              <Card key={setting.id} className={!setting.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{methodIcons[setting.method]}</span>
                      <CardTitle className="text-lg">{methodLabels[setting.method]}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={setting.is_active}
                        onCheckedChange={() => handleToggleActive(setting)}
                        disabled={saving === setting.id}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(setting)}
                        disabled={saving === setting.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Account Name</Label>
                    <Input
                      value={setting.account_name}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev.map((s) =>
                            s.id === setting.id ? { ...s, account_name: e.target.value } : s
                          )
                        )
                      }
                      onBlur={(e) => handleUpdateField(setting.id, "account_name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Account Number</Label>
                    <Input
                      value={setting.account_number}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev.map((s) =>
                            s.id === setting.id ? { ...s, account_number: e.target.value } : s
                          )
                        )
                      }
                      onBlur={(e) => handleUpdateField(setting.id, "account_number", e.target.value)}
                    />
                  </div>

                  {!isCryptoMethod(setting.method) && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Bank Name</Label>
                        <Input
                          value={setting.bank_name || ""}
                          onChange={(e) =>
                            setSettings((prev) =>
                              prev.map((s) =>
                                s.id === setting.id ? { ...s, bank_name: e.target.value } : s
                              )
                            )
                          }
                          onBlur={(e) => handleUpdateField(setting.id, "bank_name", e.target.value)}
                          placeholder="Optional"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">IFSC Code</Label>
                        <Input
                          value={setting.ifsc_code || ""}
                          onChange={(e) =>
                            setSettings((prev) =>
                              prev.map((s) =>
                                s.id === setting.id ? { ...s, ifsc_code: e.target.value } : s
                              )
                            )
                          }
                          onBlur={(e) => handleUpdateField(setting.id, "ifsc_code", e.target.value)}
                          placeholder="Optional"
                        />
                      </div>
                    </>
                  )}

                  {isCryptoMethod(setting.method) && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Wallet Address</Label>
                        <Input
                          value={setting.wallet_address || ""}
                          onChange={(e) =>
                            setSettings((prev) =>
                              prev.map((s) =>
                                s.id === setting.id ? { ...s, wallet_address: e.target.value } : s
                              )
                            )
                          }
                          onBlur={(e) => handleUpdateField(setting.id, "wallet_address", e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Network</Label>
                        <Input
                          value={setting.network || ""}
                          onChange={(e) =>
                            setSettings((prev) =>
                              prev.map((s) =>
                                s.id === setting.id ? { ...s, network: e.target.value } : s
                              )
                            )
                          }
                          onBlur={(e) => handleUpdateField(setting.id, "network", e.target.value)}
                          placeholder="TRC20, ERC20, etc."
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Additional Info</Label>
                    <Textarea
                      value={setting.additional_info || ""}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev.map((s) =>
                            s.id === setting.id ? { ...s, additional_info: e.target.value } : s
                          )
                        )
                      }
                      onBlur={(e) => handleUpdateField(setting.id, "additional_info", e.target.value)}
                      rows={2}
                      placeholder="Optional instructions"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentSettings;
