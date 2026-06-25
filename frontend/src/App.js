import "@/App.css";
import { Toaster } from "sonner";
import LandingPage from "@/pages/LandingPage";
import InvestorsPage from "@/pages/InvestorsPage";

function App() {
  const page = window.location.pathname === "/investors" ? <InvestorsPage /> : <LandingPage />;

  return (
    <>
      {page}
      <Toaster position="bottom-center" theme="light" />
    </>
  );
}

export default App;
