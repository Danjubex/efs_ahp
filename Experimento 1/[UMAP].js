
const CropYieldPredictionRF = require('./[RANDOM FOREST].js');


// Função para salvar os resultados no arquivo
function salvarResultados(tempoGeracao, melhorResultado, caminhoArquivo,  geracoes, taxaMutacao, taxaCrossover, tamanhoPopulacao, nComponents) {
  try {
    const fs = require('fs');

    // Verificar se o arquivo já existe e carregar conteúdo
    let resultados = fs.existsSync(caminhoArquivo) ? fs.readFileSync(caminhoArquivo, 'utf-8') : '';

    // Serializar os resultados no formato tabular
    const objetoSerializado = `${55}\t[]\t${melhorResultado["R_QD"]}\t${melhorResultado["R_QD_TESTE"]}\t${0}\t${melhorResultado["MST"]}\t${melhorResultado["MSE"]}\t${melhorResultado["RMSE"]}\t${melhorResultado["MAE"]}\t${melhorResultado["MAPE"]}\t${melhorResultado["SMAPE"]}\t${geracoes}\t${taxaMutacao}\t${taxaCrossover}\t${tamanhoPopulacao}\t${nComponents}\n`;

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
      // nComponentsUMAP: [2, 5,10, 11, 15, 20],
      // nVizinhos: [2, 5,10, 11, 15, 20],
      // minDist: [0.01, 0.05, 0.1],
        nVizinhos: [11],
        nComponentsUMAP: [20],
        minDist: [0.01],
    };

    const caminhoArquivo = "./AG_DOUTORADO_RESULTS_EXP1_UMAP.txt";
    let r2ValuesGlobais = [];
    let ensaio = 0;

    while (ensaio < 10) {
              for (const nComponents of grid.nComponentsUMAP) {
                        for (const nVizinhos of grid.nVizinhos) {
                                  for (const minDist of grid.minDist) {
                console.log(
                  `Iniciando com parâmetros: TSNE=${nComponents} componentes.`
                );

                 var umap = new CropYieldPredictionRF('UMAP',false,[1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1,1,1,1,1,1,1,
                                                             1,1,1,1],
                                                             false,//PCA
                                                             false,//TSNE
                                                             true);//UMAP
                 // console.log("PCA",pca)
                 var result_umap = await umap.iniciar();
                 //console.log("RESULTADO TSNE",ensaio, result_tsne)

                console.log(
                  `[ENSAIO] #${ensaio} UMAP=${nComponents}] concluídos.`, result_umap
                );

                  salvarResultados(
                    0,
                    result_umap,
                    caminhoArquivo,
                    0,
                    0,
                    0,
                    0,
                    nComponents
                  );
      }
    }
  }
      ensaio++;

      console.log(`Ensaio concluído. Resultados salvos.`);
    }

    console.log("Significância estatística alcançada para R² global.");
})();
