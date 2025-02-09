
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
        //limiar: [0, 0.01, 0.25, 0.05],//INDICA QUAL O VALOR DO GANHO FILTRARÁ OS FEATURES
        limiar: [0.025],
    };

    const caminhoArquivo = "./AG_DOUTORADO_RESULTS_EXP1_FEATURE_IMPORTANCE.txt";
    let r2ValuesGlobais = [];
    let ensaio = 0;

    while (ensaio < 10) {
          for (const limiar of grid.limiar) {
                console.log(
                  `Iniciando com parâmetros: FEATURE IMPORTANCE=${limiar} limiar.`
                );

                 var fe = new CropYieldPredictionRF('FEATURE IMPORTANCE',false,[1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1],
                                                             false,//PCA
                                                             false,//TSNE
                                                             false,//UMAP
                                                             false,//LASSO
                                                             true);//FEATURE IMPORTANCE
                 // console.log("PCA",pca)
                 var result_fe = await fe.iniciar();
                 console.log("RESULTADO FE",ensaio, result_fe,'fe.features',fe.features)

                console.log(
                  `[ENSAIO] #${ensaio} FE=${limiar} concluídos.`, result_fe
                );

                  salvarResultados(
                    fe.features,
                    0,
                    result_fe,
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
