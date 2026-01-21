import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Globe, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface IpLog {
  id: string;
  ip_address: string;
  device_info: string | null;
  logged_in_at: string;
  user_id: string;
  username?: string;
}

interface IpAccountResult {
  ip_address: string;
  accounts: { user_id: string; username: string }[];
  is_duplicate: boolean;
}

const MemberIP = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"username" | "ip">("username");
  const [ipLogs, setIpLogs] = useState<IpLog[]>([]);
  const [ipAccounts, setIpAccounts] = useState<IpAccountResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [memberUsername, setMemberUsername] = useState("");
  const { toast } = useToast();

  const searchByUsername = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setIpAccounts([]);
    try {
      // Find the user
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, username")
        .ilike("username", `%${searchQuery}%`)
        .single();

      if (!profile) {
        toast({
          title: "User not found",
          description: "No user found with that username",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setMemberUsername(profile.username);

      // Get IP logs for this user
      const { data: logs, error } = await supabase
        .from("ip_logs")
        .select("*")
        .eq("user_id", profile.user_id)
        .order("logged_in_at", { ascending: false });

      if (error) throw error;

      // Check for duplicate IPs (IPs used by multiple accounts)
      const uniqueIps = [...new Set(logs?.map((l) => l.ip_address) || [])];
      const ipResults: IpAccountResult[] = [];

      for (const ip of uniqueIps) {
        const { data: ipLogsByIp } = await supabase
          .from("ip_logs")
          .select("user_id")
          .eq("ip_address", ip);

        const uniqueUserIds = [...new Set(ipLogsByIp?.map((l) => l.user_id) || [])];

        if (uniqueUserIds.length > 1) {
          // Get usernames for all accounts
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, username")
            .in("user_id", uniqueUserIds);

          ipResults.push({
            ip_address: ip,
            accounts: profiles || [],
            is_duplicate: true,
          });
        }
      }

      setIpLogs(logs || []);
      setIpAccounts(ipResults);
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

  const searchByIP = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setIpLogs([]);
    try {
      // Get all logs for this IP
      const { data: logs, error } = await supabase
        .from("ip_logs")
        .select("*")
        .eq("ip_address", searchQuery.trim())
        .order("logged_in_at", { ascending: false });

      if (error) throw error;

      if (!logs || logs.length === 0) {
        toast({
          title: "No results",
          description: "No accounts found for this IP address",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const uniqueUserIds = [...new Set(logs.map((l) => l.user_id))];

      // Get usernames
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", uniqueUserIds);

      // Map usernames to logs
      const logsWithUsernames = logs.map((log) => ({
        ...log,
        username: profiles?.find((p) => p.user_id === log.user_id)?.username || "Unknown",
      }));

      setIpLogs(logsWithUsernames);
      setIpAccounts([
        {
          ip_address: searchQuery.trim(),
          accounts: profiles || [],
          is_duplicate: uniqueUserIds.length > 1,
        },
      ]);
      setMemberUsername("");
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

  const handleSearch = () => {
    if (searchType === "username") {
      searchByUsername();
    } else {
      searchByIP();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member IP Tracking</h1>
          <p className="text-muted-foreground">Track login IPs and detect duplicate accounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search
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
                variant={searchType === "ip" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchType("ip")}
              >
                By IP Address
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={
                  searchType === "username" ? "Enter username..." : "Enter IP address..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Duplicate IP Warning */}
        {ipAccounts.filter((ip) => ip.is_duplicate).length > 0 && (
          <Card className="border-red-500/50 bg-red-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Duplicate IP Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ipAccounts
                  .filter((ip) => ip.is_duplicate)
                  .map((ip) => (
                    <div key={ip.ip_address} className="p-3 bg-background rounded-lg">
                      <p className="font-mono text-red-500 font-medium">{ip.ip_address}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Accounts using this IP:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ip.accounts.map((acc) => (
                          <Badge key={acc.user_id} variant="secondary">
                            {acc.username}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {ipLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {memberUsername ? `IP Logs for ${memberUsername}` : "IP Logs"} ({ipLogs.length}{" "}
                entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    {searchType === "ip" && <TableHead>Username</TableHead>}
                    <TableHead>IP Address</TableHead>
                    <TableHead>Device Info</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipLogs.map((log) => {
                    const isDuplicate = ipAccounts.some(
                      (ip) => ip.ip_address === log.ip_address && ip.is_duplicate
                    );
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.logged_in_at), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        {searchType === "ip" && (
                          <TableCell className="font-medium">{log.username}</TableCell>
                        )}
                        <TableCell
                          className={`font-mono ${isDuplicate ? "text-red-500 font-medium" : ""}`}
                        >
                          {log.ip_address}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.device_info || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {isDuplicate ? (
                            <Badge variant="destructive">Duplicate</Badge>
                          ) : (
                            <Badge variant="secondary">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default MemberIP;
