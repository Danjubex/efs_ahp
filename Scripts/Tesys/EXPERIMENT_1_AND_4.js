// import { RandomForestRegression as RFRegression } from 'ml-random-forest';

const RFRegression = require('ml-random-forest').RandomForestRegression;
// console.log("RFRegression",RFRegression)
// const RFRegression = RandomForestRegression
const DB = require('./DATABASE_1.json');
// console.log("DB",DB[0], Object.keys(DB[0]).length)


class CropYieldPredictionRF {
  // O construtor é chamado quando uma nova instância da classe é criada
  constructor(id,limit,features) {
    this.id                  = id;
    this.limit               = false;
    this.features            = features;
    this.dataset             = [];
    this.validacaoTesteProp  = 1/10;//100
    this.validacaoTesteSize  = 0;//100

    this.options             = {
                                seed: 8,
                                maxFeatures: 45,
                                replacement: false,
                                nEstimators: 100
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
    // this.exibirInfo();
    return this.retornaResultado();

  }//fim do iniciar

  popularDataset(){

    DB.map((dado,i)=>{
      if(this.limit)
      {
        if(i>100)
         return;
      }
        var linha = [];
        //LOCAL / MANEJO
        linha.push(dado['F_BOM_JESUS']);//1
        linha.push(dado['F_BRANDOES']);//2
        linha.push(dado['F_CACHOEIRA']);//3
        linha.push(dado['F_FRUTOS_DA_ILHA']);//4
        linha.push(dado['F_FRUTOS_DA_ILHA_2']);//5
        linha.push(dado['F_ILHA_DA_VARZEA']);//6
        linha.push(dado['F_ILHA_GRANDE']);//7

        //OPERAÇÃO
        linha.push(dado['TOTAL_APL_NITRATO']);//8
        linha.push(dado['DIAS_ATE_FIM_CICLO']);//9

        //VARIEDADE
        linha.push(dado['V_KEITT']);//10
        linha.push(dado['V_KENT']);//11
        linha.push(dado['V_TOMMY_ATKINS']);//12
        linha.push(dado['V_PALMER']);//13
        linha.push(dado['V_OMER']);//14

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

  }//fim do popularDataset


  treinar(){
    this.validacaoTesteSize = Math.ceil(this.dataset.length * this.validacaoTesteProp);
    // console.log(this.validacaoTesteSize)
    this.trainingSet   = new Array(this.dataset.length - this.validacaoTesteSize);
    this.validationSet = new Array(this.validacaoTesteSize);
    this.predictionsTS = new Array(this.dataset.length - this.validacaoTesteSize);
    this.predictionsVS = new Array(this.validacaoTesteSize);
    //DIVIDIR ENTRE TREINAMENTO E VALIDAÇÃO
    for (let i = 0; i < this.dataset.length - this.validacaoTesteSize; ++i) {
        // this.trainingSet[i]   = this.dataset[i].slice(0, 54);
        // this.predictionsTS[i] = this.dataset[i][55];
        var t = this.dataset[i].slice(0, this.dataset[i].length-2);
        if(t.includes(null))
        console.log("TTTTT",t);
        this.trainingSet[i]   = this.dataset[i].slice(0, this.dataset[i].length-2);
        this.predictionsTS[i] = this.dataset[i][this.dataset[i].length-1];
    }
    for (let i = this.dataset.length - this.validacaoTesteSize; i < this.dataset.length; ++i) {
      // console.log( (i - (dataset.length - validacaoTesteSize)),i)
        this.validationSet[(i - (this.dataset.length - this.validacaoTesteSize))] = this.dataset[i].slice(0, this.dataset[i].length-2);
        this.predictionsVS[(i - (this.dataset.length - this.validacaoTesteSize))] = this.dataset[i][this.dataset[i].length-1];
    }

    // console.log("dataset",this.trainingSet.length,this.validationSet.length,this.predictionsTS.length,this.predictionsVS.length,this.validationSet[0])

    console.log(`TREINANDO INDIVÍDUO [${this.id}]`);
    // console.log(validationSet)
    try {

      this.regression.train(this.trainingSet, this.predictionsTS);
    } catch (e) {

      console.log(`ERRO INDIVÍDUO [${this.id}]`/*,this.trainingSet.filter(ts=>ts.includes(null))*/ );
    }

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
      // console.log(`RESULTADO [${i}] => Real:${this.predictionsVS[i]} X  Previsto: ${r} acertos ${acertos}`);
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

module.exports = CropYieldPredictionRF;
