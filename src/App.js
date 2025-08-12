import React from "react";
import "./App.css";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Home />
      </main>
      <footer className="footer">
        Built with ❤️ — Wildlife Facts • Data: public API + bundled dataset
      </footer>
    </div>
  );
}

export default App;