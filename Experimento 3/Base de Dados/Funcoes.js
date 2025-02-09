const fs                = require('fs').promises;
const ss                = require('simple-statistics');
const fetch             = require('node-fetch');
const dayjs             = require('dayjs');
const sqlite3           = require('sqlite3').verbose();

const botToken = 'SEU_TOKEN';  // Substitua pelo token do seu bot
const chatId = 'SEU_CHATID';  // Substitua pelo ID do grupo
//const message = 'Olá, grupo! Esta é uma mensagem enviada pelo meu bot.';

// Função para salvar um objeto no banco de dados SQLite em segmentos usando apenas `INSERT`
async function salvarObjetoNoBanco(prefixoNomeArquivo, obj, moeda, hora) {
  return new Promise((resolve,reject)=>{
        const db = new sqlite3.Database(`${prefixoNomeArquivo}.db`, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(`Erro ao abrir o banco de dados: ${err.message}`);
                reject('ERRO 1')
            } else {
                //console.log(`Conectado ao banco de dados: ${prefixoNomeArquivo}.db`);
            }
        });

        // Garantir que a tabela existe
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS dados (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                moeda TEXT,
                dados TEXT,
                data DATETIME
            )
        `;
        db.run(createTableSQL);

        try {
            // Inserir o novo objeto no banco de dados como uma nova linha
            db.run("INSERT INTO dados (moeda, dados, data) VALUES (?, ?, ?)", [moeda, JSON.stringify(obj), hora], function (err) {
                if (err) {
                    console.error(`Erro ao inserir no banco de dados: ${err.message}`);
                    reject('ERRO 2 '+err.message)
                } else {
                    //console.log(`Novo registro inserido no segmento ID do registro: ${this.lastID}`);
                    resolve('INSERIDO '+this.lastID)
                }
            });
        } catch (error) {
            console.error(`Erro ao salvar o objeto no banco de dados: ${error}`);

            reject('ERRO 3 ')
        } finally {
            db.close((err) => {
                if (err) {
                    console.error(`Erro ao fechar o banco de dados: ${err.message}`);
                } else {
                    //console.log("Conexão com o banco de dados fechada.");
                }
            });
        }
  })//fim do promise

}//fim de salvarObjetoNoBanco


const sendMessage = async (message) => {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const params = {
        chat_id: chatId,
        text: message
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();
        console.log('Mensagem enviada:', data);
    } catch (error) {
        console.error('Erro ao enviar a mensagem:', error);
    }
};

//sendMessage('Olá, grupo! Esta é uma mensagem enviada pelo meu bot.');

function calcularDesvioPadrao(dados, periodo, media) {
    let soma = 0;
    for (let i = 0; i < periodo; i++) {
        soma += Math.pow((dados[dados.length - 1 - i] - media), 2);
    }
    return Math.sqrt(soma / periodo);
}
// Função para calcular estatísticas de cada coluna
function calcularEstatisticas(array) {
  const estatisticas = {
      maximo: Number(Math.max(...array)).toFixed(2),
      minimo: Math.min(...array).toFixed(2),
      primeiro: array[0],
      ultimo: array[array.length-1].toFixed(2),
      mediana: array[Math.ceil(array.length/2)].toFixed(2),
      media: Number(array.reduce((total, valor) => total + valor, 0) / array.length).toFixed(2),
      desvio_padrao: Number(calcularDesvioPadrao(array,array.length,array.reduce((total, valor) => total + valor, 0) / array.length)).toFixed(2),
      valores_faltantes: array.filter(valor => isNaN(valor)).length,
      valores_distintos: new Set(array).size
  };

  return estatisticas;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function shuffle(o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}
// Função para calcular a média de uma série temporal
function calcularMedia(serieTemporal) {
    const soma = serieTemporal.reduce((acc, valor) => acc + valor, 0);
    return soma / serieTemporal.length;
}


function calcularDesvioPadraoA(valores) {
    const media = valores.reduce((acc, valor) => acc + valor, 0) / valores.length;
    const difQuadradas = valores.map(valor => Math.pow(valor - media, 2));
    const mediaDifQuadradas = difQuadradas.reduce((acc, valor) => acc + valor, 0) / difQuadradas.length;
    const desvioPadrao = Math.sqrt(mediaDifQuadradas);
    return desvioPadrao;
}


function salvarArrayNoArquivo(prefixoNomeArquivo,array) {
    return new Promise((resolve, reject) => {
        const qtd_segmentos     = Math.ceil(array.length / 2500)
        const tamanhoDoSegmento = Math.ceil(array.length / qtd_segmentos);

        for (let i = 0; i < qtd_segmentos; i++) {
            console.log("SALVANDO SEGMENTO ",i + 1)
            const nomeArquivo = `BD/${i + 1}_${prefixoNomeArquivo}`;
            const inicio = i * tamanhoDoSegmento;
            const fim = Math.min((i + 1) * tamanhoDoSegmento, array.length);
            const segmento = array.slice(inicio, fim);
            const jsonConteudo = JSON.stringify(segmento, null, 2);

            fs.writeFile(nomeArquivo, jsonConteudo, (err) => {
                if (err) {
                    reject(`Erro ao escrever no arquivo ${nomeArquivo}: ${err}`);
                    return;
                }
                console.log(`Segmento ${i + 1} foi salvo com sucesso no arquivo ${nomeArquivo}`);
                if (i === 2) {
                    resolve('Os segmentos foram salvos com sucesso.');
                }
            });
        }
    });
}

// Função para salvar um objeto em arquivos segmentados de forma assíncrona
// Função para salvar um objeto em arquivos segmentados de forma assíncrona
async function salvarObjetoNoArquivo(prefixoNomeArquivo, obj, linha) {
    return new Promise(async (resolve, reject) => {
        try {
            const maxSegmentos = 1440;  // Quantidade máxima de objetos por arquivo
            const i = Math.floor(linha / maxSegmentos) + 0;  // Número do arquivo baseado na linha atual
            const nomeArquivo = `BD/${i}_${prefixoNomeArquivo}.json`;  // Nome do arquivo baseado no segmento
            console.log("s",i)

            let array = [];

            // Verificar se o arquivo já existe
            try {
                // Tentar ler o arquivo existente
                const data = await fs.readFile(nomeArquivo, 'utf8');
                // Parse do conteúdo existente (caso haja dados)
                array = JSON.parse(data);
                console.log(`Arquivo ${nomeArquivo} lido com sucesso.`);
            } catch (err) {
                // Se o arquivo não existir ou estiver corrompido, inicializar um novo array
                if (err.code === 'ENOENT') {
                    console.log(`Arquivo ${nomeArquivo} não encontrado, criando um novo.`);
                } else {
                    console.error(`Erro ao ler o arquivo ${nomeArquivo}:`, err);
                }
            }

            // Adicionar o novo objeto ao array
            array.push(obj);

            // Salvar o array atualizado no arquivo
            const jsonConteudo = JSON.stringify(array, null, 2);

            // Escrever o conteúdo de volta no arquivo (ou criar se não existir)
            await fs.writeFile(nomeArquivo, jsonConteudo);
            console.log(`Objeto salvo no arquivo ${nomeArquivo}.`);

            resolve(`Segmento ${i + 1} atualizado com sucesso.`);
        } catch (err) {
            console.error(`Erro ao salvar o objeto no arquivo: ${err}`);
            reject(err);
        }
    });
}

// Função para salvar os rates em um arquivo
async function salvarRatesNoArquivo(rates, moeda) {
    return new Promise(async (resolve, reject) => {
        try {

            const nomeArquivo = `[RATES]${moeda}.json`; // Nome do arquivo para salvar os rates

            let ratesExistente = []; // Array vazio para armazenar os rates existentes

            await new Promise((resolve2, reject2)=>{
              fs.access(nomeArquivo, async (err) => {
                  if (!err) {
                      try {
                          const conteudoArquivo = fs.readFile(nomeArquivo, 'utf-8',(err,conteudoArquivo)=>{
                            // console.log("conteudoArquivo",conteudoArquivo)
                            if(err)
                            {
                              reject2();
                              console.log("ERRO NA LEITURA DO ARQUIVO",err)
                            }
                              try {

                                ratesExistente = JSON.parse(conteudoArquivo); // Ler o conteúdo do arquivo e converter para array
                                console.log('Arquivo encontrado e lido com sucesso:', nomeArquivo);
                                resolve2();
                              } catch (e) {

                                console.log("ERRO NA LEITURA DO ARQUIVO 2",err)
                                reject2();
                              }
                          });
                      } catch (error) {
                          console.error('Erro ao ler o arquivo:', error);
                          reject2();
                      }
                  } else {
                      console.error('Arquivo não encontrado:', nomeArquivo);
                      resolve2();
                  }
              });
            })//FIM DA PROMISE


            var novos_rates = [];
            // Adicionar os novos rates ao array existente
            for (let i = 0; i < rates.length; i++) {
                  const rate = rates[i];
                  novos_rates.push(rate);
              }
            var arr = novos_rates.concat(ratesExistente);
            arr     = arr.sort((a,b)=>{
              if(a.TIME > b.TIME)
                  return -1;
                  else {
                    return 1;
                  }
            })
            // Converter o array combinado para formato JSON e formatar com indentação de 2 espaços
            const dadosParaSalvar = JSON.stringify(arr, null, 2);

            // Escrever os dados no arquivo
            await fs.writeFile(nomeArquivo, dadosParaSalvar,()=>{
              console.log('Rates foram salvos com sucesso no arquivo:', nomeArquivo);
              resolve();
            });

        } catch (error) {
            reject(error);
        }
    });
}//FIM DA salvarRatesNoArquivo

// Função para selecionar os últimos 30 dias e dados aleatórios do período maior que 30 dias
function selecionarDadosUltimos30DiasEAleatorios(array, n) {
    const agora = dayjs();  // Data atual
    const limiteDias = agora.subtract(1, 'day');  // Calcula o limite de 30 dias

    // Array para armazenar dados dos últimos 30 dias
    var dadosUltimos30Dias = array.filter(dado => dayjs(dado.hora).isAfter(limiteDias));
        dadosUltimos30Dias = selecionarDadosAleatorios(dadosUltimos30Dias, n);
    // Array para armazenar dados anteriores aos últimos 30 dias
    const dadosAntigos = array.filter(dado => dayjs(dado.hora).isBefore(limiteDias));

    // Selecionar n dados aleatórios dos dados anteriores a 30 dias
    const dadosAleatorios = selecionarDadosAleatorios(dadosAntigos, n);

    return { dadosUltimos30Dias, dadosAleatorios };
}

// Função auxiliar para selecionar dados aleatórios de um array
function selecionarDadosAleatorios(array, n) {
    // Se n for maior do que o tamanho do array, selecione todos os dados disponíveis
    if (n > array.length) {
        console.warn(`O número solicitado (${n}) é maior do que o disponível (${array.length}). Retornando todos os dados disponíveis.`);
        return array;  // Retorna todos os dados
    }

    const copiaArray = array.slice();  // Copia o array original
    const dadosSelecionados = [];

    // Seleciona dados aleatórios até que n seja 0 ou não haja mais dados
    while (n > 0 && copiaArray.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * copiaArray.length);  // Índice aleatório
        const dadoSelecionado = copiaArray.splice(indiceAleatorio, 1)[0];  // Remove e seleciona o dado
        dadosSelecionados.push(dadoSelecionado);  // Adiciona ao array de selecionados
        n--;  // Decrementa o contador de dados a selecionar
    }

    return dadosSelecionados;
}

// Função para calcular a média móvel
function calcularMediaMovel(dados, periodo) {
    // Verifica se há pelo menos X dados
    if (dados.length < periodo) {
        return null; // Não é possível calcular a média móvel
    }

    // Obtém os últimos X dados
    const ultimosDados = dados.slice(-periodo);

    // Calcula a soma dos últimos X dados
    const soma = ultimosDados.reduce((acumulador, valor) => acumulador + valor, 0);

    // Calcula a média
    const media = soma / periodo;
    // console.log("MEDIA",media,soma,periodo)
    return media;
}


 function agruparPeriodos(dados,periodo,i){
  if(i>= dados.length - periodo)
    return undefined;

  // var dado_M15 = dados[i+15];
    var i_periodo     = i+periodo;
  //buscar todos os dados entre o i atual e o i_M15
    var dados_periodo = dados.slice(i+1,i_periodo);//.map(da=>da.TIME);
  //calcular os valores pra M15
    var open_periodo      = dados_periodo[dados_periodo.length-1].OPEN;//Preço de abertura M1
    var close_periodo     = dados_periodo[0].CLOSE;//Preço de fechamento M15
    var high_periodo      = Math.max(...dados_periodo.map(d=>d.HIGH));//Maior valor do intervalo
    var low_periodo       = Math.min(...dados_periodo.map(d=>d.LOW));//Menor valor do intervalo
    var vol_periodo       = dados_periodo.map(dp=>dp.TICK_VOLUME).reduce((acum,next)=>acum+next,0)
    // var maxClose_periodo  = Math.max(...dados_periodo.map(d=>d.HIGH));//Maior preço de venda do intervalo
    // var minClose_periodo  = Math.min(...dados_periodo.map(d=>d.LOW));//Menor preço de venda do intervalo

    return {
      OPEN        : open_periodo,
      CLOSE       : close_periodo,
      HIGH        : high_periodo,
      LOW         : low_periodo,
      VOLUME      : vol_periodo
      // minCLose    : minClose_periodo,
      // maxClose    : maxClose_periodo,
    }
}//fim do agruparPeriodo

// Função para calcular o RSI
function calcularRSI(dados, periodo) {
    // Verifica se há dados suficientes para o cálculo do RSI
    if (dados.length <= periodo) {
        return null; // Não é possível calcular o RSI
    }

    // Inicializa arrays para armazenar ganhos e perdas
    const ganhos = [];
    const perdas = [];

    // Calcula os ganhos e as perdas
    for (let i = 0; i < dados.length-1; i++) {
        const diferenca = dados[i] - dados[i + 1];
        if (diferenca >= 0) {
            ganhos.push(diferenca);
            perdas.push(0);
        } else {
            ganhos.push(0);
            perdas.push(Math.abs(diferenca));
        }
    }

    // Calcula a média dos ganhos e das perdas
    let mediaGanhos = 0;
    let mediaPerdas = 0;
    for (let i = 0; i < periodo; i++) {
        mediaGanhos += ganhos[i];
        mediaPerdas += perdas[i];
    }
    mediaGanhos /= periodo;
    mediaPerdas /= periodo;

    // Calcula o RSI
    const RS = mediaGanhos / mediaPerdas;
    const RSI = 100 - (100 / (1 + RS));

    return RSI;
}

// Função para calcular a média móvel exponencial (EMA)
function calcularEMA(serieTemporal, periodo) {
    const ema = [];
    let multiplicador = 2 / (periodo + 1);

    // Calcular a média dos primeiros valores
    let somaInicial = 0;
    for (let i = 0; i < periodo; i++) {
        somaInicial += serieTemporal[i];
    }
    ema.push(somaInicial / periodo);

    // Calcular a EMA para os valores restantes
    for (let i = periodo; i < serieTemporal.length; i++) {
        let valorEMA = (serieTemporal[i] - ema[i - periodo]) * multiplicador + ema[i - periodo];
        ema.push(valorEMA);
    }

    return ema;
}

// Função para calcular o MACD
function calcularMACD(serieTemporal) {

    const periodoCurto = 12;
    const periodoLongo = 26;
    const periodoSinal = 9;
    // Calcular a EMA rápida (MACD Line)
    const emaCurto = calcularEMA(serieTemporal, periodoCurto);

    // Calcular a EMA lenta
    const emaLongo = calcularEMA(serieTemporal, periodoLongo);

    // Calcular a linha MACD (Diferença entre EMA curta e EMA longa)
    const macdLine = emaCurto.map((valor, indice) => valor - emaLongo[indice]);

    // Calcular a EMA da linha MACD (MACD Signal Line)
    const emaSinal = calcularEMA(macdLine, periodoSinal);

    // Calcular o histograma (Diferença entre a linha MACD e a linha de sinal)
    const histograma = macdLine.map((valor, indice) => valor - emaSinal[indice]);

    return  histograma.filter(h=> !isNaN(h)) ;
}

function calcularBandasBollinger(dados, periodo = 20, multiplicador = 2) {
    let mms = calcularMediaMovel(dados, periodo);
    let desvioPadrao = calcularDesvioPadrao(dados, periodo, mms);

    let bandaSuperior = mms + (desvioPadrao * multiplicador);
    let bandaInferior = mms - (desvioPadrao * multiplicador);

    return {
        bandaSuperior,
        mms,
        bandaInferior
    };
}




function calcularEstocastico(precosFechamento, precosAltos, precosBaixos, periodoK = 14, periodoD = 3) {
    function calcularSMA(dados, periodo) {
        return dados.slice(-periodo).reduce((soma, valor) => soma + valor, 0) / periodo;
    }
    let p_K = [];
    let p_D = [];

    for (let i = periodoK - 1; i < precosFechamento.length; i++) {
        let fechamentoAtual = precosFechamento[i];
        let maximoPeriodo = Math.max(...precosAltos.slice(i - periodoK + 1, i + 1));
        let minimoPeriodo = Math.min(...precosBaixos.slice(i - periodoK + 1, i + 1));

        let valorK = ((fechamentoAtual - minimoPeriodo) / (maximoPeriodo - minimoPeriodo)) * 100;
        p_K.push(valorK);

        // Calcular %D apenas se houver dados suficientes
        if (i >= periodoK - 1 + periodoD - 1) {
            let valorD = calcularSMA(p_K.slice(-periodoD), periodoD);
            p_D.push(valorD);
        }
    }

    return { p_K:{
                    p_K_medio : p_K.reduce((acc, valor) => acc + valor, 0) / p_K.length,
                    p_K_desvio: calcularDesvioPadraoA(p_K),
                    p_K_min   : Math.min(...p_K),
                    p_K_max   : Math.max(...p_K)
                  },
             p_D:{
                   p_D_medio: p_D.reduce((acc, valor) => acc + valor, 0) / p_D.length,
                   p_D_desvio: calcularDesvioPadraoA(p_D),
                   p_D_min   : Math.min(...p_D),
                   p_D_max   : Math.max(...p_D)
                 }
          };
}

function calcularMMP(precos, periodo) {
    let somaPesos = 0;
    let somaPonderada = 0;

    for (let i = 0; i < periodo; i++) {
        let peso = periodo - i;
        somaPesos += peso;
        somaPonderada += precos[i] * peso;
    }

    return somaPonderada / somaPesos;
}



function calcularIchimoku(dados) {
    const calcularMaxMin = (inicio, fim) => {
         let maximos = dados.slice(inicio, fim).map(a => a.HIGH);
         let minimos = dados.slice(inicio, fim).map(a => a.LOW);
         return {
             max: Math.max(...maximos),
             min: Math.min(...minimos)
         };
     };

     let tenkanSen = dados.map((_, index) => {
         if (index < 8) return null; // Não há dados suficientes para os primeiros 8 períodos
         let { max, min } = calcularMaxMin(index - 8, index + 1);
         return (max + min) / 2;
     });

     let kijunSen = dados.map((_, index) => {
         if (index < 25) return null; // Não há dados suficientes para os primeiros 25 períodos
         let { max, min } = calcularMaxMin(index - 25, index + 1);
         return (max + min) / 2;
     });

     let senkouSpanA = tenkanSen.map((tenkan, index) => {
         if (index < 25) return null; // Não há dados suficientes
         return ((tenkan + kijunSen[index]) / 2);
     }).slice(25).concat(new Array(25).fill(null)); // Desloca 26 períodos para frente

     let senkouSpanB = dados.map((_, index) => {
         if (index < 51) return null; // Não há dados suficientes para os primeiros 51 períodos
         let { max, min } = calcularMaxMin(index - 51, index + 1);
         return (max + min) / 2;
     }).slice(25).concat(new Array(25).fill(null)); // Desloca 26 períodos para frente

     let chikouSpan = dados.map((_, index) => {
         if (index < 26) return null; // Não há dados suficientes para deslocar
         return dados[index - 26].CLOSE; // Desloca 26 períodos para trás
     });

     tenkanSen   = tenkanSen.filter(v=>v!=null);
     kijunSen    = kijunSen.filter(v=>v!=null);
     senkouSpanA = senkouSpanA.filter(v=>v!=null);
     senkouSpanB = senkouSpanB.filter(v=>v!=null);
     chikouSpan  = chikouSpan.filter(v=>v!=null);

     return {
              tenkanSen:{
                              tenkanSen_medio : tenkanSen.reduce((acc, valor) => acc + valor, 0) / tenkanSen.length,
                              tenkanSen_desvio: calcularDesvioPadraoA(tenkanSen),
                              tenkanSen_min   : Math.min(...tenkanSen),
                              tenkanSen_max   : Math.max(...tenkanSen)
                            },
              kijunSen:{
                              kijunSen_medio : kijunSen.reduce((acc, valor) => acc + valor, 0) / kijunSen.length,
                              kijunSen_desvio: calcularDesvioPadraoA(kijunSen),
                              kijunSen_min   : Math.min(...kijunSen),
                              kijunSen_max   : Math.max(...kijunSen)
                        },
              senkouSpanA:{
                              senkouSpanA_medio : senkouSpanA.reduce((acc, valor) => acc + valor, 0) / senkouSpanA.length,
                              senkouSpanA_desvio: calcularDesvioPadraoA(senkouSpanA),
                              senkouSpanA_min   : Math.min(...senkouSpanA),
                              senkouSpanA_max   : Math.max(...senkouSpanA)
                        },
              senkouSpanB:{
                              senkouSpanB_medio : senkouSpanB.reduce((acc, valor) => acc + valor, 0) / senkouSpanB.length,
                              senkouSpanB_desvio: calcularDesvioPadraoA(senkouSpanB),
                              senkouSpanB_min   : Math.min(...senkouSpanB),
                              senkouSpanB_max   : Math.max(...senkouSpanB)
                        },
              chikouSpan:{
                              chikouSpan_medio : chikouSpan.reduce((acc, valor) => acc + valor, 0) / chikouSpan.length,
                              chikouSpan_desvio: calcularDesvioPadraoA(chikouSpan),
                              chikouSpan_min   : Math.min(...chikouSpan),
                              chikouSpan_max   : Math.max(...chikouSpan)
                        } };
}//FIM DO ICHIMOKU

function calcularIFD(dados, periodo = 14) {
    let fluxoPositivo = 0;
    let fluxoNegativo = 0;

    for (let i = 1; i < dados.length-1; i++) {
        const precoTipicoAtual = (dados[i].HIGH + dados[i].LOW + dados[i].CLOSE) / 3;
        const precoTipicoAnterior = (dados[i+1].HIGH + dados[i+1].LOW + dados[i+1].CLOSE) / 3;
        const fluxoDinheiro = precoTipicoAtual * dados[i].TICK_VOLUME;

        if (precoTipicoAtual > precoTipicoAnterior) {
            fluxoPositivo += fluxoDinheiro;
        } else if (precoTipicoAtual < precoTipicoAnterior) {
            fluxoNegativo += fluxoDinheiro;
        }
    }

    const razaoFluxo = fluxoPositivo / fluxoNegativo;
    const ifd = 100 - (100 / (1 + razaoFluxo));

    return ifd;
}//FIM O IFD



function calcularADX(dados, periodo = 14) {
    function ema(lista, periodo) {
        let multiplicador = 2 / (periodo + 1);
        return lista.reduce((acc, val, idx) => {
            if (idx === 0) {
                acc.push(val);
            } else {
                acc.push((val - acc[acc.length - 1]) * multiplicador + acc[acc.length - 1]);
            }
            return acc;
        }, []);
    }
    function calcularTR(alta, baixa, fechamentoAnterior) {
        return Math.max(alta - baixa, Math.abs(alta - fechamentoAnterior), Math.abs(baixa - fechamentoAnterior));
    }

    function calcularDMs(altaAtual, baixaAtual, altaAnterior, baixaAnterior) {
        let maisDM = altaAtual > altaAnterior ? altaAtual - altaAnterior : 0;
        let menosDM = baixaAnterior > baixaAtual ? baixaAnterior - baixaAtual : 0;

        if (maisDM > menosDM) {
            menosDM = 0;
        } else if (menosDM > maisDM) {
            maisDM = 0;
        } else {
            maisDM = 0;
            menosDM = 0;
        }

        return { 'maisDM': maisDM, 'menosDM': menosDM };
    }
    let tr = [calcularTR(dados[0].HIGH, dados[0].LOW, dados[0].CLOSE)];
    let maisDM = [0];
    let menosDM = [0];

    for (let i = 0; i < dados.length-1; i++) {
        //console.log("i",i,i+1,dados.length)
        tr.push(calcularTR(dados[i].HIGH, dados[i].LOW, dados[i + 1].CLOSE));
        let dmResult = calcularDMs(dados[i].HIGH, dados[i].LOW, dados[i + 1].HIGH, dados[i + 1].LOW);
        maisDM.push(dmResult['maisDM']);
        menosDM.push(dmResult['menosDM']);
    }

    let trEma = ema(tr, periodo);
    let maisDMEma = ema(maisDM, periodo);
    let menosDMEma = ema(menosDM, periodo);

    let maisDI = maisDMEma.map((val, idx) => (val / trEma[idx]) * 100);
    let menosDI = menosDMEma.map((val, idx) => (val / trEma[idx]) * 100);

    let dx = maisDI.map((val, idx) => Math.abs(val - menosDI[idx]) / (val + menosDI[idx]) * 100);
        dx = dx.filter(d=>!isNaN(d));
    let adx = ema(dx, periodo);
    // console.log("ADX",adx,periodo)
    return {
                    adx_medio : adx.reduce((acc, valor) => acc + valor, 0) / adx.length,
                    adx_desvio: calcularDesvioPadraoA(adx),
                    adx_min   : Math.min(...adx),
                    adx_max   : Math.max(...adx)
              };
}//CALCULAR ADX

function calcularPVI(dados) {
  let pvi = [1000]; // Inicializa o PVI com 1000 para o primeiro dia

   for (let i = 0; i < dados.length-1; i++) {
       const variacaoPreco = (dados[i].CLOSE - dados[i + 1].CLOSE) / dados[i + 1].CLOSE;
       // console.log("variacaoPreco",variacaoPreco)
       if (dados[i].TICK_VOLUME > dados[i + 1].TICK_VOLUME) {
           // Ajusta o PVI somente se o volume aumentou em relação ao dia anterior
           pvi.push(pvi[i] + (variacaoPreco * pvi[i]));
       } else {
           // Mantém o PVI inalterado se o volume diminuiu
           pvi.push(pvi[i]);
       }
   }

   return  {
               pvi_medio : pvi.reduce((acc, valor) => acc + valor, 0) / pvi.length,
               pvi_desvio: calcularDesvioPadraoA(pvi),
               pvi_min   : Math.min(...pvi),
               pvi_max   : Math.max(...pvi),
               pvi_last  : pvi[pvi.length - 1]
           };
}//FIM DO CALCULAR PVI

function calcularSARParabolico(dados, faInicial = 0.02, faMaximo = 0.2) {
    let sar = [dados[0].LOW]; // Inicializa com o primeiro ponto baixo
    let fa = faInicial;
    let ep = dados[0].HIGH; // Primeiro ponto alto
    let tendenciaAlta = true;

    for (let i = 1; i < dados.length-1; i++) {
        let novoSAR;
        if (tendenciaAlta) {
            if (dados[i].HIGH > ep) {
                ep = dados[i].HIGH;
                fa = Math.min(fa + faInicial, faMaximo);
            }
            novoSAR = sar[i - 1] + fa * (ep - sar[i - 1]);
            if (dados[i].LOW < novoSAR) {
                tendenciaAlta = false;
                novoSAR = ep;
                ep = dados[i].LOW;
                fa = faInicial;
            }
        } else {
            if (dados[i].LOW < ep) {
                ep = dados[i].LOW;
                fa = Math.min(fa + faInicial, faMaximo);
            }
            novoSAR = sar[i - 1] - fa * (sar[i - 1] - ep);
            if (dados[i].HIGH > novoSAR) {
                tendenciaAlta = true;
                novoSAR = ep;
                ep = dados[i].HIGH;
                fa = faInicial;
            }
        }
        sar.push(novoSAR);
    }

    return {
            sar_medio : sar.reduce((acc, valor) => acc + valor, 0) / sar.length,
            sar_desvio: calcularDesvioPadraoA(sar),
            sar_min   : Math.min(...sar),
            sar_max   : Math.max(...sar),
    };
}//FIM DO calcularSARParabolico

function calcularRetracoesFibonacci(dados) {
    let resultados = dados.map(dado => {
        let alto = dado.HIGH;
        let baixo = dado.LOW;
        let diferenca = alto - baixo;
        return {
                '23.6%': alto - diferenca * 0.236,
                '38.2%': alto - diferenca * 0.382,
                '50.0%': alto - diferenca * 0.5,
                '61.8%': alto - diferenca * 0.618,
                '78.6%': alto - diferenca * 0.786
              };
    });
    var a = resultados.map(r=>r['23.6%']);
    var b = resultados.map(r=>r['38.2%']);
    var c = resultados.map(r=>r['50.0%']);
    var d = resultados.map(r=>r['61.8%']);
    var e = resultados.map(r=>r['78.6%']);
    return {
            '23.6%_medio' : a.reduce((acc, valor) => acc + valor, 0) / a.length,
            '23.6%_desvio': calcularDesvioPadraoA(a),
            '23.6%_min'   : Math.min(...a),
            '23.6%_max'   : Math.max(...a),

            '38.2%_medio' : b.reduce((acc, valor) => acc + valor, 0) / b.length,
            '38.2%_desvio': calcularDesvioPadraoA(b),
            '38.2%_min'   : Math.min(...b),
            '38.2%_max'   : Math.max(...b),

            '50.0%_medio' : c.reduce((acc, valor) => acc + valor, 0) / c.length,
            '50.0%_desvio': calcularDesvioPadraoA(c),
            '50.0%_min'   : Math.min(...c),
            '50.0%_max'   : Math.max(...c),

            '61.8%_medio' : d.reduce((acc, valor) => acc + valor, 0) / d.length,
            '61.8%_desvio': calcularDesvioPadraoA(d),
            '61.8%_min'   : Math.min(...d),
            '61.8%_max'   : Math.max(...d),

            '78.6%_medio' : e.reduce((acc, valor) => acc + valor, 0) / e.length,
            '78.6%_desvio': calcularDesvioPadraoA(e),
            '78.6%_min'   : Math.min(...e),
            '78.6%_max'   : Math.max(...e),
    }      ;
}

function calcularMFI(preco, volume, periodo) {
    if (preco.length !== volume.length || periodo >= preco.length) {
      return 0;
        // throw new Error('Dados de preço e volume devem ter o mesmo comprimento e o período deve ser menor que o tamanho dos dados.');
    }

    let positiveFlow = 0;
    let negativeFlow = 0;

    for (let i = preco.length - periodo; i < preco.length; i++) {
        const moneyFlow = preco[i] * volume[i];
        if (preco[i] > preco[i - 1]) {
            positiveFlow += moneyFlow;
        } else if (preco[i] < preco[i - 1]) {
            negativeFlow += moneyFlow;
        }
    }

    const rawMoneyRatio = positiveFlow / negativeFlow;
    const mfi = 100 - (100 / (1 + rawMoneyRatio));

    return mfi;
}



const normalizar_numeric = (vetor, v) =>{
  var MAX = Math.max(...vetor);
  var MIN = Math.min(...vetor);

  // Verifica se MAX e MIN são iguais
  if (MAX === MIN) {
    // Se forem iguais, todos os valores do vetor são iguais
    // Nesse caso, retorne 0 para evitar a divisão por zero
    return 0;
  } else {
    // Se MAX e MIN forem diferentes, faça a normalização normalmente
    return (v - MIN)/(MAX - MIN);
  }
}


const desnormalizar = (vetor, n) =>{
  var MAX = Math.max(...vetor);
  var MIN = Math.min(...vetor);

  // Verifica se MAX e MIN são iguais
  if (MAX === MIN) {
    // Se forem iguais, todos os valores do vetor são iguais
    // Nesse caso, retorne qualquer valor do vetor, pois o resultado será o mesmo
    return vetor[0];
  } else {
    // Se MAX e MIN forem diferentes, faça a desnormalização normalmente
    return n*(MAX - MIN) + MIN;
  }
}




module.exports = {
  sendMessage,
  salvarObjetoNoBanco,
  salvarRatesNoArquivo,
  salvarArrayNoArquivo,
  salvarObjetoNoArquivo,
  selecionarDadosAleatorios,
  selecionarDadosUltimos30DiasEAleatorios,
  sleep,
  shuffle,
  agruparPeriodos,
  normalizar_numeric,
  desnormalizar,
  calcularMediaMovel,
  calcularRSI,
  calcularEMA,
  calcularMACD,
  calcularBandasBollinger,
  calcularEstocastico,
  calcularMMP,
  calcularIchimoku,
  calcularIFD,
  calcularADX,
  calcularPVI,
  calcularSARParabolico,
  calcularRetracoesFibonacci,
  calcularMFI,

  calcularEstatisticas

};
