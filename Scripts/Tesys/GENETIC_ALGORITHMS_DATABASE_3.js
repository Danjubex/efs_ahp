var tempoGeracao = [];
const bestRandom = [1,1,1,1,1,1,1,0,0,0,
                    1,1,1,0,0,1,1,0,0,0,
                    0,1,1,1,0,1,0,1,1,1,
                    1,1,0,0,1,1,1,1,1,1,
                    0,1,1,0,0,0,0,0,0,1,
                    1,1,0,0,1,1,0,0,0,1,
                    0];


// const pesos = [ //PESOS DANILLO
//   0.03916282369634622,
//   0.17169208939340194,
//   0.12004256828662647,
//   0.04779472626226795,
//   0.012120137164479131,
//   0.15750266051791417,
//   0.08832919474991134,
//   0.0831500532103583,
//   0.03330968428520752,
//   0.24689606243348708
// ]

const pesos = [ //PESOS NORMALIZADOS DANILLO
0.115185092,
0.679677663,
0.4596827,
0.151951649,
0,
0.619239486,
0.324603374,
0.30254344,
0.090254344,
1,
]
// const pesos = [ //PESOS NORMALIZADOS 0 e 0.5 DANILLO
//   0.057592546,
//   0.339838832,
//   0.22984135,
//   0.075975825,
//   0,
//   0.309619743,
//   0.162301687,
//   0.15127172,
//   0.045127172,
//   0.5
// ]
// const pesos = [ //ALEATÓRIO EM GRUPOS
//   0.5,
//   0.5,
//   0.5,
//   0.5,
//   0.5,
//   0.5,
//   0.5,
//   0.5,
//   0.5,
//   0.5
// ]
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
const CropYieldPredictionRF = require('./EXPERIMENT_3.js');
// Função para criar indivíduos aleatórios no espaço de busca
function criarIndividuoAleatorio(size) {
  const numVariaveis = 61; // Defina o número de variáveis (x1, x2, ..., xN) aqui
  const features  = [];
  const variaveis = [
    {nome:'MANEJO'                        ,indice: 0, min:0,max:4,sorteio:Math.random()},
    {nome:'FASE FENOLÓGICA'               ,indice: 1, min:5,max:12,sorteio:Math.random()},
    {nome:'MÊS DO ANO'                    ,indice: 2, min:13,max:24,sorteio:Math.random()},
    {nome:'SISTEMA DE IRRIGAÇÂO'          ,indice: 3, min:25,max:34,sorteio:Math.random()},
    {nome:'TIPO DE SOLO'                  ,indice: 4, min:35,max:42,sorteio:Math.random()},
    {nome:'ZERO_A_TRINTA_SEM_ATUAL'       ,indice: 5, min:43,max:46,sorteio:Math.random()},
    {nome:'TRINTA_A_SESSENTA_SEM_ATUAL'   ,indice: 6, min:47,max:50,sorteio:Math.random()},
    {nome:'ZERO_A_TRINTA_PROX_SEMANA'     ,indice: 7, min:51,max:54,sorteio:Math.random()},
    {nome:'TRINTA_A_SESSENTA_PROX_SEMANA' ,indice: 8, min:55,max:58,sorteio:Math.random()},
    {nome:'KC HISTÓRICO E RECENTE'        ,indice: 9, min:59,max:60,sorteio:Math.random()},
  ]
/*
  for (let i = 0; i < numVariaveis; i++) {
    // MÉTODO PESOS EM GRUPO/AHP
    var variavel = variaveis.filter(f=> i >= f.min && i <= f.max)[0];
      // console.log("I",i,variavel,pesos[variavel.indice])
    if(pesos[variavel.indice] >= variavel.sorteio)
        features.push(1);
    else
        features.push(0);
*/

/*
    // MÉTODO PESOS EM GRUPO/AHP ONDE O SORTEADO SAI
    var variavel = variaveis.filter(f=> i >= f.min && i <= f.max)[0];
      // console.log("I",i,variavel,pesos[variavel.indice])
    if(pesos[variavel.indice] >= variavel.sorteio)
        features.push(0);
    else
        features.push(1);
*/
    /*MÉTODO ALEATÓRIO
    // features.push(Math.floor(Math.random() * 2)); // Valores entre 0 e 1
    // features.push(1); // Valores entre 0 e 1
    */

    //BEST RANDOM
    for (let i = 0; i < numVariaveis; i++) {
      // MÉTODO PESOS EM GRUPO/AHP
      var variavel = variaveis.filter(f=> i >= f.min && i <= f.max)[0];
        // console.log("I",i,variavel,pesos[variavel.indice])
      if(pesos[variavel.indice] >= variavel.sorteio)
          features.push(bestRandom[i]);
      else
          features.push(0);
  }
  // console.log("features",features)
  const individuo = new CropYieldPredictionRF(size,true,features);
  // console.log("NOVO",novo);
  return individuo;
}

// Função para encontrar a melhor solução usando algoritmos genéticos
async function encontrarMelhorSolucao(populacao, geracoes, taxaMutacao, taxaCrossover, funcaoObjetivo) {
  let melhorIndividuo = null;
  let melhorAptidao = -100;

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
        // console.log("Aptidão calculada:", aptidao,x.features);
        resolve(aptidao.R_QD);// QUANDO TODOS OS FEATURES FOREM ZERO
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
  // return individuo;
  if(individuo == null )
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
