const {PCA} = require('ml-pca');
const {UMAP} = require('umap-js');
const TSNE = require('tsne-js');
const {LassoRegression} = require('ml-regression-lasso');

var nn = require('nn');
var F = require('../funcoes.js');
// var nn = require('nn');
const moment = require('moment');
// const amostragem = require('./calibresCampo');

const PIBase = require('./base_estudo_prog_irrigacao_avg.json');

var dados = PIBase;



const normalizar_sbcs = (classe) =>{
      if(classe == 'Franco-siltosa')
        return 0.125;
      if(classe == 'Areia')
        return 0.25;
      if(classe == 'Franco-arenosa')
        return 0.375;
      if(classe == 'Franca')
        return 0.5;
      if(classe == 'Argila')
        return 0.625;
      if(classe == 'Franco-argilosa')
        return 0.75;
      if(classe == 'Areia-franca')
        return 0.875;
      if(classe == 'Franco-argiloarenosa')
        return 1;
}

const normalizar_profundidade = (classe) =>{
      if(classe == '0-30')
        return 0;
      if(classe == '30-60')
        return 1;
}

class KcPredictionRF {
  constructor(id, limit, features, pca, tsne, umap, lasso, rf_fi, correlation) {

    this.max_features = Math.ceil(features.length/3);//FORAM TESTADOS 1/3, 1/2 e 1
    this.id = id;
    this.limit = false;//limit;
    this.pca    = pca;
    this.tsne   = tsne;
    this.umap   = umap;
    this.lasso    = lasso;
    this.rf_fi    = rf_fi;
    this.correlation    = correlation;
    this.features = features;
    this.vetores             = [
                                [],[],[],[],[],[],[],[],[],[],[],//10
                                [],[],[],[],[],[],[],[],[],[],//20
                                [],[],[],[],[],[],[],[],[],[],//30
                                [],[],[],[],[],[],[],[],[],[],//40
                                [],[],[],[],[],[],[],[],[],[],//50
                                [],[],[],[],[],[],[],[],[],[],//60
                                [],//61
                            ];
    this.dataset = [];
    this.validacaoTesteProp = 2/10; // 2/10 para validação e teste
    this.testeProp = 2/10; // 1/10 para teste
    this.validacaoTesteSize = 0;
    this.testeSize = 0;



    this.options             = {
                                  // hidden layers eg. [ 4, 3 ] => 2 hidden layers, with 4 neurons in the first, and 3 in the second.
                                  // layers: [8,18],
                                  layers: [this.max_features],//,max_features,max_features],//18,18,18
                                  // maximum training epochs to perform on the training data
                                  iterations: 1000,//2000000,
                                  // maximum acceptable error threshold
                                  errorThresh: 0.0005,
                                  // activation function ('logistic' and 'hyperbolic' supported)
                                  activation: 'logistic',
                                  // learning rate
                                  learningRate: 0.4,
                                  // learning momentum
                                  momentum: 0.2,
                                  // logging frequency to show training progress. 0 = never, 10 = every 10 iterations.
                                  log: 50
                              };

    this.acertos = 0;
    this.MEDIA = 0;
    this.MST = 0;
    this.MSE = 0;
    this.RMSE = 0;
    this.MAE = 0;
    this.MAPE = 0;
    this.SMAPE = 0;
    this.R_QD = 0;
    this.R_QD_TESTE = 0; // Nova métrica

    //this.regression = new RFRegression(this.options);
  }
//RETIRAR ASYNC QUANDO FOR UTILIZAR AG
async iniciar() {
       if (this.R_QD === 0) {
         this.popularDataset();
         if(this.pca)
           await this.aplicarPCA();
         else if(this.tsne)
           await this.aplicarTSNE();
         else if(this.umap)
           await this.aplicarUMAP();
         else if(this.lasso)
           await this.aplicarLASSO();
         else if(this.rf_fi)
           await this.aplicarRandomForestFeatureImportance();
         else if(this.correlation)
           await this.aplicarCorrelacao();
         this.treinar();
         this.calcularResultado();
       }
       return this.retornaResultado();

  }

