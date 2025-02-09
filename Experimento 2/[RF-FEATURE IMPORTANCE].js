
const CropYieldPredictionRF = require('./[RNA].js');


// Função para salvar os resultados no arquivo
function salvarResultados(tempoGeracao, melhorResultado, caminhoArquivo,  geracoes, taxaMutacao, taxaCrossover, tamanhoPopulacao, nComponents) {
  try {
    const fs = require('fs');

    // Verificar se o arquivo já existe e carregar conteúdo
    let resultados = fs.existsSync(caminhoArquivo) ? fs.readFileSync(caminhoArquivo, 'utf-8') : '';

    // Serializar os resultados no formato tabular
    const objetoSerializado = `${melhorResultado["FEATURES_LENGHT"]}\t[${melhorResultado["FEATURES"]}]\t${melhorResultado["R_QD"]}\t${melhorResultado["R_QD_TESTE"]}\t${0}\t${melhorResultado["MST"]}\t${melhorResultado["MSE"]}\t${melhorResultado["RMSE"]}\t${melhorResultado["MAE"]}\t${melhorResultado["MAPE"]}\t${melhorResultado["SMAPE"]}\t${geracoes}\t${taxaMutacao}\t${taxaCrossover}\t${tamanhoPopulacao}\t${nComponents}\n`;

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
    const grid = { //numComponentes = this.umap.nComponents, vizinhos = this.umap.vizinhos, minDist = this.umap.minDist

      // n_trees: [50,100,150,200],
      // maxFeatures: [58,50,40,30],
      // limiar: [0.01,0.025,0.05,0.1],
      // replacement: [true,false],
      n_trees: [50],
      maxFeatures: [50],
      limiar: [0.025],
      replacement: [true],
    };

    const caminhoArquivo = "./AG_DOUTORADO_RESULTS_EXP2_RF_FI.txt";
    let r2ValuesGlobais = [];
    let ensaio = 0;

    while (ensaio < 10) {
              for (const n_trees of grid.n_trees) {
                        for (const maxFeatures of grid.maxFeatures) {
                                  for (const replacement of grid.replacement) {
                                            for (const limiar of grid.limiar) {
                var obj = {n_trees:n_trees, maxFeatures:maxFeatures, replacement:replacement, limiar:limiar}
                console.log(
                  `Iniciando com parâmetros: FI=${JSON.stringify(obj)} componentes.`
                );

                 var fi = new CropYieldPredictionRF('FI',false,[
                                                                   1,1,1,1,1,//MANEJO
                                                                   1,1,1,1,1,1,1,1,//FASE
                                                                   1,1,1,1,1,1,1,1,1,1,1,1,//MES
                                                                   1,1,1,1,1,1,1,1,1,1,//SISTEMA DE IRRIGAÇÂO
                                                                   1,1,1,1,1,1,1,1,//TIPO DE SOLO
                                                                   1,1,1,1,//Z A T S.A
                                                                   1,1,1,1,//T a S S.A
                                                                   1,1,1,1,//Z A T P.S
                                                                   1,1,1,1,//T a S P.S
                                                                 ],false,false,false,false,obj);
                 // console.log("PCA",pca)
                 var result_fi = await fi.iniciar();
                 console.log("RESULTADO FI",ensaio, result_fi)

                console.log(
                  `[ENSAIO] #${ensaio} FI=${n_trees}] concluídos.`, result_fi
                );

                  salvarResultados(
                    0,
                    result_fi,
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
}//FIM DO FOR

      ensaio++;

      console.log(`Ensaio concluído. Resultados salvos.`);
    }

    console.log("Significância estatística alcançada para R² global.");
})();
