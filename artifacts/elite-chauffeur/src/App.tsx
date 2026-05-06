import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "./pages/public/home";
import Fleet from "./pages/public/fleet";
import CarDetail from "./pages/public/car-detail";
import Services from "./pages/public/services";
import Book from "./pages/public/book";
import Contact from "./pages/public/contact";
import Terms from "./pages/public/terms";

import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import AdminReservations from "./pages/admin/reservations";
import AdminCalendar from "./pages/admin/calendar";
import AdminCars from "./pages/admin/cars";
import AdminDrivers from "./pages/admin/drivers";
import AdminPricing from "./pages/admin/pricing";
import AdminServices from "./pages/admin/services";
import AdminTerms from "./pages/admin/terms";
import AdminSettings from "./pages/admin/settings";
import AdminUsers from "./pages/admin/users";
import AdminTheme from "./pages/admin/theme";

import PublicLayout from "./components/layout/public-layout";
import AdminLayout from "./components/layout/admin-layout";
import AdminGuard from "./components/admin-guard";
import { AdminAuthProvider } from "./lib/admin-auth";
import { I18nProvider } from "./lib/i18n";
import { SiteSettingsProvider } from "./lib/site-settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/administration" nest>
        <Switch>
          <Route path="/login" component={AdminLogin} />
          <Route>
            <AdminGuard>
              <AdminLayout>
                <Switch>
                  <Route path="/" component={AdminDashboard} />
                  <Route path="/reservations" component={AdminReservations} />
                  <Route path="/calendar" component={AdminCalendar} />
                  <Route path="/cars" component={AdminCars} />
                  <Route path="/drivers" component={AdminDrivers} />
                  <Route path="/pricing" component={AdminPricing} />
                  <Route path="/services" component={AdminServices} />
                  <Route path="/terms" component={AdminTerms} />
                  <Route path="/users" component={AdminUsers} />
                  <Route path="/theme" component={AdminTheme} />
                  <Route path="/settings" component={AdminSettings} />
                  <Route component={NotFound} />
                </Switch>
              </AdminLayout>
            </AdminGuard>
          </Route>
        </Switch>
      </Route>
      <Route path="/" nest>
        <PublicLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/fleet" component={Fleet} />
            <Route path="/cars/:id" component={CarDetail} />
            <Route path="/services" component={Services} />
            <Route path="/book" component={Book} />
            <Route path="/contact" component={Contact} />
            <Route path="/terms" component={Terms} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <I18nProvider>
            <SiteSettingsProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
            </SiteSettingsProvider>
          </I18nProvider>
        </AdminAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