  popularDataset() {


      var self = this;
      PIBase.filter(pi=>pi.FASE != null && pi.KC != undefined).map((b,i)=>{
        // if(this.limit)
        // {
        //   if(i>250)
        //    return;
        // }
          // vetores[0].push(b.FAZENDA);
          // console.log("b",b);
        this.vetores[0].push(b.FAZENDA == 'FAZENDA_1' ? 1 : 0); //0
        this.vetores[1].push(b.FAZENDA == 'FAZENDA_2' ? 1 : 0); //1
        this.vetores[2].push(b.FAZENDA == 'FAZENDA_3' ? 1 : 0); //2
        this.vetores[3].push(b.FAZENDA == 'FAZENDA_4' ? 1 : 0); //3
        this.vetores[4].push(b.FAZENDA == 'FAZENDA_5' ? 1 : 0); //4

        //5-12
        this.vetores[5].push(b.FASE == 'FLORAÇÃO' ? 1 : 0);
        this.vetores[6].push(b.FASE == 'COLHEITA' ? 1 : 0);
        this.vetores[7].push(b.FASE == 'CRESCIMENTO VEGETATIVO' ? 1 : 0);
        this.vetores[8].push(b.FASE == 'DESENVOLVIMENTO DO FRUTO' ? 1 : 0);
        this.vetores[9].push(b.FASE == 'INDUÇÃO FLORAL' ? 1 : 0);
        this.vetores[10].push(b.FASE == 'CHUMBINHO' ? 1 : 0);
        this.vetores[11].push(b.FASE == 'AMADURECIMENTO DE RAMOS' ? 1 : 0);
        this.vetores[12].push(b.FASE == 'FORM' ? 1 : 0);//12

        //13-24
        this.vetores[13].push(b.MES_ANO == '01' ? 1 : 0);
        this.vetores[14].push(b.MES_ANO == '02' ? 1 : 0);
        this.vetores[15].push(b.MES_ANO == '03' ? 1 : 0);
        this.vetores[16].push(b.MES_ANO == '04' ? 1 : 0);
        this.vetores[17].push(b.MES_ANO == '05' ? 1 : 0);
        this.vetores[18].push(b.MES_ANO == '06' ? 1 : 0);
        this.vetores[19].push(b.MES_ANO == '07' ? 1 : 0);
        this.vetores[20].push(b.MES_ANO == '08' ? 1 : 0);
        this.vetores[21].push(b.MES_ANO == '09' ? 1 : 0);
        this.vetores[22].push(b.MES_ANO == '10' ? 1 : 0);
        this.vetores[23].push(b.MES_ANO == '11' ? 1 : 0);
        this.vetores[24].push(b.MES_ANO == '12' ? 1 : 0);//24

        //25-34
        this.vetores[25].push(b.CAPACIDADE_MAXIMA);//25
        this.vetores[26].push(b.AREA);
        this.vetores[27].push(b.PRECIPITACAO);
        this.vetores[28].push(b.ESP_RUA);
        this.vetores[29].push(b.FITAS_LINHA);
        this.vetores[30].push(b.ESPACAMENTO_GOTEJO);
        this.vetores[31].push(b.VAZAO_GOTEJO);
        this.vetores[32].push(0/*b.HORAS_IRRIGACAO*/);
        this.vetores[33].push(0/*b.VOLUME_AGUA*/);
        this.vetores[34].push(0/*b.LAMINA_BRUTA*/);//34

        //35-42
        this.vetores[35].push(b.SBCS == 'Franco-siltosa' ? 1 : 0);//35
        this.vetores[36].push(b.SBCS == 'Areia' ? 1 : 0);
        this.vetores[37].push(b.SBCS == 'Franco-arenosa' ? 1 : 0);
        this.vetores[38].push(b.SBCS == 'Franca' ? 1 : 0);
        this.vetores[39].push(b.SBCS == 'Argila' ? 1 : 0);
        this.vetores[40].push(b.SBCS == 'Franco-argilosa' ? 1 : 0);
        this.vetores[41].push(b.SBCS == 'Areia-franca' ? 1 : 0);
        this.vetores[42].push(b.SBCS == 'Franco-argiloarenosa' ? 1 : 0);//42

        //43-46
        this.vetores[43].push(b.ZERO_A_TRINTA_SEM_ATUAL == 'SC - Seco' ? 1 : 0);//43
        this.vetores[44].push(b.ZERO_A_TRINTA_SEM_ATUAL == 'US - Úmido Seco' ? 1 : 0);
        this.vetores[45].push(b.ZERO_A_TRINTA_SEM_ATUAL == 'CC - Capacidade de Campo' ? 1 : 0);
        this.vetores[46].push(b.ZERO_A_TRINTA_SEM_ATUAL == 'UU - Úmido Úmido' ? 1 : 0);//46

        //47-50
        this.vetores[47].push(b.TRINTA_A_SESSENTA_SEM_ATUAL == 'SC - Seco' ? 1 : 0);//47
        this.vetores[48].push(b.TRINTA_A_SESSENTA_SEM_ATUAL == 'US - Úmido Seco' ? 1 : 0);
        this.vetores[49].push(b.TRINTA_A_SESSENTA_SEM_ATUAL == 'CC - Capacidade de Campo' ? 1 : 0);
        this.vetores[50].push(b.TRINTA_A_SESSENTA_SEM_ATUAL == 'UU - Úmido Úmido' ? 1 : 0);//50


        //51-54
        this.vetores[51].push(b.ZERO_A_TRINTA_PROX_SEMANA == 'SC - Seco' ? 1 : 0);//51
        this.vetores[52].push(b.ZERO_A_TRINTA_PROX_SEMANA == 'US - Úmido Seco' ? 1 : 0);
        this.vetores[53].push(b.ZERO_A_TRINTA_PROX_SEMANA == 'CC - Capacidade de Campo' ? 1 : 0);
        this.vetores[54].push(b.ZERO_A_TRINTA_PROX_SEMANA == 'UU - Úmido Úmido' ? 1 : 0);//54

        //55-58
        this.vetores[55].push(b.TRINTA_A_SESSENTA_PROX_SEMANA == 'SC - Seco' ? 1 : 0);//55
        this.vetores[56].push(b.TRINTA_A_SESSENTA_PROX_SEMANA == 'US - Úmido Seco' ? 1 : 0);
        this.vetores[57].push(b.TRINTA_A_SESSENTA_PROX_SEMANA == 'CC - Capacidade de Campo' ? 1 : 0);
        this.vetores[58].push(b.TRINTA_A_SESSENTA_PROX_SEMANA == 'UU - Úmido Úmido' ? 1 : 0);//58

        //59-60
        this.vetores[59].push(b.KC_RECENTE);//59
        this.vetores[60].push(b.KC_HISTORICO);//60

        this.vetores[61].push( b.KC.toFixed(2));//61
      })//fim do map
      // console.log("this.vetores",this.vetores.length)

      this.dataset = PIBase.map((ts,i)=>{
        // var vetor = vetores[0];

        // console.log("F.normalizar_numeric(vetores[25],vetores[25][i])",vetores[25][i],F.normalizar_numeric(vetores[25],vetores[25][i]));
        if(this.vetores[0][i] != undefined)
          return{
            input: [
                        //0-4 //FAZENDAS
                        this.vetores[0][i],
                        this.vetores[1][i],
                        this.vetores[2][i],
                        this.vetores[3][i],
                        this.vetores[4][i],

                        //5-12 //FASES
                        this.vetores[5][i],
                        this.vetores[6][i],
                        this.vetores[7][i],
                        this.vetores[8][i],
                        this.vetores[9][i],
                        this.vetores[10][i],
                        this.vetores[11][i],
                        this.vetores[12][i],

                        //13-24 //MESES
                        this.vetores[13][i],
                        this.vetores[14][i],
                        this.vetores[15][i],
                        this.vetores[16][i],
                        this.vetores[17][i],
                        this.vetores[18][i],
                        this.vetores[19][i],
                        this.vetores[20][i],
                        this.vetores[21][i],
                        this.vetores[22][i],
                        this.vetores[23][i],
                        this.vetores[24][i],

                        // vetores[25],//KC

                        //SISTEMA DE IRRIGAÇÃO //25-34
                        F.normalizar_numeric(this.vetores[25],this.vetores[25][i]),//CAPACIDADE_MAXIMA
                        F.normalizar_numeric(this.vetores[26],this.vetores[26][i]),//AREA
                        F.normalizar_numeric(this.vetores[27],this.vetores[27][i]),//PRECIPITACAO
                        F.normalizar_numeric(this.vetores[28],this.vetores[28][i]),//ESP_RUA
                        F.normalizar_numeric(this.vetores[29],this.vetores[29][i]),//FITAS_LINHA
                        F.normalizar_numeric(this.vetores[30],this.vetores[30][i]),//ESPACAMENTO_GOTEJO
                        F.normalizar_numeric(this.vetores[31],this.vetores[31][i]),//VAZAO_GOTEJO

                        0/*F.normalizar_numeric(this.vetores[32],this.vetores[32][i])*/,//HORAS_IRRIGACAO
                        0/*F.normalizar_numeric(this.vetores[33],this.vetores[33][i])*/,//VOLUME_AGUA
                        0/*F.normalizar_numeric(this.vetores[34],this.vetores[34][i])*/,//LAMINA_BRUTA

                        //SBCS //35-42
                        this.vetores[35][i],
                        this.vetores[36][i],
                        this.vetores[37][i],
                        this.vetores[38][i],
                        this.vetores[39][i],
                        this.vetores[40][i],
                        this.vetores[41][i],
                        this.vetores[42][i],


                        //43-46 //ZERO_A_TRINTA_SEM_ATUAL
                        this.vetores[43][i],
                        this.vetores[44][i],
                        this.vetores[45][i],
                        this.vetores[46][i],

                        //47-50 //TRINTA_A_SESSENTA_SEM_ATUAL
                        this.vetores[47][i],
                        this.vetores[48][i],
                        this.vetores[49][i],
                        this.vetores[50][i],

                        //51-54 //ZERO_A_TRINTA_PROX_SEMANA
                        this.vetores[51][i],
                        this.vetores[52][i],
                        this.vetores[53][i],
                        this.vetores[54][i],

                        //55-58 //TRINTA_A_SESSENTA_PROX_SEMANA
                        this.vetores[55][i],
                        this.vetores[56][i],
                        this.vetores[57][i],
                        this.vetores[58][i],

                        //KC RECENTE E HISTORICO
                        F.normalizar_numeric(this.vetores[59],this.vetores[59][i]),
                        F.normalizar_numeric(this.vetores[60],this.vetores[60][i]),
                      // normalizar_profundidade(vetores[1][i]) ,

                      // F.normalizar_numeric(vetores[1],vetores[1][i]),


                      // F.normalizar_numeric(vetores[2],vetores[2][i]),
                      // F.normalizar_numeric(vetores[3],vetores[3][i])
                    ],
            output: [F.normalizar_numeric(this.vetores[61],this.vetores[61][i])]
          }
      });

      this.dataset = this.dataset.map(linha=>{
        var nova_linha = {input:[],output:linha.output};
        this.features.map((feature,j)=>{
          if(feature == 1)//ENTRA
            nova_linha.input.push(linha.input[j])
            // console.log('ds[i]',ds[j])
            // retorno[Object.keys(retorno).length] = ds[j]
            // retorno.push(this.vetores[j]);
        })
        return nova_linha;
      })//fim do map this.dataset

      // console.log("TESTE",this.dataset[0],this.dataset.length);
      this.regression         = nn(this.options);

      // console.log("this.features",this.features.length,this.dataset.length);
      // console.log("dataset",this.dataset[0],this.dataset.length, Object.keys(this.dataset[0]).length)

  }
  // Normalizar os dados
  normalizar(dados) {
      if (!Array.isArray(dados) || dados.length === 0) {
          throw new Error("O conjunto de dados está vazio ou inválido.");
      }

      // Verificar se o dataset tem apenas uma coluna
      const colunas = Array.isArray(dados[0]) ? dados[0].length : 1;
      const normalizado = [];

      if (colunas === 1) {
          // Caso de uma única coluna
          const coluna = dados.map(linha => Array.isArray(linha) ? linha[0] : linha);
          const min = Math.min(...coluna);
          const max = Math.max(...coluna);

          if (max === min) {
              // Caso todos os valores sejam iguais
              return coluna.map(() => [0]);
          } else {
              return coluna.map(valor => [(valor - min) / (max - min)]);
          }
      }

      // Normalizar várias colunas
      for (let i = 0; i < colunas; i++) {
          const coluna = dados.map(linha => linha[i]); // Extrair a coluna
          const min = Math.min(...coluna); // Valor mínimo da coluna
          const max = Math.max(...coluna); // Valor máximo da coluna

          if (max === min) {
              // Caso todos os valores sejam iguais na coluna, normalizá-los como 0
              normalizado.push(coluna.map(() => 0));
          } else {
              // Normalizar a coluna
              const colunaNormalizada = coluna.map(valor => (valor - min) / (max - min));
              normalizado.push(colunaNormalizada);
          }
      }

      // Transpor a matriz para retornar ao formato original (linhas por colunas)
      return normalizado[0].map((_, rowIndex) => normalizado.map(coluna => coluna[rowIndex]));
  }
  // Função para calcular a importância das features a partir de uma árvore
  calcularImportanciaPorArvore(node, featureImportances) {
    if (!node || !node.splitColumn) return;

    // Adicionar o ganho desta divisão à importância da feature
    featureImportances[node.splitColumn] += node.gain || 0;

    // Recursivamente calcular para os nós filho
    if (node.left) this.calcularImportanciaPorArvore(node.left, featureImportances);
    if (node.right) this.calcularImportanciaPorArvore(node.right, featureImportances);
}

