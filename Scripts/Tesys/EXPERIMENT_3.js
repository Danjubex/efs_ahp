// import { RandomForestRegression as RFRegression } from 'ml-random-forest';

const RFRegression = require('ml-random-forest').RandomForestRegression;
// console.log("RFRegression",RFRegression)
// const RFRegression = RandomForestRegression
var nn = require('nn');
var F = require('./funcoes.js');
// var nn = require('nn');
const moment = require('moment');
// const amostragem = require('./calibresCampo');

const PIBase = require('./DATABASE_3.json');

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
  // O construtor é chamado quando uma nova instância da classe é criada
  constructor(id,limit,features) {

    var max_features = Math.ceil(features.length/3);
    this.id                  = id;
    this.limit               = false;
    this.features            = features;
    this.dataset             = [];
    this.vetores             = [
                                [],[],[],[],[],[],[],[],[],[],[],//10
                                [],[],[],[],[],[],[],[],[],[],//20
                                [],[],[],[],[],[],[],[],[],[],//30
                                [],[],[],[],[],[],[],[],[],[],//40
                                [],[],[],[],[],[],[],[],[],[],//50
                                [],[],[],[],[],[],[],[],[],[],//60
                                [],//61
                            ];
    this.inputs              = [];
    this.outputs             = [];
    this.validacaoTesteProp  = 1/10;//100
    this.validacaoTesteSize  = 0;//100
    this.limiar              = 0.1;

    this.options             = {
                                  // hidden layers eg. [ 4, 3 ] => 2 hidden layers, with 4 neurons in the first, and 3 in the second.
                                  // layers: [8,18],
                                  layers: [max_features,max_features,max_features],//18,18,18
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

    this.acertos          = 0;
    this.acertos_10       = 0;
    this.acertos_20       = 0;
    this.acertos_30       = 0;
    this.acertos_acima_30 = 0;

    this.MEDIA   = 0;
    this.MST     = 0;
    this.MSE     = 0;
    this.RMSE    = 0;
    this.MAE     = 0;
    this.MAPE    = 0;
    this.SMAPE   = 0;
    this.R_QD    = 0;
    // this.regression         = new RFRegression(this.options);

    // const trainingSet = new Array(dataset.length - 200);
    // const predictions = new Array(dataset.length);
  }//FIM DO CONSTRUCTOR

  iniciar(){
    if(this.R_QD    ==  0)
    {

      this.popularDataset();
      this.treinar();
      this.calcularResultado();
    }
    this.exibirInfo();
    return this.retornaResultado();

  }//fim do iniciar

  popularDataset(){

    var self = this;
    PIBase.filter(pi=>pi.FASE != null && pi.KC != undefined).map(b=>{
        // vetores[0].push(b.FAZENDA);
        // console.log("b",b);
      this.vetores[0].push(b.FAZENDA == 'BRANDÕES' ? 1 : 0); //0
      this.vetores[1].push(b.FAZENDA == 'ILHA DA VARZEA' ? 1 : 0); //1
      this.vetores[2].push(b.FAZENDA == 'ILHA GRANDE' ? 1 : 0); //2
      this.vetores[3].push(b.FAZENDA == 'BOM JESUS' ? 1 : 0); //3
      this.vetores[4].push(b.FAZENDA == 'CACHOEIRA' ? 1 : 0); //4

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

    /*
    //LÓGICA PARA ENCURTAR O ARRAY COM BASE NOS FEATURES
    this.vetores = this.vetores.map(vetor=>{
      // console.log("Object.keys(ds)",Object.keys(ds),ds[0]);
      // return Object.keys(ds)
      var retorno = [];

      this.features.map((feature,j)=>{
        if(feature == 1)//ENTRA
          // console.log('ds[i]',ds[j])
          // retorno[Object.keys(retorno).length] = ds[j]
          retorno.push(this.vetores[j]);
      })
      // retorno[Object.keys(retorno).length] = ds[55];
      retorno.push(this.vetores[this.vetores.length-1]);
      // console.log("retorno",retorno);
      return retorno;
    })*/


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

  }//fim do popularDataset


  treinar(){


    var tamanho_treinamento = Math.ceil(this.dataset.length - this.dataset.length * this.validacaoTesteProp);
    var tamanho_validacao   = Math.ceil(this.dataset.length * this.validacaoTesteProp) -1;

    this.trainingSet = new Array(tamanho_treinamento);
    this.validationSet = new Array(tamanho_validacao);
    // this.predictions = new Array(tamanho_treinamento);
    // this.predictionsVS = new Array(tamanho_validacao);

    // var variavel = this.dataset[0].input.length-1;
    var support = 0;
    console.log("variavel",this.dataset[0].input.length,this.dataset.length,tamanho_treinamento,tamanho_validacao)

    for (let i = 0; i < tamanho_treinamento; ++i) {
      // if(i/(dataset.length-1) <= 0.85)
        this.trainingSet[i] = this.dataset[i];//slice(0, this.dataset[0].length-1);
      // else
      // {

          // validationSet[support] = dataset[i].slice(0, 16);
          // support += 1;
          // console.log("support",support, i/dataset.length)
      // }
      // console.log(" dataset[i].slice(0, 3)", dataset[i].slice(0, 3))
      // this.predictions[i] = this.dataset[i].output;//this.dataset[i][variavel];
      // predictions[i] = dataset[i].slice(17, 18);;
    }

    // console.log("this.trainingSet",this.trainingSet.length,this.trainingSet.filter(ts=> ts).length);

    for (let i = 0; i < tamanho_validacao; ++i)
    {
        this.validationSet[i]      = this.dataset[this.dataset.length - (tamanho_validacao - i)];//.slice(0, this.dataset[0].length-1);
        // this.predictionsVS[i]      = this.dataset[this.dataset.length - (tamanho_validacao - i)][variavel];
    }

    // this.regression = new RFRegression(this.options);
    // var modelo = this.regression.train(this.trainingSet, this.predictions);

    this.regression.train(this.trainingSet);


}//fim do Treinar







  // Método para exibir informações da pessoa
  calcularResultado (){


    // this.result = this.regression.predict(this.validationSet);
    // var limiar = 0.1;
    var preditos = [];
    var acertos = 0;
    this.validationSet.map((TD,i)=>{
      // console.log("net.send(TD.input)[0]",this.regression.send(TD.input),this.regression.send(TD.input)[0]);
      var res = F.desnormalizar(this.vetores[61], this.regression.send(TD.input)[0]);//arred(net.send(TD.input));
      var real = F.desnormalizar(this.vetores[61], TD.output);
      // var condicao = Math.abs(Number(res) - Number(vetores[4][i]) ) < 5 ? 1 : 0;
      var condicao = Math.abs(res.toFixed(2) - real.toFixed(2)) < 0.1;
      acertos += condicao
      /*// console.log("PREDIÇÃO do CA ["+(i+1)+"]")
      if(!condicao && true)
      console.table({
        teste:i+1,
        predito:res.toFixed(2),
        real:real.toFixed(2),
        dif: Math.abs(res - real).toFixed(2),
        // output:TD.output,
        'acertou_0.1':condicao
      })*/
      preditos.push({predito:res, real:real, diff:Math.abs(res - real).toFixed(2)});
    });

    this.MEDIA = (preditos.map(p=>p.predito).reduce((total, elemento) => total + elemento, 0))/preditos.length;
    // console.log("ACERTOS",acertos,preditos.length,this.MEDIA)

    console.log('ACURACIA NN',Number(100*acertos/this.validationSet.length).toFixed(2),"%")
    console.log(`FIM DO TREINO DO INDIVÍDUO [${this.id}]`)

    //MARGEM DE ERRO: 0.1
    //ACURACIA: GRAU DE CONFIANCA
      preditos.map((predito,i)=>{
      var r =  predito.real;
      var diferenca = Math.abs(predito.diff);
      var intervalo = diferenca < predito.predito * this.limiar;
      this.acertos += intervalo == true ?  1 : 0;

      this.MST += Math.pow(predito.predito - this.MEDIA,2);
      this.MSE += Math.pow(r - predito.predito,2);
      this.RMSE += Math.pow(r - predito.predito,2);
      this.MAE  += Math.abs(r - predito.predito);
      this.MAPE += Math.abs( (predito.predito - r)/predito.predito);
      this.SMAPE += Math.abs(r - predito.predito) / ((Math.abs(r) + Math.abs(predito.predito))/2);

      //PA
      if(diferenca < predito.predito * 0.1)
        this.acertos_10 += 1;
      else if(diferenca < predito.predito * 0.2)
        this.acertos_20 += 1;
      else if(diferenca < predito.predito * 0.3)
        this.acertos_30 += 1;
      else if(diferenca < predito.predito)
        this.acertos_acima_30 += 1;
      // console.log(`RESULTADO [${i}] => Real:${this.predictionsVS[i]} X  Previsto: ${r} Diferença:${diferenca}`);
    })

    this.MST        = this.MST / preditos.length;
    this.MSE        = this.MSE / preditos.length;
    this.RMSE       = Math.sqrt(this.RMSE / preditos.length);
    this.MAE        = this.MAE / preditos.length;
    this.MAPE       = this.MAPE / preditos.length;
    this.SMAPE      = 100*(this.SMAPE / preditos.length);
    this.R_QD       = 1 - (this.MSE/this.MST);

    this.result     = preditos;

  }//FIM do calcularResultado
  exibirInfo() {

          console.log(`Acuracia: ${100*this.acertos/this.validationSet.length}% no grau de confiança
                       MEDIA            : ${this.MEDIA}
                       MST              : ${this.MST}
                       MSE              : ${this.MSE}
                       RMSE             : ${this.RMSE}
                       MAE              : ${this.MAE}
                       MAPE             : ${this.MAPE}
                       SMAPE            : ${this.SMAPE}
                       R²               : ${this.R_QD}

                       Acertos 10%      : ${100*this.acertos_10/this.validationSet.length}%
                       Acertos 20%      : ${100*this.acertos_20/this.validationSet.length}%
                       Acertos 30%      : ${100*this.acertos_30/this.validationSet.length}%
                       Acertos Acima 30%: ${100*this.acertos_acima_30/this.validationSet.length}%
            `)
  }//fim do exibirInfo

  retornaResultado (){
    // return this.R_QD;
    return {
      MEDIA:             this.MEDIA,
      MST              : this.MST,
      MSE              : this.MSE,
      RMSE             : this.RMSE,
      MAE              : this.MAE,
      MAPE             : this.MAPE,
      SMAPE            : this.SMAPE/100,
      R_QD             : this.R_QD,

      PA_10             : 100*this.acertos_10/this.result.length,
      PA_20             : 100*this.acertos_20/this.result.length,
      PA_30             : 100*this.acertos_30/this.result.length,
      PA_ACIMA_30       : 100*this.acertos_acima_30/this.result.length
    }
  }
}//FIM DA CLASSE CropYieldPredictionRF


  // Criar uma instância da classe CropYieldPredictionRF
  // const preditor = new CropYieldPredictionRF(0);

  // Chamar o método para exibir informações
  // preditor.iniciar();

var NN = new KcPredictionRF(0,false,[     1,1,1,1,1,1,1,1,1,1,
                                          1,1,1,1,1,1,1,1,1,1,
                                          1,1,1,1,1,1,1,1,1,1,
                                          1,1,1,1,1,1,1,1,1,1,
                                          1,1,1,1,1,1,1,1,1,1,
                                          1,1,1,1,1,1,1,1,1,1,
                                          1
                                         ]);
NN.iniciar();

module.exports = KcPredictionRF;
