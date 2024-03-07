import React, { useState, useEffect } from "react";
import "./App.css";

function PopUp({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p className="cookieHeading">Atenção!</p>
        <p className="cookieDescription">
          Ao final do processo, irá acontecer um download direto! Você está de
          acordo?
        </p>

        <div className="buttonContainer">
          <button className="acceptButton" onClick={onClose}>
            Sim!
          </button>
          <button disabled className="declineButton" onClick={onClose}>
            Não!
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [pesquisa, setPesquisa] = useState("");
  const [carregamento, setCarregamento] = useState(false);
  const [error, setError] = useState("");
  const [popUp, setPopUp] = useState(false);

  useEffect(() => {
    setPopUp(true);
  }, []);

  const handleInputChange = (event) => {
    setPesquisa(event.target.value);
  };

  function handleKeyPress(event) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  }

  const handleSubmit = () => {
    setCarregamento(true);
    fetch(`http://localhost:3000/pesquisar?termo=${pesquisa}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Resultados da pesquisa:", data);
        setCarregamento(false);
        setError("");
        downloadCSV();
      })

      .catch((error) => {
        console.error("Erro ao fazer a pesquisa:", error);
        setCarregamento(false);
        setError(
          "Ocorreu um erro ao fazer a pesquisa. Por favor, tente novamente."
        );
      });
  };

  const downloadCSV = () => {
    const link = document.createElement("a");
    link.href = "resultado.csv";
    console.log(link.href + " link href");
    link.download = "resultados.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClosePopUp = () => {
    setPopUp(false);
  };

  return (
    <div className="app">
      {popUp && <PopUp onClose={handleClosePopUp} />}
      <main className="main">
        <h1>Web Scraping</h1>
        {error && <p className="error">{error}</p>}
        <p>Digite aqui a pesquisa desejada:</p>
        <input
          type="text"
          className="input"
          value={pesquisa}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
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