  // Função para calcular a correlação de Pearson
  calcularCorrelacao(x, y) {
    //console.log("X",x,"Y",y.map(y=>y[0]))
    const n = x.length;
    const mediaX = x.reduce((acc, val) => acc + val, 0) / n;
    const mediaY = y.map(y=>y[0]).reduce((acc, val) => acc + val, 0) / n;

    const numerador = x.reduce((acc, xi, i) => acc + (xi - mediaX) * (y[i] - mediaY), 0);
    const denominador = Math.sqrt(
        x.reduce((acc, xi) => acc + Math.pow(xi - mediaX, 2), 0) *
        y.reduce((acc, yi) => acc + Math.pow(yi - mediaY, 2), 0)
    );

    return denominador === 0 ? 0 : numerador / denominador;
  }

  filtrarFeatures(){
    console.log("this.dataset[0]",this.dataset[0].input.length, this.features.length)
      //LÓGICA PARA ENCURTAR O ARRAY COM BASE NOS FEATURES
      this.dataset = this.dataset.map(ds=>{
        // console.log("Object.keys(ds)",Object.keys(ds),ds[0]);
        // return Object.keys(ds)
        var retorno = [];

        this.features.map((feature,j)=>{
          if(feature == 1 && ds.input[j] != undefined)//ENTRA
            // console.log('ds[i]',ds[j])
            // retorno[Object.keys(retorno).length] = ds[j]
            retorno.push(ds.input[j]);
        })
        // retorno[Object.keys(retorno).length] = ds[55];
        //retorno.push(ds[ds.length-1]);
        // console.log("retorno",retorno);
        return {
                  ...ds,
                  input:retorno
        };
      })
      console.log("this.features",this.features, this.dataset.length, this.dataset[0], this.dataset[0].input.length);
  }

async aplicarPCA(dataset = this.dataset, numComponentes = this.pca) {
  return new Promise((resolve, reject) => {
      try {
          if (!dataset || dataset.length === 0) {
              throw new Error("O conjunto de dados está vazio.");
          }

          console.log("Iniciando o PCA no dataset com", dataset.length, "linhas.");

          // Separar X (features) e Y (última coluna como valor alvo)
          const X = dataset.map(linha => linha.input); // Todas as colunas menos a última
          let Y = dataset.map(linha => linha.output); // Última coluna
          let indices_rejeitados = [];

          // Tratar valores NaN em X
          const tratarNaN = (linha, index) => {
              return linha.map((valor, colunaIndex) => {
                  const num = parseFloat(valor);
                  if (isNaN(num)) {
                      console.warn(`NaN detectado na linha ${index}, coluna ${colunaIndex}. Substituindo por 0.`);
                      return 0; // Substituir por 0 (ou qualquer outro valor como média/mediana)
                  }
                  return num;
              });
          };

          // Validar e corrigir valores NaN
          const XCorrigido = X.map(tratarNaN);
          const XNormalizado = this.normalizar(XCorrigido);
          const YNormalizado = this.normalizar(Y).map(d=>d[0]);

          console.log(`Aplicando PCA para ${numComponentes} componentes...`,YNormalizado.length);
          // XNormalizado.map((x,i)=>console.log("X",i,x))

          // Executar PCA
          const pca = new PCA(XNormalizado);
          const XTransformado = pca.predict(XNormalizado, { nComponents: numComponentes });

          // Combinar os componentes principais com o Y
          const datasetTransformado = XTransformado.to2DArray().map((linha, index) => {
              // return [...linha, YNormalizado[index]];
              return {input: linha, output:[YNormalizado[index]]}
          });

          console.log(
              `PCA concluído. Dataset atualizado com ${numComponentes} componentes principais e a última coluna como valor alvo.`,
              datasetTransformado.length,
              datasetTransformado[0].length,
              datasetTransformado[0]
          );

          // Atualizar o dataset
          this.dataset = datasetTransformado;
          resolve(datasetTransformado);
      } catch (error) {
          console.error("Erro ao aplicar PCA:", error);
          reject(error);
      }
    });
}//FIM DO PCA

async aplicarTSNE(dataset = this.dataset, numComponentes = this.tsne.nComponentsTSNE, perplexidade = this.tsne.perplexidade, iteracoes = this.tsne.nIteracoes) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando o t-SNE no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)
            const X = dataset.map(linha => linha.input); // Todas as colunas menos a última
            let Y = dataset.map(linha => linha.output); // Última coluna
            let indices_rejeitados = [];

            // Tratar valores NaN em X
            const tratarNaN = (linha, index) => {
                return linha.map((valor, colunaIndex) => {
                    const num = parseFloat(valor);
                    if (isNaN(num)) {
                        console.warn(`NaN detectado na linha ${index}, coluna ${colunaIndex}. Substituindo por 0.`);
                        return 0; // Substituir por 0 (ou qualquer outro valor como média/mediana)
                    }
                    return num;
                });
            };

            // Validar e corrigir valores NaN
            const XCorrigido = X.map(tratarNaN);


            const XNormalizado = this.normalizar(XCorrigido);
            const YNormalizado = this.normalizar(Y).map(d => d[0]);

            console.log(`Aplicando t-SNE para ${numComponentes} componentes...`, YNormalizado.length, this.tsne);

            // Executar t-SNE
            const tsne = new TSNE({
                dim: numComponentes, // Número de componentes
                perplexity: perplexidade, // Parâmetro de t-SNE
                iteration: iteracoes, // Número de iterações
                //perplexity: 30.0,
                earlyExaggeration: 4.0,
                learningRate: 100.0,
                nIter: iteracoes,
                metric: 'euclidean'
            });

            tsne.init({
                        data: XNormalizado,
                        type: 'dense'
                      });
            await tsne.run(); // Executa o algoritmo
            const XTransformado = await tsne.getOutput(); // Obtem os dados transformados

            // Combinar os componentes transformados com o Y
            const datasetTransformado = XTransformado.map((linha, index) => {
                // return [...linha, YNormalizado[index]];
                return {input: linha, output:[YNormalizado[index]]};
            });

            console.log(
                `t-SNE concluído. Dataset atualizado com ${numComponentes} componentes principais e a última coluna como valor alvo.`,
                datasetTransformado.length,
                datasetTransformado[0].length,
                datasetTransformado[0],
            );

            // Atualizar o dataset
            this.dataset = datasetTransformado;
            resolve(datasetTransformado);
        } catch (error) {
            console.error("Erro ao aplicar t-SNE:", error);
            reject(error);
        }
    });
}

