// Criado por Guilherme Duffes 04/03/2024 14h30.

const puppeteer = require("puppeteer");
const express = require("express");
const fs = require("fs");
const cheerio = require("cheerio");
const app = express();
const port = 3000;
const cors = require("cors");

app.use(cors());
const url = "https://www.mercadolivre.com.br/";

app.use(express.json());

app.get("/pesquisar", async (req, res) => {
  const pesquisaPor = req.query.termo;

  const nomeArquivo = "resultados.csv";
  try {
    console.log(
      "Requisição de pesquisa recebida. Termo de pesquisa:",
      pesquisaPor
    );

    const navegador = await puppeteer.launch({ headless: false });
    const pagina = await navegador.newPage();
    await pagina.goto(url);

    await pagina.waitForSelector(".nav-search-input");
    await pagina.type(".nav-search-input", pesquisaPor);
    await Promise.all([
      pagina.waitForNavigation(),
      pagina.click(".nav-search-btn"),
    ]);
    await pagina.waitForSelector(".ui-search-layout__item");

    const html = await pagina.content();
    const $ = cheerio.load(html);

    const dadosCSV = await extrairDadosProdutos($);

    await navegador.close();

    fs.writeFileSync(nomeArquivo, dadosCSV, "utf-8");

    console.log("Dados salvos em", nomeArquivo);
    res.send({ message: "Pesquisa concluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao realizar a pesquisa:", error);
    res.status(500).send({ error: "Ocorreu um erro ao realizar a pesquisa." });
  }
});

async function extrairDadosProdutos($) {
  let dadosCSV = "Título do Produto,Preço do Produto\n";

  $(".ui-search-layout__item").each((i, elemento) => {
    // const linkProduto = $(elemento).find(".ui-search-link").attr("href");
    const tituloProduto = $(elemento)
      .find(".ui-search-item__title")
      .text()
      .trim()
      .toUpperCase();
    const precoProduto = $(elemento)
      .find(
        "span.andes-money-amount.ui-search-price__part.ui-search-price__part--medium.andes-money-amount--cents-superscript"
      )
      .text()
      .trim();

    dadosCSV += `"${tituloProduto}","${precoProduto}"\n`;
  });

  return dadosCSV;
}

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
