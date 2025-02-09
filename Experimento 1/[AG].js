var tempoGeracao = [];

 const pairwise = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                     1, 0, 0, 0, 1, 1, 0, 0, 0, 0,
                     0, 1, 0, 0, 1, 1, 0, 0, 0, 1,
                     1, 1, 0, 0, 0, 1, 0, 0, 0, 1,
                     1, 0, 0, 1, 0];

// const pesos = [//PESOS LEO
//   0.07837810978235664,
//   0.023374300195448373,
//   0.11640772517971315,
//   0.13097028522211548,
//   0.2560042402358631,
//   0.1031901149501441,
//   0.15768377115977078,
//   0.057229933415046216,
//   0.07676151985954219
// ];

// const pesos = [ //ÉZIO
//   0.1638483641266906,
//   0.017967722905016086,
//   0.13092179297723872,
//   0.14010100512837154,
//   0.19899984139937562,
//   0.12259277875651613,
//   0.1260638595756854,
//   0.05235161833166808,
//   0.04765201679943733
// ]
// const pesos = [ //GRUPO
//   0.18024866529884123,
//   0.07437632185382491,
//   0.1149973268958087,
//   0.1340878288368756,
//   0.18444936904062534,
//   0.10441432081819722,
//   0.10278301788943706,
//   0.05512103252983656,
//   0.04952211683655342
// ]

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


// const pesos = [ //WILLI
//   0.21304926764314247,
//     0.18819351975144255,
//     0.08314839473294867,
//     0.1220594762538837,
//     0.15534842432312473,
//     0.0680574049415594,
//     0.056221334516940384,
//     0.06065986092617252,
//     0.05326231691078562
//
// ]

/*
const pesos = [ //PESOS LEO NORMALIZADOS
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
const pesos = [ //PESOS LEO
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
const CropYieldPredictionRF = require('./[RANDOM FOREST].js');
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
    /*//MÉTODO CONCORRENTE
    if(pairwise[i] == 1)
    {
      features.push(1);
    }
    else {
      features.push(Math.floor(Math.random() * 2))
    }*/
    //EFS-AHP
    var variavel = variaveis.filter(f=> i >= f.min && i <= f.max)[0];
    if(pesos[variavel.indice] >= variavel.sorteio)
        // features.push(1);
        features.push(Math.floor(Math.random() * 2))
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
    //ALEATÓRIO
    //features.push(Math.floor(Math.random() * 2)); // Valores entre 0 e 1
    // features.push(1); // Valores entre 0 e 1
  }
  // console.log("features",features)
  const individuo = new CropYieldPredictionRF(size,true,features);
  // console.log("NOVO",novo);
  return individuo;
}

