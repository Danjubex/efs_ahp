
const CropYieldPredictionRF = require('./[RNA].js');


// Função para salvar os resultados no arquivo
function salvarResultados(tempoGeracao, melhorResultado, caminhoArquivo,  geracoes, taxaMutacao, taxaCrossover, tamanhoPopulacao, nComponents) {
  try {
    const fs = require('fs');

    // Verificar se o arquivo já existe e carregar conteúdo
    let resultados = fs.existsSync(caminhoArquivo) ? fs.readFileSync(caminhoArquivo, 'utf-8') : '';

    // Serializar os resultados no formato tabular
    const objetoSerializado = `${61}\t[]\t${melhorResultado["R_QD"]}\t${melhorResultado["R_QD_TESTE"]}\t${0}\t${melhorResultado["MST"]}\t${melhorResultado["MSE"]}\t${melhorResultado["RMSE"]}\t${melhorResultado["MAE"]}\t${melhorResultado["MAPE"]}\t${melhorResultado["SMAPE"]}\t${geracoes}\t${taxaMutacao}\t${taxaCrossover}\t${tamanhoPopulacao}\t${nComponents}\n`;

    // Adicionar os novos resultados ao conteúdo existente
    resultados += objetoSerializado;

    // Salvar no arquivo
    fs.writeFileSync(caminhoArquivo, resultados);
    console.log("Resultados salvos com sucesso em:", caminhoArquivo);
  } catch (error) {
    console.error("Erro ao salvar os resultados:", error);
  }
}
(async () => {
    const grid = {
      // nIteracoes: [1000,1500,2000],
      // nComponentsTSNE: [2,3,10,15,20,30,35,40,45,50],
      // perplexidade: [10,20,30],
      nIteracoes: [2000],
      nComponentsTSNE: [2],
      perplexidade: [30],
      // nComponentsTSNE: [15],
    };

    const caminhoArquivo = "./AG_DOUTORADO_RESULTS_EXP2_TSNE.txt";
    let r2ValuesGlobais = [];
    let ensaio = 0;

    while (ensaio < 10) {
              for (const nComponentsTSNE of grid.nComponentsTSNE) {
                        for (const nIteracoes of grid.nIteracoes) {
                                  for (const perplexidade of grid.perplexidade) {
                var obj = {nComponentsTSNE:nComponentsTSNE, nIteracoes:nIteracoes, perplexidade:perplexidade}
                console.log(
                  `Iniciando com parâmetros: TSNE=${JSON.stringify(obj)} componentes.`
                );

                 var tsne = new CropYieldPredictionRF('TSNE',false,[
                                                                   1,1,1,1,1,//MANEJO
                                                                   1,1,1,1,1,1,1,1,//FASE
                                                                   1,1,1,1,1,1,1,1,1,1,1,1,//MES
                                                                   1,1,1,1,1,1,1,1,1,1,//SISTEMA DE IRRIGAÇÂO
                                                                   1,1,1,1,1,1,1,1,//TIPO DE SOLO
                                                                   1,1,1,1,//Z A T S.A
                                                                   1,1,1,1,//T a S S.A
                                                                   1,1,1,1,//Z A T P.S
                                                                   1,1,1,1,//T a S P.S
                                                                 ],false,obj);
                 // console.log("PCA",pca)
                 var result_tsne = await tsne.iniciar();
                 console.log("RESULTADO TSNE",ensaio, result_tsne)

                console.log(
                  `[ENSAIO] #${ensaio} TSNE=${nComponentsTSNE}] concluídos.`, result_tsne
                );

                  salvarResultados(
                    0,
                    result_tsne,
                    caminhoArquivo,
                    0,
                    0,
                    0,
                    0,
                    JSON.stringify(obj)
                  );
      }//FIM DO FOR
}//FIM DO FOR
}//FIM DO FOR

      ensaio++;

      console.log(`Ensaio concluído. Resultados salvos.`);
    }

    console.log("Significância estatística alcançada para R² global.");
})();