async aplicarUMAP(dataset = this.dataset, numComponentes = this.umap.nComponents, vizinhos = this.umap.vizinhos, minDist = this.umap.minDist) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando o UMAP no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)
            const X = dataset.map(linha => linha.input);
            let Y = dataset.map(linha => linha.output);

            // Tratar valores NaN
            const tratarNaN = linha => linha.map(valor => (isNaN(parseFloat(valor)) ? 0 : parseFloat(valor)));
            const XCorrigido = X.map(tratarNaN);

            // Normalizar
            const XNormalizado = this.normalizar(XCorrigido);

            console.log("Valores normalizados:", XNormalizado[0]);

            // UMAP
            const umap = new UMAP({
                nComponents: numComponentes, // Número de dimensões
                nNeighbors: vizinhos, // Número de vizinhos locais
                minDist: minDist, // Distância mínima
                metric: 'euclidean' // Métrica de distância
            });

            console.log("Executando UMAP...");
            const XTransformado = await umap.fit(XNormalizado);

            const YNormalizado = this.normalizar(Y).map(d=>d[0]);
            // Combinar com Y
            const datasetTransformado = XTransformado.map((linha, index) => {return {input: linha, output:[YNormalizado[index]]}});

            console.log(
                `UMAP concluído. Dataset com ${numComponentes} componentes principais e valor alvo.`,
                datasetTransformado.length,
                datasetTransformado[0]
            );

            // Atualizar dataset
            this.dataset = datasetTransformado;
            resolve(datasetTransformado);
        } catch (error) {
            console.error("Erro ao aplicar UMAP:", error);
            reject(error);
        }
    });
}

