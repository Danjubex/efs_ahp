// import { RandomForestRegression as RFRegression } from 'ml-random-forest';

const RFRegression = require('ml-random-forest').RandomForestRegression;
// console.log("RFRegression",RFRegression)
// const RFRegression = RandomForestRegression
const historico = require('./DATABASE_2_1');
const amostragem = require('./DATABASE_2_2
');
const moment = require('moment');

var dados = historico//.filter(h=>h.VARIEDADE == 'KEITT');
                        //.filter(h=>h.TALH_ST_DESCRICAO == 'AGD BAHIA-038');
var amostra = amostragem//.filter(h=>h.TALHAO == 'AGD BAHIA-038')
                        .map(a=>({
  TALHAO:a.TALHAO,
  DATA:a.DATA,
  CALIBRE:a.CALIBRE

}))
// console.log("DB",DB[0], Object.keys(DB[0]).length)

const selectVariedade = (variedade) =>{
  switch(variedade)
  {
    case 'PALMER': return 0;
      case 'TOMMY': return 1;
        case 'OMER': return 2;
          case 'KEITT': return 3;
            case 'KENT': return 4;
            case 'OSTEEN':return 5;
  }
}
const groupBy = (array, prop) => {

    return array.reduce((groups, item) => {
        const val = item[prop];

        groups[val] = groups[val] || [];
        groups[val].push(item);

        return groups;
    }, {});
};

class CaliberPredictionRF {
  // O construtor é chamado quando uma nova instância da classe é criada
  constructor(id,limit,features) {
    this.id                  = id;
    this.limit               = false;
    this.features            = features;
    this.dataset             = [];
    this.inputs              = [];
    this.outputs             = [];
    this.validacaoTesteProp  = 1/10;//100
    this.validacaoTesteSize  = 0;//100

    this.options             = {
                                  seed: 27,
                                  maxFeatures: 14,
                                  replacement: true,
                                  nEstimators: 200
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
    var safras = groupBy(dados,"SAFRA_ST_CODIGO");
    // console.table(dados[2]);
    Object.keys(safras).forEach(function(safra, i) {//para cada safra
      let dados_safra = safras[safra];
      // console.log("safra",safra);
      // console.table(dados_safra);
      var talhoes =   groupBy(dados_safra,"TALH_ST_DESCRICAO");
      Object.keys(talhoes).forEach(function(talhao, i) {//para cada talhao
        let dados_talhao = talhoes[talhao];
        // console.log("safra",safra);
        // console.table(dados_talhao);
        var controles =   groupBy(dados_talhao,"CPROC_IN_CODIGO");
        Object.keys(controles).forEach(function(controle, i) {//para cada controle
          let dados_controle = controles[controle];
          // console.log("safra",safra,"talhao",talhao,"controle",controle);
          // console.table(dados_controle);
          var obj = {
                      SAFRA:dados_controle[0].SAFRA_ST_CODIGO,
                      TALHAO:dados_controle[0].TALH_ST_DESCRICAO,
                      VARIEDADE:dados_controle[0].VARIEDADE,
                      CONTROLE:dados_controle[0].CPROC_IN_CODIGO,
                      DATA_EMBALAGEM: dados_controle[0].DATA_EMBALAGEM,
                      ORDEM: dados_controle[0].ORDEM
                    };
          dados_controle.map(dc=>{
                obj[dc.VALOR_CALIBRE] = dc.CALIBRE;
              // console.log("dc",dc.VALOR_CALIBRE)
          })
          // console.log("obj",obj)
          self.outputs.push(obj)
          // SAFRA_ST_CODIGO │ TALH_ST_DESCRICAO │ CPROC_IN_CODIGO │ DATA_EMBALAGEM │ ORDEM │ VALOR_CALIBRE │       CALIBRE       │ VARIEDADE
        })//fim de cada talhao
      })//fim de cada talhao
    })//fim de cada safra

    //talhao
    var talhoes = groupBy(amostra,"TALHAO");
    Object.keys(talhoes).forEach(function(talhao, i) {//para cada talhao
      let dados_talhao = talhoes[talhao];
      // console.log("talhao",talhao)
      // console.table(dados_talhao)

      var datas = groupBy(dados_talhao,"DATA");
      Object.keys(datas).forEach(function(data, i) {//para cada data
        let dados_data = datas[data];
        // console.log("talhao",talhao,"data",data)
        // console.table(dados_data)
        var obj = {TALHAO:talhao, DATA:data,
                   CALIBRE_4:0,
                   CALIBRE_5:0,
                   CALIBRE_6:0,
                   CALIBRE_7:0,
                   CALIBRE_8:0,
                   CALIBRE_9:0,
                   CALIBRE_10:0,
                   CALIBRE_11:0,
                   CALIBRE_12:0,
                   CALIBRE_13:0,
                   CALIBRE_14:0,
                   // CALIBRE_16:0,
                   };
        dados_data.map(dd=>{
          obj['CALIBRE_'+dd.CALIBRE]+=1;
        });
        var soma =     obj.CALIBRE_4 + obj.CALIBRE_5 + obj.CALIBRE_6 + obj.CALIBRE_7
                      +obj.CALIBRE_8 + obj.CALIBRE_9 + obj.CALIBRE_10 + obj.CALIBRE_11
                      +obj.CALIBRE_12 + obj.CALIBRE_13 + obj.CALIBRE_14 ;//+ obj.CALIBRE_16;
        obj.CALIBRE_4 /= soma;
        obj.CALIBRE_5 /= soma;
        obj.CALIBRE_6 /= soma;
        obj.CALIBRE_7 /= soma;
        obj.CALIBRE_8 /= soma;
        obj.CALIBRE_9 /= soma;
        obj.CALIBRE_10 /= soma;
        obj.CALIBRE_11 /= soma;
        obj.CALIBRE_12 /= soma;
        obj.CALIBRE_13 /= soma;
        obj.CALIBRE_14 /= soma;
        // obj.CALIBRE_16 /= soma;

        // console.log("obj",obj,soma)
        self.inputs.push(obj);
      });//fim de cada data
    });//fim de cada talhao
    //data

    //DIST CALIBRE
    // console.table(self.inputs[0]);
    // console.table(self.outputs[0]);

    var raw_dataset = [];
    var dataset = [];

    this.inputs.map(i=>{
      var linhas = this.outputs.filter(o=>o.TALHAO == i.TALHAO).map(o=>{
        var DISTANCIA_DIAS = moment.duration(moment(o.DATA_EMBALAGEM, "YYYY-MM-DD").diff(moment(i.DATA, "YYYY-MM-DD"))).asDays();
        var ORDEM = o.ORDEM;
        var SEMANA_1 = 0;
        var SEMANA_2 = 0;
        var SEMANA_3 = 0;
        var SEMANA_4 = 0;
        var SEMANAS_V = 0;

        var PRIMEIRO = 0;
        var SEGUNDO = 0;
        var TERCEIRO = 0;
        var QUARTO = 0;
        var QUINTO = 0;
        var SEXTO = 0;
        var ULTIMOS = 0;

        if(DISTANCIA_DIAS <= 7)
          SEMANA_1 = 1;
        else if(DISTANCIA_DIAS <= 14)
          SEMANA_2 = 1;
        else if(DISTANCIA_DIAS <= 21)
          SEMANA_3 = 1;
        else if(DISTANCIA_DIAS <= 28)
          SEMANA_4 = 1;
        else
          SEMANAS_V = 1;

          if(ORDEM == 1)
            PRIMEIRO = 1;
     else if(ORDEM == 2)
            SEGUNDO = 1;
     else if(ORDEM == 3)
            TERCEIRO = 1;
     else if(ORDEM == 4)
            QUARTO = 1;
     else if(ORDEM == 5)
            QUINTO = 1;
     else if(ORDEM == 6)
            SEXTO = 1;
     else if(ORDEM > 6)
            ULTIMOS = 1;


        // console.log("o",o);
        raw_dataset.push({
          // TALHAO:0,//i.TALHAO,
            // TALHAO:0,//i.TALHAO,
            // VARIEDADE:selectVariedade(o.VARIEDADE),//o.VARIEDADE,
            PALMER:selectVariedade(o.VARIEDADE) == 0 ? 1 : 0,
            TOMMY:selectVariedade(o.VARIEDADE) == 1 ? 1 : 0,
            OMER:selectVariedade(o.VARIEDADE) == 0 ? 2 : 0,
            KEITT:selectVariedade(o.VARIEDADE) == 0 ? 3 : 0,
            KENT:selectVariedade(o.VARIEDADE) == 0 ? 4 : 0,
            OSTEEN: selectVariedade(o.VARIEDADE) == 0 ? 5 : 0,
            // DATA_A:moment(i.DATA, "YYYY-MM-DD"),
            // DATA_B:moment(o.DATA_EMBALAGEM, "YYYY-MM-DD"),
            // DISTANCIA_DIAS: ,
            SEMANA_1:SEMANA_1,
            SEMANA_2:SEMANA_2,
            SEMANA_3:SEMANA_3,
            SEMANA_4:SEMANA_4,
            SEMANAS_V:SEMANAS_V,
          // DISTANCIA_DIAS: moment.duration(moment(o.DATA_EMBALAGEM, "YYYY-MM-DD").diff(moment(i.DATA, "YYYY-MM-DD"))).asDays(),
          // ORDEM: o.ORDEM,
          PRIMEIRO:PRIMEIRO,
          SEGUNDO:SEGUNDO,
          TERCEIRO:TERCEIRO,
          QUARTO:QUARTO,
          QUINTO:QUINTO,
          SEXTO:SEXTO,
          ULTIMOS:ULTIMOS,

          CALIBRE_4:i.CALIBRE_4,
          CALIBRE_5:i.CALIBRE_5,
          CALIBRE_6:i.CALIBRE_6,
          CALIBRE_7:i.CALIBRE_7,
          CALIBRE_8:i.CALIBRE_8,
          CALIBRE_9:i.CALIBRE_9,
          CALIBRE_10:i.CALIBRE_10,
          CALIBRE_11:i.CALIBRE_11,
          CALIBRE_12:i.CALIBRE_12,
          CALIBRE_13:i.CALIBRE_13,
          CALIBRE_14:i.CALIBRE_14,
          // CALIBRE_16:i.CALIBRE_16,

          // CALIBRE_4_O:o.CALIBRE_4,
          // CALIBRE_5_O:o.CALIBRE_5,
          // CALIBRE_6_O:o.CALIBRE_6,
          // CALIBRE_7_O:o.CALIBRE_7,
          CALIBRE_8_O:o.CALIBRE_8,
          // CALIBRE_9_O:o.CALIBRE_9,
          // CALIBRE_10_O:o.CALIBRE_10,
          // CALIBRE_11_O:o.CALIBRE_11,
          // CALIBRE_12_O:o.CALIBRE_12,
          // CALIBRE_13_O:o.CALIBRE_13,
          // CALIBRE_14_O:o.CALIBRE_14,
          // CALIBRE_16_O:o.CALIBRE_16,
        })

        // console.table(raw_dataset[raw_dataset.length-1]);
      });

    });
    // console.table(raw_dataset[raw_dataset.length-1]);

    this.dataset = raw_dataset.map(ds=>([
      // ds.TALHAO,
      // ds.VARIEDADE,
      ds.PALMER,//0
      ds.TOMMY,//1
      ds.OMER,//2
      ds.KEITT,//3
      ds.KENT,//4
      ds.OSTEEN,//5

      // ds.DISTANCIA_DIAS,
      ds.SEMANA_1,//6
      ds.SEMANA_2,//7
      ds.SEMANA_3,//8
      ds.SEMANA_4,//9
      ds.SEMANAS_V,//10

      // ds.ORDEM,//7
      ds.PRIMEIRO,//11
      ds.SEGUNDO,//12
      ds.TERCEIRO,//13
      ds.QUARTO,//14
      ds.QUINTO,//15
      ds.SEXTO,//16
      ds.ULTIMOS,//17


      ds.CALIBRE_4,//18
      ds.CALIBRE_5,//19
      ds.CALIBRE_6,//20
      ds.CALIBRE_7,//21
      ds.CALIBRE_8,//22
      ds.CALIBRE_9,//23
      ds.CALIBRE_10,//24
      ds.CALIBRE_11,//25
      ds.CALIBRE_12,//26
      ds.CALIBRE_13,//27
      ds.CALIBRE_14,//28
      // ds.CALIBRE_16,

      // ds.CALIBRE_4_O,
      // ds.CALIBRE_5_O,
      // ds.CALIBRE_6_O,
      // ds.CALIBRE_7_O,
      ds.CALIBRE_8_O,//29
      // ds.CALIBRE_9_O,
      // ds.CALIBRE_10_O,
      // ds.CALIBRE_11_O,
      // ds.CALIBRE_12_O,
      // ds.CALIBRE_13_O,
      // ds.CALIBRE_14_O,
      // ds.CALIBRE_16_O,
    ]))

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


    // console.log("this.dataset[0].length",this.dataset[0].length)
    this.options            = {...this.options,maxFeatures:this.dataset[0].length -2 }//AJUSTANDO O MAX FEATURES COM BASE NO NOVO DATASET



    this.regression         = new RFRegression(this.options);

    // console.log("this.features",this.features,this.dataset[0],this.options);
    // console.log("dataset",this.dataset[0],this.dataset.length, Object.keys(this.dataset[0]).length)

  }//fim do popularDataset


  treinar(){

    var tamanho_treinamento = Math.ceil(this.dataset.length - this.dataset.length * this.validacaoTesteProp);
    var tamanho_validacao   = Math.ceil(this.dataset.length * this.validacaoTesteProp) -1;

    this.trainingSet = new Array(tamanho_treinamento);
    this.validationSet = new Array(tamanho_validacao);
    this.predictions = new Array(tamanho_treinamento);
    this.predictionsVS = new Array(tamanho_validacao);

      /*
      Object.keys(raw_dataset[0]).forEach(function(chave, i) {//para cada chave
        console.log("chave",chave,raw_dataset[0][chave])
      });*/
    var variavel = this.dataset[0].length-1;
    var support = 0;
    console.log("variavel",variavel, this.dataset[0].length,this.dataset.length,tamanho_treinamento,tamanho_validacao)

    for (let i = 0; i < tamanho_treinamento; ++i) {
      // if(i/(dataset.length-1) <= 0.85)
        this.trainingSet[i] = this.dataset[i].slice(0, this.dataset[0].length-1);
      // else
      // {

          // validationSet[support] = dataset[i].slice(0, 16);
          // support += 1;
          // console.log("support",support, i/dataset.length)
      // }
      // console.log(" dataset[i].slice(0, 3)", dataset[i].slice(0, 3))
      this.predictions[i] = this.dataset[i][variavel];
      // predictions[i] = dataset[i].slice(17, 18);;
    }

    for (let i = 0; i < tamanho_validacao; ++i)
    {
        this.validationSet[i]      = this.dataset[this.dataset.length - (tamanho_validacao - i)].slice(0, this.dataset[0].length-1);
        this.predictionsVS[i] = this.dataset[this.dataset.length - (tamanho_validacao - i)][variavel];
    }

    this.regression = new RFRegression(this.options);
    var modelo = this.regression.train(this.trainingSet, this.predictions);

  }//fim do Treinar







  // Método para exibir informações da pessoa
  calcularResultado (){
    this.result = this.regression.predict(this.validationSet);
    var limiar = 0.1;

    this.MEDIA = (this.predictionsVS.reduce((total, elemento) => total + elemento, 0))/this.predictionsVS.length;


    console.log(`FIM DO TREINO DO INDIVÍDUO [${this.id}]`)

    //MARGEM DE ERRO: 0.1
    //ACURACIA: GRAU DE CONFIANCA
    this.result.map((r,i)=>{
      var diferenca = Math.abs(this.predictionsVS[i] - r);
      var intervalo = diferenca < this.predictionsVS[i] * limiar;
      this.acertos += intervalo == true ?  1 : 0;

      this.MST += Math.pow(this.predictionsVS[i] - this.MEDIA,2);
      this.MSE += Math.pow(r - this.predictionsVS[i],2);
      this.RMSE += Math.pow(r - this.predictionsVS[i],2);
      this.MAE  += Math.abs(r - this.predictionsVS[i]);
      this.MAPE += Math.abs( (this.predictionsVS[i] - r)/this.predictionsVS[i]);
      this.SMAPE += Math.abs(r - this.predictionsVS[i]) / ((Math.abs(r) + Math.abs(this.predictionsVS[i]))/2);

      //PA
      if(diferenca < this.predictionsVS[i] * 0.1)
        this.acertos_10 += 1;
      else if(diferenca < this.predictionsVS[i] * 0.2)
        this.acertos_20 += 1;
      else if(diferenca < this.predictionsVS[i] * 0.3)
        this.acertos_30 += 1;
      else if(diferenca < this.predictionsVS[i])
        this.acertos_acima_30 += 1;
      // console.log(`RESULTADO [${i}] => Real:${this.predictionsVS[i]} X  Previsto: ${r} Diferença:${diferenca}`);
    })

    this.MST        = this.MST / this.result.length;
    this.MSE        = this.MSE / this.result.length;
    this.RMSE       = Math.sqrt(this.RMSE / this.result.length);
    this.MAE        = this.MAE / this.result.length;
    this.MAPE       = this.MAPE / this.result.length;
    this.SMAPE      = 100*(this.SMAPE / this.result.length);
    this.R_QD  = 1 - (this.MSE/this.MST);

  }//FIM do calcularResultado
  exibirInfo() {

          console.log(`Acuracia: ${100*this.acertos/this.result.length}% no grau de confiança
                       MEDIA            : ${this.MEDIA}
                       MST              : ${this.MST}
                       MSE              : ${this.MSE}
                       RMSE             : ${this.RMSE}
                       MAE              : ${this.MAE}
                       MAPE             : ${this.MAPE}
                       SMAPE            : ${this.SMAPE}
                       R²               : ${this.R_QD}

                       Acertos 10%      : ${100*this.acertos_10/this.result.length}%
                       Acertos 20%      : ${100*this.acertos_20/this.result.length}%
                       Acertos 30%      : ${100*this.acertos_30/this.result.length}%
                       Acertos Acima 30%: ${100*this.acertos_acima_30/this.result.length}%
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

var RF = new CaliberPredictionRF(0,false,[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
RF.iniciar();

module.exports = CaliberPredictionRF;
