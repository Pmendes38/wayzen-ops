import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Clients from "./pages/Clients";
import Funnels from "./pages/Funnels";
import Leads from "./pages/Leads";
import Sprints from "./pages/Sprints";
import Playbooks from "./pages/Playbooks";
import Preparacao from "./pages/Preparacao";
import PreparacaoProduto from "./pages/preparacao/Produto";
import PreparacaoICP from "./pages/preparacao/ICP";
import PreparacaoProcesso from "./pages/preparacao/Processo";
import PreparacaoOnboarding from "./pages/preparacao/Onboarding";
import PreparacaoAtividades from "./pages/preparacao/Atividades";
import PreparacaoSemanas from "./pages/preparacao/Semanas";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/clients"} component={Clients} />
      <Route path={"/funnels"} component={Funnels} />
      <Route path={"/leads"} component={Leads} />
      <Route path={"/sprints"} component={Sprints} />
      <Route path={"/playbooks"} component={Playbooks} />
      <Route path={"/preparacao"} component={Preparacao} />
      <Route path={"/preparacao/produto"} component={PreparacaoProduto} />
      <Route path={"/preparacao/icp"} component={PreparacaoICP} />
      <Route path={"/preparacao/processo"} component={PreparacaoProcesso} />
      <Route path={"/preparacao/onboarding"} component={PreparacaoOnboarding} />
      <Route path={"/preparacao/atividades"} component={PreparacaoAtividades} />
      <Route path={"/preparacao/cronograma"} component={PreparacaoSemanas} />
      <Route path={"/preparacao/semanas"} component={PreparacaoSemanas} />
      <Route path={"/404"} component={NotFound} />
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
