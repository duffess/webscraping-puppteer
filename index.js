const pup = require("puppeteer"); // importação do modulo puppeteer

const fs = require("fs");

const url = "https://www.mercadolivre.com.br/"; // url desejada

const pesquisaPor = "notebook"; // pesquisa desejada

const nomeArquivo = "resultados.csv";

let contador = 0;

(async () => {
  const navegador = await pup.launch({
    headless: true, // headless false significa que o navegador irá aparecer
  });

  const pagina = await navegador.newPage(); // criar uma nova pagina
  console.log("newPage e navegador funcionando!");

  await pagina.goto(url); // ir para a url

  await pagina.waitForSelector("#cb1-edit"); // esperar o seletor de pesquisa carregar

  await pagina.type("#cb1-edit", pesquisaPor); // pesquisar o que foi escrito na variavel

  await Promise.all([
    pagina.waitForNavigation(), // espera da pagina ir até a prox pagina
    pagina.click(".nav-search-btn"), // clique no botao de pesquisa
  ]);

  await pagina.waitForSelector(".ui-search-result__content"); // espera do seletor ser carregado

  let dadosCSV = "Título do Produto,Preço do Produto\n";

  while (true) {
    const resultados = await pagina.$$(".ui-search-result__content");

    if (contador >= resultados.length) break;

    const resultado = resultados[contador];
    const linkProduto = await resultado.$eval(
      "a.ui-search-link",
      (element) => element.href
    );
    await pagina.goto(linkProduto);
    await pagina.waitForSelector("h1.ui-pdp-title");

    const tituloProduto = await pagina.$eval("h1.ui-pdp-title", (element) =>
      element.textContent.trim()
    );
    console.log("Título do produto:", tituloProduto);

    const precoProduto = await pagina.$eval(
      ".ui-pdp-price__second-line",
      (element) => element.textContent.trim()
    );
    console.log("Preço do produto:", precoProduto);
    console.log();
    console.log();
    console.log();

    dadosCSV += `"${tituloProduto}","${precoProduto}"\n`;

    await pagina.goBack();
    contador++;
  }

  await navegador.close();

  fs.writeFileSync(nomeArquivo, dadosCSV, "utf-8");

  console.log("Dados salvos em", nomeArquivo);
})();