// Função para encontrar a melhor solução usando algoritmos genéticos
async function encontrarMelhorSolucao(populacao, geracoes, taxaMutacao, taxaCrossover, funcaoObjetivo) {

  return new Promise(async (resolve,reject)=>{


  let melhorIndividuo = null;
  let melhorAptidao = -Infinity; // Certifique-se de iniciar com o menor valor possível

  for (let geracao = 0; geracao < geracoes; geracao++) {
    const tempoAnterior = tempoGeracao.length > 0 ? tempoGeracao[tempoGeracao.length - 1].tempoAtual : new Date().getTime();

    console.log("\nGERACAO", geracao, "GERAÇÕES", geracoes, "mutação", taxaMutacao, "crossover", taxaCrossover, "populacao", populacao.length, '\n\n');

    for (let i = 0; i < populacao.length; i++) {
      const individuo = populacao[i];
      try {
        const aptidao = await calcularAptidao(individuo, funcaoObjetivo);

        console.log("GERAÇÃO:", geracao, "INDIVIDUO:", i + 1, "APTIDAO:", aptidao, '\n');

        if (aptidao > melhorAptidao) { // Atualizar o melhor indivíduo e aptidão
          melhorIndividuo = individuo;
          melhorAptidao = aptidao;

          console.log("\n\nGERACAO", geracao, "MELHOR", melhorIndividuo.retornaResultado(), "APTIDAO", melhorAptidao, '\n\n');
          melhorIndividuo.exibirInfo();
        }
      } catch (e) {
        console.error("Erro ao calcular aptidão para o indivíduo:", e);
      }
    }

    // Criar uma nova população para a próxima geração
    let novaPopulacao = [];

    // Elitismo
    if (melhorIndividuo) novaPopulacao.push(melhorIndividuo);

    while (novaPopulacao.length < populacao.length) {
      const pais = [
        populacao[Math.floor(Math.random() * populacao.length)],
        populacao[Math.floor(Math.random() * populacao.length)]
      ];

      if (Math.random() < taxaCrossover) {
        const [filho1, filho2] = cruzamento(...pais);
        novaPopulacao.push(filho1, filho2);
      } else {
        novaPopulacao.push(criarIndividuoAleatorio('F.ALEATORIO'));
      }
    }

    // Mutação na nova população
    console.log("Nova população gerada com tamanho:", novaPopulacao.length);
    novaPopulacao = novaPopulacao.map(individuo => mutacao(individuo, taxaMutacao));

    populacao = novaPopulacao;

    const tempoAtual = new Date().getTime();
    const diferencaEmSegundos = ((tempoAtual - tempoAnterior) / 1000) / 60;
    const tempoAcumulado = tempoGeracao.length > 0 ? tempoGeracao[tempoGeracao.length - 1].tempoAcumulado : 0;

    try {
      const novoTempo = {
        geracao: geracao,
        tempo: parseFloat(diferencaEmSegundos.toFixed(3)),
        tempoAtual: tempoAtual,
        tempoAcumulado: tempoAcumulado + diferencaEmSegundos,
        melhorResultado: melhorIndividuo ? melhorIndividuo.retornaResultado() : null
      };

      tempoGeracao.push(novoTempo);

      console.log("\n\nRESULTADO:", {
        individuo: melhorIndividuo ? melhorIndividuo.retornaResultado() : null,
        aptidao: melhorAptidao,
        tempo: novoTempo
      });
    } catch (e) {
      console.error("Erro ao registrar novo tempo:", e);
    }
  }

  resolve({ individuo: melhorIndividuo, aptidao: melhorAptidao }) ;
  })//fim da promise
}


// Função de aptidão para maximização (o objetivo é maximizar a função objetivo)

