const pup = require("puppeteer");
const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/pesquisar", async (req, res) => {
  const pesquisaPor = req.query.termo;

  try {
    console.log(
      "Requisição de pesquisa recebida. Termo de pesquisa:",
      pesquisaPor
    );

    const navegador = await pup.launch();
    const pagina = await navegador.newPage();
    await pagina.goto(`https://www.mercadolivre.com.br/`);
    console.log("Página inicial carregada.");
    await pagina.waitForSelector("#cb1-edit");
    console.log("Campo de pesquisa encontrado.");
    await pagina.type("#cb1-edit", pesquisaPor);
    console.log("Termo de pesquisa inserido:", pesquisaPor);
    await Promise.all([
      pagina.waitForNavigation(),
      pagina.click(".nav-search-btn"),
    ]);
    console.log("Pesquisa realizada.");
    await pagina.waitForSelector(".ui-search-result__content");
    console.log("Resultados da pesquisa carregados.");

    let dadosCSV = "Título do Produto,Preço do Produto\n";

    const resultados = await pagina.$$(".ui-search-result__content");

    for (const resultado of resultados) {
      const linkProduto = await resultado.$eval(
        "a.ui-search-link",
        (element) => element.href
      );
      console.log("Link do produto:", linkProduto);
      await pagina.goto(linkProduto);
      console.log("Página do produto carregada.");
      await pagina.waitForSelector("h1.ui-pdp-title");
      console.log("Título do produto encontrado.");

      const tituloProduto = await pagina.$eval("h1.ui-pdp-title", (element) =>
        element.textContent.trim().toUpperCase()
      );
      console.log("Título do produto:", tituloProduto);

      let precoProduto = "Preço não encontrado";
      const precoElement = await pagina.waitForSelector("[data-testid='price-part']", { timeout: 5000 }); // Aumentar o tempo de espera para o elemento de preço
      if (precoElement) {
        precoProduto = await precoElement.evaluate((element) =>
          element.textContent.trim()
        );
      }
      console.log("Preço do produto:", precoProduto);

      dadosCSV += `"${tituloProduto}","${precoProduto}"\n`;
    }

    await navegador.close();

    fs.writeFileSync("resultados.csv", dadosCSV, "utf-8");

    res.send({ message: "Pesquisa concluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao realizar a pesquisa:", error);
    res.status(500).send({ error: "Ocorreu um erro ao realizar a pesquisa." });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
