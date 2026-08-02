import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';

import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import CreateResource from '@/pages/CreateResource';
import History from '@/pages/History';
import Account from '@/pages/Account';

import { ThemeProvider } from '@/components/theme-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <AppLayout><Dashboard /></AppLayout>
      </Route>
      <Route path="/create">
        <AppLayout><CreateResource /></AppLayout>
      </Route>
      <Route path="/history">
        <AppLayout><History /></AppLayout>
      </Route>
      <Route path="/account">
        <AppLayout><Account /></AppLayout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
