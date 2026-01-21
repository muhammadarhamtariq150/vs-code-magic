import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GemsMines from "./pages/games/GemsMines";
import SOS from "./pages/games/SOS";
import Lottery from "./pages/games/Lottery";
import HighOrLow from "./pages/games/HighOrLow";
import Blackjack21 from "./pages/games/Blackjack21";
import Slots777 from "./pages/games/Slots777";
import LoveSlots from "./pages/games/LoveSlots";
import Crazy777 from "./pages/games/Crazy777";
import Jackpot from "./pages/games/Jackpot";
import F1Formula from "./pages/games/F1Formula";
import Plinko from "./pages/games/Plinko";
import Wingo from "./pages/games/Wingo";
import Aviator from "./pages/games/Aviator";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import MemberDetails from "./pages/admin/MemberDetails";
import MemberFinancialRecords from "./pages/admin/MemberFinancialRecords";
import BettingRecords from "./pages/admin/BettingRecords";
import MemberIP from "./pages/admin/MemberIP";
import FastPaymentCheck from "./pages/admin/FastPaymentCheck";
import Adjustment from "./pages/admin/Adjustment";
import WagerAdjustment from "./pages/admin/WagerAdjustment";
import WithdrawalManagement from "./pages/admin/WithdrawalManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/games/gems-mines" element={<GemsMines />} />
          <Route path="/games/sos" element={<SOS />} />
          <Route path="/games/lottery" element={<Lottery />} />
          <Route path="/games/high-or-low" element={<HighOrLow />} />
          <Route path="/games/21" element={<Blackjack21 />} />
          <Route path="/games/slots-777" element={<Slots777 />} />
          <Route path="/games/love-slots" element={<LoveSlots />} />
          <Route path="/games/crazy-777" element={<Crazy777 />} />
          <Route path="/games/jackpot" element={<Jackpot />} />
          <Route path="/games/f1-formula" element={<F1Formula />} />
          <Route path="/games/plinko" element={<Plinko />} />
          <Route path="/games/wingo" element={<Wingo />} />
          <Route path="/games/aviator" element={<Aviator />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/members" element={<MemberDetails />} />
          <Route path="/admin/members/financial" element={<MemberFinancialRecords />} />
          <Route path="/admin/members/betting" element={<BettingRecords />} />
          <Route path="/admin/members/ip" element={<MemberIP />} />
          <Route path="/admin/finance/deposits" element={<FastPaymentCheck />} />
          <Route path="/admin/finance/adjustment" element={<Adjustment />} />
          <Route path="/admin/finance/wager" element={<WagerAdjustment />} />
          <Route path="/admin/finance/withdrawal" element={<WithdrawalManagement />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
