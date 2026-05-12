import { useState } from "react";
import "@/App.css";
import { Toaster } from "./components/ui/sonner";
import MainHub from "./game/MainHub";
import Shop from "./game/Shop";
import CharacterScreen from "./game/CharacterScreen";
import BiomeSelect from "./game/BiomeSelect";
import ProbabilityDungeon from "./game/ProbabilityDungeon";

function App() {
  const [screen, setScreen] = useState("hub");
  const [biomeId, setBiomeId] = useState(null);
  const [level, setLevel] = useState(1);

  return (
    <div className="App" data-testid="app-root">
      {screen === "hub" && (
        <MainHub
          onEnterDungeon={() => setScreen("biome")}
          onOpenShop={() => setScreen("shop")}
          onOpenCharacter={() => setScreen("character")}
        />
      )}
      {screen === "shop" && <Shop onBack={() => setScreen("hub")} />}
      {screen === "character" && <CharacterScreen onBack={() => setScreen("hub")} />}
      {screen === "biome" && (
        <BiomeSelect
          onPick={(id, lvl) => { setBiomeId(id); setLevel(lvl); setScreen("dungeon"); }}
          onBack={() => setScreen("hub")}
        />
      )}
      {screen === "dungeon" && (
        <ProbabilityDungeon
          biomeId={biomeId}
          level={level}
          onExit={() => setScreen("biome")}
        />
      )}
      <Toaster />
    </div>
  );
}

export default App;
