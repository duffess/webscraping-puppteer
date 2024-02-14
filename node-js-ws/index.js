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

    const navegador = await pup.launch({
      headless: false,
    });

    const pagina = await navegador.newPage();
    await pagina.goto(`https://www.mercadolivre.com.br/`);
    await pagina.waitForSelector("#cb1-edit");
    await pagina.type("#cb1-edit", pesquisaPor);
    await Promise.all([
      pagina.waitForNavigation(),
      pagina.click(".nav-search-btn"),
    ]);
    await pagina.waitForSelector(
      ".ui-search-result__content"
    );

    let dadosCSV = "Título do Produto,Preço do Produto\n";

    const resultados = await pagina.$$(".ui-search-result__content");

    for (const resultado of resultados) {
      const linkProduto = await resultado.$eval(
        "a.ui-search-link",
        (element) => element.href
      );
      await pagina.goto(linkProduto);
      await pagina.waitForSelector("h1.ui-pdp-title");

      const tituloProduto = await pagina.$eval("h1.ui-pdp-title", (element) =>
        element.textContent.trim().toUpperCase()
      );

      const precoProduto = await pagina.$eval(
        "andes-money-amount.ui-pdp-price__part.andes-money-amount--cents-superscript.andes-money-amount--compact",
        (element) => element.textContent.trim()
      );

      dadosCSV += `"${tituloProduto}","${precoProduto}"\n`;

      console.log(tituloProduto);
      console.log(precoProduto);

      await pagina.goBack();
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
