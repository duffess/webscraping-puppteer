const pup = require("puppeteer");

const url = "https://www.mercadolivre.com.br/";

const pesquisaPor = "ioiô";

let contador = 0;

(async () => {
    const navegador = await pup.launch({
        headless: false
    });

    const pagina = await navegador.newPage();
    console.log('newPage e navegador funcionando!');

    await pagina.goto(url);

    await pagina.waitForSelector('#cb1-edit');

    await pagina.type('#cb1-edit', pesquisaPor);

    await Promise.all([
        pagina.waitForNavigation(),
        pagina.click(".nav-search-btn")
    ]);

    await pagina.waitForSelector('.ui-search-result__content');

    while (true) {
        const resultados = await pagina.$$('.ui-search-result__content');

        if (contador >= resultados.length) break;

        const resultado = resultados[contador];
        const linkProduto = await resultado.$eval('a.ui-search-link', element => element.href);
        await pagina.goto(linkProduto);
        await pagina.waitForSelector('h1.ui-pdp-title');

        const tituloProduto = await pagina.$eval('h1.ui-pdp-title', element => element.textContent.trim());
        console.log("Título do produto:", tituloProduto);

        const precoProduto = await pagina.$eval('.ui-pdp-price__second-line', element => element.textContent.trim());
        console.log("Preço do produto:", precoProduto); 
        console.log();
        console.log();
        console.log();
        
        // Volta para a página de resultados de busca
        await pagina.goBack();
        contador++;
    }

    await navegador.close();
})();