function calcularAptidao(x, funcaoObjetivo) {
  // Utilizando setTimeout para atrasar o retorno por 1 segundo
  return new Promise (async (resolve,reject)=>{
    setTimeout(async () => {
      // const aptidao = Math.random() * 100;
      try {

        const aptidao = await x.features.reduce((acum,next) =>acum+next,0) == 0 ? {R_QD:0} : x.iniciar();//x.reduce((acum,next)=>acum+next);
        //console.log("Aptidão calculada:", aptidao, aptidao.R_QD);
        resolve(aptidao.R_QD);
      } catch (e) {
        console.log("ERRO APT",e.toString(),x.iniciar,x.R_QD,x.R_QD_TESTE,x.id);
        resolve(0)
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

// Função para salvar os resultados no arquivo
function salvarResultados(tempoGeracao, melhorIndividuo, caminhoArquivo,  geracoes, taxaMutacao, taxaCrossover, tamanhoPopulacao) {
  try {
    const fs = require('fs');

    // Verificar se o arquivo já existe e carregar conteúdo
    let resultados = fs.existsSync(caminhoArquivo) ? fs.readFileSync(caminhoArquivo, 'utf-8') : '';

    // Transformar os resultados do indivíduo em formato serializado
    let featuresString = '';
    let qtdVariaveis = 0;

    melhorIndividuo.features.forEach(f => {
      featuresString += f + ' ';
      qtdVariaveis += f;
    });

    let indice = tempoGeracao.length - 1;
    const melhorResultado = tempoGeracao[indice].melhorResultado;

    // Serializar os resultados no formato tabular
    const objetoSerializado = `${qtdVariaveis}\t${featuresString}\t${melhorResultado["R_QD"]}\t${melhorResultado["R_QD_TESTE"]}\t${tempoGeracao[indice].tempoAcumulado}\t${melhorResultado["MST"]}\t${melhorResultado["MSE"]}\t${melhorResultado["RMSE"]}\t${melhorResultado["MAE"]}\t${melhorResultado["MAPE"]}\t${melhorResultado["SMAPE"]}\t${geracoes}\t${taxaMutacao}\t${taxaCrossover}\t${tamanhoPopulacao}\n`;

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
  const fs = require("fs");
  var ttest = require( '@stdlib/stats-ttest' );

  function isR2StatisticallyValid(r2Values, alpha = 0.05) {
      if (r2Values.length > 4) {
          // Calcular a média dos valores R²
          const meanR2 = r2Values.reduce((sum, value) => sum + value, 0) / r2Values.length;

          // Realizar o teste de Wilcoxon
          const out = ttest(r2Values);

          // Log dos resultados
          console.log("Valores R²:", r2Values);
          console.log("Média do R²:", meanR2);
          console.log("Resultado do teste t-Student pareado:", out);

          // Retornar se não há diferença significativa
          return !out.rejected;
      } else {
          console.log("Dados insuficientes para validação estatística (menos de 8 valores).");
          return false;
      }
  }



  // Grid de parâmetros
  const grid = {
    // tamanhoPopulacao: [100, 150, 200],
    // geracoes: [5, 10, 20],
    // taxaMutacao: [0.1, 0.2, 0.3],
    // taxaCrossover: [0.2, 0.6, 0.8],

    tamanhoPopulacao: [100],
    geracoes: [10],
    taxaMutacao: [0.1],
    taxaCrossover: [0.8],
  };

  const caminhoArquivo = "./AG_DOUTORADO_RESULTS_RANDOM.txt";
  let r2ValuesGlobais = [];
  let ensaio = 0;

  // while (!isR2StatisticallyValid(r2ValuesGlobais)) { // Cada iteração do while é um ensaio
    while (ensaio < 10) { // Cada iteração do while é um ensaio

  for (const geracoes of grid.geracoes) {
    for (const tamanhoPopulacao of grid.tamanhoPopulacao) {
            for (const taxaMutacao of grid.taxaMutacao) {
                for (const taxaCrossover of grid.taxaCrossover) {
                    console.log(
                        `Iniciando com parâmetros: População=${tamanhoPopulacao}, Gerações=${geracoes}, Mutação=${taxaMutacao}, Crossover=${taxaCrossover}`
                    );

                    const resultadosGerais = []; // Coletar resultados de todas as configurações dentro deste ensaio
                    const r2ValuesLocais = [];
                    let noImprovementCounter = 0;
                    let melhorR2 = -Infinity;
                    let melhorSolucaoFinal = null;

                    // Processar para cada configuração
                    tempoGeracao = [];
                    let populacao = Array.from(
                        { length: tamanhoPopulacao },
                        (_, size) => criarIndividuoAleatorio(size + 1)
                    );

                    const melhorSolucao = await encontrarMelhorSolucao(
                        populacao,
                        geracoes,
                        taxaMutacao,
                        taxaCrossover,
                        {}
                    );

                    if (melhorSolucao && melhorSolucao.individuo) {
                      // Gerar um valor aleatório entre 4 e 5 para r2Atual
                        const r2Atual = melhorSolucao.individuo.retornaResultado()["R_QD"];
                        r2ValuesLocais.push(r2Atual);
                        r2ValuesGlobais.push(r2Atual);

                        console.log(
                            `Configuração concluída: Melhor R² = ${r2Atual}, Histórico Local = ${r2ValuesLocais}`
                        );

                        if (r2Atual > melhorR2) {
                            melhorR2 = r2Atual;
                            melhorSolucaoFinal = melhorSolucao.individuo;
                            noImprovementCounter = 0; // Resetar contador
                        } else {
                            noImprovementCounter++;
                        }

                        // Early stopping
                        if (noImprovementCounter >= 3) {
                            console.log("Early stopping ativado.");
                            break;
                        }
                    }

                    // Coletar os resultados dessa configuração
                    if (melhorSolucaoFinal) {
                        resultadosGerais.push({ tempoGeracao, melhorSolucaoFinal });
                    }

                    console.log(
                        `[ENSAIO] #${ensaio} Parâmetros [População=${tamanhoPopulacao}, Gerações=${geracoes}, Mutação=${taxaMutacao}, Crossover=${taxaCrossover}] concluídos.\n`
                    );

                    // Salvar os resultados acumulados de todas as configurações após o ensaio
                    for (const resultado of resultadosGerais) {
                        salvarResultados(resultado.tempoGeracao, resultado.melhorSolucaoFinal, caminhoArquivo, geracoes, taxaMutacao, taxaCrossover, tamanhoPopulacao);
                    }
                }
            }
        }
    }

    ensaio++;

    console.log(`Ensaio concluído. Resultados salvos.`);
}




  console.log("Significância estatística alcançada para R² global.");
})();
