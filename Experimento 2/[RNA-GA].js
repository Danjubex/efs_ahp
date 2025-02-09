var tempoGeracao = [];

 const pairwise = [ //gpt
                    1,1,1,1,1,//MANEJO
                    0,0,1,1,0,0,0,0,//FASE
                    0,0,1,1,1,1,1,1,0,0,0,0,//MES
                    0,0,0,0,0,0,0,0,1,1,//SISTEMA DE IRRIGAÇÂO
                    1,0,0,0,1,1,0,1,//TIPO DE SOLO
                    0,0,1,1,//Z A T S.A
                    0,0,1,1,//T a S S.A
                    0,0,1,1,//Z A T P.S
                    0,0,1,1,//T a S P.S
                  ];

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

 // const pesos = [ //PESOS GPT (RC) 14.245852952556058
 //   0.011794486091056483,
 //   0.1105619986589515,
 //   0.2071600637175426,
 //   0.052609545569040926,
 //   0.02456637657919104,
 //   0.04820324335063453,
 //   0.0828469962996995,
 //   0.11264807410534682,
 //   0.13350882856929994,
 //   0.21610038705923676
 // ]
 const pesos = [ //PESOS DECISOR 1
   0.03916282369634622,
   0.17169208939340194,
   0.12004256828662647,
   0.04779472626226795,
   0.012120137164479131,
   0.15750266051791417,
   0.08832919474991134,
   0.0831500532103583,
   0.03330968428520752,
   0.24689606243348708
 ]

 // const pesos = [ //PESOS NORMALIZADOS DECISOR 1
 // 0.115185092,
 // 0.679677663,
 // 0.4596827,
 // 0.151951649,
 // 0,
 // 0.619239486,
 // 0.324603374,
 // 0.30254344,
 // 0.090254344,
 // 1,
 // ]
 
const KcPredictionRF = require('./nn_doutorado_new_grid.js');
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
  // var mudouGrupo = false;
  // console.log("A,B,C",a,b,c)

  for (let i = 0; i < numVariaveis; i++) {
    //MÉTODO CONCORRENTE
    // if(pairwise[i] == 1)
    // {
    //   features.push(1);
    // }
    // else {
    //   features.push(Math.floor(Math.random() * 2))
    // }

    //EFS-AHP
    var variavel = variaveis.filter(f=> i >= f.min && i <= f.max)[0];
    if(pesos[variavel.indice] >= variavel.sorteio)
        // features.push(1);
        features.push(Math.floor(Math.random() * 2))
    else
        features.push(0);


    // MÉTODO PESOS EM GRUPO/AHP
    /*
      var variavel = variaveis.filter(f=> i >= f.min && i <= f.max)[0];
        // console.log("I",i,variavel,pesos[variavel.indice])
      if(pesos[variavel.indice] >= variavel.sorteio)
          features.push(bestRandom[i]);
      else
          features.push(0);
    */
    //ALEATÓRIO
    // features.push(Math.floor(Math.random() * 2)); // Valores entre 0 e 1
    // features.push(1); // Valores entre 0 e 1
  }
  // console.log("features",features)
  const individuo = new KcPredictionRF(size,true,features);
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
        console.log("ERRO APT",e.toString(),x.iniciar,x.R_QD,x.R_QD_TESTE,x.id,e);
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
  const filho1 = new KcPredictionRF('F1.CRUZAMENTO',true,featuresFilho1);//individuo1.slice(0, pontoCorte).concat(individuo2.slice(pontoCorte));
  const filho2 = new KcPredictionRF('F2.CRUZAMENTO',true,featuresFilho2);//individuo2.slice(0, pontoCorte).concat(individuo1.slice(pontoCorte));
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
      return new KcPredictionRF('F.MUTADO',true,features);
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
    geracoes: [20],
    taxaMutacao: [0.2],
    taxaCrossover: [0.6],
  };

  const caminhoArquivo = "./AG_DOUTORADO_RESULTS_EFS_AHP.txt";
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
