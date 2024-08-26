var tempoGeracao = [];

// const bestRandom = [0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1]

/*const pesos = [//PESOS DANILLO
  0.07837810978235664,
  0.023374300195448373,
  0.11640772517971315,
  0.13097028522211548,
  0.2560042402358631,
  0.1031901149501441,
  0.15768377115977078,
  0.057229933415046216,
  0.07676151985954219
];*/
/*
const pesos = [ //ÉZIO
  0.1638483641266906,
  0.017967722905016086,
  0.13092179297723872,
  0.14010100512837154,
  0.19899984139937562,
  0.12259277875651613,
  0.1260638595756854,
  0.05235161833166808,
  0.04765201679943733
]*/
/*
const pesos = [ //GRUPO
  0.18024866529884123,
  0.07437632185382491,
  0.1149973268958087,
  0.1340878288368756,
  0.18444936904062534,
  0.10441432081819722,
  0.10278301788943706,
  0.05512103252983656,
  0.04952211683655342

]
*/

const pesos = [ //GPT
  0.09607007879059638,
  0.04562487989238358,
  0.02102684004868362,
  0.03889885337262187,
  0.06916597271154955,
  0.10817692652616746,
  0.15357760553455896,
  0.20514380885273206,
  0.26231503427070657
];

/*
const pesos = [ //WILLI
  0.21304926764314247,
    0.18819351975144255,
    0.08314839473294867,
    0.1220594762538837,
    0.15534842432312473,
    0.0680574049415594,
    0.056221334516940384,
    0.06065986092617252,
    0.05326231691078562

]*/

/*
const pesos = [ //PESOS DANILLO NORMALIZADOS
  0.23644338118022326,
  0,
  0.39992025518341323,
  0.4625199362041468,
  1,
  0.3431020733652313,
  0.5773524720893143,
  0.1455342902711324,
  0.2294941900205058
]
*/
/*
const pesos = [ //PESOS DANILLO
  0.3,
  0.3,
  0.3,
  0.3,
  0.3,
  0.3,
  0.3,
  0.3,
  0.3
]*/
/*
const pesos = [ //SEM PESO
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1
]*/
const CropYieldPredictionRF = require('./rf_doutorado.js');
// Função para criar indivíduos aleatórios no espaço de busca
function criarIndividuoAleatorio(size) {
  const numVariaveis = 54; // Defina o número de variáveis (x1, x2, ..., xN) aqui
  const features  = [];
  const variaveis = [
    {nome:'MANEJO'            ,indice: 0, min:0,max:6,sorteio:Math.random()},
    {nome:'OPERAÇÃO'          ,indice: 1, min:7,max:8,sorteio:Math.random()},
    {nome:'VARIEDADE'         ,indice: 2, min:9,max:13,sorteio:Math.random()},
    {nome:'COMPOSIÇÃO DO SOLO',indice: 3, min:14,max:21,sorteio:Math.random()},
    {nome:'MACRONUTRIENTES'   ,indice: 4, min:22,max:28,sorteio:Math.random()},
    {nome:'MICRONUTRIENTES'   ,indice: 5, min:29,max:34,sorteio:Math.random()},
    {nome:'FISIOLÓGICAS'      ,indice: 6, min:35,max:39,sorteio:Math.random()},
    {nome:'TIPO DE SOLO'      ,indice: 7, min:40,max:47,sorteio:Math.random()},
    {nome:'CALIBRES'          ,indice: 8, min:48,max:54,sorteio:Math.random()},
  ]
  // var mudouGrupo = false;
  // console.log("A,B,C",a,b,c)

  for (let i = 0; i < numVariaveis; i++) {
    // var sorteio =
    var variavel = variaveis.filter(f=> i >= f.min && i <= f.max)[0];
    if(pesos[variavel.indice] >= variavel.sorteio)
        features.push(1);
    else
        features.push(0);
    /*
    // MÉTODO PESOS EM GRUPO/AHP
    var variavel = variaveis.filter(f=> i >= f.min && i <= f.max)[0];
      // console.log("I",i,variavel,pesos[variavel.indice])
    if(pesos[variavel.indice] >= variavel.sorteio)
        features.push(bestRandom[i]);
    else
        features.push(0);
    */
    // features.push(Math.floor(Math.random() * 2)); // Valores entre 0 e 1
    // features.push(1); // Valores entre 0 e 1
  }
  // console.log("features",features)
  const individuo = new CropYieldPredictionRF(size,true,features);
  // console.log("NOVO",novo);
  return individuo;
}