async aplicarLASSO(dataset = this.dataset, alpha = this.lasso.alpha) {
    return new Promise((resolve, reject) => {
        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando o LASSO no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)
            const X = dataset.map(linha => linha.input);
            let Y = dataset.map(linha => linha.output);

            // Validar que X seja 2D e Y seja 1D
            if (!Array.isArray(X) || X.length === 0 || !Array.isArray(X[0])) {
                throw new Error("X deve ser uma matriz 2D.");
            }

            if (!Array.isArray(Y) || Y.length !== X.length) {
                throw new Error("Y deve ser um vetor 1D com o mesmo número de elementos que X.");
            }

            // Tratar valores NaN
            const tratarNaN = linha => linha.map(valor => (isNaN(parseFloat(valor)) ? 0 : parseFloat(valor)));
            const XCorrigido = X.map(tratarNaN);
            const YCorrigido = Y.map(valor => (isNaN(parseFloat(valor)) ? [0] : [parseFloat(valor)] ));

            // Normalizar os dados
            const XNormalizado = this.normalizar(XCorrigido);
            const YNormalizado = YCorrigido; // Manter Y no formato unidimensional

            // console.log("Valores normalizados:", XNormalizado[0]);

            // Ajustar o modelo LASSO
            const lasso = new LassoRegression(XNormalizado, YNormalizado, alpha);
            const coeficientes = lasso.weights;

            console.log("Coeficientes ajustados pelo LASSO:", coeficientes);

            // Filtrar features relevantes (coeficientes diferentes de zero)
            const featuresRelevantes = coeficientes
                .map((coef, index) => ({ featureIndex: index, coef }))
                // .filter(f => console.log("f.coef",f.coef[0]))
                .map(f => {
                  if(f.coef[0] !== 0)
                    return 1;
                  return 0;

                })
                //.map(f => f.featureIndex);

            console.log("Features selecionadas pelo LASSO:", featuresRelevantes);
            this.features = featuresRelevantes;
            this.filtrarFeatures();
            // Criar novo dataset com apenas as features selecionadas
            const XSelecionado = XNormalizado.map(row => featuresRelevantes.map(index => row[index]));
            // const finalFeatures = featuresRelevantes.

            // Combinar com Y novamente
            const datasetSelecionado = XSelecionado.map((linha, index) => {return {input: linha, output:[YNormalizado[index]]}});

            console.log(
                "LASSO concluído. Dataset atualizado com features selecionadas:",
                datasetSelecionado.length,
                datasetSelecionado[0].length
            );

            resolve({ datasetSelecionado, featuresRelevantes, coeficientes });
        } catch (error) {
            console.error("Erro ao aplicar LASSO:", error);
            reject(error);
        }
    });
}

async aplicarRandomForestFeatureImportance(dataset = this.dataset, numTrees = this.rf_fi.n_trees, maxFeatures = this.rf_fi.maxFeatures, replacement = this.rf_fi.replacement, limiar = this.rf_fi.limiar) {

  const { RandomForestRegression } = require('ml-random-forest');
    return new Promise((resolve, reject) => {

        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando o Random Forest no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)
            const X = dataset.map(linha => linha.input); // Features
            const Y = dataset.map(linha => linha.output); // Target

            // Validar X e Y
            if (!Array.isArray(X) || X.length === 0 || !Array.isArray(X[0])) {
                throw new Error("X deve ser uma matriz 2D.");
            }
            if (!Array.isArray(Y) || Y.length !== X.length) {
                throw new Error("Y deve ser um vetor 1D com o mesmo número de elementos que X.");
            }

            // Tratar valores NaN
            const tratarNaN = linha => linha.map(valor => (isNaN(parseFloat(valor)) ? 0 : parseFloat(valor)));
            const XCorrigido = X.map(tratarNaN);

            console.log("Treinando Random Forest para calcular Feature Importance...",X[0],Y[0],this.rf_fi );

            // Treinar o Random Forest
            const rf = new RandomForestRegression({
                nEstimators: numTrees, // Número de árvores
                maxFeatures: maxFeatures, // Máximo de features a serem consideradas
                replacement: replacement // Sem reposição
            });

            const YNormalizado = this.normalizar(Y).map(d=>d[0]);
            rf.train(XCorrigido, YNormalizado);

            // Calcular a importância das features manualmente
            const numFeatures = X[0].length;
            const featureImportances = Array(numFeatures).fill(0);

            // Iterar por todas as árvores na floresta
            rf.estimators.forEach(tree => {
                this.calcularImportanciaPorArvore(tree.root, featureImportances);
            });

            // Normalizar as importâncias
            const totalImportance = featureImportances.reduce((a, b) => a + b, 0);
            const normalizedImportances = featureImportances.map(val => val / totalImportance);

            console.log("Importância normalizada das features:",featureImportances);
            console.table(normalizedImportances.map((imp, idx) => ({ Feature: idx, Importance: imp })));

            // Selecionar features relevantes (importância > 0)
            const featuresRelevantes = normalizedImportances
                .map((importance, index) => ({ index, importance }))
                //.filter(f => f.importance > 0) // Apenas features relevantes
                //.sort((a, b) => b.importance - a.importance) // Ordenar por importância
                .map(f => f.importance)
                .map(f => {
                //  console.log("f",f)
                  // if(f !== 0)
                  if(f < limiar)//0.025)
                    return 1;
                  return 0;
                })

            console.log("Features selecionadas:", featuresRelevantes);

            // Criar novo dataset com as features selecionadas
            const XSelecionado = XCorrigido.map(row => featuresRelevantes.map(index => row[index]));

            const datasetSelecionado = XSelecionado.map((linha, index) => {return {input: linha, output:[YNormalizado[index]]}});

            console.log(
                "Random Forest concluído. Dataset atualizado com features selecionadas:",
                datasetSelecionado.length,
                datasetSelecionado[0].length
            );
            this.features = featuresRelevantes;
            this.filtrarFeatures();
            resolve({ datasetSelecionado, featuresRelevantes, importancias: normalizedImportances });
        } catch (error) {
            console.error("Erro ao aplicar Random Forest:", error);
            reject(error);
        }
    });
}

