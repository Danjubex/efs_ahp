
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
    const grid = { //numComponentes = this.umap.nComponents, vizinhos = this.umap.vizinhos, minDist = this.umap.minDist

      // alpha: [0.01,0.02,0.03,0.05,0.1],
      alpha: [0.05]
    };

    const caminhoArquivo = "./AG_DOUTORADO_RESULTS_EXP2_LASSO.txt";
    let r2ValuesGlobais = [];
    let ensaio = 0;

    while (ensaio < 10) {
              for (const alpha of grid.alpha) {
                var obj = {alpha:alpha}
                console.log(
                  `Iniciando com parâmetros: LASSO=${JSON.stringify(obj)} componentes.`
                );

                 var lasso = new CropYieldPredictionRF('LASSO',false,[
                                                                   1,1,1,1,1,//MANEJO
                                                                   1,1,1,1,1,1,1,1,//FASE
                                                                   1,1,1,1,1,1,1,1,1,1,1,1,//MES
                                                                   1,1,1,1,1,1,1,1,1,1,//SISTEMA DE IRRIGAÇÂO
                                                                   1,1,1,1,1,1,1,1,//TIPO DE SOLO
                                                                   1,1,1,1,//Z A T S.A
                                                                   1,1,1,1,//T a S S.A
                                                                   1,1,1,1,//Z A T P.S
                                                                   1,1,1,1,//T a S P.S
                                                                 ],false,false,false,obj);
                 // console.log("PCA",pca)
                 var result_lasso = await lasso.iniciar();
                 console.log("RESULTADO LASSO",ensaio, result_lasso)

                console.log(
                  `[ENSAIO] #${ensaio} LASSO=${alpha}] concluídos.`, result_lasso
                );

                  salvarResultados(
                    0,
                    result_lasso,
                    caminhoArquivo,
                    0,
                    0,
                    0,
                    0,
                    JSON.stringify(obj)
                  );

}//FIM DO FOR

      ensaio++;

      console.log(`Ensaio concluído. Resultados salvos.`);
    }

    console.log("Significância estatística alcançada para R² global.");
})();