// Função para encontrar a melhor solução usando algoritmos genéticos
async function encontrarMelhorSolucao(populacao, geracoes, taxaMutacao, taxaCrossover, funcaoObjetivo) {
  let melhorIndividuo = null;
  let melhorAptidao = 0;

  for (let geracao = 0; geracao < geracoes; geracao++) {

    var tempoAnterior = tempoGeracao.length > 0 ? tempoGeracao[tempoGeracao.length - 1].tempoAtual : new Date().getTime();
    await new Promise((resolve,reject) =>{

        console.log("\nGERACAO",geracao,'\n')
        // Avaliar a aptidão de cada indivíduo na população
        populacao.forEach(async (individuo,i) => {
          // console.log("individuo",individuo.features)
          const aptidao = await calcularAptidao(individuo,funcaoObjetivo);

            console.log("INDIVIDUO",i+1,aptidao,'\n')
            if (aptidao > melhorAptidao) { //INVERTER O SINAL PARA CASOS DE MAXIMIZAÇÃO
              melhorIndividuo = individuo;//.slice(); // Copiar o indivíduo para evitar referências
              melhorAptidao = aptidao;

              console.log("\n\nGERACAO",geracao,"MELHOR",melhorIndividuo.retornaResultado(),"APDTIDAO",melhorAptidao,'\n\n');
              individuo.exibirInfo();
            }
            if(i == populacao.length-1)
            {
              resolve();
            }
        });
    })//FIM DA PROMISE

    // Criar uma nova população para a próxima geração
    let novaPopulacao = [];

    // Elitismo
    novaPopulacao.push(melhorIndividuo);

    while (novaPopulacao.length < populacao.length) {
      // Seleção de dois pais (roleta viciada)
      const pais = [populacao[Math.floor(Math.random() * populacao.length)], populacao[Math.floor(Math.random() * populacao.length)]];

      // Cruzamento
      if (Math.random() < taxaCrossover) {
        const [filho1, filho2] = cruzamento(...pais);
        novaPopulacao.push(filho1, filho2);
      } else {
        // novaPopulacao.push(...pais);
        novaPopulacao.push(criarIndividuoAleatorio('F.ALEATORIO'));
      }

    }

    // Mutação na nova população
    console.log("novaPopulacao",novaPopulacao.length)
    novaPopulacao = novaPopulacao.map((individuo) => mutacao(individuo, taxaMutacao));
    // console.log("novaPopulacao",novaPopulacao[0].features)

    populacao = novaPopulacao;
    // console.log("geracao",geracao)
    var tempoAtual = new Date().getTime();

var diferencaEmSegundos = ((tempoAtual - tempoAnterior) / 1000)/60;
var tempoAcumulado = tempoGeracao.length > 0 ? tempoGeracao[tempoGeracao.length-1].tempoAcumulado : 0;
var novoTempo = { geracao: geracao, tempo: parseFloat(diferencaEmSegundos.toFixed(3)), tempoAtual:tempoAtual,
  tempoAcumulado:tempoAcumulado + diferencaEmSegundos, melhorResultado:melhorIndividuo.retornaResultado()}
    tempoGeracao.push(novoTempo);

  }
  console.log("\n\nRESULTADO",{individuo: melhorIndividuo.retornaResultado(), aptidao: melhorAptidao },novoTempo)
  return new Promise((resolve,reject)=>{
    resolve({ individuo: melhorIndividuo, aptidao: melhorAptidao })
  })
}

// Função de aptidão para maximização (o objetivo é maximizar a função objetivo)

function calcularAptidao(x, funcaoObjetivo) {
  // Utilizando setTimeout para atrasar o retorno por 1 segundo
  return new Promise ((resolve,reject)=>{
    setTimeout(() => {
      // const aptidao = Math.random() * 100;
      try {

        const aptidao = x.features.reduce((acum,next) =>acum+next,0) == 0 ? {R_QD:0} : x.iniciar();//x.reduce((acum,next)=>acum+next);
        // console.log("Aptidão calculada:", aptidao);
        resolve(aptidao.R_QD);
      } catch (e) {
        console.log("ERRO",e,x.iniciar,x.features,x.R_QD,x.id);
      }
      // Você pode chamar a função calcularFuncaoObjetivo aqui se necessário
    }, 1000); // 1000 milissegundos = 1 segundo
  })
}