async aplicarCorrelacao(dataset = this.dataset, limiar = this.correlation.limiar) {
    return new Promise((resolve, reject) => {
        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando a análise de correlação no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)

            const X = dataset.map(linha => linha.input); // Features
            const Y = dataset.map(linha => linha.output); // Target

            // Validar X e Y
            if (!Array.isArray(X) || X.length === 0 || !Array.isArray(X[0])) {
                throw new Error("X deve ser uma matriz 2D.");
            }
            if (!Array.isArray(Y) || Y.length !== X.length) {
                throw new Error("Y deve ser um vetor 1D com o mesmo número de elementos que X.");
            }

            // Tratar valores NaN
            const tratarNaN = linha => linha.map(valor => (isNaN(parseFloat(valor)) ? 0 : parseFloat(valor)));
            const XCorrigido = X.map(tratarNaN);
            const YNormalizado = this.normalizar(Y);//.map(d=>d[0]);

            console.log("Calculando a correlação...",YNormalizado[0]);

            // Calcular correlação de cada feature com Y
            const correlacoes = XCorrigido[0].map((_, featureIndex) => {
                const featureColuna = XCorrigido.map(linha => linha[featureIndex]); // Extrair coluna da feature
                const correlacao = this.calcularCorrelacao(featureColuna, YNormalizado); // Função de correlação
                return { featureIndex, correlacao };
            });

            console.log("CORRELACOES",correlacoes);
            // Ordenar features pela correlação (em ordem decrescente)
            const featuresOrdenadas = correlacoes
                .sort((a, b) => Math.abs(a.featureIndex) - Math.abs(b.featureIndex))
                .map(f => f.correlacao)
                .map(f => {
                 //console.log("f",f)
                  // if(f !== 0)
                  if(f > limiar)
                    return 1;
                  return 0;
                })

            console.log("Features ordenadas por correlação com Y:", featuresOrdenadas,"FEATURES length",featuresOrdenadas.filter(fo=>fo == 1).length);

            this.features = featuresOrdenadas;
            this.filtrarFeatures();
            // Criar novo dataset com as features ordenadas
            const XSelecionado = XCorrigido.map(linha => featuresOrdenadas.map(index => linha[index]));

            const datasetSelecionado = XSelecionado.map((linha, index) => {return {input: linha, output:[YNormalizado[index]]}});

            console.log(
                "Análise de correlação concluída. Dataset atualizado com features ordenadas:",
                datasetSelecionado.length,
                datasetSelecionado[0].length
            );

            resolve({ datasetSelecionado, featuresOrdenadas, correlacoes });
        } catch (error) {
            console.error("Erro ao aplicar correlação:", error);
            reject(error);
        }
    });
}


  treinar() {
    this.validacaoTesteSize = Math.ceil(this.dataset.length * this.validacaoTesteProp);
    this.testeSize = this.validacaoTesteSize; // Tamanho do conjunto de teste
    this.trainingSet = new Array(this.dataset.length - 2 * this.validacaoTesteSize);
    this.validationSet = new Array(this.validacaoTesteSize);
    this.testSet = new Array(this.testeSize); // Conjunto de teste
    this.predictionsTS = new Array(this.trainingSet.length);
    this.predictionsVS = new Array(this.validationSet.length);
    this.predictionsTest = new Array(this.testSet.length); // Previsões do conjunto de teste

    // Dividir os dados em conjuntos de treinamento, validação e teste
  console.log('trainingSet',this.trainingSet.length,"this.dataset",this.dataset.length,"colunas",this.dataset[0].length,"features",this.features.filter(f=>f==1).length)
    for (let i = 0; i < this.trainingSet.length; ++i) {
      //console.log("I",i)
        this.trainingSet[i] = this.dataset[i]//.slice(0, this.dataset[i].length - 2).map(Number);
        //this.predictionsTS[i] = Number(this.dataset[i][this.dataset[i].length - 1]);
    }
    for (let i = this.trainingSet.length; i < this.trainingSet.length + this.validationSet.length; ++i) {
        const index = i - this.trainingSet.length;
        this.validationSet[index] = this.dataset[i]//.slice(0, this.dataset[i].length - 2).map(Number);
        //this.predictionsVS[index] = Number(this.dataset[i][this.dataset[i].length - 1]);
    }
    for (
        let i = this.trainingSet.length + this.validationSet.length;
        i < this.dataset.length;
        ++i
    ) {
        const index = i - this.trainingSet.length - this.validationSet.length;
        this.testSet[index] = this.dataset[i]//.slice(0, this.dataset[i].length - 2).map(Number);
        //this.predictionsTest[index] = Number(this.dataset[i][this.dataset[i].length - 1]);
    }

    console.log(`INICIANDO GRID SEARCH PARA INDIVÍDUO [${this.id}]`);

    const gridSearchConfig = {
        // layers: [this.max_features],//,max_features,max_features],//18,18,18
        // iterations: [1000, 2000, 3000]
        // errorThresh: [0.0005, 0.0006, 0.0007],
        // activation: ['logistic','hyperbolic'],
        // learningRate: [0.3, 0.4, 0.5],
        // momentum: [0.2, 0.5, 0.8],
        // log: 50

        layers: [this.max_features],//,max_features,max_features],//18,18,18
        iterations: 1000,
        errorThresh: [0.0005],
        activation: ['logistic'],
        learningRate: [0.4],
        momentum: [0.2],
        log: 50
    };

    // const maxAvailableFeatures = this.trainingSet[0].length; // Total de features disponíveis
    // gridSearchConfig.maxFeatures = gridSearchConfig.maxFeatures.filter(
    //     maxFeatures => maxFeatures < maxAvailableFeatures
    // ); // Filtrar valores inválidos

    let bestConfig = null;
    let bestPerformance = -Infinity;
    //APÓS CROSS-VALIDATION
    for (let errorThresh of gridSearchConfig.errorThresh) {
        for (let activation of gridSearchConfig.activation) {
            for (let learningRate of gridSearchConfig.learningRate) {
                for (let momentum of gridSearchConfig.momentum) {
                    const currentOptions = {
                        ...this.option,
                        errorThresh: errorThresh,
                        activation: activation,
                        learningRate: learningRate,
                        momentum: momentum,
                    };

                    // console.log(
                    //     `Testando configuração: nEstimators=${nEstimators}, maxFeatures=${maxFeatures}, replacement=${replacement}, seed=${seed}`
                    // );

                    // Criar nova instância de RandomForest com as opções atuais
                    this.regression = new nn(currentOptions);

                    try {
                          this.regression.train(this.trainingSet); // Treinar o modelo com o conjunto de treinamento

                          // Fazer previsões desnormalizadas
                          const predictions = this.validationSet.map((TD, i) => {
                              // Previsão do modelo
                              const predNormalizado = this.regression.send(TD.input)[0];
                              // Desnormalizar o valor previsto
                              const predDesnormalizado = F.desnormalizar(this.vetores[61], predNormalizado);
                              return predDesnormalizado;
                          });

                          // Valores reais desnormalizados
                          const reais = this.validationSet.map(TD => F.desnormalizar(this.vetores[61], TD.output));

                          // Calcular MSE
                          const mse = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - reais[i], 2), 0) / predictions.length;

                          // Calcular MST
                          const mediaReais = reais.reduce((sum, valor) => sum + valor, 0) / reais.length;
                          const mst = reais.reduce((sum, actual) => sum + Math.pow(actual - mediaReais, 2), 0) / reais.length;

                          // Calcular R²
                          const rSquared = 1 - mse / mst;
                          console.log(`rSquared=${rSquared}`)
                          // Atualizar melhor configuração
                          if (rSquared > bestPerformance) {
                              bestPerformance = rSquared;
                              bestConfig = { ...currentOptions };
                          }
                      } catch (e) {
                          console.error(
                              `Erro ao treinar com a configuração: errorThresh=${errorThresh}, activation=${activation}, learningRate=${learningRate}, momentum=${momentum}`,
                              e
                          );
                      }

                }
            }
        }
    }
    //CROS-VALIDATION LOOCV
    /*for (let errorThresh of gridSearchConfig.errorThresh) {
    for (let activation of gridSearchConfig.activation) {
        for (let learningRate of gridSearchConfig.learningRate) {
            for (let momentum of gridSearchConfig.momentum) {
                const currentOptions = {
                    ...this.option,
                    errorThresh: errorThresh,
                    activation: activation,
                    learningRate: learningRate,
                    momentum: momentum,
                };

                console.log(
                    `Testando configuração: errorThresh=${errorThresh}, activation=${activation}, learningRate=${learningRate}, momentum=${momentum}`
                );

                let totalRSquared = 0;
                let validacoesRealizadas = 0;

                try {
                    for (let i = 0; i < this.trainingSet.length; ++i) {
                        // Criar cópias dos conjuntos de treinamento e predições
                        const trainData = [...this.trainingSet];
                        const trainLabels = [...this.predictionsTS];

                        // Separar uma amostra para validação
                        const validationSample = trainData.splice(i, 1)[0];
                        const validationLabel = trainLabels.splice(i, 1)[0];

                        // Criar e treinar o modelo com a configuração atual
                        this.regression = new nn(currentOptions);
                        this.regression.train(trainData);

                        // Fazer previsão para a amostra de validação
                        const predNormalizado = this.regression.send(validationSample.input)[0];
                        const predDesnormalizado = F.desnormalizar(this.vetores[61], predNormalizado);
                        const realDesnormalizado = F.desnormalizar(this.vetores[61], validationLabel);

                        // Calcular erro
                        const error = Math.pow(predDesnormalizado - realDesnormalizado, 2);
                        totalRSquared += error;
                        validacoesRealizadas++;
                    }

                    // Calcular R² médio sobre todas as iterações LOOCV
                    const mse = totalRSquared / validacoesRealizadas;
                    const mediaReais = this.predictionsTS.reduce((sum, valor) => sum + valor, 0) / this.predictionsTS.length;
                    const mst = this.predictionsTS.reduce((sum, actual) => sum + Math.pow(actual - mediaReais, 2), 0) / this.predictionsTS.length;
                    const rSquared = 1 - mse / mst;

                    console.log(`R² médio para configuração atual: ${rSquared}`);

                    // Atualizar melhor configuração
                    if (rSquared > bestPerformance) {
                        bestPerformance = rSquared;
                        bestConfig = { ...currentOptions };
                    }

                } catch (e) {
                    console.error(
                        `Erro ao treinar com a configuração: errorThresh=${errorThresh}, activation=${activation}, learningRate=${learningRate}, momentum=${momentum}`,
                        e
                    );
                }
            }
        }
    }
} */

    // Treinar com a melhor configuração encontrada
    /*if (bestConfig) {
        console.log(`Melhor configuração:`, bestConfig);
        this.regression = new nn(bestConfig);
        try {
            this.regression.train(this.trainingSet)//, this.predictionsTS);
            console.log(`Modelo treinado com a melhor configuração.`);
        } catch (e) {
            console.error(`Erro ao treinar com a melhor configuração:`, e);
        }
    } else {
        console.error("Nenhuma configuração válida encontrada durante o Grid Search.");
    }*/
}






