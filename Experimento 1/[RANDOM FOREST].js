const RFRegression = require("ml-random-forest").RandomForestRegression;
const DB = require("./DOUTORADO_BASE.json");
const {PCA} = require('ml-pca');
const {UMAP} = require('umap-js');
const TSNE = require('tsne-js');
const {LassoRegression} = require('ml-regression-lasso');

class CropYieldPredictionRF {
  constructor(id, limit, features, pca, tsne, umap, lasso, rf_fi, correlation) {
    this.id = id;
    this.limit = false;//limit;
    this.pca    = pca;
    this.tsne   = tsne;
    this.umap   = umap;
    this.lasso    = lasso;
    this.rf_fi    = rf_fi;
    this.correlation    = correlation;
    this.features = features;
    this.dataset = [];
    this.validacaoTesteProp = 2/10; // 2/10 para validação e teste
    this.testeProp = 2/10; // 1/10 para teste
    this.validacaoTesteSize = 0;
    this.testeSize = 0;

    this.options = {
      seed: 8,
      maxFeatures: 45,
      replacement: false,
      nEstimators: 100,
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

    this.regression = new RFRegression(this.options);
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

    DB.map((dado,i)=>{
      if(this.limit)
      {
        if(i>100)
         return;
      }
        var linha = [];
        //LOCAL / MANEJO
        linha.push(dado['F_FAZENDA_1']);//1
        linha.push(dado['F_FAZENDA_2']);//2
        linha.push(dado['F_FAZENDA_3']);//3
        linha.push(dado['F_FAZENDA_5']);//4
        linha.push(dado['F_FAZENDA_4']);//5
        linha.push(dado['F_FAZENDA_6']);//6
        linha.push(dado['F_FAZENDA_7']);//7

        //OPERAÇÃO
        linha.push(dado['TOTAL_APL_NITRATO']);//8
        linha.push(dado['DIAS_ATE_FIM_CICLO']);//9

        //VARIEDADE
        linha.push(dado['V_VARIEDADE_1']);//10
        linha.push(dado['V_VARIEDADE_2']);//11
        linha.push(dado['V_VARIEDADE_3']);//12
        linha.push(dado['V_VARIEDADE_4']);//13
        linha.push(dado['V_VARIEDADE_5']);//14

        //COMPOSIÇÃO DO SOLO
        linha.push(dado['MATERIA_ORGANICA']);//15
        linha.push(dado['CARBONO_ORGANICO']);//16
        linha.push(dado['SOMA_BASES']);//17
        linha.push(dado['SATURACAO_BASE']);//18
        linha.push(dado['pH_agua']);//19
        linha.push(dado['pH']);//20
        linha.push(dado['pH2']);//21
        linha.push(dado['CTC']);//22

        //MACRONUTRIENTES
        linha.push(dado['AL3']  ? dado['AL3']: 0);//23
        linha.push(dado['H_AL3']   ? dado['H_AL3'] : 0 );//24
        linha.push(dado['P']   ?  dado['P'] : 0  );//25
        linha.push(dado['K']    ? dado['K'] : 0 );//26
        linha.push(dado['Ca']    ? dado['Ca'] : 0 );//27
        linha.push(dado['Mg']    ? dado['Mg'] : 0 );//28
        linha.push(dado['Na']    ?  dado['Na']: 0 );//29

        //MICRONUTRIENTES
        linha.push(dado['Cu']    ? dado['Cu'] : 0 );//30
        linha.push(dado['Fe']    ? dado['Fe'] : 0  );//31
        linha.push(dado['Mn']    ? dado['Mn'] : 0 );//32
        linha.push(dado['Zn']    ? dado['Zn']: 0 );//33
        linha.push(dado['B']     ? dado['B'] : 0 );//34
        linha.push(dado['S']     ? dado['S'] : 0 );//35

        //FISIOLÓGICAS
        linha.push(dado['NUM_PLANTAS']);//36
        linha.push(dado['ESP_ENTRE_RUAS']);//37
        linha.push(dado['ESP_ENTRE_PLANTAS']);//38
        linha.push(dado['PLANTAS_HA']);//39
        linha.push(dado['APROD_RE_AREATOTAL']);//40

        //TIPO DE SOLO
        linha.push(dado['TS_FRANCO_SILTOSA']);//41
        linha.push(dado['TS_FRANCO_ARENOSA']);//42
        linha.push(dado['TS_AREIA_FRANCA']);//43
        linha.push(dado['TS_AREIA']);//44
        linha.push(dado['TS_FRANCA']);//45
        linha.push(dado['TS_FRANCO_ARGILOSA']);//46
        linha.push(dado['TS_FRANCO_ARGILOARENOSA']);//47
        linha.push(dado['TS_ARGILA']);//48


        //CALIBRES
        linha.push(dado['AVG_CALIBRE_6']);//49
        linha.push(dado['AVG_CALIBRE_7']);//50
        linha.push(dado['AVG_CALIBRE_8']);//51
        linha.push(dado['AVG_CALIBRE_9']);//52
        linha.push(dado['AVG_CALIBRE_10']);//53
        linha.push(dado['AVG_CALIBRE_12']);//54
        linha.push(dado['AVG_CALIBRE_14']);//55

        linha.push(dado['TON_HA']);//56

        this.dataset.push(linha);
    });//FIM DO MAP
    // if(this.limit)
    this.dataset = this.dataset.sort(() => Math.random() - 0.5);//BALANCERAR OS DADOS

    //LÓGICA PARA ENCURTAR O ARRAY COM BASE NOS FEATURES
    this.dataset = this.dataset.map(ds=>{
      // console.log("Object.keys(ds)",Object.keys(ds),ds[0]);
      // return Object.keys(ds)
      var retorno = [];

      this.features.map((feature,j)=>{
        if(feature == 1)//ENTRA
          // console.log('ds[i]',ds[j])
          // retorno[Object.keys(retorno).length] = ds[j]
          retorno.push(ds[j]);
      })
      // retorno[Object.keys(retorno).length] = ds[55];
      retorno.push(ds[55]);
      // console.log("retorno",retorno);
      return retorno;
    })
    this.options            = {...this.options,maxFeatures:this.dataset[0].length-2}//AJUSTANDO O MAX FEATURES COM BASE NO NOVO DATASET



    this.regression         = new RFRegression(this.options);

    // console.log("this.features",this.features,this.dataset[0],this.options);
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
    const n = x.length;
    const mediaX = x.reduce((acc, val) => acc + val, 0) / n;
    const mediaY = y.reduce((acc, val) => acc + val, 0) / n;

    const numerador = x.reduce((acc, xi, i) => acc + (xi - mediaX) * (y[i] - mediaY), 0);
    const denominador = Math.sqrt(
        x.reduce((acc, xi) => acc + Math.pow(xi - mediaX, 2), 0) *
        y.reduce((acc, yi) => acc + Math.pow(yi - mediaY, 2), 0)
    );

    return denominador === 0 ? 0 : numerador / denominador;
  }

  filtrarFeatures(){

      //LÓGICA PARA ENCURTAR O ARRAY COM BASE NOS FEATURES
      this.dataset = this.dataset.map(ds=>{
        // console.log("Object.keys(ds)",Object.keys(ds),ds[0]);
        // return Object.keys(ds)
        var retorno = [];

        this.features.map((feature,j)=>{
          if(feature == 1)//ENTRA
            // console.log('ds[i]',ds[j])
            // retorno[Object.keys(retorno).length] = ds[j]
            retorno.push(ds[j]);
        })
        // retorno[Object.keys(retorno).length] = ds[55];
        retorno.push(ds[ds.length-1]);
        // console.log("retorno",retorno);
        return retorno;
      })
      console.log("this.features",this.features, this.dataset[0]);
  }

async aplicarPCA(dataset = this.dataset, numComponentes = 11) {
  return new Promise((resolve, reject) => {
      try {
          if (!dataset || dataset.length === 0) {
              throw new Error("O conjunto de dados está vazio.");
          }

          console.log("Iniciando o PCA no dataset com", dataset.length, "linhas.");

          // Separar X (features) e Y (última coluna como valor alvo)
          const X = dataset.map(linha => linha.slice(0, -1)); // Todas as colunas menos a última
          let Y = dataset.map(linha => linha[linha.length - 1]); // Última coluna
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
              return [...linha, YNormalizado[index]];
          });

          console.log(
              `PCA concluído. Dataset atualizado com ${numComponentes} componentes principais e a última coluna como valor alvo.`,
              datasetTransformado.length,
              datasetTransformado[0].length
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

async aplicarTSNE(dataset = this.dataset, numComponentes = 2, perplexidade = 20, iteracoes = 1000) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando o t-SNE no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)
            const X = dataset.map(linha => linha.slice(0, -1)); // Todas as colunas menos a última
            let Y = dataset.map(linha => linha[linha.length - 1]); // Última coluna
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

            console.log(`Aplicando t-SNE para ${numComponentes} componentes...`, YNormalizado.length);

            // Executar t-SNE
            const tsne = new TSNE({
                dim: numComponentes, // Número de componentes
                perplexity: perplexidade, // Parâmetro de t-SNE
                // iteration: iteracoes, // Número de iterações
                perplexity: 30.0,
                earlyExaggeration: 4.0,
                learningRate: 100.0,
                // nIter: iteracoes,
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
                return [...linha, YNormalizado[index]];
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

async aplicarUMAP(dataset = this.dataset, numComponentes = 20, vizinhos = 11, minDist = 0.01) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando o UMAP no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)
            const X = dataset.map(linha => linha.slice(0, -1));
            let Y = dataset.map(linha => linha[linha.length - 1]);

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

            // Combinar com Y
            const datasetTransformado = XTransformado.map((linha, index) => [...linha, Y[index]]);

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

async aplicarLASSO(dataset = this.dataset, alpha = 0.01) {
    return new Promise((resolve, reject) => {
        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando o LASSO no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)
            const X = dataset.map(linha => linha.slice(0, -1));
            let Y = dataset.map(linha => linha[linha.length - 1]);

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
            const datasetSelecionado = XSelecionado.map((linha, index) => [...linha, YNormalizado[index]]);

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

async  aplicarRandomForestFeatureImportance(dataset = this.dataset, numTrees = 100) {

  const { RandomForestRegression } = require('ml-random-forest');
    return new Promise((resolve, reject) => {

        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando o Random Forest no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)
            const X = dataset.map(linha => linha.slice(0, -1)); // Features
            const Y = dataset.map(linha => linha[linha.length - 1]); // Target

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

            console.log("Treinando Random Forest para calcular Feature Importance...");

            // Treinar o Random Forest
            const rf = new RandomForestRegression({
                nEstimators: numTrees, // Número de árvores
                maxFeatures: 50, // Máximo de features a serem consideradas
                replacement: false // Sem reposição
            });

            rf.train(XCorrigido, Y);

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

            console.log("Importância normalizada das features:");
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
                  if(f < 0.025)
                    return 1;
                  return 0;
                })

            console.log("Features selecionadas:", featuresRelevantes);

            // Criar novo dataset com as features selecionadas
            const XSelecionado = XCorrigido.map(row => featuresRelevantes.map(index => row[index]));
            const datasetSelecionado = XSelecionado.map((linha, index) => [...linha, Y[index]]);

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

async aplicarCorrelacao(dataset = this.dataset) {
    return new Promise((resolve, reject) => {
        try {
            if (!dataset || dataset.length === 0) {
                throw new Error("O conjunto de dados está vazio.");
            }

            console.log("Iniciando a análise de correlação no dataset com", dataset.length, "linhas.");

            // Separar X (features) e Y (última coluna como valor alvo)
            const X = dataset.map(linha => linha.slice(0, -1)); // Features
            const Y = dataset.map(linha => linha[linha.length - 1]); // Target

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

            console.log("Calculando a correlação...");

            // Calcular correlação de cada feature com Y
            const correlacoes = XCorrigido[0].map((_, featureIndex) => {
                const featureColuna = XCorrigido.map(linha => linha[featureIndex]); // Extrair coluna da feature
                const correlacao = this.calcularCorrelacao(featureColuna, Y); // Função de correlação
                return { featureIndex, correlacao };
            });

            console.log("CORRELACOES",correlacoes);
            // Ordenar features pela correlação (em ordem decrescente)
            const featuresOrdenadas = correlacoes
                .sort((a, b) => Math.abs(b.correlacao) - Math.abs(a.correlacao))
                .map(f => f.correlacao)
                .map(f => {
                //  console.log("f",f)
                  // if(f !== 0)
                  if(f > 0.15)
                    return 1;
                  return 0;
                })

            console.log("Features ordenadas por correlação com Y:", featuresOrdenadas);

            this.features = featuresOrdenadas;
            this.filtrarFeatures();
            // Criar novo dataset com as features ordenadas
            const XSelecionado = XCorrigido.map(linha => featuresOrdenadas.map(index => linha[index]));
            const datasetSelecionado = XSelecionado.map((linha, index) => [...linha, Y[index]]);

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
        this.trainingSet[i] = this.dataset[i].slice(0, this.dataset[i].length - 2).map(Number);
        this.predictionsTS[i] = Number(this.dataset[i][this.dataset[i].length - 1]);
    }
    for (let i = this.trainingSet.length; i < this.trainingSet.length + this.validationSet.length; ++i) {
        const index = i - this.trainingSet.length;
        this.validationSet[index] = this.dataset[i].slice(0, this.dataset[i].length - 2).map(Number);
        this.predictionsVS[index] = Number(this.dataset[i][this.dataset[i].length - 1]);
    }
    for (
        let i = this.trainingSet.length + this.validationSet.length;
        i < this.dataset.length;
        ++i
    ) {
        const index = i - this.trainingSet.length - this.validationSet.length;
        this.testSet[index] = this.dataset[i].slice(0, this.dataset[i].length - 2).map(Number);
        this.predictionsTest[index] = Number(this.dataset[i][this.dataset[i].length - 1]);
    }

    console.log(`INICIANDO GRID SEARCH PARA INDIVÍDUO [${this.id}]`);

    const gridSearchConfig = {
        // nEstimators: [50, 100, 150],
        // maxFeatures: [5, 10, 15], // Ajuste inicial
        // replacement: [true, false],
        // seed: [8]

        nEstimators: [100],
        maxFeatures: [this.tsne ? 1 : 5], // Ajuste inicial
        replacement: [true],
        seed: [8]
    };

    const maxAvailableFeatures = this.trainingSet[0].length; // Total de features disponíveis
    gridSearchConfig.maxFeatures = gridSearchConfig.maxFeatures.filter(
        maxFeatures => maxFeatures < maxAvailableFeatures
    ); // Filtrar valores inválidos

    let bestConfig = null;
    let bestPerformance = -Infinity;
    //EXECUTAR APÓS CROSS-VALIDATION
    for (let nEstimators of gridSearchConfig.nEstimators) {
        for (let maxFeatures of gridSearchConfig.maxFeatures) {
            for (let replacement of gridSearchConfig.replacement) {
                for (let seed of gridSearchConfig.seed) {
                    const currentOptions = {
                        nEstimators,
                        maxFeatures,
                        replacement,
                        seed
                    };

                    console.log(
                        `Testando configuração: nEstimators=${nEstimators}, maxFeatures=${maxFeatures}, replacement=${replacement}, seed=${seed}`
                    );

                    // Criar nova instância de RandomForest com as opções atuais
                    this.regression = new RFRegression(currentOptions);

                    try {
                        this.regression.train(this.trainingSet, this.predictionsTS);

                        // Fazer previsões e calcular R²
                        const predictions = this.regression.predict(this.validationSet);
                        const mse = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - this.predictionsVS[i], 2), 0) / predictions.length;
                        const mst = this.predictionsVS.reduce((sum, actual) => sum + Math.pow(actual - this.MEDIA, 2), 0) / this.predictionsVS.length;
                        const rSquared = 1 - mse / mst;

                        console.log(`R² para configuração atual: ${rSquared}`);

                        // Atualizar melhor configuração
                        if (rSquared > bestPerformance) {
                            bestPerformance = rSquared;
                            bestConfig = { ...currentOptions };
                        }
                    } catch (e) {
                        console.error(`Erro ao treinar com a configuração: nEstimators=${nEstimators}, maxFeatures=${maxFeatures}, replacement=${replacement}, seed=${seed}`, e);
                    }
                }
            }
        }
    }

    //CROSS-VALIDATION LOOCV
    /*for (let nEstimators of gridSearchConfig.nEstimators) {
        for (let maxFeatures of gridSearchConfig.maxFeatures) {
            for (let replacement of gridSearchConfig.replacement) {
                for (let seed of gridSearchConfig.seed) {
                    const currentOptions = {
                        nEstimators,
                        maxFeatures,
                        replacement,
                        seed
                    };

                    console.log(
                        `Testando configuração: nEstimators=${nEstimators}, maxFeatures=${maxFeatures}, replacement=${replacement}, seed=${seed}`
                    );
                    //CROSS-VALIDATION
                    let totalRSquared = 0;
                    for (let i = 0; i < this.trainingSet.length; ++i) {
                        const trainData = [...this.trainingSet];
                        const trainLabels = [...this.predictionsTS];

                        const validationSample = trainData.splice(i, 1)[0];
                        const validationLabel = trainLabels.splice(i, 1)[0];

                        this.regression = new RFRegression(currentOptions);
                        try {
                            this.regression.train(trainData, trainLabels);
                            const prediction = this.regression.predict([validationSample])[0];
                            const error = Math.pow(prediction - validationLabel, 2);
                            totalRSquared += error;
                        } catch (e) {
                            console.error(`Erro no LOOCV: nEstimators=${nEstimators}, maxFeatures=${maxFeatures}, replacement=${replacement}, seed=${seed}`, e);
                        }
                    }
                    const mse = totalRSquared / this.trainingSet.length;
                    const mst = this.predictionsTS.reduce((sum, actual) => sum + Math.pow(actual - this.MEDIA, 2), 0) / this.trainingSet.length;
                    const rSquared = 1 - mse / mst;

                }
            }
        }
    }*/
    // Treinar com a melhor configuração encontrada
    if (bestConfig) {
        console.log(`Melhor configuração:`, bestConfig);
        this.regression = new RFRegression(bestConfig);
        try {
            this.regression.train(this.trainingSet, this.predictionsTS);
            console.log(`Modelo treinado com a melhor configuração.`);
        } catch (e) {
            console.error(`Erro ao treinar com a melhor configuração:`, e);
        }
    } else {
        console.error("Nenhuma configuração válida encontrada durante o Grid Search.",bestConfig);
    }
}






  calcularResultado() {
      // Predições para os conjuntos de validação e teste
      this.resultValidation = this.regression.predict(this.validationSet);
      this.resultTest = this.regression.predict(this.testSet);

      const limiar = 0.1;

      // Calcular média dos valores reais da validação
      this.MEDIA = this.predictionsVS.reduce((total, valor) => total + valor, 0) / this.predictionsVS.length;

      console.log(`FIM DO TREINO DO INDIVÍDUO [${this.id}]`);

      // Inicializar métricas
      let MSTValidation = 0;
      let MSTTest = 0;
      let MSETest = 0;

      this.resultValidation.forEach((r, i) => {
        const diferenca = Math.abs(this.predictionsVS[i] - r);

        // Comparação com limiares
        this.acertos += diferenca < this.predictionsVS[i] * limiar ? 1 : 0;
        if (diferenca < this.predictionsVS[i] * 0.1) this.acertos_10 += 1;
        else if (diferenca < this.predictionsVS[i] * 0.2) this.acertos_20 += 1;
        else if (diferenca < this.predictionsVS[i] * 0.3) this.acertos_30 += 1;
        else if (diferenca < this.predictionsVS[i]) this.acertos_acima_30 += 1;

        // Métricas de validação
        this.MST += Math.pow(this.predictionsVS[i] - this.MEDIA, 2);
        this.MSE += Math.pow(r - this.predictionsVS[i], 2);

        this.RMSE += Math.pow(r - this.predictionsVS[i], 2);
        this.MAE += Math.abs(r - this.predictionsVS[i]);
        this.MAPE += Math.abs((this.predictionsVS[i] - r) / this.predictionsVS[i]);
        this.SMAPE += Math.abs(r - this.predictionsVS[i]) / ((Math.abs(r) + Math.abs(this.predictionsVS[i])) / 2);
      });

      // Calcular métricas para o conjunto de teste
      this.resultTest.forEach((z, i) => {
        MSTTest += Math.pow(this.predictionsTest[i] - this.MEDIA, 2);
        MSETest += Math.pow(z - this.predictionsTest[i], 2);
      });

      // Normalizar as métricas de validação
      this.MST = this.MST / this.resultValidation.length;
      this.MSE = this.MSE / this.resultValidation.length;
      this.RMSE = Math.sqrt(this.RMSE / this.resultValidation.length);
      this.MAE = this.MAE / this.resultValidation.length;
      this.MAPE = this.MAPE / this.resultValidation.length;
      this.SMAPE = (this.SMAPE / this.resultValidation.length) * 100;
      this.R_QD = 1 - this.MSE / this.MST;

      // Calcular R² para o conjunto de teste
      MSTTest /= this.resultTest.length;
      MSETest /= this.resultTest.length;
      this.R_QD_TESTE = 1 - MSETest / MSTTest;
    }


    retornaResultado() {
      return {
          // Métricas do conjunto de validação
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
module.exports = CropYieldPredictionRF;