// Operador de cruzamento (ponto único de corte)
function cruzamento(individuo1, individuo2) {
  const pontoCorte = Math.floor(Math.random() * individuo1.features.length-1);
  const featuresFilho1 = individuo1.features.slice(0, pontoCorte).concat(individuo2.features.slice(pontoCorte));
  const featuresFilho2 = individuo2.features.slice(0, pontoCorte).concat(individuo1.features.slice(pontoCorte));
    // console.log("individuo1,individuo2",individuo1.retornaResultado(),individuo2.retornaResultado(),featuresFilho1,featuresFilho2)
  const filho1 = new CropYieldPredictionRF('F1.CRUZAMENTO',true,featuresFilho1);//individuo1.slice(0, pontoCorte).concat(individuo2.slice(pontoCorte));
  const filho2 = new CropYieldPredictionRF('F2.CRUZAMENTO',true,featuresFilho2);//individuo2.slice(0, pontoCorte).concat(individuo1.slice(pontoCorte));
  return [filho1, filho2];
}

// Operador de mutação (troca aleatória de um gene)
function mutacao(individuo, taxaMutacao) {
  if(!individuo)
  return individuo;
  var features = individuo.features;
  var posicao  = Math.floor(Math.random() * features.length-1);

    if (Math.random() < taxaMutacao && individuo.R_QD == 0) {

        // for (let i = 0; i < features.length; i++) {

            features[posicao] = features[posicao] == 0 ? 1 : 0;
        // }
      // individuo[i] = Math.floor(Math.random()); // Valores entre 0 e 30
      // return individuo;
      return new CropYieldPredictionRF('F.MUTADO',true,features);
    }
    else {
      return individuo;
    }
  // console.log("MUTACAO");
}


(async ()=>{


  for(var i = 0; i < 10; i++)
  {
    // Parâmetros do algoritmo genético
    tempoGeracao  = [];
    const tamanhoPopulacao = 5;
    const geracoes = 5;
    const taxaMutacao = 0.1;//0.1; // Taxa de mutação entre 0 e 1 (por exemplo, 0.1 representa 10% de chance de mutação em cada gene)
    const taxaCrossover = 0.2; // Taxa de crossover entre 0 e 1 (por exemplo, 0.8 representa 80% de chance de crossover)
    const funcaoObjetivo = {};

    const restricoes = [];
    // Inicialização da população aleatória
    let populacao = Array.from({ length: tamanhoPopulacao }, (a,size) => criarIndividuoAleatorio(size+1));
    // console.table(populacao)

    // Encontrar a melhor solução
    const melhorSolucao = await encontrarMelhorSolucao(populacao, geracoes, taxaMutacao, taxaCrossover, funcaoObjetivo);

    // Exibir a melhor solução encontrada
    if (melhorSolucao && melhorSolucao.individuo) {
      console.log(  `ENSAIO ${i}`,"\n\nMelhores valores das variáveis:", melhorSolucao.individuo.retornaResultado(), melhorSolucao.individuo.features);
      melhorSolucao.individuo.exibirInfo();
      console.log( `ENSAIO ${i}`,"Valor máximo da função objetivo:", melhorSolucao.aptidao);
      console.log( `ENSAIO ${i}`,"Tempo entre gerações:", tempoGeracao);
    } else {
      console.log( `ENSAIO ${i}`,"Nenhuma solução encontrada.");
    }

    const fs = require('fs');
    // Caminho do arquivo onde você deseja salvar o objeto serializado
    const caminhoArquivo = './AG_DOUTORADO_RESULTS.txt';
    // Leitura do arquivo e tratamento dos resultados
      let resultados;
      try {
        resultados = await fs.readFileSync(caminhoArquivo, 'utf-8');
        resultados = resultados.length > 0  ? resultados : '';
        // console.log("RESULTADOS",resultados);
        var featuresString = '';
        var qtd_variaveis = 0;
        melhorSolucao.individuo.features.map(f=>{
          featuresString += f+' '
          qtd_variaveis += f;

        })
        var indice = tempoGeracao.length - 1;
        const objetoSerializado = resultados + `${qtd_variaveis}\t${featuresString}\t${tempoGeracao[indice].melhorResultado["R_QD"]}\t${tempoGeracao[indice].tempoAcumulado}\t${tempoGeracao[indice].melhorResultado["MST"]}\t${tempoGeracao[indice].melhorResultado["MSE"]}\t${tempoGeracao[indice].melhorResultado["RMSE"]}\t${tempoGeracao[indice].melhorResultado["MAE"]}\t${tempoGeracao[indice].melhorResultado["MAPE"]}\t${tempoGeracao[indice].melhorResultado["SMAPE"]}\t${tempoGeracao[indice].melhorResultado["PA_10"]}\t${tempoGeracao[indice].melhorResultado["PA_20"]}\t${tempoGeracao[indice].melhorResultado["PA_30"]}\t${tempoGeracao[indice].melhorResultado["PA_ACIMA_30"]}\n`

        fs.writeFileSync(caminhoArquivo, objetoSerializado);
      } catch (error) {
        console.log("ERROR",error);
        resultados = '';
      }
  }//FIM DO FOR


})()