calcularResultado() {
    // Predições para os conjuntos de validação e teste
    this.resultValidation = this.validationSet.map(TD => {
        const predNormalizado = this.regression.send(TD.input)[0];
        return F.desnormalizar(this.vetores[61], predNormalizado); // Desnormalizar a predição
    });

    this.resultTest = this.testSet.map(TD => {
        const predNormalizado = this.regression.send(TD.input)[0];
        return F.desnormalizar(this.vetores[61], predNormalizado); // Desnormalizar a predição
    });

    const limiar = 0.1;

    console.log(`FIM DO TREINO DO INDIVÍDUO [${this.id}]`);

    // Inicializar métricas
    this.MEDIA = 0;
    let MSTValidation = 0;
    let MSTTest = 0;
    let MSETest = 0;

    let totalValidation = 0;

    this.validationSet.forEach((TD, i) => {
        const real = F.desnormalizar(this.vetores[61], TD.output); // Valor real desnormalizado
        const predito = this.resultValidation[i];

        // Atualizar média
        this.MEDIA += real;
        totalValidation++;

        const diferenca = Math.abs(real - predito);

        // Comparação com limiares
        this.acertos += diferenca < real * limiar ? 1 : 0;
        if (diferenca < real * 0.1) this.acertos_10 += 1;
        else if (diferenca < real * 0.2) this.acertos_20 += 1;
        else if (diferenca < real * 0.3) this.acertos_30 += 1;
        else if (diferenca < real) this.acertos_acima_30 += 1;

        // Métricas de validação
        this.MST += Math.pow(real - this.MEDIA / totalValidation, 2);
        this.MSE += Math.pow(predito - real, 2);

        this.RMSE += Math.pow(predito - real, 2);
        this.MAE += Math.abs(predito - real);
        this.MAPE += Math.abs((real - predito) / real);
        this.SMAPE += Math.abs(predito - real) / ((Math.abs(predito) + Math.abs(real)) / 2);
    });

    // Calcular métricas para o conjunto de teste
    this.testSet.forEach((TD, i) => {
        const real = F.desnormalizar(this.vetores[61], TD.output); // Valor real desnormalizado
        const predito = this.resultTest[i];

        MSTTest += Math.pow(real - this.MEDIA / totalValidation, 2);
        MSETest += Math.pow(predito - real, 2);
    });

    // Normalizar as métricas de validação
    this.MEDIA /= totalValidation;
    this.MST /= this.validationSet.length;
    this.MSE /= this.validationSet.length;
    this.RMSE = Math.sqrt(this.RMSE / this.validationSet.length);
    this.MAE /= this.validationSet.length;
    this.MAPE /= this.validationSet.length;
    this.SMAPE = (this.SMAPE / this.validationSet.length) * 100;
    this.R_QD = 1 - this.MSE / this.MST;

    // Calcular R² para o conjunto de teste
    MSTTest /= this.testSet.length;
    MSETest /= this.testSet.length;
    this.R_QD_TESTE = 1 - MSETest / MSTTest;

    // console.log("Métricas calculadas:");
    // console.log({
    //     R_QD: this.R_QD,
    //     RMSE: this.RMSE,
    //     MAE: this.MAE,
    //     MAPE: this.MAPE,
    //     SMAPE: this.SMAPE,
    //     R_QD_TESTE: this.R_QD_TESTE,
    // });
}




    retornaResultado() {
      return {
          // Métricas do conjunto de validação
          FEATURES:this.features,
          FEATURES_LENGHT: this.features.filter(f=>f==1).length,
          MEDIA: this.MEDIA,
          MST: this.MST,
          MSE: this.MSE,
          RMSE: this.RMSE,
          MAE: this.MAE,
          MAPE: this.MAPE,
          SMAPE: this.SMAPE / 100, // Converte para decimal
          R_QD: this.R_QD,

          // Métricas do conjunto de teste
          MST_TESTE: this.MST_TESTE,
          MSE_TESTE: this.MSE_TESTE,
          RMSE_TESTE: this.RMSE_TESTE,
          R_QD_TESTE: this.R_QD_TESTE,

          // // Acurácia (validação)
          // PA_10: 100 * this.acertos_10 / this.resultValidation.length,
          // PA_20: 100 * this.acertos_20 / this.resultValidation.length,
          // PA_30: 100 * this.acertos_30 / this.resultValidation.length,
          // PA_ACIMA_30: 100 * this.acertos_acima_30 / this.resultValidation.length
      };
  }
  exibirInfo() {
      console.log(`
          === RESULTADOS DO INDIVÍDUO [${this.id}] ===

          --- Métricas do Conjunto de Validação ---
          Acurácia: ${((100 * this.acertos) / this.resultValidation.length).toFixed(2)}% no grau de confiança
          Média: ${this.MEDIA.toFixed(4)}
          MST (Total de Quadrados): ${this.MST.toFixed(4)}
          MSE (Erro Médio Quadrado): ${this.MSE.toFixed(4)}
          RMSE (Raiz do Erro Médio Quadrado): ${this.RMSE.toFixed(4)}
          MAE (Erro Médio Absoluto): ${this.MAE.toFixed(4)}
          MAPE (Erro Médio Percentual Absoluto): ${(this.MAPE * 100).toFixed(2)}%
          SMAPE (Erro Médio Percentual Simétrico): ${this.SMAPE.toFixed(2)}%
          R² (Coeficiente de Determinação): ${this.R_QD.toFixed(4)}

          R² (Teste): ${this.R_QD_TESTE.toFixed(4)}
      `);
  }
}

// Exportando a classe ajustada
module.exports = KcPredictionRF;
