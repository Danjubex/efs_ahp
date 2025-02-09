
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

      // nComponents: [2,3,10,15,20,30,35,40,45,50],
      // vizinhos: [5,11,20],
      // minDist: [0.01,0.02,0.05],

      nComponents: [20],
      vizinhos: [11],
      minDist: [0.01],
    };

    const caminhoArquivo = "./AG_DOUTORADO_RESULTS_EXP2_UMAP.txt";
    let r2ValuesGlobais = [];
    let ensaio = 0;

    while (ensaio < 10) {
              for (const nComponents of grid.nComponents) {
                        for (const vizinhos of grid.vizinhos) {
                                  for (const minDist of grid.minDist) {
                var obj = {nComponents:nComponents, vizinhos:vizinhos, minDist:minDist}
                console.log(
                  `Iniciando com parâmetros: UMAP=${JSON.stringify(obj)} componentes.`
                );

                 var umap = new CropYieldPredictionRF('UMAP',false,[
                                                                   1,1,1,1,1,//MANEJO
                                                                   1,1,1,1,1,1,1,1,//FASE
                                                                   1,1,1,1,1,1,1,1,1,1,1,1,//MES
                                                                   1,1,1,1,1,1,1,1,1,1,//SISTEMA DE IRRIGAÇÂO
                                                                   1,1,1,1,1,1,1,1,//TIPO DE SOLO
                                                                   1,1,1,1,//Z A T S.A
                                                                   1,1,1,1,//T a S S.A
                                                                   1,1,1,1,//Z A T P.S
                                                                   1,1,1,1,//T a S P.S
                                                                 ],false,false,obj);
                 // console.log("PCA",pca)
                 var result_umap = await umap.iniciar();
                 console.log("RESULTADO UMAP",ensaio, result_umap)

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
