
const CropYieldPredictionRF = require('./[RANDOM FOREST].js');


// Função para salvar os resultados no arquivo
function salvarResultados(features,tempoGeracao, melhorResultado, caminhoArquivo,  geracoes, taxaMutacao, taxaCrossover, tamanhoPopulacao, nComponents) {
  try {
    const fs = require('fs');

    // Verificar se o arquivo já existe e carregar conteúdo
    let resultados = fs.existsSync(caminhoArquivo) ? fs.readFileSync(caminhoArquivo, 'utf-8') : '';

    // Serializar os resultados no formato tabular
    const objetoSerializado = `${features.filter(f=>f == 1).length}\t[${features}]\t${melhorResultado["R_QD"]}\t${melhorResultado["R_QD_TESTE"]}\t${0}\t${melhorResultado["MST"]}\t${melhorResultado["MSE"]}\t${melhorResultado["RMSE"]}\t${melhorResultado["MAE"]}\t${melhorResultado["MAPE"]}\t${melhorResultado["SMAPE"]}\t${geracoes}\t${taxaMutacao}\t${taxaCrossover}\t${tamanhoPopulacao}\t${nComponents}\n`;

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
      // alpha: [0.01, 0.05, 0.1],
        alpha: [0.1],
    };

    const caminhoArquivo = "./AG_DOUTORADO_RESULTS_EXP1_LASSO.txt";
    let r2ValuesGlobais = [];
    let ensaio = 0;

    while (ensaio < 10) {
          for (const alpha of grid.alpha) {
                console.log(
                  `Iniciando com parâmetros: LASSO=${alpha} alpha.`
                );

                 var lasso = new CropYieldPredictionRF('FEATURE IMPORTANCE',false,[1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1],
                                                             false,//PCA
                                                             false,//TSNE
                                                             false,//UMAP
                                                             true);//LASSO
                 // console.log("PCA",pca)
                 var result_lasso = await lasso.iniciar();
                 console.log("RESULTADO lasso",ensaio, result_lasso,'lasso.features',lasso.features)

                console.log(
                  `[ENSAIO] #${ensaio} LASSO=${alpha} concluídos.`, result_lasso
                );

                  salvarResultados(
                    lasso.features,
                    0,
                    result_lasso,
                    caminhoArquivo,
                    0,
                    0,
                    0,
                    0,
                    0
                  );

  }
      ensaio++;

      console.log(`Ensaio concluído. Resultados salvos.`);
    }

    console.log("Significância estatística alcançada para R² global.");
})();
