import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProbabilityDungeon from "./game/ProbabilityDungeon";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App" data-testid="app-root">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProbabilityDungeon />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
