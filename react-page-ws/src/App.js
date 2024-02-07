import React, { useState } from "react";
import "./App.css";

function App() {
  const [pesquisa, setPesquisa] = useState("");
  const [carregamento, setCarregamento] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (event) => {
    setPesquisa(event.target.value);
  };

  const handleSubmit = () => {
    setCarregamento(true);
    fetch(`http://localhost:3000/pesquisar?termo=${pesquisa}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Resultados da pesquisa:", data);
        setCarregamento(false);
        setError("");
      })
      .catch((error) => {
        console.error("Erro ao fazer a pesquisa:", error);
        setCarregamento(false);
        setError(
          "Ocorreu um erro ao fazer a pesquisa. Por favor, tente novamente."
        );
      });
  };

  return (
    <div className="app">
      <main className="main">
        <h1>Web Scraping</h1>
        {error && <p className="error">{error}</p>}
        <p>Digite aqui a pesquisa desejada:</p>
        <input
          type="text"
          className="input"
          value={pesquisa}
          onChange={handleInputChange}
          placeholder="Digite sua pesquisa..."
        />
        <button className="buttonInput" onClick={handleSubmit}>
          Pesquisar
        </button>
        {carregamento && <div className="carregamento">Carregando...</div>}
      </main>
    </div>
  );
}

export default App;
