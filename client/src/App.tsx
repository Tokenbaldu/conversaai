import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Flows from "./pages/Flows";
import FlowBuilder from "./pages/FlowBuilder";
import Contacts from "./pages/Contacts";
import Automations from "./pages/Automations";
import Broadcasts from "./pages/Broadcasts";
import Inbox from "./pages/Inbox";
import Analytics from "./pages/Analytics";
import Templates from "./pages/Templates";
import Channels from "./pages/Channels";
import Plans from "./pages/Plans";
import AIPage from "./pages/AIPage";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminPlans from "./pages/AdminPlans";
import AdminStripe from "./pages/AdminStripe";
import AdminSettings from "./pages/AdminSettings";
import AdminDatabase from "./pages/AdminDatabase";
import AdminPagBank from "./pages/AdminPagBank";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/flows" component={Flows} />
      <Route path="/flows/new" component={FlowBuilder} />
      <Route path="/flows/:id" component={FlowBuilder} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/automations" component={Automations} />
      <Route path="/broadcasts" component={Broadcasts} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/templates" component={Templates} />
      <Route path="/channels" component={Channels} />
      <Route path="/plans" component={Plans} />
      <Route path="/ai" component={AIPage} />
      <Route path="/settings" component={Settings} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/plans" component={AdminPlans} />
      <Route path="/admin/stripe" component={AdminStripe} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/database" component={AdminDatabase} />
      <Route path="/admin/pagbank" component={AdminPagBank} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
