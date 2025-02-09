const Moment            = require('moment');
const asciichart        = require('asciichart');
const TZ                = require('moment-timezone');
const fetch             = require('cross-fetch');


const MOEDA             = 'GOLD';//'WDOK24'//GBPUSD//USDJPY
const VOLUME            = 0.01;
const CICLO_MIN         = 1440*2;//240
const PERCENTUAL_C_V    = 0.000138952;
const MODEAS_INICADORES = {
                           // 'BTCUSD':['PERIODOS','MEDIAS','RSI','MACD','FIB'],
                           // 'BTCUSD':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','SAR'],
                           // 'ETHUSD':['RSI'],
                           // 'EURUSD':['RSI']
                           'EURGBP':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','IFD','ADX','PVI','SAR','FIB','TRSI','MFI'],
                           'USDJPY':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','IFD','ADX','PVI','SAR','FIB','TRSI','MFI'],
                           'GOLD'  :['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','IFD','ADX','PVI','SAR','FIB','TRSI','MFI'],
                           'GBPUSD':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','IFD','ADX','PVI','SAR','FIB','TRSI','MFI'],
                           'ETHUSD':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','IFD','ADX','PVI','SAR','FIB','TRSI','MFI'],
                           'USDCHF':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','IFD','ADX','PVI','SAR','FIB','TRSI','MFI'],
                           'BTCUSD':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','IFD','ADX','PVI','SAR','FIB','TRSI','MFI'],
                           'EURUSD':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','IFD','ADX','PVI','SAR','FIB','TRSI','MFI'],
                           'DOGEUSD':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','IFD','ADX','PVI','SAR','FIB','TRSI','MFI'],
                           // 'EURUSD':['PERIODOS','MEDIAS','RSI','MACD','BBL','OSC','MMP','IKH','SAR']
                          }

const Funcoes           = require('./Funcoes');
const fs                = require('fs');

const readline = require('readline');

// Função para ler grandes arquivos JSON em pedaços e mostrar o progresso
async function lerArquivoGrandeComProgresso(nomeArquivo) {
    return new Promise((resolve, reject) => {
        const chunks = [];  // Array para armazenar os pedaços lidos
        let totalLido = 0;  // Variável para acompanhar a quantidade lida

        // Obter o tamanho total do arquivo
        const tamanhoTotal = fs.statSync(nomeArquivo).size;

        // Criação de stream para ler o arquivo
        const stream = fs.createReadStream(nomeArquivo, { encoding: 'utf-8' });

        stream.on('data', (chunk) => {
            // Adiciona cada pedaço lido no array de chunks
            chunks.push(chunk);

            // Atualizar a quantidade total lida
            totalLido += chunk.length;

            // Calcular o progresso como percentual
            const progresso = ((totalLido / tamanhoTotal) * 100).toFixed(2);

            // Exibir o progresso
            console.log(`Lido: ${totalLido} de ${tamanhoTotal} bytes (${progresso}%)`);
        });

        stream.on('end', () => {
            // Quando o arquivo for completamente lido, juntar os pedaços em uma única string
            console.log("chunks.length",chunks.length)
        const jsonString = chunks.join('');
        // Tentar converter o JSON para objeto
        try {

                const jsonData = JSON.parse(jsonString);
                resolve(jsonData);  // Retornar o JSON como objeto
            } catch (err) {
                reject(`Erro ao parsear JSON: ${err}`);
            }
        });

        stream.on('error', (err) => {
            reject(`Erro ao ler o arquivo: ${err}`);
        });
    });
}


// Função de callback para processar o conteúdo do arquivo linha por linha
function processarConteudo(jsonObject) {
    console.log('Objeto JSON processado:', jsonObject);
    // Aqui você pode adicionar os dados a um array ou processá-los de acordo com sua lógica
}




async function montarBase(moeda){
  const nomeArquivo = `[RATES]${moeda}.json`; // Nome do arquivo para salvar os rates
  var CONTRATO      = MOEDA == 'EURUSD' || MOEDA == 'GBPUSD' ? 100000 :
                                                    MOEDA == 'USDCHF' ? 100000 :
                                                    MOEDA == 'EURGBP' ? 100000 :
                                                    MOEDA == 'USDJPY' ? 1000 :
                                                    MOEDA == 'GOLD' ? 100 :
                                                  (MOEDA == 'BTCUSD' || MOEDA == 'ETHUSD' ? 100 :
                                                  (MOEDA == 'DOGEUSD' ? 10000 : 1)) ;

  var contrato_ajustado = MOEDA == 'BTCUSD' || MOEDA == 'ETHUSD' ? 1 : CONTRATO;
  var dados         = await new Promise(async (resolve, reject)=>{
                          var retorno = await lerArquivoGrandeComProgresso(nomeArquivo);
                          resolve(retorno);
                          /*fs.access(nomeArquivo, async (err) => {
                              if (!err) {
                                  try {
                                      const conteudoArquivo = fs.readFile(nomeArquivo, 'utf-8',(err,conteudoArquivo)=>{
                                        console.log("conteudoArquivo",conteudoArquivo.length)

                                        ratesExistente = JSON.parse(conteudoArquivo); // Ler o conteúdo do arquivo e converter para array
                                        console.log('Arquivo encontrado e lido com sucesso:', nomeArquivo);
                                        resolve(ratesExistente);
                                      });
                                  } catch (error) {
                                      console.error('Erro ao ler o arquivo:', error);
                                      reject();
                                  }
                              } else {
                                  console.error('Arquivo não encontrado:', nomeArquivo);
                                  resolve([]);
                              }
                          });*/
                        })//FIM DA PROMISE
/*
    Open: Preço de abertura M1
    Close: Preço de fechamento M15
    HIGH: Maior valor do intervalo
    LOW: Menor valor do intervalo
    MAX CLOSE: Maior preço de venda do intervalo
    MIN CLOSE: Menor preço de venda do intervalo
*/
  var base          = [];
  var resultados    = [];
   // dados             = dados.filter((dado,i)=>i<1*1440*1);
   dados                = dados.sort((a,b)=>{
                                             if(a.TIME < b.TIME)
                                                return 1
                                                return -1
                                              })

  console.log("\n==========DADOS==========\n\n"
                                              // ,dados[0],dados[1]
                                              ,dados.length);
  //CALCULAR M15
  console.log("DADOS.length",dados.length)
  // dados.map(async (dado,i)=>{
  for(var i = 0; i < dados.length; i++) {
    var dado = dados[i];

     if(i <= CICLO_MIN || i%1 != 0 || dado.TIME > '2023.11.07 20:31:00' /*|| */)//GARANTINDO O INTERVALO DE TEMPO E 60 MIN NO FUTURO
        // return;
        continue;
      //CONFIGURAÇÕES DE COMPRA
          //COMPRA
          var preco_compra  = dado.OPEN + dado.SPREAD/CONTRATO;//ask
          var preco_venda   = (dado.HIGH + dado.LOW + 2*dado.CLOSE)/4;// - dado.SPREAD/CONTRATO;//bid
          //COMPRA
          var TP            = preco_compra + 5*dado.SPREAD/CONTRATO;// + preco_compra *0.01;// + preco_compra * 5 * PERCENTUAL_C_V;
          var SL            = dado.OPEN - dado.OPEN*0.005;//  - preco_venda *0.01;

          var TP_2          = preco_compra + 2*dado.SPREAD/CONTRATO;
          var SL_2          = dado.OPEN - dado.OPEN*0.004;

          var TP_3          = preco_compra + 3*dado.SPREAD/CONTRATO;
          var SL_3          = dado.OPEN - dado.OPEN*0.008;

          var TP_4          = preco_compra + 15*dado.SPREAD/CONTRATO;
          var SL_4          = dado.OPEN - dado.OPEN*0.015;

          // console.log("preco_compra",preco_compra,"TP",TP,"SL",SL,"TP_4",TP_4,"SL_4",SL_4,"dado.SPREAD",dado.SPREAD)
          //VENDA
          var preco_compra_V  = dado.OPEN - dado.SPREAD/CONTRATO;//ask
          var preco_venda_V   = (dado.HIGH + dado.LOW + 2*dado.CLOSE)/4;// - dado.SPREAD/CONTRATO;//bid
          //COMPRA
          var TP_V            = preco_compra_V - 5*dado.SPREAD/CONTRATO;// + preco_compra *0.01;// + preco_compra * 5 * PERCENTUAL_C_V;
          var SL_V            = dado.OPEN + dado.OPEN*0.005;//  - preco_venda *0.01;

          var TP_2_V          = preco_compra_V - 2*dado.SPREAD/CONTRATO;
          var SL_2_V          = dado.OPEN + dado.OPEN*0.004;

          var TP_3_V          = preco_compra_V - 3*dado.SPREAD/CONTRATO;
          var SL_3_V          = dado.OPEN + dado.OPEN*0.008;

          var TP_4_V          = preco_compra_V - 15*dado.SPREAD/CONTRATO;
          var SL_4_V          = dado.OPEN + dado.OPEN*0.015;

          //var SL            = preco_compra + dado.SPREAD/CONTRATO;// + preco_compra *0.01;// + preco_compra * 5 * PERCENTUAL_C_V;
          //var TP            = dado.OPEN - dado.OPEN*0.002;//  - preco_venda *0.01;
          var i_futuro      = i-CICLO_MIN-1;
          var dados_passados= dados.slice(i+1,i+CICLO_MIN);//60 dados no passado
          var dados_futuros = dados.slice(i_futuro,i);//60 dados no futuro
          dados_futuros     = dados_futuros.sort((a,b)=>{
                                                      if(a.TIME < b.TIME)
                                                            return -1
                                                      return 1;
                                                })
          // console.log("DADOS FUTUROS",dado.TIME,dados_futuros.map(df=>df.TIME),i,i_futuro)
         //PERIODOS AGRUPADOS 7 * 4 = 28 Variáveis
         var periodo_M5     = Funcoes.agruparPeriodos(dados,5,i);
         var periodo_M15    = Funcoes.agruparPeriodos(dados,15,i);
         var periodo_M30    = Funcoes.agruparPeriodos(dados,30,i);
         var periodo_H1     = Funcoes.agruparPeriodos(dados,60,i);
         var periodo_H4     = Funcoes.agruparPeriodos(dados,4*60,i);
         var periodo_D1     = Funcoes.agruparPeriodos(dados,24*60,i);
         var periodo_W1     = Funcoes.agruparPeriodos(dados,24*60*7,i);

         //==============INDICADORES======================

         //MEDIA FECHAMENTO
         var mediaM5        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+5).map(d=>d.CLOSE),5-1);
         var mediaM15       = Funcoes.calcularMediaMovel(dados.slice(i+1,i+15).map(d=>d.CLOSE),15-1);
         var mediaM30       = Funcoes.calcularMediaMovel(dados.slice(i+1,i+30).map(d=>d.CLOSE),30-1);
         var mediaH1        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-1);
         var mediaH4        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(4*60)).map(d=>d.CLOSE),(4*60)-1);
         var mediaD1        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(24*60)).map(d=>d.CLOSE),(24*60)-1);
         var mediaW1        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(7*24*60)).map(d=>d.CLOSE),(7*24*60)-1);

         //MEDIA MÓVEL FECHAMENTO
         var mediaMovelM1   = Funcoes.calcularMediaMovel(dados.slice((i+1),(i+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM2   = Funcoes.calcularMediaMovel(dados.slice((i+2),(i+2+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM3   = Funcoes.calcularMediaMovel(dados.slice((i+3),(i+3+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM4   = Funcoes.calcularMediaMovel(dados.slice((i+4),(i+4+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM5   = Funcoes.calcularMediaMovel(dados.slice((i+5),(i+5+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM6   = Funcoes.calcularMediaMovel(dados.slice((i+6),(i+6+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM7   = Funcoes.calcularMediaMovel(dados.slice((i+7),(i+7+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM8   = Funcoes.calcularMediaMovel(dados.slice((i+8),(i+8+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM9   = Funcoes.calcularMediaMovel(dados.slice((i+9),(i+9+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM10  = Funcoes.calcularMediaMovel(dados.slice((i+10),(i+10+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM11  = Funcoes.calcularMediaMovel(dados.slice((i+11),(i+11+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM12  = Funcoes.calcularMediaMovel(dados.slice((i+12),(i+12+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM13  = Funcoes.calcularMediaMovel(dados.slice((i+13),(i+13+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM14  = Funcoes.calcularMediaMovel(dados.slice((i+14),(i+14+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelM15  = Funcoes.calcularMediaMovel(dados.slice((i+15),(i+15+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS

         //MEDIA VOLUME
         var mediaVolumeM5  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+5).map(d=>d.TICK_VOLUME),5-1);
         var mediaVolumeM15 = Funcoes.calcularMediaMovel(dados.slice(i+1,i+15).map(d=>d.TICK_VOLUME),15-1);
         var mediaVolumeM30 = Funcoes.calcularMediaMovel(dados.slice(i+1,i+30).map(d=>d.TICK_VOLUME),30-1);
         var mediaVolumeH1  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+60).map(d=>d.TICK_VOLUME),60-1);
         var mediaVolumeH4  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(4*60)).map(d=>d.TICK_VOLUME),(4*60)-1);
         var mediaVolumeD1  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(24*60)).map(d=>d.TICK_VOLUME),(24*60)-1);
         var mediaVolumeW1  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(7*24*60)).map(d=>d.TICK_VOLUME),(7*24*60)-1);

         //MEDIA MÓVEL VOLUME
         var mediaMovelVolumeM1   = Funcoes.calcularMediaMovel(dados.slice((i+1),(i+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM2   = Funcoes.calcularMediaMovel(dados.slice((i+2),(i+2+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM3   = Funcoes.calcularMediaMovel(dados.slice((i+3),(i+3+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM4   = Funcoes.calcularMediaMovel(dados.slice((i+4),(i+4+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM5   = Funcoes.calcularMediaMovel(dados.slice((i+5),(i+5+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM6   = Funcoes.calcularMediaMovel(dados.slice((i+6),(i+6+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM7   = Funcoes.calcularMediaMovel(dados.slice((i+7),(i+7+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM8   = Funcoes.calcularMediaMovel(dados.slice((i+8),(i+8+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM9   = Funcoes.calcularMediaMovel(dados.slice((i+9),(i+9+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM10  = Funcoes.calcularMediaMovel(dados.slice((i+10),(i+10+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM11  = Funcoes.calcularMediaMovel(dados.slice((i+11),(i+11+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM12  = Funcoes.calcularMediaMovel(dados.slice((i+12),(i+12+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM13  = Funcoes.calcularMediaMovel(dados.slice((i+13),(i+13+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM14  = Funcoes.calcularMediaMovel(dados.slice((i+14),(i+14+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
         var mediaMovelVolumeM15  = Funcoes.calcularMediaMovel(dados.slice((i+15),(i+15+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS

         //RSI
         var rsiM5          = Funcoes.calcularRSI(dados.slice(i+1,i+5).map(d=>d.CLOSE),5-2);
         var rsiM15         = Funcoes.calcularRSI(dados.slice(i+1,i+15).map(d=>d.CLOSE),15-2);
         var rsiM30         = Funcoes.calcularRSI(dados.slice(i+1,i+30).map(d=>d.CLOSE),30-2);
         var rsiH1          = Funcoes.calcularRSI(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-2);
         var rsiH4          = Funcoes.calcularRSI(dados.slice(i+1,i+(4*60)).map(d=>d.CLOSE),(4*60)-2);
         var rsiD1          = Funcoes.calcularRSI(dados.slice(i+1,i+(24*60)).map(d=>d.CLOSE),(24*60)-2);
         var rsiW1          = Funcoes.calcularRSI(dados.slice(i+1,i+(7*24*60)).map(d=>d.CLOSE),(7*24*60)-2);

         //MACD (SOMENTE HISTOGRAMA)
         var macdH1         = Funcoes.calcularMACD(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-1);

         //Bandas de Bollinger (TODOS OS PERÍODOS)
         var bbM5           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+5).map(d=>d.CLOSE),5-1);
         var bbM15          = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+15).map(d=>d.CLOSE),15-2);
         var bbM30          = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+30).map(d=>d.CLOSE),30-2);
         var bbH1           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-1);
         var bbH4           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+(4*60)).map(d=>d.CLOSE),(4*60)-2);
         var bbD1           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+(24*60)).map(d=>d.CLOSE),(24*60)-2);
         var bbW1           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+(7*24*60)).map(d=>d.CLOSE),(7*24*60)-2);

         //Oscilador Estocástico (M30 acima)
         var oeM30          = Funcoes.calcularEstocastico(dados.slice(i+1,i+30).map(d=>d.CLOSE),
                                                          dados.slice(i+1,i+30).map(d=>d.HIGH),
                                                          dados.slice(i+1,i+30).map(d=>d.LOW));
         var oeH1           = Funcoes.calcularEstocastico(dados.slice(i+1,i+60).map(d=>d.CLOSE),
                                                         dados.slice(i+1,i+60).map(d=>d.HIGH),
                                                         dados.slice(i+1,i+60).map(d=>d.LOW));
         var oeH4           = Funcoes.calcularEstocastico(dados.slice(i+1,i+60*4).map(d=>d.CLOSE),
                                                          dados.slice(i+1,i+60*4).map(d=>d.HIGH),
                                                          dados.slice(i+1,i+60*4).map(d=>d.LOW));
         var oeD1           = Funcoes.calcularEstocastico(dados.slice(i+1,i+60*24).map(d=>d.CLOSE),
                                                        dados.slice(i+1,i+60*24).map(d=>d.HIGH),
                                                        dados.slice(i+1,i+60*24).map(d=>d.LOW));
         var oeW1           = Funcoes.calcularEstocastico(dados.slice(i+1,i+60*24*7).map(d=>d.CLOSE),
                                                        dados.slice(i+1,i+60*24*7).map(d=>d.HIGH),
                                                        dados.slice(i+1,i+60*24*7).map(d=>d.LOW));
        //MÉDIA MÓVEL PONDERADA (TODOS)
        var mmpM5         = Funcoes.calcularMMP(dados.slice(i+1,i+5).map(d=>d.CLOSE),5-1);
        var mmpM15        = Funcoes.calcularMMP(dados.slice(i+1,i+15).map(d=>d.CLOSE),15-1);
        var mmpM30        = Funcoes.calcularMMP(dados.slice(i+1,i+30).map(d=>d.CLOSE),30-2);
        var mmpH1         = Funcoes.calcularMMP(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-2);
        var mmpH4         = Funcoes.calcularMMP(dados.slice(i+1,i+(4*60)).map(d=>d.CLOSE),(4*60)-2);
        var mmpD1         = Funcoes.calcularMMP(dados.slice(i+1,i+(24*60)).map(d=>d.CLOSE),(24*60)-2);
        var mmpW1         = Funcoes.calcularMMP(dados.slice(i+1,i+(7*24*60)).map(d=>d.CLOSE),(7*24*60)-2);

        //Ichimoku Kinko Hyo (SOMENTE H1)
        var ikhH1         = Funcoes.calcularIchimoku(dados.slice(i+1,i+60));

        //IFD
        var ifdM5          = Funcoes.calcularIFD(dados.slice(i,i+5),5-1);
        var ifdM15         = Funcoes.calcularIFD(dados.slice(i,i+15),15-1);
        var ifdM30         = Funcoes.calcularIFD(dados.slice(i,i+30),30-1);
        var ifdH1          = Funcoes.calcularIFD(dados.slice(i,i+60),60-1);
        var ifdH4          = Funcoes.calcularIFD(dados.slice(i,i+(4*60)),(4*60)-1);
        var ifdD1          = Funcoes.calcularIFD(dados.slice(i,i+(24*60)),(24*60)-1);
        var ifdW1          = Funcoes.calcularIFD(dados.slice(i,i+(7*24*60)),(7*24*60)-1);

        // Índice de Movimento Direcional Médio (ADX)  (TODOS MENOS M5)
        // var adxM5          = Funcoes.calcularADX(dados.slice(i,i+5),5-1);
        var adxM15         = Funcoes.calcularADX(dados.slice(i,i+15),15-1);
        var adxM30         = Funcoes.calcularADX(dados.slice(i,i+30),30-1);
        var adxH1          = Funcoes.calcularADX(dados.slice(i,i+60),60-1);
        var adxH4          = Funcoes.calcularADX(dados.slice(i,i+4*60),4*60-1);
        var adxD1          = Funcoes.calcularADX(dados.slice(i,i+24*60),24*60-1);
        var adxW1          = Funcoes.calcularADX(dados.slice(i,i+7*24*60),7*24*60-1);

        //  Índice de Variação de Preço (PVI)  (TODOS MENOS M5)
        var pviM5          = Funcoes.calcularPVI(dados.slice(i,i+5),5-1);
        var pviM15         = Funcoes.calcularPVI(dados.slice(i,i+15),15-1);
        var pviM30         = Funcoes.calcularPVI(dados.slice(i,i+30),30-1);
        var pviH1          = Funcoes.calcularPVI(dados.slice(i,i+60),60-1);
        var pviH4          = Funcoes.calcularPVI(dados.slice(i,i+4*60),4*60-1);
        var pviD1          = Funcoes.calcularPVI(dados.slice(i,i+24*60),24*60-1);
        var pviW1          = Funcoes.calcularPVI(dados.slice(i,i+7*24*60),7*24*60-1);

        //SAR Parabólico (Stop and Reverse)
        var sarM5          = Funcoes.calcularSARParabolico(dados.slice(i,i+5),5-1);
        var sarM15         = Funcoes.calcularSARParabolico(dados.slice(i,i+15),15-1);
        var sarM30         = Funcoes.calcularSARParabolico(dados.slice(i,i+30),30-1);
        var sarH1          = Funcoes.calcularSARParabolico(dados.slice(i,i+60),60-1);
        var sarH4          = Funcoes.calcularSARParabolico(dados.slice(i,i+4*60),4*60-1);
        var sarD1          = Funcoes.calcularSARParabolico(dados.slice(i,i+24*60),24*60-1);
        var sarW1          = Funcoes.calcularSARParabolico(dados.slice(i,i+7*24*60),7*24*60-1);

        //Retrações Fibonnaci
        var fibM5          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+5));
        var fibM15         = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+15));
        var fibM30         = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+30));
        var fibH1          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+60));
        var fibH4          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+60*4));
        var fibD1          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+60*24));
        var fibW1          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+7*60*24));

        //TRIPLE RSI
        var rsi7           = Funcoes.calcularRSI(dados.slice(i+1,i+7).map(d=>d.CLOSE),7-2);
        var rsi14          = Funcoes.calcularRSI(dados.slice(i+1,i+14).map(d=>d.CLOSE),14-2);
        var rsi21          = Funcoes.calcularRSI(dados.slice(i+1,i+21).map(d=>d.CLOSE),21-2);
        var trsi           = rsi7 > 70 && rsi14 > 70 && rsi21 > 70 ? 1 : (rsi7 < 30 && rsi14 < 30 && rsi21 < 30 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO
        var crsi           = rsi7 > rsi14 && rsi7 > rsi21 ? 1 : (rsi7 < rsi14 && rsi7 < rsi21 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO

        var rsi7H           = Funcoes.calcularRSI(dados.slice(i+1,i+7*60).map(d=>d.CLOSE),7*60-2);
        var rsi14H          = Funcoes.calcularRSI(dados.slice(i+1,i+14*60).map(d=>d.CLOSE),14*60-2);
        var rsi21H          = Funcoes.calcularRSI(dados.slice(i+1,i+21*60).map(d=>d.CLOSE),21*60-2);
        var trsiH           = rsi7H > 70 && rsi14H > 70 && rsi21H > 70 ? 1 : (rsi7H < 30 && rsi14H < 30 && rsi21H < 30 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO
        var crsiH           = rsi7H > rsi14H && rsi7H > rsi21H ? 1 : (rsi7H < rsi14H && rsi7H < rsi21H ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO

        var rsi13          = Funcoes.calcularRSI(dados.slice(i+1,i+14).map(d=>d.CLOSE),14-2);
        var rsi28          = Funcoes.calcularRSI(dados.slice(i+1,i+28).map(d=>d.CLOSE),28-2);
        var rsi34          = Funcoes.calcularRSI(dados.slice(i+1,i+34).map(d=>d.CLOSE),34-2);
        var rsi35          = Funcoes.calcularRSI(dados.slice(i+1,i+35).map(d=>d.CLOSE),35-2);
        var rsi42          = Funcoes.calcularRSI(dados.slice(i+1,i+42).map(d=>d.CLOSE),42-2);
        var rsi49          = Funcoes.calcularRSI(dados.slice(i+1,i+49).map(d=>d.CLOSE),49-2);
        var rsi55          = Funcoes.calcularRSI(dados.slice(i+1,i+55).map(d=>d.CLOSE),55-2);


        // MFI
        var mfiM5          = Funcoes.calcularMFI(dados.slice(i+1,i+5).map(d=>d.CLOSE),dados.slice(i+1,i+5).map(d=>d.TICK_VOLUME),5-2);
        var mfiM15         = Funcoes.calcularMFI(dados.slice(i+1,i+15).map(d=>d.CLOSE),dados.slice(i+1,i+15).map(d=>d.TICK_VOLUME),15-2);
        var mfiM30         = Funcoes.calcularMFI(dados.slice(i+1,i+30).map(d=>d.CLOSE),dados.slice(i+1,i+30).map(d=>d.TICK_VOLUME),30-2);
        var mfiH1          = Funcoes.calcularMFI(dados.slice(i+1,i+60).map(d=>d.CLOSE),dados.slice(i+1,i+60).map(d=>d.TICK_VOLUME),60-2);
        var mfiH4          = Funcoes.calcularMFI(dados.slice(i+1,i+60*4).map(d=>d.CLOSE),dados.slice(i+1,i+60*4).map(d=>d.TICK_VOLUME),60*4-2);
        var mfiD1          = Funcoes.calcularMFI(dados.slice(i+1,i+60*24).map(d=>d.CLOSE),dados.slice(i+1,i+60*24).map(d=>d.TICK_VOLUME),60*24-2);
        var mfiW1          = Funcoes.calcularMFI(dados.slice(i+1,i+60*24*7).map(d=>d.CLOSE),dados.slice(i+1,i+60*24*7).map(d=>d.TICK_VOLUME),60*24*7-2);

        //TRIPPLE MFI
        var mfi7           = Funcoes.calcularMFI(dados.slice(i+1,i+7).map(d=>d.CLOSE),dados.slice(i+1,i+7).map(d=>d.TICK_VOLUME),7-2);
        var mfi14          = Funcoes.calcularMFI(dados.slice(i+1,i+14).map(d=>d.CLOSE),dados.slice(i+1,i+14).map(d=>d.TICK_VOLUME),14-2);
        var mfi21          = Funcoes.calcularMFI(dados.slice(i+1,i+21).map(d=>d.CLOSE),dados.slice(i+1,i+21).map(d=>d.TICK_VOLUME),21-2);
        var tmfi           = mfi7 > 70 && mfi14 > 70 && mfi21 > 70 ? 1 : (mfi7 < 30 && mfi14 < 30 && mfi21 < 30 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO
        var cmfi           = mfi7 > mfi14 && mfi7 > mfi21 ? 1 : (mfi7 < mfi14 && rsi7 < mfi21 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO

        var mfi7H           = Funcoes.calcularMFI(dados.slice(i+1,i+7*60).map(d=>d.CLOSE),dados.slice(i+1,i+7*60).map(d=>d.TICK_VOLUME),7*60-2);
        var mfi14H          = Funcoes.calcularMFI(dados.slice(i+1,i+14*60).map(d=>d.CLOSE),dados.slice(i+1,i+14*60).map(d=>d.TICK_VOLUME),14*60-2);
        var mfi21H          = Funcoes.calcularMFI(dados.slice(i+1,i+21*60).map(d=>d.CLOSE),dados.slice(i+1,i+21*60).map(d=>d.TICK_VOLUME),20*60-2);
        var mfiiH           = mfi7H > 70 && mfi14H > 70 && mfi21H > 70 ? 1 : (mfi7H < 30 && mfi14H < 30 && mfi21H < 30 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO
        var cmfiH           = mfi7H > mfi14H && mfi7H > mfi21H ? 1 : (mfi7H < mfi14H && mfi7H < mfi21H ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO

        var mfi13          = Funcoes.calcularMFI(dados.slice(i+1,i+13).map(d=>d.CLOSE),dados.slice(i+1,i+13).map(d=>d.TICK_VOLUME),13-2);
        var mfi28          = Funcoes.calcularMFI(dados.slice(i+1,i+28).map(d=>d.CLOSE),dados.slice(i+1,i+28).map(d=>d.TICK_VOLUME),28-2);
        var mfi34          = Funcoes.calcularMFI(dados.slice(i+1,i+34).map(d=>d.CLOSE),dados.slice(i+1,i+34).map(d=>d.TICK_VOLUME),34-2);
        var mfi35          = Funcoes.calcularMFI(dados.slice(i+1,i+35).map(d=>d.CLOSE),dados.slice(i+1,i+35).map(d=>d.TICK_VOLUME),35-2);
        var mfi42          = Funcoes.calcularMFI(dados.slice(i+1,i+42).map(d=>d.CLOSE),dados.slice(i+1,i+42).map(d=>d.TICK_VOLUME),42-2);
        var mfi49          = Funcoes.calcularMFI(dados.slice(i+1,i+49).map(d=>d.CLOSE),dados.slice(i+1,i+49).map(d=>d.TICK_VOLUME),49-2);
        var mfi55          = Funcoes.calcularMFI(dados.slice(i+1,i+55).map(d=>d.CLOSE),dados.slice(i+1,i+55).map(d=>d.TICK_VOLUME),55-2);
     if(
           periodo_M5   == undefined
        || periodo_M15  == undefined
        || periodo_M30  == undefined
        || periodo_H1   == undefined
        || periodo_H4   == undefined
        || periodo_D1   == undefined
        || periodo_W1   == undefined
      )
        return;
      //verificar o resultado i+60
          // var high_futuro   = dados_futuros.map(d=>d.HIGH);
          var high_futuro   = dados_futuros.map(d=>(d.HIGH + d.LOW + 2*d.CLOSE)/4);// O PREÇO MAIS ALTO É AQUELE Q REPRESENTARIA UMA VENDA CONCRETIZADA
          var low_futuro    = dados_futuros.map(d=>(d.HIGH + d.LOW + 2*d.CLOSE)/4);// O PREÇO MAIS ALTO É AQUELE Q REPRESENTARIA UMA VENDA CONCRETIZADA

          //COMPRA
          var ask_futuro    = dados_futuros.map(d=>d.OPEN + d.SPREAD/CONTRATO); //O PREÇO DE ABERTURA + O SPREAD
          var profit_futuro = ask_futuro.map(af => (af - preco_compra) * (VOLUME*contrato_ajustado));//*CONTRATO));

          // console.log("ask_futuro",ask_futuro);

          //VENDA
          var ask_futuro_V    = dados_futuros.map(d=>d.OPEN - d.SPREAD/CONTRATO); //O PREÇO DE ABERTURA + O SPREAD
          var profit_futuro_V = ask_futuro_V.map(af => -(af - preco_compra_V) * (VOLUME*contrato_ajustado));//*CONTRATO));
      //ENTRAR OU SAIR (2 Colunas)

          var i_onde_ganhou        = undefined;
          var i_onde_ganhou_2x     = undefined;
          var i_onde_ganhou_3x     = undefined;
          var i_onde_ganhou_4x     = undefined;
          var i_onde_perdeu        = undefined;
          var i_onde_perdeu_2x     = undefined;
          var i_onde_perdeu_3x     = undefined;
          var i_onde_perdeu_4x     = undefined;

          var i_onde_ganhou_V      = undefined;
          var i_onde_ganhou_2x_V   = undefined;
          var i_onde_ganhou_3x_V   = undefined;
          var i_onde_ganhou_4x_V   = undefined;
          var i_onde_perdeu_V      = undefined;
          var i_onde_perdeu_2x_V   = undefined;
          var i_onde_perdeu_3x_V   = undefined;
          var i_onde_perdeu_4x_V   = undefined;
          //COMPRA
          high_futuro.map((bf,j) =>{
                                    // //4x
                                    // if(low_futuro[j] <= SL_4 && !i_onde_ganhou && !i_onde_perdeu_4x) i_onde_perdeu_4x  = j;
                                    // if(bf >= TP_4 && !i_onde_ganhou_4x && !i_onde_perdeu) i_onde_ganhou_4x  = j;
                                    // //3x
                                    // if(low_futuro[j] <= SL_3 && !i_onde_ganhou && !i_onde_perdeu_3x) i_onde_perdeu_3x  = j;
                                    // if(bf >= TP_3 && !i_onde_ganhou_3x && !i_onde_perdeu) i_onde_ganhou_3x  = j;
                                    // //2x
                                    // if(low_futuro[j] <= SL_2 && !i_onde_ganhou && !i_onde_perdeu_2x) i_onde_perdeu_2x  = j;
                                    // if(bf >= TP_2 && !i_onde_ganhou_2x && !i_onde_perdeu) i_onde_ganhou_2x  = j;
                                    //NORMAL
                                    if(low_futuro[j] <= SL && !i_onde_ganhou && !i_onde_perdeu) i_onde_perdeu  = j;
                                    if(bf >= TP && !i_onde_ganhou && !i_onde_perdeu) i_onde_ganhou  = j;
                                  })
          //VENDA
          low_futuro.map((lf,j) =>{
                                    // //4x
                                    // if(high_futuro[j] >= SL_V && !i_onde_ganhou_V && !i_onde_perdeu_4x_V) i_onde_perdeu_4x_V  = j;
                                    // if(lf <= TP_V && !i_onde_ganhou_4x_V && !i_onde_perdeu_V)i_onde_ganhou_4x_V  = j;
                                    // //3x
                                    // if(high_futuro[j] >= SL_V && !i_onde_ganhou_V && !i_onde_perdeu_3x_V) i_onde_perdeu_3x_V  = j;
                                    // if(lf <= TP_V && !i_onde_ganhou_3x_V && !i_onde_perdeu_V)i_onde_ganhou_3x_V  = j;
                                    // //2x
                                    // if(high_futuro[j] >= SL_V && !i_onde_ganhou_V && !i_onde_perdeu_2x_V) i_onde_perdeu_2x_V  = j;
                                    // if(lf <= TP_V && !i_onde_ganhou_2x_V && !i_onde_perdeu_V)i_onde_ganhou_2x_V  = j;
                                    //NORMAL
                                    if(high_futuro[j] >= SL_V && !i_onde_ganhou_V && !i_onde_perdeu_V) i_onde_perdeu_V  = j;
                                    if(lf <= TP_V && !i_onde_ganhou_V && !i_onde_perdeu_V)i_onde_ganhou_V  = j;
                                  })
      //o TP é 0.014% do ASK (CLOSE + SPREAD)
      //O SL é 0.014% do BID (CLOSE)
     console.log(`\n==========DADO [${dado.TIME}]==========\n\n`,//dados[i_M15].TIME,
                    // 'M5',periodo_M5,'\n',
                  // 'mfiM5',mfiM5,'\n',
                  // 'mfiM15',mfiM15,'\n'
                  );

//COMPRA
var ganhou_perdeu   = undefined;
var total_ganhou    = undefined;//(profit_futuro[i_onde_ganhou]  ? profit_futuro[i_onde_ganhou] : 0),//426
var total_perdeu    = undefined;//(profit_futuro[i_onde_ganhou]  ? profit_futuro[i_onde_ganhou] : 0),//426
var min_onde_ganhou = 0;
var min_onde_perdeu = 0;

if(i_onde_perdeu_4x){ganhou_perdeu = 'PERDEU 4X'; total_perdeu = profit_futuro[i_onde_perdeu_4x]; total_ganhou  = 0;min_onde_perdeu=i_onde_perdeu_4x}
else if(i_onde_perdeu_3x){ganhou_perdeu = 'PERDEU 3X'; total_perdeu = profit_futuro[i_onde_perdeu_3x]; total_ganhou  = 0;min_onde_perdeu=i_onde_perdeu_3x}
else if(i_onde_perdeu_2x){ganhou_perdeu = 'PERDEU 2X'; total_perdeu = profit_futuro[i_onde_perdeu_2x]; total_ganhou  = 0;min_onde_perdeu=i_onde_perdeu_2x}
else if(i_onde_perdeu)   {ganhou_perdeu = 'PERDEU'   ; total_perdeu = profit_futuro[i_onde_perdeu];    total_ganhou  = 0;min_onde_perdeu=i_onde_perdeu}
else if(i_onde_ganhou_4x)     {ganhou_perdeu = 'GANHOU 4x'; total_ganhou = profit_futuro[i_onde_ganhou_4x]; total_perdeu  = 0;min_onde_ganhou= i_onde_ganhou_4x}
else if(i_onde_ganhou_3x){ganhou_perdeu = 'GANHOU 3x'; total_ganhou = profit_futuro[i_onde_ganhou_3x]; total_perdeu  = 0;min_onde_ganhou= i_onde_ganhou_3x}
else if(i_onde_ganhou_2x){ganhou_perdeu = 'GANHOU 2x'; total_ganhou = profit_futuro[i_onde_ganhou_2x]; total_perdeu  = 0;min_onde_ganhou= i_onde_ganhou_2x}
else if(i_onde_ganhou)   {ganhou_perdeu = 'GANHOU'   ; total_ganhou = profit_futuro[i_onde_ganhou];    total_perdeu  = 0;min_onde_ganhou= i_onde_ganhou}

// console.log("ganhou_perdeu",ganhou_perdeu,"min_onde_ganhou",min_onde_ganhou,"min_onde_perdeu",min_onde_perdeu)
if(i_onde_ganhou_4x)
  resultados.push({tipo:'COMPRA',escala:'4x',resultado:true,lucro:profit_futuro[i_onde_ganhou_4x]  });
else if(i_onde_ganhou_3x)
  resultados.push({tipo:'COMPRA',escala:'3x',resultado:true,lucro:profit_futuro[i_onde_ganhou_3x]  });
else if(i_onde_ganhou_2x)
  resultados.push({tipo:'COMPRA',escala:'2x',resultado:true,lucro:profit_futuro[i_onde_ganhou_2x]  });
else if(i_onde_ganhou)
  resultados.push({tipo:'COMPRA',escala:'NORMAL',resultado:true,lucro:profit_futuro[i_onde_ganhou]  });

else if(i_onde_perdeu_4x)
  resultados.push({tipo:'COMPRA',escala:'4x',resultado:false,lucro:profit_futuro[i_onde_perdeu_4x]});
else if(i_onde_perdeu_3x)
  resultados.push({tipo:'COMPRA',escala:'3x',resultado:false,lucro:profit_futuro[i_onde_perdeu_3x]});
else if(i_onde_perdeu_2x)
  resultados.push({tipo:'COMPRA',escala:'2x',resultado:false,lucro:profit_futuro[i_onde_perdeu_2x]});
else if(i_onde_perdeu)
  resultados.push({tipo:'COMPRA',escala:'NORMAL',resultado:false,lucro:profit_futuro[i_onde_perdeu]});
else
  resultados.push({tipo:'COMPRA',resultado:undefined,lucro:profit_futuro[i_onde_perdeu]});


//VENDA
var ganhou_perdeu_V   = undefined;
var total_ganhou_V    = undefined;//(profit_futuro[i_onde_ganhou]  ? profit_futuro[i_onde_ganhou] : 0),//426
var total_perdeu_V    = undefined;//(profit_futuro[i_onde_ganhou]  ? profit_futuro[i_onde_ganhou] : 0),//426
var min_onde_ganhou_V = 0;
var min_onde_perdeu_V = 0;

if(i_onde_perdeu_4x_V){ganhou_perdeu_V = 'PERDEU 4X'; total_perdeu_V = profit_futuro[i_onde_perdeu_4x_V]; total_ganhou_V  = 0;min_onde_perdeu_V=i_onde_perdeu_4x_V}
else if(i_onde_perdeu_3x_V){ganhou_perdeu_V = 'PERDEU 3X'; total_perdeu_V = profit_futuro[i_onde_perdeu_3x_V]; total_ganhou_V  = 0;min_onde_perdeu_V=i_onde_perdeu_3x_V}
else if(i_onde_perdeu_2x_V){ganhou_perdeu_V = 'PERDEU 2X'; total_perdeu_V = profit_futuro[i_onde_perdeu_2x_V]; total_ganhou_V  = 0;min_onde_perdeu_V=i_onde_perdeu_2x_V}
else if(i_onde_perdeu_V)   {ganhou_perdeu_V = 'PERDEU'   ; total_perdeu_V = profit_futuro[i_onde_perdeu_V];    total_ganhou_V  = 0;min_onde_perdeu_V=i_onde_perdeu_V}
else if(i_onde_ganhou_4x_V)     {ganhou_perdeu_V = 'GANHOU 4x'; total_ganhou_V = profit_futuro[i_onde_ganhou_4x_V]; total_perdeu_V  = 0;min_onde_ganhou_V= i_onde_ganhou_4x_V}
else if(i_onde_ganhou_3x_V){ganhou_perdeu_V = 'GANHOU 3x'; total_ganhou_V = profit_futuro[i_onde_ganhou_3x_V]; total_perdeu_V  = 0;min_onde_ganhou_V= i_onde_ganhou_3x_V}
else if(i_onde_ganhou_2x_V){ganhou_perdeu_V = 'GANHOU 2x'; total_ganhou_V = profit_futuro[i_onde_ganhou_2x_V]; total_perdeu_V  = 0;min_onde_ganhou_V= i_onde_ganhou_2x_V}
else if(i_onde_ganhou_V)   {ganhou_perdeu_V = 'GANHOU'   ; total_ganhou_V = profit_futuro[i_onde_ganhou_V];    total_perdeu_V  = 0;min_onde_ganhou_V= i_onde_ganhou_V}

// console.log("ganhou_perdeu_V",ganhou_perdeu_V,"min_onde_ganhou_V",min_onde_ganhou_V,"min_onde_perdeu_V",min_onde_perdeu_V)

if(i_onde_ganhou_4x_V)
  resultados.push({tipo:'VENDA',escala:'4x',resultado:true,lucro:profit_futuro[i_onde_ganhou_4x_V]  });
else if(i_onde_ganhou_3x_V)
  resultados.push({tipo:'VENDA',escala:'3x',resultado:true,lucro:profit_futuro[i_onde_ganhou_3x_V]  });
else if(i_onde_ganhou_2x_V)
  resultados.push({tipo:'VENDA',escala:'2x',resultado:true,lucro:profit_futuro[i_onde_ganhou_2x_V]  });
else if(i_onde_ganhou_V)
  resultados.push({tipo:'VENDA',escala:'NORMAL',resultado:true,lucro:profit_futuro[i_onde_ganhou_V]  });

else if(i_onde_perdeu_4x_V)
  resultados.push({tipo:'VENDA',escala:'4x',resultado:false,lucro:profit_futuro[i_onde_perdeu_4x_V]});
else if(i_onde_perdeu_3x_V)
  resultados.push({tipo:'VENDA',escala:'3x',resultado:false,lucro:profit_futuro[i_onde_perdeu_3x_V]});
else if(i_onde_perdeu_2x_V)
  resultados.push({tipo:'VENDA',escala:'2x',resultado:false,lucro:profit_futuro[i_onde_perdeu_2x_V]});
else if(i_onde_perdeu_V)
  resultados.push({tipo:'VENDA',escala:'NORMAL',resultado:false,lucro:profit_futuro[i_onde_perdeu_V]});
else
  resultados.push({tipo:'VENDA',resultado:undefined,lucro:profit_futuro[i_onde_perdeu_V]});

      base.push({
        //PERIODOS
                periodo_M5_open     : periodo_M5.OPEN,//0
                periodo_M5_close    : periodo_M5.CLOSE,//1
                periodo_M5_high     : periodo_M5.HIGH,//2
                periodo_M5_low      : periodo_M5.LOW,//3
                periodo_M5_volume   : periodo_M5.VOLUME,//4

                periodo_M15_open    : periodo_M15.OPEN,//5
                periodo_M15_close   : periodo_M15.CLOSE,//6
                periodo_M15_high    : periodo_M15.HIGH,//7
                periodo_M15_low     : periodo_M15.LOW,//8
                periodo_M15_volume  : periodo_M15.VOLUME,//9

                periodo_M30_open    : periodo_M30.OPEN,//10
                periodo_M30_close   : periodo_M30.CLOSE,//11
                periodo_M30_high    : periodo_M30.HIGH,//12
                periodo_M30_low     : periodo_M30.LOW,//13
                periodo_M30_volume  : periodo_M30.VOLUME,//14

                periodo_H1_open    : periodo_H1.OPEN,//15
                periodo_H1_close   : periodo_H1.CLOSE,//16
                periodo_H1_high    : periodo_H1.HIGH,//17
                periodo_H1_low     : periodo_H1.LOW,//18
                periodo_H1_volume  : periodo_H1.VOLUME,//19

                periodo_H4_open    : periodo_H4.OPEN,//20
                periodo_H4_close   : periodo_H4.CLOSE,//21
                periodo_H4_high    : periodo_H4.HIGH,//22
                periodo_H4_low     : periodo_H4.LOW,//23
                periodo_H4_volume  : periodo_H4.VOLUME,//24

                periodo_D1_open    : periodo_D1 ? periodo_D1.OPEN : 0,//25
                periodo_D1_close   : periodo_D1 ? periodo_D1.CLOSE : 0,//26
                periodo_D1_high    : periodo_D1 ? periodo_D1.HIGH : 0,//27
                periodo_D1_low     : periodo_D1 ? periodo_D1.LOW : 0,//28
                periodo_D1_volume  : periodo_D1 ? periodo_D1.VOLUME : 0,//29

                periodo_W1_open    : periodo_W1 ? periodo_W1.OPEN : 0,//30
                periodo_W1_close   : periodo_W1 ? periodo_W1.CLOSE : 0,//31
                periodo_W1_high    : periodo_W1 ? periodo_W1.HIGH : 0,//32
                periodo_W1_low     : periodo_W1 ? periodo_W1.LOW : 0,//33
                periodo_W1_volume  : periodo_W1 ? periodo_W1.VOLUME : 0,//34

         //MEDIAS SIMPLES FECHAMENTO
                media_simples_M5   : mediaM5,//35
                media_simples_M15  : mediaM15,//36
                media_simples_M30  : mediaM30,//37
                media_simples_H1   : mediaH1,//38
                media_simples_H4   : mediaH4,//39
                media_simples_D1   : mediaD1,//40
                media_simples_W1   : mediaW1,//41
         //MEDIA MOVEL FECHAMENTO
                media_movel_M1       : mediaMovelM1,//42
                media_movel_M2       : mediaMovelM2,//43
                media_movel_M3       : mediaMovelM3,//44
                media_movel_M4       : mediaMovelM4,//45
                media_movel_M5       : mediaMovelM5,//46
                media_movel_M6       : mediaMovelM6,//47
                media_movel_M7       : mediaMovelM7,//48
                media_movel_M8       : mediaMovelM8,//49
                media_movel_M9       : mediaMovelM9,//50
                media_movel_M10      : mediaMovelM10,//51
                media_movel_M11      : mediaMovelM11,//52
                media_movel_M12      : mediaMovelM12,//53
                media_movel_M13      : mediaMovelM13,//54
                media_movel_M14      : mediaMovelM14,//55
                media_movel_M15      : mediaMovelM15,//56
          //MEDIA SIMPLES VOLUME
                media_volume_M5      : mediaVolumeM5,//57
                media_volume_M15     : mediaVolumeM15,//58
                media_volume_M30     : mediaVolumeM30,//59
                media_volume_H1      : mediaVolumeH1,//60
                media_volume_H4      : mediaVolumeH4,//61
                media_volume_D1      : mediaVolumeD1,//62
                media_volume_W1      : mediaVolumeW1,//63
          //MEDIA MOVEL VOLUME
            media_movel_volume_M1    : mediaMovelVolumeM1,//64
            media_movel_volume_M2    : mediaMovelVolumeM2,//65
            media_movel_volume_M3    : mediaMovelVolumeM3,//66
            media_movel_volume_M4    : mediaMovelVolumeM4,//67
            media_movel_volume_M5    : mediaMovelVolumeM5,//68
            media_movel_volume_M6    : mediaMovelVolumeM6,//69
            media_movel_volume_M7    : mediaMovelVolumeM7,//70
            media_movel_volume_M8    : mediaMovelVolumeM8,//71
            media_movel_volume_M9    : mediaMovelVolumeM9,//72
            media_movel_volume_M10   : mediaMovelVolumeM10,//73
            media_movel_volume_M11   : mediaMovelVolumeM11,//74
            media_movel_volume_M12   : mediaMovelVolumeM12,//75
            media_movel_volume_M13   : mediaMovelVolumeM13,//76
            media_movel_volume_M14   : mediaMovelVolumeM14,//77
            media_movel_volume_M15   : mediaMovelVolumeM15,//78
          //RSI
              rsi_M5                 : rsiM5,//79
              rsi_M15                : rsiM15,//80
              rsi_M30                : rsiM30,//81
              rsi_H1                 : rsiH1,//82
              rsi_H4                 : rsiH4,//83
              rsi_D1                 : rsiD1,//84
              rsi_W1                 : rsiW1,//85
          //MACD
              macd_H1_1              : macdH1[0],//86
              macd_H1_2              : macdH1[1],//87
              macd_H1_3              : macdH1[2],//88
              macd_H1_4              : macdH1[3],//89
              macd_H1_5              : macdH1[4],//90
              macd_H1_6              : macdH1[5],//91
              macd_H1_7              : macdH1[6],//92
              macd_H1_8              : macdH1[7],//93
              macd_H1_9              : macdH1[8],//94
              macd_H1_10             : macdH1[9],//95
              macd_H1_11             : macdH1[10],//96
              macd_H1_12             : macdH1[11],//97
              macd_H1_13             : macdH1[12],//98
              macd_H1_14             : macdH1[13],//99
              macd_H1_15             : macdH1[14],//100
              macd_H1_16             : macdH1[15],//101
              macd_H1_17             : macdH1[16],//102
              macd_H1_18             : macdH1[17],//103
              macd_H1_19             : macdH1[18],//104
              macd_H1_20             : macdH1[19],//105
              macd_H1_21             : macdH1[20],//106
              macd_H1_22             : macdH1[21],//107
              macd_H1_23             : macdH1[22],//108
              macd_H1_24             : macdH1[23],//109
              macd_H1_25             : macdH1[24],//110
              macd_H1_26             : macdH1[25],//111
      //Bandas de Bollinger (TODOS OS PERÍODOS)
              bollinger_M5_superior  : bbM5.bandaSuperior,//112
              bollinger_M5_mms       : bbM5.mms,//113
              bollinger_M5_inferior  : bbM5.bandaInferior,//114
              bollinger_M15_superior : bbM15.bandaSuperior,//115
              bollinger_M15_mms      : bbM15.mms,//116
              bollinger_M15_inferior : bbM15.bandaInferior,//117
              bollinger_M30_superior : bbM30.bandaSuperior,//118
              bollinger_M30_mms      : bbM30.mms,//119
              bollinger_M30_inferior : bbM30.bandaInferior,//120
              bollinger_H1_superior  : bbH1.bandaSuperior,//121
              bollinger_H1_mms       : bbH1.mms,//122
              bollinger_H1_inferior  : bbH1.bandaInferior,//123
              bollinger_H4_superior  : bbH4.bandaSuperior,//124
              bollinger_H4_mms       : bbH4.mms,//125
              bollinger_H4_inferior  : bbH4.bandaInferior,//126
              bollinger_D1_superior  : bbD1 ? bbD1.bandaSuperior : 0,//127
              bollinger_D1_mms       : bbD1 ? bbD1.mms : 0,//128
              bollinger_D1_inferior  : bbD1 ? bbD1.bandaInferior : 0,//129
              bollinger_W1_superior  : bbW1 ? bbW1.bandaSuperior : 0,//130
              bollinger_W1_mms       : bbW1 ? bbW1.mms : 0,//131
              bollinger_W1_inferior  : bbW1 ? bbW1.bandaInferior : 0,//132

  //Oscilador Estocástico
      osc_estocastico_M30_pk_medio  : oeM30.p_K.p_K_medio,//133
      osc_estocastico_M30_pk_desvio : oeM30.p_K.p_K_desvio,//134
      osc_estocastico_M30_pk_min    : oeM30.p_K.p_K_min,//135
      osc_estocastico_M30_pk_max    : oeM30.p_K.p_K_max,//136
      osc_estocastico_M30_pd_medio  : oeM30.p_D.p_D_medio,//137
      osc_estocastico_M30_pd_desvio : oeM30.p_D.p_D_desvio,//138
      osc_estocastico_M30_pd_min    : oeM30.p_D.p_D_min,//139
      osc_estocastico_M30_pd_max    : oeM30.p_D.p_D_max,//140

      osc_estocastico_H1_pk_medio  : oeH1.p_K.p_K_medio,//141
      osc_estocastico_H1_pk_desvio : oeH1.p_K.p_K_desvio,//142
      osc_estocastico_H1_pk_min    : oeH1.p_K.p_K_min,//143
      osc_estocastico_H1_pk_max    : oeH1.p_K.p_K_max,//144
      osc_estocastico_H1_pd_medio  : oeH1.p_D.p_D_medio,//145
      osc_estocastico_H1_pd_desvio : oeH1.p_D.p_D_desvio,//146
      osc_estocastico_H1_pd_min    : oeH1.p_D.p_D_min,//147
      osc_estocastico_H1_pd_max    : oeH1.p_D.p_D_max,//148

      osc_estocastico_H4_pk_medio  : oeH4.p_K.p_K_medio,//149
      osc_estocastico_H4_pk_desvio : oeH4.p_K.p_K_desvio,//150
      osc_estocastico_H4_pk_min    : oeH4.p_K.p_K_min,//151
      osc_estocastico_H4_pk_max    : oeH4.p_K.p_K_max,//152
      osc_estocastico_H4_pd_medio  : oeH4.p_D.p_D_medio,//153
      osc_estocastico_H4_pd_desvio : oeH4.p_D.p_D_desvio,//154
      osc_estocastico_H4_pd_min    : oeH4.p_D.p_D_min,//155
      osc_estocastico_H4_pd_max    : oeH4.p_D.p_D_max,//156

      osc_estocastico_D1_pk_medio  : oeD1.p_K.p_K_medio,//157
      osc_estocastico_D1_pk_desvio : oeD1.p_K.p_K_desvio,//158
      osc_estocastico_D1_pk_min    : oeD1.p_K.p_K_min,//159
      osc_estocastico_D1_pk_max    : oeD1.p_K.p_K_max,//160
      osc_estocastico_D1_pd_medio  : oeD1.p_D.p_D_medio,//161
      osc_estocastico_D1_pd_desvio : oeD1.p_D.p_D_desvio,//162
      osc_estocastico_D1_pd_min    : oeD1.p_D.p_D_min,//163
      osc_estocastico_D1_pd_max    : oeD1.p_D.p_D_max,//164

      osc_estocastico_W1_pk_medio  : oeW1.p_K.p_K_medio,//165
      osc_estocastico_W1_pk_desvio : oeW1.p_K.p_K_desvio,//166
      osc_estocastico_W1_pk_min    : oeW1.p_K.p_K_min,//167
      osc_estocastico_W1_pk_max    : oeW1.p_K.p_K_max,//168
      osc_estocastico_W1_pd_medio  : oeW1.p_D.p_D_medio,//169
      osc_estocastico_W1_pd_desvio : oeW1.p_D.p_D_desvio,//170
      osc_estocastico_W1_pd_min    : oeW1.p_D.p_D_min,//171
      osc_estocastico_W1_pd_max    : oeW1.p_D.p_D_max,//172
      //MÉDIA MÓVEL PONDERADA (TODOS)
                media_movel_p_M5   : mmpM5,//173
                media_movel_p_M15  : mmpM15,//174
                media_movel_p_M30  : mmpM30,//175
                media_movel_p_H1   : mmpH1,//176
                media_movel_p_H4   : mmpH4,//177
                media_movel_p_D1   : mmpD1,//178
                media_movel_p_W1   : mmpW1,//179
    //Ichimoku Kinko Hyo (SOMENTE H1)
      ichimoku_H1_tenkanSen_medio  : ikhH1.tenkanSen.tenkanSen_medio,//180
      ichimoku_H1_tenkanSen_desvio : ikhH1.tenkanSen.tenkanSen_desvio,//181
      ichimoku_H1_tenkanSen_min    : ikhH1.tenkanSen.tenkanSen_min,//182
      ichimoku_H1_tenkanSen_max    : ikhH1.tenkanSen.tenkanSen_max,//183
      ichimoku_H1_kijunSen_medio   : ikhH1.kijunSen.kijunSen_medio,//184
      ichimoku_H1_kijunSen_desvio  : ikhH1.kijunSen.kijunSen_desvio,//185
      ichimoku_H1_kijunSen_min     : ikhH1.kijunSen.kijunSen_min,//186
      ichimoku_H1_kijunSen_max     : ikhH1.kijunSen.kijunSen_max,//187
      ichimoku_H1_senkouSpanA_medio  : ikhH1.senkouSpanA.senkouSpanA_medio,//188
      ichimoku_H1_senkouSpanA_desvio : ikhH1.senkouSpanA.senkouSpanA_desvio,//189
      ichimoku_H1_senkouSpanA_min    : ikhH1.senkouSpanA.senkouSpanA_min,//190
      ichimoku_H1_senkouSpanA_max    : ikhH1.senkouSpanA.senkouSpanA_max,//191
      ichimoku_H1_senkouSpanB_medio  : ikhH1.senkouSpanB.senkouSpanB_medio,//192
      ichimoku_H1_senkouSpanB_desvio : ikhH1.senkouSpanB.senkouSpanB_desvio,//193
      ichimoku_H1_senkouSpanB_min    : ikhH1.senkouSpanB.senkouSpanB_min,//194
      ichimoku_H1_senkouSpanB_max    : ikhH1.senkouSpanB.senkouSpanB_max,//195
      ichimoku_H1_chikouSpan_medio  : ikhH1.chikouSpan.chikouSpan_medio,//196
      ichimoku_H1_chikouSpan_desvio : ikhH1.chikouSpan.chikouSpan_desvio,//197
      ichimoku_H1_chikouSpan_min    : ikhH1.chikouSpan.chikouSpan_min,//198
      ichimoku_H1_chikouSpan_max    : ikhH1.chikouSpan.chikouSpan_max,//199
      //IFD
                      ifd_M5        : ifdM5,//200
                      ifd_M15       : ifdM15,//201
                      ifd_M30       : ifdM30,//202
                      ifd_H1        : ifdH1,//203
                      ifd_H4        : ifdH4,//204
                      ifd_D1        : ifdD1,//205
                      ifd_W1        : ifdW1,//206
// Índice de Movimento Direcional Médio (ADX)  (TODOS MENOS M5)
                    adx_M15_medio   : adxM15.adx_medio,//207
                    adx_M15_desvio  : adxM15.adx_desvio,//208
                    adx_M15_min     : adxM15.adx_min,//209
                    adx_M15_max     : adxM15.adx_max,//210
                    adx_M30_medio   : adxM30.adx_medio,//211
                    adx_M30_desvio  : adxM30.adx_desvio,//212
                    adx_M30_min     : adxM30.adx_min,//213
                    adx_M30_max     : adxM30.adx_max,//214
                    adx_H1_medio   : adxH1.adx_medio,//215
                    adx_H1_desvio  : adxH1.adx_desvio,//216
                    adx_H1_min     : adxH1.adx_min,//217
                    adx_H1_max     : adxH1.adx_max,//218
                    adx_H4_medio   : adxH4.adx_medio,//219
                    adx_H4_desvio  : adxH4.adx_desvio,//220
                    adx_H4_min     : adxH4.adx_min,//221
                    adx_H4_max     : adxH4.adx_max,//222
                    adx_D1_medio   : adxD1.adx_medio,//223
                    adx_D1_desvio  : adxD1.adx_desvio,//224
                    adx_D1_min     : adxD1.adx_min,//225
                    adx_D1_max     : adxD1.adx_max,//226
                    adx_W1_medio   : adxW1.adx_medio,//227
                    adx_W1_desvio  : adxW1.adx_desvio,//228
                    adx_W1_min     : adxW1.adx_min,//229
                    adx_W1_max     : adxW1.adx_max,//230

        //  Índice de Variação de Preço (PVI)  (TODOS MENOS M5)
                    pvi_M15_medio  : pviM15.pvi_medio,//231
                    pvi_M15_desvio : pviM15.pvi_desvio,//232
                    pvi_M15_min    : pviM15.pvi_min,//233
                    pvi_M15_max    : pviM15.pvi_max,//234
                    pvi_M15_last   : pviM15.pvi_last,//235
                    pvi_M30_medio  : pviM30.pvi_medio,//236
                    pvi_M30_desvio : pviM30.pvi_desvio,//237
                    pvi_M30_min    : pviM30.pvi_min,//238
                    pvi_M30_max    : pviM30.pvi_max,//239
                    pvi_M30_last   : pviM30.pvi_last,//240
                    pvi_H1_medio  : pviH1.pvi_medio,//241
                    pvi_H1_desvio : pviH1.pvi_desvio,//242
                    pvi_H1_min    : pviH1.pvi_min,//243
                    pvi_H1_max    : pviH1.pvi_max,//244
                    pvi_H1_last   : pviH1.pvi_last,//245
                    pvi_H4_medio  : pviH4.pvi_medio,//246
                    pvi_H4_desvio : pviH4.pvi_desvio,//247
                    pvi_H4_min    : pviH4.pvi_min,//248
                    pvi_H4_max    : pviH4.pvi_max,//249
                    pvi_H4_last   : pviH4.pvi_last,//250
                    pvi_D1_medio  : pviD1.pvi_medio,//251
                    pvi_D1_desvio : pviD1.pvi_desvio,//252
                    pvi_D1_min    : pviD1.pvi_min,//253
                    pvi_D1_max    : pviD1.pvi_max,//254
                    pvi_D1_last   : pviD1.pvi_last,//255
                    pvi_W1_medio  : pviW1.pvi_medio,//256
                    pvi_W1_desvio : pviW1.pvi_desvio,//257
                    pvi_W1_min    : pviW1.pvi_min,//258
                    pvi_W1_max    : pviW1.pvi_max,//259
                    pvi_W1_last   : pviW1.pvi_last,//260

        //SAR Parabólico (Stop and Reverse)
                  sar_M15_medio   : sarM15.sar_medio,//261
                  sar_M15_desvio  : sarM15.sar_desvio,//262
                  sar_M15_min     : sarM15.sar_min,//263
                  sar_M15_max     : sarM15.sar_max,//264
                  sar_M30_medio   : sarM30.sar_medio,//265
                  sar_M30_desvio  : sarM30.sar_desvio,//266
                  sar_M30_min     : sarM30.sar_min,//267
                  sar_M30_max     : sarM30.sar_max,//268
                  sar_H1_medio   : sarH1.sar_medio,//269
                  sar_H1_desvio  : sarH1.sar_desvio,//270
                  sar_H1_min     : sarH1.sar_min,//271
                  sar_H1_max     : sarH1.sar_max,//272
                  sar_H4_medio   : sarH4.sar_medio,//273
                  sar_H4_desvio  : sarH4.sar_desvio,//274
                  sar_H4_min     : sarH4.sar_min,//275
                  sar_H4_max     : sarH4.sar_max,//276
                  sar_D1_medio   : sarD1.sar_medio,//277
                  sar_D1_desvio  : sarD1.sar_desvio,//278
                  sar_D1_min     : sarD1.sar_min,//279
                  sar_D1_max     : sarD1.sar_max,//280
                  sar_W1_medio   : sarW1.sar_medio,//281
                  sar_W1_desvio  : sarW1.sar_desvio,//282
                  sar_W1_min     : sarW1.sar_min,//283
                  sar_W1_max     : sarW1.sar_max,//284

    //Retrações Fibonnaci 285-424
            'fib_M5_23.6%_medio' : fibM5['23.6%_medio'],//284
            'fib_M5_23.6%_desvio': fibM5['23.6%_desvio'],//285
            'fib_M5_23.6%_min'   : fibM5['23.6%_min'],//286
            'fib_M5_23.6%_max'   : fibM5['23.6%_max'],//287
            'fib_M5_38.2%_medio' : fibM5['38.2%_medio'],//288
            'fib_M5_38.2%_desvio': fibM5['38.2%_desvio'],//289
            'fib_M5_38.2%_min'   : fibM5['38.2%_min'],//290
            'fib_M5_38.2%_max'   : fibM5['38.2%_max'],//291
            'fib_M5_50.0%_medio' : fibM5['50.0%_medio'],//292
            'fib_M5_50.0%_desvio': fibM5['50.0%_desvio'],//293
            'fib_M5_50.0%_min'   : fibM5['50.0%_min'],//294
            'fib_M5_50.0%_max'   : fibM5['50.0%_max'],//295
            'fib_M5_61.8%_medio' : fibM5['61.8%_medio'],//296
            'fib_M5_61.8%_desvio': fibM5['61.8%_desvio'],//297
            'fib_M5_61.8%_min'   : fibM5['61.8%_min'],//298
            'fib_M5_61.8%_max'   : fibM5['61.8%_max'],//299
            'fib_M5_78.6%_medio' : fibM5['78.6%_medio'],//300
            'fib_M5_78.6%_desvio': fibM5['78.6%_desvio'],//301
            'fib_M5_78.6%_min'   : fibM5['78.6%_min'],//302
            'fib_M5_78.6%_max'   : fibM5['78.6%_max'],//303

            'fib_M15_23.6%_medio' : fibM15['23.6%_medio'],//304
            'fib_M15_23.6%_desvio': fibM15['23.6%_desvio'],//305
            'fib_M15_23.6%_min'   : fibM15['23.6%_min'],//306
            'fib_M15_23.6%_max'   : fibM15['23.6%_max'],//307
            'fib_M15_38.2%_medio' : fibM15['38.2%_medio'],//308
            'fib_M15_38.2%_desvio': fibM15['38.2%_desvio'],//309
            'fib_M15_38.2%_min'   : fibM15['38.2%_min'],//310
            'fib_M15_38.2%_max'   : fibM15['38.2%_max'],//311
            'fib_M15_50.0%_medio' : fibM15['50.0%_medio'],//312
            'fib_M15_50.0%_desvio': fibM15['50.0%_desvio'],//313
            'fib_M15_50.0%_min'   : fibM15['50.0%_min'],//314
            'fib_M15_50.0%_max'   : fibM15['50.0%_max'],//315
            'fib_M15_61.8%_medio' : fibM15['61.8%_medio'],//316
            'fib_M15_61.8%_desvio': fibM15['61.8%_desvio'],//317
            'fib_M15_61.8%_min'   : fibM15['61.8%_min'],//318
            'fib_M15_61.8%_max'   : fibM15['61.8%_max'],//319
            'fib_M15_78.6%_medio' : fibM15['78.6%_medio'],//320
            'fib_M15_78.6%_desvio': fibM15['78.6%_desvio'],//321
            'fib_M15_78.6%_min'   : fibM15['78.6%_min'],//322
            'fib_M15_78.6%_max'   : fibM15['78.6%_max'],//323

            'fib_M30_23.6%_medio' : fibM30['23.6%_medio'],//324
            'fib_M30_23.6%_desvio': fibM30['23.6%_desvio'],//325
            'fib_M30_23.6%_min'   : fibM30['23.6%_min'],//326
            'fib_M30_23.6%_max'   : fibM30['23.6%_max'],//327
            'fib_M30_38.2%_medio' : fibM30['38.2%_medio'],//328
            'fib_M30_38.2%_desvio': fibM30['38.2%_desvio'],//329
            'fib_M30_38.2%_min'   : fibM30['38.2%_min'],//330
            'fib_M30_38.2%_max'   : fibM30['38.2%_max'],//331
            'fib_M30_50.0%_medio' : fibM30['50.0%_medio'],//332
            'fib_M30_50.0%_desvio': fibM30['50.0%_desvio'],//333
            'fib_M30_50.0%_min'   : fibM30['50.0%_min'],//334
            'fib_M30_50.0%_max'   : fibM30['50.0%_max'],//335
            'fib_M30_61.8%_medio' : fibM30['61.8%_medio'],//336
            'fib_M30_61.8%_desvio': fibM30['61.8%_desvio'],//337
            'fib_M30_61.8%_min'   : fibM30['61.8%_min'],//338
            'fib_M30_61.8%_max'   : fibM30['61.8%_max'],//339
            'fib_M30_78.6%_medio' : fibM30['78.6%_medio'],//340
            'fib_M30_78.6%_desvio': fibM30['78.6%_desvio'],//341
            'fib_M30_78.6%_min'   : fibM30['78.6%_min'],//342
            'fib_M30_78.6%_max'   : fibM30['78.6%_max'],//343

            'fib_H1_23.6%_medio' : fibH1['23.6%_medio'],//344
            'fib_H1_23.6%_desvio': fibH1['23.6%_desvio'],//345
            'fib_H1_23.6%_min'   : fibH1['23.6%_min'],//346
            'fib_H1_23.6%_max'   : fibH1['23.6%_max'],//347
            'fib_H1_38.2%_medio' : fibH1['38.2%_medio'],//348
            'fib_H1_38.2%_desvio': fibH1['38.2%_desvio'],//349
            'fib_H1_38.2%_min'   : fibH1['38.2%_min'],//350
            'fib_H1_38.2%_max'   : fibH1['38.2%_max'],//351
            'fib_H1_50.0%_medio' : fibH1['50.0%_medio'],//352
            'fib_H1_50.0%_desvio': fibH1['50.0%_desvio'],//353
            'fib_H1_50.0%_min'   : fibH1['50.0%_min'],//354
            'fib_H1_50.0%_max'   : fibH1['50.0%_max'],//355
            'fib_H1_61.8%_medio' : fibH1['61.8%_medio'],//356
            'fib_H1_61.8%_desvio': fibH1['61.8%_desvio'],//357
            'fib_H1_61.8%_min'   : fibH1['61.8%_min'],//358
            'fib_H1_61.8%_max'   : fibH1['61.8%_max'],//359
            'fib_H1_78.6%_medio' : fibH1['78.6%_medio'],//360
            'fib_H1_78.6%_desvio': fibH1['78.6%_desvio'],//361
            'fib_H1_78.6%_min'   : fibH1['78.6%_min'],//362
            'fib_H1_78.6%_max'   : fibH1['78.6%_max'],//363

            'fib_H4_23.6%_medio' : fibH4['23.6%_medio'],//364
            'fib_H4_23.6%_desvio': fibH4['23.6%_desvio'],//365
            'fib_H4_23.6%_min'   : fibH4['23.6%_min'],//366
            'fib_H4_23.6%_max'   : fibH4['23.6%_max'],//367
            'fib_H4_38.2%_medio' : fibH4['38.2%_medio'],//368
            'fib_H4_38.2%_desvio': fibH4['38.2%_desvio'],//369
            'fib_H4_38.2%_min'   : fibH4['38.2%_min'],//370
            'fib_H4_38.2%_max'   : fibH4['38.2%_max'],//371
            'fib_H4_50.0%_medio' : fibH4['50.0%_medio'],//372
            'fib_H4_50.0%_desvio': fibH4['50.0%_desvio'],//373
            'fib_H4_50.0%_min'   : fibH4['50.0%_min'],//374
            'fib_H4_50.0%_max'   : fibH4['50.0%_max'],//375
            'fib_H4_61.8%_medio' : fibH4['61.8%_medio'],//376
            'fib_H4_61.8%_desvio': fibH4['61.8%_desvio'],//377
            'fib_H4_61.8%_min'   : fibH4['61.8%_min'],//378
            'fib_H4_61.8%_max'   : fibH4['61.8%_max'],//379
            'fib_H4_78.6%_medio' : fibH4['78.6%_medio'],//380
            'fib_H4_78.6%_desvio': fibH4['78.6%_desvio'],//381
            'fib_H4_78.6%_min'   : fibH4['78.6%_min'],//382
            'fib_H4_78.6%_max'   : fibH4['78.6%_max'],//383

            'fib_D1_23.6%_medio' : fibD1['23.6%_medio'],//384
            'fib_D1_23.6%_desvio': fibD1['23.6%_desvio'],//385
            'fib_D1_23.6%_min'   : fibD1['23.6%_min'],//386
            'fib_D1_23.6%_max'   : fibD1['23.6%_max'],//387
            'fib_D1_38.2%_medio' : fibD1['38.2%_medio'],//388
            'fib_D1_38.2%_desvio': fibD1['38.2%_desvio'],//389
            'fib_D1_38.2%_min'   : fibD1['38.2%_min'],//390
            'fib_D1_38.2%_max'   : fibD1['38.2%_max'],//391
            'fib_D1_50.0%_medio' : fibD1['50.0%_medio'],//392
            'fib_D1_50.0%_desvio': fibD1['50.0%_desvio'],//393
            'fib_D1_50.0%_min'   : fibD1['50.0%_min'],//394
            'fib_D1_50.0%_max'   : fibD1['50.0%_max'],//395
            'fib_D1_61.8%_medio' : fibD1['61.8%_medio'],//396
            'fib_D1_61.8%_desvio': fibD1['61.8%_desvio'],//397
            'fib_D1_61.8%_min'   : fibD1['61.8%_min'],//398
            'fib_D1_61.8%_max'   : fibD1['61.8%_max'],//399
            'fib_D1_78.6%_medio' : fibD1['78.6%_medio'],//400
            'fib_D1_78.6%_desvio': fibD1['78.6%_desvio'],//401
            'fib_D1_78.6%_min'   : fibD1['78.6%_min'],//402
            'fib_D1_78.6%_max'   : fibD1['78.6%_max'],//403

            'fib_W1_23.6%_medio' : fibW1['23.6%_medio'],//404
            'fib_W1_23.6%_desvio': fibW1['23.6%_desvio'],//405
            'fib_W1_23.6%_min'   : fibW1['23.6%_min'],//406
            'fib_W1_23.6%_max'   : fibW1['23.6%_max'],//407
            'fib_W1_38.2%_medio' : fibW1['38.2%_medio'],//408
            'fib_W1_38.2%_desvio': fibW1['38.2%_desvio'],//409
            'fib_W1_38.2%_min'   : fibW1['38.2%_min'],//410
            'fib_W1_38.2%_max'   : fibW1['38.2%_max'],//411
            'fib_W1_50.0%_medio' : fibW1['50.0%_medio'],//412
            'fib_W1_50.0%_desvio': fibW1['50.0%_desvio'],//413
            'fib_W1_50.0%_min'   : fibW1['50.0%_min'],//414
            'fib_W1_50.0%_max'   : fibW1['50.0%_max'],//415
            'fib_W1_61.8%_medio' : fibW1['61.8%_medio'],//416
            'fib_W1_61.8%_desvio': fibW1['61.8%_desvio'],//417
            'fib_W1_61.8%_min'   : fibW1['61.8%_min'],//418
            'fib_W1_61.8%_max'   : fibW1['61.8%_max'],//419
            'fib_W1_78.6%_medio' : fibW1['78.6%_medio'],//420
            'fib_W1_78.6%_desvio': fibW1['78.6%_desvio'],//421
            'fib_W1_78.6%_min'   : fibW1['78.6%_min'],//422
            'fib_W1_78.6%_max'   : fibW1['78.6%_max'],//423

           //TRIPPLE RSI
            rsi7                 : rsi7,//425
            rsi14                : rsi14,//426
            rsi21                : rsi21,//427
            trsi                 : trsi, //428
            crsi                 : crsi, //429

            rsi13                : rsi13,//430
            rsi28                : rsi28,//431
            rsi34                : rsi34,//432
            rsi35                : rsi35,//433
            rsi42                : rsi42,//434
            rsi49                : rsi49,//435
            rsi55                : rsi55,//436

            rsi7H                : rsi7H,//437
            rsi14H               : rsi14H,//438
            rsi21H               : rsi21H,//439
            trsiH                : trsiH,//440
            crsiH                 : crsi,//441

            // MFI
            mfiM5          : mfiM5,//442
            mfiM15         : mfiM15,//443
            mfiM30         : mfiM30,//444
            mfiH1          : mfiH1 ,//445
            mfiH4          : mfiH4 ,//446
            mfiD1          : mfiD1 ,//447
            mfiW1          : mfiW1 ,//448

            //TRIPPLE MFI
            mfi7           : mfi7  ,//449
            mfi14          : mfi14 ,//450
            mfi21          : mfi21 ,//451
            tmfi           : tmfi  ,//452
            cmfi           : cmfi  ,//453

            mfi7H           :mfi7H ,//454
            mfi14H          :mfi14H,//455
            mfi21H          :mfi21H,//456
            mfiiH           :mfiiH ,//457
            cmfiH           :cmfiH ,//458

            mfi13          : mfi13 ,//459
            mfi28          : mfi28 ,//460
            mfi34          : mfi34 ,//461
            mfi35          : mfi35 ,//462
            mfi42          : mfi42 ,//463
            mfi49          : mfi49 ,//464
            mfi55          : mfi55 ,//465

            //RESULTADO COMPRA
            min_onde_perdeu      : min_onde_perdeu,//466
            min_onde_ganhou      : min_onde_ganhou,//467
            total_ganhou         : total_ganhou,//468
            total_perdeu         : total_perdeu,//469
            perdeu_ganhou        : ganhou_perdeu,//470

            //VENDA
            min_onde_perdeu_V      : min_onde_perdeu_V,//471
            min_onde_ganhou_V      : min_onde_ganhou_V,//472
            total_ganhou_V         : total_ganhou_V,//473
            total_perdeu_V         : total_perdeu_V,//474
            perdeu_ganhou_V        : ganhou_perdeu_V,//475
            hora                   : dado.TIME//476
      })//fim do base push
      //==============MONTANDO O OBJETO======================


        const nomeArquivo2 = `[BD]${MOEDA}`; // Nome do arquivo para salvar os rates
        // Converter o array combinado para formato JSON e formatar com indentação de 2 espaços
        const dadosParaSalvar = base[base.length-1];//JSON.stringify(base, null, 2);
        try {

          // var retorno = await Funcoes.salvarObjetoNoArquivo(nomeArquivo2, dadosParaSalvar,i)
          var retorno = await Funcoes.salvarObjetoNoBanco(nomeArquivo2, dadosParaSalvar,MOEDA,dado.TIME)
          console.log('retorno',retorno);
        } catch (e) {
          console.log("erro",e)
        }
            //.then(msg => console.log(msg))
            //.catch(err => console.error(err));




    } //fim do dados_map
  // })//fim do dados_map


  console.log("BASE[0]",base.map(b=>{
    return {
      min_onde_perdeu:b.min_onde_perdeu,//424
      min_onde_ganhou:b.min_onde_ganhou,//425
      total_ganhou:b.total_ganhou,//426
      total_perdeu:b.total_perdeu,//427
      perdeu_ganhou:b.perdeu_ganhou,//428

      //VENDA
      min_onde_perdeu_V:b.min_onde_perdeu_V,//429
      min_onde_ganhou_V:b.min_onde_ganhou_V,//430
      total_ganhou_V:b.total_ganhou_V,//431
      total_perdeu_V:b.total_perdeu_V,//432
      perdeu_ganhou_V:b.perdeu_ganhou_V,//433
      hora:b.hora
    }

    return;

  }).filter((v,i)=> i < 40));
  // base.map((b,i)=>{
  //   if(i<400)
  //   console.log('BASE',i,b.perdeu_ganhou,b.total_ganhou,b.total_perdeu);
  // })
  /*
    const nomeArquivo2 = `[BD]${MOEDA}.json`; // Nome do arquivo para salvar os rates
    // Converter o array combinado para formato JSON e formatar com indentação de 2 espaços
    const dadosParaSalvar = base;//JSON.stringify(base, null, 2);

    Funcoes.salvarArrayNoArquivo(nomeArquivo2, dadosParaSalvar)
        .then(msg => console.log(msg))
        .catch(err => console.error(err));
  */
  //COMPRA
  var taxa_acerto_4x     = (100*(resultados.filter(r=>r.resultado && r.tipo=='COMPRA' && r.escala == '4x').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var taxa_acerto_3x     = (100*(resultados.filter(r=>r.resultado && r.tipo=='COMPRA' && r.escala == '3x').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var taxa_acerto_2x     = (100*(resultados.filter(r=>r.resultado && r.tipo=='COMPRA' && r.escala == '2x').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var taxa_acerto        = (100*(resultados.filter(r=>r.resultado && r.tipo=='COMPRA' && r.escala == 'NORMAL').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var taxa_acerto_geral  = (100*(resultados.filter(r=>r.resultado && r.tipo=='COMPRA').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var ganho_acumulado    = resultados.filter(r=>r.resultado && r.tipo=='COMPRA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);
  var perda_acumulada    = resultados.filter(r=>r.resultado === false && r.resultado !== undefined && r.tipo=='COMPRA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);
  var taxa_perda_4x      = (100*(resultados.filter(r=>!r.resultado && r.resultado != undefined && r.tipo=='COMPRA' && r.escala == '4x').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var taxa_perda_3x      = (100*(resultados.filter(r=>!r.resultado && r.resultado != undefined && r.tipo=='COMPRA' && r.escala == '3x').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var taxa_perda_2x      = (100*(resultados.filter(r=>!r.resultado && r.resultado != undefined && r.tipo=='COMPRA' && r.escala == '2x').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var taxa_perda         = (100*(resultados.filter(r=>!r.resultado && r.resultado != undefined && r.tipo=='COMPRA' && r.escala == 'NORMAL').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var taxa_perda_geral   = (100*(resultados.filter(r=>!r.resultado && r.resultado != undefined && r.tipo=='COMPRA').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  var taxa_indefinida    = (100*(resultados.filter(r=>r.resultado === undefined && r.tipo=='COMPRA').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
  console.log("=============QTD=============\n\t\t", resultados.filter(r=> r.tipo == 'COMPRA').length)
  console.log("=============TAXA DE ACERTO GERAL=============\n\t\t", taxa_acerto_geral )
  console.log("=============TAXA DE PERDA GERAL=============\n\t\t", taxa_perda_geral,'\n\n' )
  console.log("=============TAXA DE ACERTO 4X=============\n\t\t", taxa_acerto_4x )
  console.log("=============TAXA DE ACERTO 3X=============\n\t\t", taxa_acerto_3x )
  console.log("=============TAXA DE ACERTO 2X=============\n\t\t", taxa_acerto_2x )
  console.log("=============TAXA DE ACERTO NORMAL=============\n\t\t", taxa_acerto )
  console.log("=============TAXA DE PERDA 4X=============\n\t\t", taxa_perda_4x )
  console.log("=============TAXA DE PERDA 3X=============\n\t\t", taxa_perda_3x )
  console.log("=============TAXA DE PERDA 2X=============\n\t\t", taxa_perda_2x )
  console.log("=============TAXA DE PERDA NORMAL=============\n\t\t", taxa_perda )
  console.log("=============TAXA INDEFINIDA=============\n\t\t", taxa_indefinida )
  console.log("=============GANHO ACUMULADO=============\n\t\t", ganho_acumulado )
  console.log("=============PERDA ACUMULADA=============\n\t\t", perda_acumulada,'\n\n' )

  //VENDA
  var taxa_acerto_V        = (100*(resultados.filter(r=>r.resultado && r.tipo=='VENDA').length/resultados.filter(r=> r.tipo == 'VENDA').length)).toFixed(2);
  var ganho_acumulado_V    = resultados.filter(r=>r.resultado && r.tipo=='VENDA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);
  var perda_acumulada_V    = resultados.filter(r=>r.resultado === false && r.resultado !== undefined && r.tipo=='VENDA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);
  var taxa_perda_V         = (100*(resultados.filter(r=>!r.resultado && r.resultado != undefined && r.tipo=='VENDA').length/resultados.filter(r=> r.tipo == 'VENDA').length)).toFixed(2);
  var taxa_indefinida_V    = (100*(resultados.filter(r=>r.resultado === undefined && r.tipo=='VENDA').length/resultados.filter(r=> r.tipo == 'VENDA').length)).toFixed(2);
  console.log("=============[V] QTD=============\n\t\t", resultados.filter(r=> r.tipo == 'VENDA').length)
  console.log("=============[V] TAXA DE ACERTO=============\n\t\t", taxa_acerto_V )
  console.log("=============[V] TAXA DE PERDA=============\n\t\t", taxa_perda_V )
  console.log("=============[V] TAXA INDEFINIDA=============\n\t\t", taxa_indefinida_V )
  console.log("=============[V] GANHO ACUMULADO=============\n\t\t", ganho_acumulado_V )
  console.log("=============[V] PERDA ACUMULADA=============\n\t\t", perda_acumulada_V )

  // process.exit(1);
}//fim do MONTAR BASE

// Simulação de uma função que pode ser parte de um código maior
function consultaAPI(moeda,dados) {
  return new Promise((resolve, reject) => {
      // Definir a URL da API
      const url = 'http://127.0.0.1:5000/predict';

      // Dados para enviar, substitua por sua série de dados
      const data = {
        moeda:moeda,
        series: dados  // Exemplo de série de preços
      };

      // Fazer uma requisição POST à API
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (response.ok) {
          return response.json();  // Converte a resposta para JSON
        }
        // console.log("RESPONSE",response)
        throw new Error('Network response was not ok.');
      })
      .then(json => {
        //console.log("Previsão recebida:", json);
        resolve(json);  // Usar a classificação recebida da API
      })
      .catch(error => {
        console.error('Houve um problema com sua requisição:', error);
        // reject(error);
        resolve('INDEFINIDO')
      });
  });
}//FIM DA consultaAPI

async function IAPredict(moeda,dados,tipo){

  // console.log("=============BASE=============\n\t\t", moeda,dados.length );
  //MONTAR DADOS_PREDICAO
  return new Promise(async (resolve,reject)=>{
    //SERIE HISTÓRICA
    if(false && (moeda == 'GOLD' || moeda == 'USDJPY'))//LSTM
    {
      try {
        //PARA DADOS A CADA MIN
        // var dados_predict = dados.slice(dados.length-60*11,dados.length-1).map(dado=>(dado.HIGH + dado.LOW + 2*dado.CLOSE)/4);

        // Função para calcular o weighted close para um bloco de dados
        function calculateWeightedCloseForBlock(dataBlock) {
            return dataBlock.reduce((acc, curr) => acc + (curr.HIGH + curr.LOW + 2 * curr.CLOSE) / 4, 0) / dataBlock.length;
        }

        // Agrupar dados em ciclos de 60 minutos e calcular o weighted close para cada ciclo
        var dados_predict = [];
        for (let i = 0; i < dados.slice(dados.length-60*11,dados.length-1).length; i += 60) {
            // Obter o bloco de 60 minutos
            let dataBlock = dados.slice(i, i + 60);
            if (dataBlock.length === 60) { // Certifique-se de que temos um bloco completo de 60 minutos
                let weightedClose = calculateWeightedCloseForBlock(dataBlock);
                dados_predict.push(weightedClose);
            }
        }
        var retorno = await consultaAPI(moeda,dados_predict)
        // console.log("GOLD",retorno);
        resolve(retorno);
      } catch (e) {
        console.log("e",e)
        resolve('INDEFINIDO')
      }
    }


  var dados_predicao = {};
  var i              = 0;
  //PERIODOS AGRUPADOS 7 * 4 = 28 Variáveis
  var periodo_M5     = Funcoes.agruparPeriodos(dados,5,i);
  var periodo_M15    = Funcoes.agruparPeriodos(dados,15,i);
  var periodo_M30    = Funcoes.agruparPeriodos(dados,30,i);
  var periodo_H1     = Funcoes.agruparPeriodos(dados,60,i);
  var periodo_H4     = Funcoes.agruparPeriodos(dados,4*60,i);
  var periodo_D1     = Funcoes.agruparPeriodos(dados,24*60,i);
  var periodo_W1     = Funcoes.agruparPeriodos(dados,24*60*7,i);

  //==============INDICADORES======================

  //MEDIA FECHAMENTO
  var mediaM5        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+5).map(d=>d.CLOSE),5-1);
  var mediaM15       = Funcoes.calcularMediaMovel(dados.slice(i+1,i+15).map(d=>d.CLOSE),15-1);
  var mediaM30       = Funcoes.calcularMediaMovel(dados.slice(i+1,i+30).map(d=>d.CLOSE),30-1);
  var mediaH1        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-1);
  var mediaH4        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(4*60)).map(d=>d.CLOSE),(4*60)-1);
  var mediaD1        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(24*60)).map(d=>d.CLOSE),(24*60)-1);
  var mediaW1        = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(7*24*60)).map(d=>d.CLOSE),(7*24*60)-1);

  //MEDIA MÓVEL FECHAMENTO
  var mediaMovelM1   = Funcoes.calcularMediaMovel(dados.slice((i+1),(i+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM2   = Funcoes.calcularMediaMovel(dados.slice((i+2),(i+2+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM3   = Funcoes.calcularMediaMovel(dados.slice((i+3),(i+3+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM4   = Funcoes.calcularMediaMovel(dados.slice((i+4),(i+4+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM5   = Funcoes.calcularMediaMovel(dados.slice((i+5),(i+5+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM6   = Funcoes.calcularMediaMovel(dados.slice((i+6),(i+6+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM7   = Funcoes.calcularMediaMovel(dados.slice((i+7),(i+7+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM8   = Funcoes.calcularMediaMovel(dados.slice((i+8),(i+8+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM9   = Funcoes.calcularMediaMovel(dados.slice((i+9),(i+9+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM10  = Funcoes.calcularMediaMovel(dados.slice((i+10),(i+10+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM11  = Funcoes.calcularMediaMovel(dados.slice((i+11),(i+11+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM12  = Funcoes.calcularMediaMovel(dados.slice((i+12),(i+12+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM13  = Funcoes.calcularMediaMovel(dados.slice((i+13),(i+13+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM14  = Funcoes.calcularMediaMovel(dados.slice((i+14),(i+14+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelM15  = Funcoes.calcularMediaMovel(dados.slice((i+15),(i+15+5)).map(d=>d.CLOSE),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS

  //MEDIA VOLUME
  var mediaVolumeM5  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+5).map(d=>d.TICK_VOLUME),5-1);
  var mediaVolumeM15 = Funcoes.calcularMediaMovel(dados.slice(i+1,i+15).map(d=>d.TICK_VOLUME),15-1);
  var mediaVolumeM30 = Funcoes.calcularMediaMovel(dados.slice(i+1,i+30).map(d=>d.TICK_VOLUME),30-1);
  var mediaVolumeH1  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+60).map(d=>d.TICK_VOLUME),60-1);
  var mediaVolumeH4  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(4*60)).map(d=>d.TICK_VOLUME),(4*60)-1);
  var mediaVolumeD1  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(24*60)).map(d=>d.TICK_VOLUME),(24*60)-1);
  var mediaVolumeW1  = Funcoes.calcularMediaMovel(dados.slice(i+1,i+(7*24*60)).map(d=>d.TICK_VOLUME),(7*24*60)-1);

  //MEDIA MÓVEL VOLUME
  var mediaMovelVolumeM1   = Funcoes.calcularMediaMovel(dados.slice((i+1),(i+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM2   = Funcoes.calcularMediaMovel(dados.slice((i+2),(i+2+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM3   = Funcoes.calcularMediaMovel(dados.slice((i+3),(i+3+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM4   = Funcoes.calcularMediaMovel(dados.slice((i+4),(i+4+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM5   = Funcoes.calcularMediaMovel(dados.slice((i+5),(i+5+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM6   = Funcoes.calcularMediaMovel(dados.slice((i+6),(i+6+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM7   = Funcoes.calcularMediaMovel(dados.slice((i+7),(i+7+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM8   = Funcoes.calcularMediaMovel(dados.slice((i+8),(i+8+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM9   = Funcoes.calcularMediaMovel(dados.slice((i+9),(i+9+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM10  = Funcoes.calcularMediaMovel(dados.slice((i+10),(i+10+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM11  = Funcoes.calcularMediaMovel(dados.slice((i+11),(i+11+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM12  = Funcoes.calcularMediaMovel(dados.slice((i+12),(i+12+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM13  = Funcoes.calcularMediaMovel(dados.slice((i+13),(i+13+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM14  = Funcoes.calcularMediaMovel(dados.slice((i+14),(i+14+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
  var mediaMovelVolumeM15  = Funcoes.calcularMediaMovel(dados.slice((i+15),(i+15+5)).map(d=>d.TICK_VOLUME),5-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS

  //RSI
  var rsiM5          = Funcoes.calcularRSI(dados.slice(i+1,i+5).map(d=>d.CLOSE),5-2);
  var rsiM15         = Funcoes.calcularRSI(dados.slice(i+1,i+15).map(d=>d.CLOSE),15-2);
  var rsiM30         = Funcoes.calcularRSI(dados.slice(i+1,i+30).map(d=>d.CLOSE),30-2);
  var rsiH1          = Funcoes.calcularRSI(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-2);
  var rsiH4          = Funcoes.calcularRSI(dados.slice(i+1,i+(4*60)).map(d=>d.CLOSE),(4*60)-2);
  var rsiD1          = Funcoes.calcularRSI(dados.slice(i+1,i+(24*60)).map(d=>d.CLOSE),(24*60)-2);
  var rsiW1          = Funcoes.calcularRSI(dados.slice(i+1,i+(7*24*60)).map(d=>d.CLOSE),(7*24*60)-2);

  //MACD (SOMENTE HISTOGRAMA)
  var macdH1         = Funcoes.calcularMACD(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-1);

  //Bandas de Bollinger (TODOS OS PERÍODOS)
  var bbM5           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+5).map(d=>d.CLOSE),5-1);
  var bbM15          = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+15).map(d=>d.CLOSE),15-2);
  var bbM30          = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+30).map(d=>d.CLOSE),30-2);
  var bbH1           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-1);
  var bbH4           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+(4*60)).map(d=>d.CLOSE),(4*60)-2);
  var bbD1           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+(24*60)).map(d=>d.CLOSE),(24*60)-2);
  var bbW1           = Funcoes.calcularBandasBollinger(dados.slice(i+1,i+(7*24*60)).map(d=>d.CLOSE),(7*24*60)-2);

  //Oscilador Estocástico (M30 acima)
  var oeM30          = Funcoes.calcularEstocastico(dados.slice(i+1,i+30).map(d=>d.CLOSE),
                                                   dados.slice(i+1,i+30).map(d=>d.HIGH),
                                                   dados.slice(i+1,i+30).map(d=>d.LOW));
  var oeH1           = Funcoes.calcularEstocastico(dados.slice(i+1,i+60).map(d=>d.CLOSE),
                                                  dados.slice(i+1,i+60).map(d=>d.HIGH),
                                                  dados.slice(i+1,i+60).map(d=>d.LOW));
  var oeH4           = Funcoes.calcularEstocastico(dados.slice(i+1,i+60*4).map(d=>d.CLOSE),
                                                   dados.slice(i+1,i+60*4).map(d=>d.HIGH),
                                                   dados.slice(i+1,i+60*4).map(d=>d.LOW));
  var oeD1           = Funcoes.calcularEstocastico(dados.slice(i+1,i+60*24).map(d=>d.CLOSE),
                                                 dados.slice(i+1,i+60*24).map(d=>d.HIGH),
                                                 dados.slice(i+1,i+60*24).map(d=>d.LOW));
  var oeW1           = Funcoes.calcularEstocastico(dados.slice(i+1,i+60*24*7).map(d=>d.CLOSE),
                                                 dados.slice(i+1,i+60*24*7).map(d=>d.HIGH),
                                                 dados.slice(i+1,i+60*24*7).map(d=>d.LOW));
  //MÉDIA MÓVEL PONDERADA (TODOS)
  var mmpM5         = Funcoes.calcularMMP(dados.slice(i+1,i+5).map(d=>d.CLOSE),5-1);
  var mmpM15        = Funcoes.calcularMMP(dados.slice(i+1,i+15).map(d=>d.CLOSE),15-1);
  var mmpM30        = Funcoes.calcularMMP(dados.slice(i+1,i+30).map(d=>d.CLOSE),30-2);
  var mmpH1         = Funcoes.calcularMMP(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-2);
  var mmpH4         = Funcoes.calcularMMP(dados.slice(i+1,i+(4*60)).map(d=>d.CLOSE),(4*60)-2);
  var mmpD1         = Funcoes.calcularMMP(dados.slice(i+1,i+(24*60)).map(d=>d.CLOSE),(24*60)-2);
  var mmpW1         = Funcoes.calcularMMP(dados.slice(i+1,i+(7*24*60)).map(d=>d.CLOSE),(7*24*60)-2);

  //Ichimoku Kinko Hyo (SOMENTE H1)
  var ikhH1         = Funcoes.calcularIchimoku(dados.slice(i+1,i+60));

  //IFD
  var ifdM5          = Funcoes.calcularIFD(dados.slice(i,i+5),5-1);
  var ifdM15         = Funcoes.calcularIFD(dados.slice(i,i+15),15-1);
  var ifdM30         = Funcoes.calcularIFD(dados.slice(i,i+30),30-1);
  var ifdH1          = Funcoes.calcularIFD(dados.slice(i,i+60),60-1);
  var ifdH4          = Funcoes.calcularIFD(dados.slice(i,i+(4*60)),(4*60)-1);
  var ifdD1          = Funcoes.calcularIFD(dados.slice(i,i+(24*60)),(24*60)-1);
  var ifdW1          = Funcoes.calcularIFD(dados.slice(i,i+(7*24*60)),(7*24*60)-1);

  // Índice de Movimento Direcional Médio (ADX)  (TODOS MENOS M5)
  // var adxM5          = Funcoes.calcularADX(dados.slice(i,i+5),5-1);
  var adxM15         = Funcoes.calcularADX(dados.slice(i,i+15),15-1);
  var adxM30         = Funcoes.calcularADX(dados.slice(i,i+30),30-1);
  var adxH1          = Funcoes.calcularADX(dados.slice(i,i+60),60-1);
  var adxH4          = Funcoes.calcularADX(dados.slice(i,i+4*60),4*60-1);
  var adxD1          = Funcoes.calcularADX(dados.slice(i,i+24*60),24*60-1);
  var adxW1          = Funcoes.calcularADX(dados.slice(i,i+7*24*60),7*24*60-1);

//  Índice de Variação de Preço (PVI)  (TODOS MENOS M5)
var pviM5          = Funcoes.calcularPVI(dados.slice(i,i+5),5-1);
var pviM15         = Funcoes.calcularPVI(dados.slice(i,i+15),15-1);
var pviM30         = Funcoes.calcularPVI(dados.slice(i,i+30),30-1);
var pviH1          = Funcoes.calcularPVI(dados.slice(i,i+60),60-1);
var pviH4          = Funcoes.calcularPVI(dados.slice(i,i+4*60),4*60-1);
var pviD1          = Funcoes.calcularPVI(dados.slice(i,i+24*60),24*60-1);
var pviW1          = Funcoes.calcularPVI(dados.slice(i,i+7*24*60),7*24*60-1);

//MÉDIA MÓVEL PONDERADA (TODOS)
var mmpM5         = Funcoes.calcularMMP(dados.slice(i+1,i+5).map(d=>d.CLOSE),5-1);
var mmpM15        = Funcoes.calcularMMP(dados.slice(i+1,i+15).map(d=>d.CLOSE),15-1);
var mmpM30        = Funcoes.calcularMMP(dados.slice(i+1,i+30).map(d=>d.CLOSE),30-2);
var mmpH1         = Funcoes.calcularMMP(dados.slice(i+1,i+60).map(d=>d.CLOSE),60-2);
var mmpH4         = Funcoes.calcularMMP(dados.slice(i+1,i+(4*60)).map(d=>d.CLOSE),(4*60)-2);
var mmpD1         = Funcoes.calcularMMP(dados.slice(i+1,i+(24*60)).map(d=>d.CLOSE),(24*60)-2);
var mmpW1         = Funcoes.calcularMMP(dados.slice(i+1,i+(7*24*60)).map(d=>d.CLOSE),(7*24*60)-2);


//SAR Parabólico (Stop and Reverse)
var sarM5          = Funcoes.calcularSARParabolico(dados.slice(i,i+5),5-1);
var sarM15         = Funcoes.calcularSARParabolico(dados.slice(i,i+15),15-1);
var sarM30         = Funcoes.calcularSARParabolico(dados.slice(i,i+30),30-1);
var sarH1          = Funcoes.calcularSARParabolico(dados.slice(i,i+60),60-1);
var sarH4          = Funcoes.calcularSARParabolico(dados.slice(i,i+4*60),4*60-1);
var sarD1          = Funcoes.calcularSARParabolico(dados.slice(i,i+24*60),24*60-1);
var sarW1          = Funcoes.calcularSARParabolico(dados.slice(i,i+7*24*60),7*24*60-1);

//Retrações Fibonnaci
var fibM5          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+5));
var fibM15         = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+15));
var fibM30         = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+30));
var fibH1          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+60));
var fibH4          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+60*4));
var fibD1          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+60*24));
var fibW1          = Funcoes.calcularRetracoesFibonacci(dados.slice(i,i+7*60*24));

//TRIPLE RSI
var rsi7           = Funcoes.calcularRSI(dados.slice(i+1,i+7).map(d=>d.CLOSE),7-2);
var rsi14          = Funcoes.calcularRSI(dados.slice(i+1,i+14).map(d=>d.CLOSE),14-2);
var rsi21          = Funcoes.calcularRSI(dados.slice(i+1,i+21).map(d=>d.CLOSE),21-2);
var trsi           = rsi7 > 70 && rsi14 > 70 && rsi21 > 70 ? 1 : (rsi7 < 30 && rsi14 < 30 && rsi21 < 30 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO
var crsi           = rsi7 > rsi14 && rsi7 > rsi21 ? 1 : (rsi7 < rsi14 && rsi7 < rsi21 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO

var rsi7H           = Funcoes.calcularRSI(dados.slice(i+1,i+7*60).map(d=>d.CLOSE),7*60-2);
var rsi14H          = Funcoes.calcularRSI(dados.slice(i+1,i+14*60).map(d=>d.CLOSE),14*60-2);
var rsi21H          = Funcoes.calcularRSI(dados.slice(i+1,i+21*60).map(d=>d.CLOSE),21*60-2);
var trsiH           = rsi7H > 70 && rsi14H > 70 && rsi21H > 70 ? 1 : (rsi7H < 30 && rsi14H < 30 && rsi21H < 30 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO
var crsiH           = rsi7H > rsi14H && rsi7H > rsi21H ? 1 : (rsi7H < rsi14H && rsi7H < rsi21H ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO

var rsi13          = Funcoes.calcularRSI(dados.slice(i+1,i+14).map(d=>d.CLOSE),14-2);
var rsi28          = Funcoes.calcularRSI(dados.slice(i+1,i+28).map(d=>d.CLOSE),28-2);
var rsi34          = Funcoes.calcularRSI(dados.slice(i+1,i+34).map(d=>d.CLOSE),34-2);
var rsi35          = Funcoes.calcularRSI(dados.slice(i+1,i+35).map(d=>d.CLOSE),35-2);
var rsi42          = Funcoes.calcularRSI(dados.slice(i+1,i+42).map(d=>d.CLOSE),42-2);
var rsi49          = Funcoes.calcularRSI(dados.slice(i+1,i+49).map(d=>d.CLOSE),49-2);
var rsi55          = Funcoes.calcularRSI(dados.slice(i+1,i+55).map(d=>d.CLOSE),55-2);


// MFI
var mfiM5          = Funcoes.calcularMFI(dados.slice(i+1,i+5).map(d=>d.CLOSE),dados.slice(i+1,i+5).map(d=>d.TICK_VOLUME),5-2);
var mfiM15         = Funcoes.calcularMFI(dados.slice(i+1,i+15).map(d=>d.CLOSE),dados.slice(i+1,i+15).map(d=>d.TICK_VOLUME),15-2);
var mfiM30         = Funcoes.calcularMFI(dados.slice(i+1,i+30).map(d=>d.CLOSE),dados.slice(i+1,i+30).map(d=>d.TICK_VOLUME),30-2);
var mfiH1          = Funcoes.calcularMFI(dados.slice(i+1,i+60).map(d=>d.CLOSE),dados.slice(i+1,i+60).map(d=>d.TICK_VOLUME),60-2);
var mfiH4          = Funcoes.calcularMFI(dados.slice(i+1,i+60*4).map(d=>d.CLOSE),dados.slice(i+1,i+60*4).map(d=>d.TICK_VOLUME),60*4-2);
var mfiD1          = Funcoes.calcularMFI(dados.slice(i+1,i+60*24).map(d=>d.CLOSE),dados.slice(i+1,i+60*24).map(d=>d.TICK_VOLUME),60*24-2);
var mfiW1          = Funcoes.calcularMFI(dados.slice(i+1,i+60*24*7).map(d=>d.CLOSE),dados.slice(i+1,i+60*24*7).map(d=>d.TICK_VOLUME),60*24*7-2);

//TRIPPLE MFI
var mfi7           = Funcoes.calcularMFI(dados.slice(i+1,i+7).map(d=>d.CLOSE),dados.slice(i+1,i+7).map(d=>d.TICK_VOLUME),7-2);
var mfi14          = Funcoes.calcularMFI(dados.slice(i+1,i+14).map(d=>d.CLOSE),dados.slice(i+1,i+14).map(d=>d.TICK_VOLUME),14-2);
var mfi21          = Funcoes.calcularMFI(dados.slice(i+1,i+21).map(d=>d.CLOSE),dados.slice(i+1,i+21).map(d=>d.TICK_VOLUME),21-2);
var tmfi           = mfi7 > 70 && mfi14 > 70 && mfi21 > 70 ? 1 : (mfi7 < 30 && mfi14 < 30 && mfi21 < 30 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO
var cmfi           = mfi7 > mfi14 && mfi7 > mfi21 ? 1 : (mfi7 < mfi14 && rsi7 < mfi21 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO

var mfi7H           = Funcoes.calcularMFI(dados.slice(i+1,i+7*60).map(d=>d.CLOSE),dados.slice(i+1,i+7*60).map(d=>d.TICK_VOLUME),7*60-2);
var mfi14H          = Funcoes.calcularMFI(dados.slice(i+1,i+14*60).map(d=>d.CLOSE),dados.slice(i+1,i+14*60).map(d=>d.TICK_VOLUME),14*60-2);
var mfi21H          = Funcoes.calcularMFI(dados.slice(i+1,i+21*60).map(d=>d.CLOSE),dados.slice(i+1,i+21*60).map(d=>d.TICK_VOLUME),20*60-2);
var mfiiH           = mfi7H > 70 && mfi14H > 70 && mfi21H > 70 ? 1 : (mfi7H < 30 && mfi14H < 30 && mfi21H < 30 ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO
var cmfiH           = mfi7H > mfi14H && mfi7H > mfi21H ? 1 : (mfi7H < mfi14H && mfi7H < mfi21H ? 0 : 2)//0 COMPRA 1 VENDE 2 INDEFINIDO

var mfi13          = Funcoes.calcularMFI(dados.slice(i+1,i+13).map(d=>d.CLOSE),dados.slice(i+1,i+13).map(d=>d.TICK_VOLUME),13-2);
var mfi28          = Funcoes.calcularMFI(dados.slice(i+1,i+28).map(d=>d.CLOSE),dados.slice(i+1,i+28).map(d=>d.TICK_VOLUME),28-2);
var mfi34          = Funcoes.calcularMFI(dados.slice(i+1,i+34).map(d=>d.CLOSE),dados.slice(i+1,i+34).map(d=>d.TICK_VOLUME),34-2);
var mfi35          = Funcoes.calcularMFI(dados.slice(i+1,i+35).map(d=>d.CLOSE),dados.slice(i+1,i+35).map(d=>d.TICK_VOLUME),35-2);
var mfi42          = Funcoes.calcularMFI(dados.slice(i+1,i+42).map(d=>d.CLOSE),dados.slice(i+1,i+42).map(d=>d.TICK_VOLUME),42-2);
var mfi49          = Funcoes.calcularMFI(dados.slice(i+1,i+49).map(d=>d.CLOSE),dados.slice(i+1,i+49).map(d=>d.TICK_VOLUME),49-2);
var mfi55          = Funcoes.calcularMFI(dados.slice(i+1,i+55).map(d=>d.CLOSE),dados.slice(i+1,i+55).map(d=>d.TICK_VOLUME),55-2);


  // console.log("MODEAS_INICADORES[moeda].includes('PERIODOS')",MODEAS_INICADORES[moeda].includes('PERIODOS'));
  dados_predicao = {
    //PERIODOS
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M5_open: periodo_M5.OPEN } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M5_close: periodo_M5.CLOSE } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M5_high: periodo_M5.HIGH } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M5_low: periodo_M5.LOW } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M5_volume: periodo_M5.VOLUME } : {}),

        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M15_open: periodo_M15.OPEN } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M15_close: periodo_M15.CLOSE } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M15_high: periodo_M15.HIGH } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M15_low: periodo_M15.LOW } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M15_volume: periodo_M15.VOLUME } : {}),

        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M30_open: periodo_M30.OPEN } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M30_close: periodo_M30.CLOSE } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M30_high: periodo_M30.HIGH } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M30_low: periodo_M30.LOW } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_M30_volume: periodo_M30.VOLUME } : {}),

        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H1_open: periodo_H1.OPEN } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H1_close: periodo_H1.CLOSE } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H1_high: periodo_H1.HIGH } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H1_low: periodo_H1.LOW } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H1_volume: periodo_H1.VOLUME } : {}),

        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H4_open: periodo_H4.OPEN } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H4_close: periodo_H4.CLOSE } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H4_high: periodo_H4.HIGH } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H4_low: periodo_H4.LOW } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_H4_volume: periodo_H4.VOLUME } : {}),

        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_D1_open: periodo_D1.OPEN } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_D1_close: periodo_D1.CLOSE } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_D1_high: periodo_D1.HIGH } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_D1_low: periodo_D1.LOW } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_D1_volume: periodo_D1.VOLUME } : {}),

        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_W1_open: periodo_W1.OPEN } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_W1_close: periodo_W1.CLOSE } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_W1_high: periodo_W1.HIGH } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_W1_low: periodo_W1.LOW } : {}),
        ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { periodo_W1_volume: periodo_W1.VOLUME } : {}),

     //MEDIAS SIMPLES FECHAMENTO
       ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { media_simples_M5: mediaM5} : {}),
       ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { media_simples_M15: mediaM15} : {}),
       ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { media_simples_M30: mediaM30} : {}),
       ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { media_simples_H1: mediaH1} : {}),
       ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { media_simples_H4: mediaH4} : {}),
       ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { media_simples_D1: mediaD1} : {}),
       ...(MODEAS_INICADORES[moeda].includes('PERIODOS') ? { media_simples_W1: mediaW1} : {}),
     //MEDIA MOVEL FECHAMENTO
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M1: mediaMovelM1} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M2: mediaMovelM2} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M3: mediaMovelM3} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M4: mediaMovelM4} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M5: mediaMovelM5} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M6: mediaMovelM6} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M7: mediaMovelM7} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M8: mediaMovelM8} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M9: mediaMovelM9} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M10:mediaMovelM10} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M11:mediaMovelM11} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M12:mediaMovelM12} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M13:mediaMovelM13} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M14:mediaMovelM14} : {}),
     ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_M15:mediaMovelM15} : {}),
      //MEDIA SIMPLES VOLUME
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_volume_M5: mediaVolumeM5} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_volume_M15: mediaVolumeM15} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_volume_M30: mediaVolumeM30} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_volume_H1: mediaVolumeH1} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_volume_H4: mediaVolumeH4} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_volume_D1: mediaVolumeD1} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_volume_W1: mediaVolumeW1} : {}),
      //MEDIA MOVEL VOLUME
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M1: mediaMovelVolumeM1} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M2: mediaMovelVolumeM2} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M3: mediaMovelVolumeM3} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M4: mediaMovelVolumeM4} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M5: mediaMovelVolumeM5} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M6: mediaMovelVolumeM6} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M7: mediaMovelVolumeM7} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M8: mediaMovelVolumeM8} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M9: mediaMovelVolumeM9} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M10:mediaMovelVolumeM10} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M11:mediaMovelVolumeM11} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M12:mediaMovelVolumeM12} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M13:mediaMovelVolumeM13} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M14:mediaMovelVolumeM14} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MEDIAS') ? { media_movel_volume_M15:mediaMovelVolumeM15} : {}),
      //RSI
      ...(MODEAS_INICADORES[moeda].includes('RSI') ? { rsi_M5: rsiM5} : {}),
      ...(MODEAS_INICADORES[moeda].includes('RSI') ? { rsi_M15: rsiM15} : {}),
      ...(MODEAS_INICADORES[moeda].includes('RSI') ? { rsi_M30: rsiM30} : {}),
      ...(MODEAS_INICADORES[moeda].includes('RSI') ? { rsi_H1: rsiH1} : {}),
      ...(MODEAS_INICADORES[moeda].includes('RSI') ? { rsi_H4: rsiH4} : {}),
      ...(MODEAS_INICADORES[moeda].includes('RSI') ? { rsi_D1: rsiD1} : {}),
      ...(MODEAS_INICADORES[moeda].includes('RSI') ? { rsi_W1: rsiW1} : {}),

      //MACD
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_1: macdH1[0]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_2: macdH1[1]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_3: macdH1[2]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_4: macdH1[3]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_5: macdH1[4]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_6: macdH1[5]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_7: macdH1[6]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_8: macdH1[7]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_9: macdH1[8]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_10:macdH1[9]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_11:macdH1[10]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_12:macdH1[11]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_13:macdH1[12]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_14:macdH1[13]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_15:macdH1[14]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_16:macdH1[15]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_17:macdH1[16]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_18:macdH1[17]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_19:macdH1[18]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_20:macdH1[19]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_21:macdH1[20]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_22:macdH1[21]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_23:macdH1[22]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_24:macdH1[23]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_25:macdH1[24]} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MACD') ? { macd_H1_26:macdH1[25]} : {}),

      //Bandas de Bollinger (TODOS OS PERÍODOS)
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_M5_superior 	: bbM5.bandaSuperior } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_M5_mms      	: bbM5.mms			 } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_M5_inferior 	: bbM5.bandaInferior } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_M15_superior	: bbM15.bandaSuperior} : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_M15_mms     	: bbM15.mms			 } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_M15_inferior	: bbM15.bandaInferior} : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_M30_superior	: bbM30.bandaSuperior} : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_M30_mms     	: bbM30.mms          } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_M30_inferior	: bbM30.bandaInferior} : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_H1_superior 	: bbH1.bandaSuperior } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_H1_mms      	: bbH1.mms           } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_H1_inferior 	: bbH1.bandaInferior } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_H4_superior 	: bbH4.bandaSuperior } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_H4_mms      	: bbH4.mms			 } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_H4_inferior 	: bbH4.bandaInferior } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_D1_superior 	: bbD1 ? bbD1.bandaSuperior : 0} : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_D1_mms      	: bbD1 ? bbD1.mms : 0          } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_D1_inferior 	: bbD1 ? bbD1.bandaInferior : 0} : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_W1_superior 	: bbW1 ? bbW1.bandaSuperior : 0} : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_W1_mms      	: bbW1 ? bbW1.mms : 0          } : {}),
      ...(MODEAS_INICADORES[moeda].includes('BBL') ? { bollinger_W1_inferior 	: bbW1 ? bbW1.bandaInferior : 0} : {}),

      //Oscilador Estocástico
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_M30_pk_medio 	: oeM30.p_K.p_K_medio 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_M30_pk_desvio	: oeM30.p_K.p_K_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_M30_pk_min   	: oeM30.p_K.p_K_min	 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_M30_pk_max   	: oeM30.p_K.p_K_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_M30_pd_medio 	: oeM30.p_D.p_D_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_M30_pd_desvio	: oeM30.p_D.p_D_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_M30_pd_min   	: oeM30.p_D.p_D_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_M30_pd_max   	: oeM30.p_D.p_D_max		} : {}),

      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H1_pk_medio 	: oeH1.p_K.p_K_medio 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H1_pk_desvio	: oeH1.p_K.p_K_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H1_pk_min   	: oeH1.p_K.p_K_min	 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H1_pk_max   	: oeH1.p_K.p_K_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H1_pd_medio 	: oeH1.p_D.p_D_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H1_pd_desvio	: oeH1.p_D.p_D_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H1_pd_min   	: oeH1.p_D.p_D_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H1_pd_max   	: oeH1.p_D.p_D_max		} : {}),


      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H4_pk_medio 	: oeH4.p_K.p_K_medio 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H4_pk_desvio	: oeH4.p_K.p_K_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H4_pk_min   	: oeH4.p_K.p_K_min	 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H4_pk_max   	: oeH4.p_K.p_K_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H4_pd_medio 	: oeH4.p_D.p_D_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H4_pd_desvio	: oeH4.p_D.p_D_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H4_pd_min   	: oeH4.p_D.p_D_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_H4_pd_max   	: oeH4.p_D.p_D_max		} : {}),


      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_D1_pk_medio 	: oeD1.p_K.p_K_medio 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_D1_pk_desvio	: oeD1.p_K.p_K_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_D1_pk_min   	: oeD1.p_K.p_K_min	 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_D1_pk_max   	: oeD1.p_K.p_K_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_D1_pd_medio 	: oeD1.p_D.p_D_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_D1_pd_desvio	: oeD1.p_D.p_D_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_D1_pd_min   	: oeD1.p_D.p_D_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_D1_pd_max   	: oeD1.p_D.p_D_max		} : {}),


      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_W1_pk_medio 	: oeW1.p_K.p_K_medio 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_W1_pk_desvio	: oeW1.p_K.p_K_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_W1_pk_min   	: oeW1.p_K.p_K_min	 	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_W1_pk_max   	: oeW1.p_K.p_K_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_W1_pd_medio 	: oeW1.p_D.p_D_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_W1_pd_desvio	: oeW1.p_D.p_D_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_W1_pd_min   	: oeW1.p_D.p_D_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('OSC') ? { osc_estocastico_W1_pd_max   	: oeW1.p_D.p_D_max		} : {}),

      //MÉDIA MÓVEL PONDERADA (TODOS)
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { media_movel_p_M5 	: mmpM5		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { media_movel_p_M15	: mmpM15	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { media_movel_p_M30	: mmpM30	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { media_movel_p_H1 	: mmpH1		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { media_movel_p_H4 	: mmpH4		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { media_movel_p_D1 	: mmpD1		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { media_movel_p_W1 	: mmpW1		} : {}),
      //Ichimoku Kinko Hyo (SOMENTE H1)
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_tenkanSen_medio    	: ikhH1.tenkanSen.tenkanSen_medio		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_tenkanSen_desvio   	: ikhH1.tenkanSen.tenkanSen_desvio		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_tenkanSen_min      	: ikhH1.tenkanSen.tenkanSen_min			} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_tenkanSen_max      	: ikhH1.tenkanSen.tenkanSen_max			} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_kijunSen_medio     	: ikhH1.kijunSen.kijunSen_medio			} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_kijunSen_desvio    	: ikhH1.kijunSen.kijunSen_desvio		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_kijunSen_min       	: ikhH1.kijunSen.kijunSen_min			} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_kijunSen_max     	 	: ikhH1.kijunSen.kijunSen_max			} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_senkouSpanA_medio  	: ikhH1.senkouSpanA.senkouSpanA_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_senkouSpanA_desvio 	: ikhH1.senkouSpanA.senkouSpanA_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_senkouSpanA_min    	: ikhH1.senkouSpanA.senkouSpanA_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_senkouSpanA_max    	: ikhH1.senkouSpanA.senkouSpanA_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_senkouSpanB_medio  	: ikhH1.senkouSpanB.senkouSpanB_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_senkouSpanB_desvio 	: ikhH1.senkouSpanB.senkouSpanB_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_senkouSpanB_min    	: ikhH1.senkouSpanB.senkouSpanB_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_senkouSpanB_max    	: ikhH1.senkouSpanB.senkouSpanB_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_chikouSpan_medio   	: ikhH1.chikouSpan.chikouSpan_medio		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_chikouSpan_desvio  	: ikhH1.chikouSpan.chikouSpan_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_chikouSpan_min     	: ikhH1.chikouSpan.chikouSpan_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IKH') ? { ichimoku_H1_chikouSpan_max     	: ikhH1.chikouSpan.chikouSpan_max		} : {}),

      //IFD
      ...(MODEAS_INICADORES[moeda].includes('IFD') ? { ifd_M5 	: ifdM5	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IFD') ? { ifd_M15	: ifdM15} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IFD') ? { ifd_M30	: ifdM30} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IFD') ? { ifd_H1 	: ifdH1	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IFD') ? { ifd_H4 	: ifdH4	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IFD') ? { ifd_D1 	: ifdD1	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('IFD') ? { ifd_W1 	: ifdW1	} : {}),

      // Índice de Movimento Direcional Médio (ADX)  (TODOS MENOS M5)
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_M15_medio  	: adxM15.adx_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_M15_desvio 	: adxM15.adx_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_M15_min    	: adxM15.adx_min	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_M15_max    	: adxM15.adx_max	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_M30_medio  	: adxM30.adx_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_M30_desvio 	: adxM30.adx_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_M30_min    	: adxM30.adx_min	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_M30_max    	: adxM30.adx_max	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_H1_medio   	: adxH1.adx_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_H1_desvio  	: adxH1.adx_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_H1_min     	: adxH1.adx_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_H1_max     	: adxH1.adx_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_H4_medio   	: adxH4.adx_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_H4_desvio  	: adxH4.adx_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_H4_min     	: adxH4.adx_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_H4_max     	: adxH4.adx_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_D1_medio   	: adxD1.adx_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_D1_desvio  	: adxD1.adx_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_D1_min     	: adxD1.adx_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_D1_max     	: adxD1.adx_max		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_W1_medio   	: adxW1.adx_medio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_W1_desvio  	: adxW1.adx_desvio	} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_W1_min     	: adxW1.adx_min		} : {}),
      ...(MODEAS_INICADORES[moeda].includes('MMP') ? { adx_W1_max     	: adxW1.adx_max		} : {}),

                  //  Índice de Variação de Preço (PVI)  (TODOS MENOS M5)
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M15_medio: pviM15.pvi_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M15_desvio: pviM15.pvi_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M15_min: pviM15.pvi_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M15_max: pviM15.pvi_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M15_last: pviM15.pvi_last} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M30_medio: pviM30.pvi_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M30_desvio: pviM30.pvi_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M30_min: pviM30.pvi_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M30_max: pviM30.pvi_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_M30_last: pviM30.pvi_last} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H1_medio: pviH1.pvi_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H1_desvio: pviH1.pvi_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H1_min: pviH1.pvi_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H1_max: pviH1.pvi_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H1_last: pviH1.pvi_last} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H4_medio: pviH4.pvi_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H4_desvio: pviH4.pvi_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H4_min: pviH4.pvi_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H4_max: pviH4.pvi_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_H4_last: pviH4.pvi_last} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_D1_medio: pviD1.pvi_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_D1_desvio: pviD1.pvi_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_D1_min: pviD1.pvi_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_D1_max: pviD1.pvi_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_D1_last: pviD1.pvi_last} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_W1_medio: pviW1.pvi_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_W1_desvio: pviW1.pvi_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_W1_min: pviW1.pvi_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_W1_max: pviW1.pvi_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('PVI') ? { pvi_W1_last: pviW1.pvi_last} : {}),

      //SAR Parabólico (Stop and Reverse)
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_M15_medio: sarM15.sar_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_M15_desvio: sarM15.sar_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_M15_min: sarM15.sar_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_M15_max: sarM15.sar_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_M30_medio: sarM30.sar_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_M30_desvio: sarM30.sar_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_M30_min: sarM30.sar_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_M30_max: sarM30.sar_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_H1_medio: sarH1.sar_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_H1_desvio: sarH1.sar_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_H1_min: sarH1.sar_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_H1_max: sarH1.sar_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_H4_medio: sarH4.sar_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_H4_desvio: sarH4.sar_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_H4_min: sarH4.sar_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_H4_max: sarH4.sar_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_D1_medio: sarD1.sar_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_D1_desvio: sarD1.sar_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_D1_min: sarD1.sar_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_D1_max: sarD1.sar_max} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_W1_medio: sarW1.sar_medio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_W1_desvio: sarW1.sar_desvio} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_W1_min: sarW1.sar_min} : {}),
      ...(MODEAS_INICADORES[moeda].includes('SAR') ? { sar_W1_max: sarW1.sar_max} : {}),
//Retrações Fibonnaci 285-424

...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_23.6%_medio' 	: fibM5['23.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_23.6%_desvio'	: fibM5['23.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_23.6%_min'   	: fibM5['23.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_23.6%_max'   	: fibM5['23.6%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_38.2%_medio' 	: fibM5['38.2%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_38.2%_desvio'	: fibM5['38.2%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_38.2%_min'   	: fibM5['38.2%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_38.2%_max'   	: fibM5['38.2%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_50.0%_medio' 	: fibM5['50.0%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_50.0%_desvio'	: fibM5['50.0%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_50.0%_min'   	: fibM5['50.0%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_50.0%_max'   	: fibM5['50.0%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_61.8%_medio' 	: fibM5['61.8%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_61.8%_desvio'	: fibM5['61.8%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_61.8%_min'   	: fibM5['61.8%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_61.8%_max'   	: fibM5['61.8%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_78.6%_medio' 	: fibM5['78.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_78.6%_desvio'	: fibM5['78.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_78.6%_min'   	: fibM5['78.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M5_78.6%_max'   	: fibM5['78.6%_max']} : {}),

...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_23.6%_medio' 	: fibM15['23.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_23.6%_desvio'	: fibM15['23.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_23.6%_min'   	: fibM15['23.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_23.6%_max'   	: fibM15['23.6%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_38.2%_medio' 	: fibM15['38.2%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_38.2%_desvio'	: fibM15['38.2%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_38.2%_min'   	: fibM15['38.2%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_38.2%_max'   	: fibM15['38.2%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_50.0%_medio' 	: fibM15['50.0%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_50.0%_desvio'	: fibM15['50.0%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_50.0%_min'   	: fibM15['50.0%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_50.0%_max'   	: fibM15['50.0%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_61.8%_medio' 	: fibM15['61.8%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_61.8%_desvio'	: fibM15['61.8%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_61.8%_min'   	: fibM15['61.8%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_61.8%_max'   	: fibM15['61.8%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_78.6%_medio' 	: fibM15['78.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_78.6%_desvio'	: fibM15['78.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_78.6%_min'   	: fibM15['78.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M15_78.6%_max'   	: fibM15['78.6%_max']} : {}),


...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_23.6%_medio' 	: fibM30['23.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_23.6%_desvio'	: fibM30['23.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_23.6%_min'   	: fibM30['23.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_23.6%_max'   	: fibM30['23.6%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_38.2%_medio' 	: fibM30['38.2%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_38.2%_desvio'	: fibM30['38.2%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_38.2%_min'   	: fibM30['38.2%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_38.2%_max'   	: fibM30['38.2%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_50.0%_medio' 	: fibM30['50.0%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_50.0%_desvio'	: fibM30['50.0%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_50.0%_min'   	: fibM30['50.0%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_50.0%_max'   	: fibM30['50.0%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_61.8%_medio' 	: fibM30['61.8%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_61.8%_desvio'	: fibM30['61.8%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_61.8%_min'   	: fibM30['61.8%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_61.8%_max'   	: fibM30['61.8%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_78.6%_medio' 	: fibM30['78.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_78.6%_desvio'	: fibM30['78.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_78.6%_min'   	: fibM30['78.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_M30_78.6%_max'   	: fibM30['78.6%_max']} : {}),

...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_23.6%_medio' 	: fibH1['23.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_23.6%_desvio'	: fibH1['23.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_23.6%_min'   	: fibH1['23.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_23.6%_max'   	: fibH1['23.6%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_38.2%_medio' 	: fibH1['38.2%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_38.2%_desvio'	: fibH1['38.2%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_38.2%_min'   	: fibH1['38.2%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_38.2%_max'   	: fibH1['38.2%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_50.0%_medio' 	: fibH1['50.0%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_50.0%_desvio'	: fibH1['50.0%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_50.0%_min'   	: fibH1['50.0%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_50.0%_max'   	: fibH1['50.0%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_61.8%_medio' 	: fibH1['61.8%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_61.8%_desvio'	: fibH1['61.8%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_61.8%_min'   	: fibH1['61.8%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_61.8%_max'   	: fibH1['61.8%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_78.6%_medio' 	: fibH1['78.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_78.6%_desvio'	: fibH1['78.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_78.6%_min'   	: fibH1['78.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H1_78.6%_max'   	: fibH1['78.6%_max']} : {}),


...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_23.6%_medio' 	: fibH4['23.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_23.6%_desvio'	: fibH4['23.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_23.6%_min'   	: fibH4['23.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_23.6%_max'   	: fibH4['23.6%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_38.2%_medio' 	: fibH4['38.2%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_38.2%_desvio'	: fibH4['38.2%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_38.2%_min'   	: fibH4['38.2%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_38.2%_max'   	: fibH4['38.2%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_50.0%_medio' 	: fibH4['50.0%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_50.0%_desvio'	: fibH4['50.0%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_50.0%_min'   	: fibH4['50.0%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_50.0%_max'   	: fibH4['50.0%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_61.8%_medio' 	: fibH4['61.8%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_61.8%_desvio'	: fibH4['61.8%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_61.8%_min'   	: fibH4['61.8%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_61.8%_max'   	: fibH4['61.8%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_78.6%_medio' 	: fibH4['78.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_78.6%_desvio'	: fibH4['78.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_78.6%_min'   	: fibH4['78.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_H4_78.6%_max'   	: fibH4['78.6%_max']} : {}),


...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_23.6%_medio' 	: fibD1['23.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_23.6%_desvio'	: fibD1['23.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_23.6%_min'   	: fibD1['23.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_23.6%_max'   	: fibD1['23.6%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_38.2%_medio' 	: fibD1['38.2%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_38.2%_desvio'	: fibD1['38.2%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_38.2%_min'   	: fibD1['38.2%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_38.2%_max'   	: fibD1['38.2%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_50.0%_medio' 	: fibD1['50.0%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_50.0%_desvio'	: fibD1['50.0%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_50.0%_min'   	: fibD1['50.0%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_50.0%_max'   	: fibD1['50.0%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_61.8%_medio' 	: fibD1['61.8%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_61.8%_desvio'	: fibD1['61.8%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_61.8%_min'   	: fibD1['61.8%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_61.8%_max'   	: fibD1['61.8%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_78.6%_medio' 	: fibD1['78.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_78.6%_desvio'	: fibD1['78.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_78.6%_min'   	: fibD1['78.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_D1_78.6%_max'   	: fibD1['78.6%_max']} : {}),


...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_23.6%_medio' 	: fibW1['23.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_23.6%_desvio'	: fibW1['23.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_23.6%_min'   	: fibW1['23.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_23.6%_max'   	: fibW1['23.6%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_38.2%_medio' 	: fibW1['38.2%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_38.2%_desvio'	: fibW1['38.2%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_38.2%_min'   	: fibW1['38.2%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_38.2%_max'   	: fibW1['38.2%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_50.0%_medio' 	: fibW1['50.0%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_50.0%_desvio'	: fibW1['50.0%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_50.0%_min'   	: fibW1['50.0%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_50.0%_max'   	: fibW1['50.0%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_61.8%_medio' 	: fibW1['61.8%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_61.8%_desvio'	: fibW1['61.8%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_61.8%_min'   	: fibW1['61.8%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_61.8%_max'   	: fibW1['61.8%_max']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_78.6%_medio' 	: fibW1['78.6%_medio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_78.6%_desvio'	: fibW1['78.6%_desvio']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_78.6%_min'   	: fibW1['78.6%_min']} : {}),
...(MODEAS_INICADORES[moeda].includes('FIB') ? { 'fib_W1_78.6%_max'   	: fibW1['78.6%_max']} : {}),

//TRIPPLE RSI
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi7     	: rsi7   } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi14    	: rsi14  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi21    	: rsi21  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { trsi     	: trsi   } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { crsi     	: crsi   } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi13    	: rsi13  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi28    	: rsi28  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi34    	: rsi34  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi35    	: rsi35  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi42    	: rsi42  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi49    	: rsi49  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi55    	: rsi55  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi7H    	: rsi7H  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi14H   	: rsi14H } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { rsi21H   	: rsi21H } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { trsiH    	: trsiH  } : {}),
...(MODEAS_INICADORES[moeda].includes('TRSI') ? { crsiH    	: crsiH  } : {}),


//MFI
...(MODEAS_INICADORES[moeda].includes('MFI') ? { mfiM5   	: mfiM5  } : {}),
...(MODEAS_INICADORES[moeda].includes('MFI') ? { mfiM15  	: mfiM15 } : {}),
...(MODEAS_INICADORES[moeda].includes('MFI') ? { mfiM30  	: mfiM30 } : {}),
...(MODEAS_INICADORES[moeda].includes('MFI') ? { mfiH1   	: mfiH1  } : {}),
...(MODEAS_INICADORES[moeda].includes('MFI') ? { mfiH4   	: mfiH4  } : {}),
...(MODEAS_INICADORES[moeda].includes('MFI') ? { mfiD1   	: mfiD1  } : {}),
...(MODEAS_INICADORES[moeda].includes('MFI') ? { mfiW1   	: mfiW1  } : {}),

//TRIPPLE MFI
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi7     	: mfi7   }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi14    	: mfi14  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi21    	: mfi21  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { tmfi     	: tmfi   }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { cmfi     	: cmfi   }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi7H    	: mfi7H  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi14H   	: mfi14H }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi21H   	: mfi21H }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfiiH    	: mfiiH  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { cmfiH    	: cmfiH  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi13    	: mfi13  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi28    	: mfi28  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi34    	: mfi34  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi35    	: mfi35  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi42    	: mfi42  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi49    	: mfi49  }: {}),
...(MODEAS_INICADORES[moeda].includes('TMFI') ? { mfi55    	: mfi55  }: {}),
  }//fim do OBJ


  /***********************************************
    PREDIÇÃO UTILIZANDO PYTHON/EFSAHP
  ************************************************/
  if(true && (moeda == 'GOLD' || moeda == 'DOGEUSD' || moeda == 'USDJPY' || moeda == 'BTCUSD'
  || moeda == 'ETHUSD' || moeda == 'GBPUSD' || moeda == 'EURUSD' || moeda == 'USDCHF' || moeda == 'EURGBP') )//LSTM
  {
    try {
      //transformando obj em vetor
      var dados_arr = [];
      Object.keys(dados_predicao).map(key=>
          dados_arr.push(dados_predicao[key])
      )
      //console.log("LENG",dados_arr.length)
      var retorno = await consultaAPI(moeda,dados_arr)
      //console.log("GOLD",retorno);
      resolve(retorno);
      return;
    } catch (e) {
      console.log("e",e)
      resolve('INDEFINIDO')
      return;
    }
    return;
  }

  /***********************************************
    PREDIÇÃO COMUM UTILIZANDO JAVASCRIPT
  ************************************************/
  var nomeArquivo = `[IA${tipo?'-VENDA':''}]${moeda}.txt`
  try {
       var arquivoRecuperado = fs.readFileSync(nomeArquivo);
           arquivoRecuperado = JSON.parse(arquivoRecuperado);
           var IA            = RFClassification.load(arquivoRecuperado);

           // console.log("=============DADOS PREDICAO=============\n\t\t",nomeArquivo);

           var resultado    = IA.predict( [Object.values(dados_predicao)] );
           // console.log(`\n\n=============[${tipo ? 'VENDA' : 'COMPRA'}]PREDICAO =============\n\t\t`,resultado );
           // resultado = resultado == 0 ||
           //             resultado == 1 ||
           //             resultado == 2 ||
           //             resultado == 3   ? 'VAI PERDER' : (
           //                                                  resultado == 4 ||
           //                                                  resultado == 5 ||
           //                                                  resultado == 6 ||
           //                                                  resultado == 7   ? 'DEVE GANHAR' : 'INDEFINIDO')
           if(resultado == 0 || resultado == 1)      resultado = 'VAI PERDER 3 OU 4 X';
           else if(resultado == 2 || resultado == 3) resultado = 'VAI PERDER';
           else if(resultado == 4 || resultado == 5) resultado = 'DEVE GANHAR';
           else if(resultado == 6 || resultado == 7) resultado = 'DEVE GANHAR 3 OU 4 X';
           else if(resultado == 8) resultado = 'INDEFINIDO';
           // console.log(`\n\n=============[${tipo ? 'VENDA' : 'COMPRA'}]RESULTADO PREDICAO =============\n\t\t`,resultado );
           // return resultado;
           // console.log("RESULT",resultado)
           resolve(resultado);
       }
       catch(e){
         console.log("=============ERRO IA=============\n\t\t",e );
         // return 8;
         resolve(8);
       }

   })//fim da promise
}//FIM

async function buscaTarget(TP_SIZE,SL_SIZE){

  const nomeArquivo = `[RATES]${MOEDA}.json`; // Nome do arquivo para salvar os rates
  var CONTRATO      = MOEDA == 'EURUSD' || MOEDA == 'GBPUSD' ? 100000 :
                                                   MOEDA == 'USDCHF' ? 100000 :
                                                   MOEDA == 'EURGBP' ? 100000 :
                                                   MOEDA == 'USDJPY' ? 1000 :
                                                   MOEDA == 'GOLD' ? 100 :
                                                  (MOEDA == 'BTCUSD' || MOEDA == 'ETHUSD' ? 100 :
                                                  (MOEDA == 'DOGEUSD' ? 10000 : 1)) ;
  var dados         = await new Promise((resolve, reject)=>{
                          fs.access(nomeArquivo, async (err) => {
                              if (!err) {
                                  try {
                                      const conteudoArquivo = fs.readFile(nomeArquivo, 'utf-8',(err,conteudoArquivo)=>{
                                        // console.log("conteudoArquivo",conteudoArquivo)

                                        ratesExistente = JSON.parse(conteudoArquivo); // Ler o conteúdo do arquivo e converter para array
                                        console.log('Arquivo encontrado e lido com sucesso:', nomeArquivo);
                                        resolve(ratesExistente);
                                      });
                                  } catch (error) {
                                      console.error('Erro ao ler o arquivo:', error);
                                      reject();
                                  }
                              } else {
                                  console.error('Arquivo não encontrado:', nomeArquivo);
                                  resolve([]);
                              }
                          });
                        })//FIM DA PROMISE
/*
    Open: Preço de abertura M1
    Close: Preço de fechamento M15
    HIGH: Maior valor do intervalo
    LOW: Menor valor do intervalo
    MAX CLOSE: Maior preço de venda do intervalo
    MIN CLOSE: Menor preço de venda do intervalo
*/
  var base          = [];
  var resultados    = [];
   dados             = dados.filter((dado,i)=>i<1440*30);
  console.log("\n==========DADOS==========\n\n"
                                              // ,dados[0],dados[1]
                                              ,dados.length);

  //CALCULAR M15
  dados.map((dado,i)=>{

     if(i <= CICLO_MIN || i%300 != 0)// || i !=1445)//GARANTINDO O INTERVALO DE TEMPO E 60 MIN NO FUTURO
        return;
      //CONFIGURAÇÕES DE COMPRA
          //COMPRA
          var preco_compra  = dado.OPEN + dado.SPREAD/CONTRATO;//ask
          var preco_venda   = dado.HIGH;// - dado.SPREAD/CONTRATO;//bid
          //COMPRA
          var TP            = preco_compra + TP_SIZE * dado.SPREAD/CONTRATO;// + preco_compra *0.01;// + preco_compra * 5 * PERCENTUAL_C_V;
          var SL            = dado.OPEN - dado.OPEN*SL_SIZE;//  - preco_venda *0.01;

          //VENDA
          var preco_compra_V  = dado.OPEN - dado.SPREAD/CONTRATO;//ask
          var preco_venda_V   = dado.LOW;// - dado.SPREAD/CONTRATO;//bid
          //VENDA
          var TP_V            = preco_compra_V - TP_SIZE * dado.SPREAD/CONTRATO;// + preco_compra *0.01;// + preco_compra * 5 * PERCENTUAL_C_V;
          var SL_V            = dado.OPEN + dado.OPEN*SL_SIZE;//  - preco_venda *0.01;

          var i_futuro      = i-CICLO_MIN-1;
          // var dados_passados= dados.slice(i+1,i+CICLO_MIN);//60 dados no passado
          var dados_futuros = dados.slice(i_futuro,i);//60 dados no futuro
          dados_futuros     = dados_futuros.sort((a,b)=>{if(a.TIME < b.TIME) return -1
                                                      return 1;
                                                })
          //COMPRA
          var ask_futuro           = dados_futuros.map(d=>d.HIGH)// + d.SPREAD/CONTRATO); //O PREÇO DE ABERTURA + O SPREAD
          var profit_futuro        = ask_futuro.map(af => (af - preco_compra) * (VOLUME*CONTRATO));//*CONTRATO));

          // console.log("ask_futuro",ask_futuro);

          //VENDA
          var ask_futuro_V         = dados_futuros.map(d=>d.LOW)// - d.SPREAD/CONTRATO); //O PREÇO DE ABERTURA + O SPREAD
          var profit_futuro_V      = ask_futuro_V.map(af => -(af - preco_compra_V) * (VOLUME*CONTRATO));//*CONTRATO));
          var i_onde_ganhou        = undefined;
          var i_onde_ganhou_V      = undefined;
          var i_onde_perdeu        = undefined;
          var i_onde_perdeu_V      = undefined;
          var high_futuro          = dados_futuros.map(d=>d.HIGH);// O PREÇO MAIS ALTO É AQUELE Q REPRESENTARIA UMA VENDA CONCRETIZADA
          var low_futuro           = dados_futuros.map(d=>d.LOW);// O PREÇO MAIS ALTO É AQUELE Q REPRESENTARIA UMA VENDA CONCRETIZADA

  high_futuro.map((bf,j) =>{
                                    //NORMAL
                                    if(low_futuro[j] <= SL && !i_onde_ganhou && !i_onde_perdeu) i_onde_perdeu  = j;
                                    if(bf >= TP && !i_onde_ganhou && !i_onde_perdeu) i_onde_ganhou  = j;
                                  })
  //VENDA
  low_futuro.map((lf,j) =>{
                            //NORMAL
                            if(high_futuro[j] >= SL_V && !i_onde_ganhou_V && !i_onde_perdeu_V) i_onde_perdeu_V  = j;
                            if(lf <= TP_V && !i_onde_ganhou_V && !i_onde_perdeu_V)i_onde_ganhou_V  = j;
                          })
  // console.log("I",i)
  console.log("I",i,dado.TIME,'iog',i_onde_ganhou,'iop',i_onde_perdeu,'lucro',
              profit_futuro[i_onde_ganhou],profit_futuro[i_onde_perdeu]);

  if(i_onde_ganhou)
  resultados.push({tipo:'COMPRA',escala:'NORMAL',resultado:true,lucro:profit_futuro[i_onde_ganhou]  });
  else if(i_onde_perdeu)
    resultados.push({tipo:'COMPRA',escala:'NORMAL',resultado:false,lucro:profit_futuro[i_onde_perdeu]});
  else
    resultados.push({tipo:'COMPRA',resultado:undefined,lucro:profit_futuro[i_onde_perdeu]});


});//FIM DO MAP DADOS


//COMPRA
var taxa_acerto_geral  = (100*(resultados.filter(r=>r.resultado && r.tipo=='COMPRA').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
var ganho_acumulado    = 3*resultados.filter(r=>r.resultado && r.tipo=='COMPRA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);
var perda_acumulada    = 3*resultados.filter(r=>r.resultado === false && r.resultado !== undefined && r.tipo=='COMPRA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);
var saldo_acumulado    = 3*resultados.filter(r=>r.resultado !== undefined && r.tipo=='COMPRA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);

var saldo_evolucao = [50]
resultados.filter(r=>r.resultado !== undefined && r.tipo=='COMPRA').map(r=>r.lucro).map(l=>saldo_evolucao.push(saldo_evolucao[saldo_evolucao.length-1]+Number(l.toFixed(2)) ))

var taxa_perda_geral   = (100*(resultados.filter(r=>!r.resultado && r.resultado != undefined && r.tipo=='COMPRA').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
var taxa_indefinida    = (100*(resultados.filter(r=>r.resultado === undefined && r.tipo=='COMPRA').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);

// saldo_evolucao.map((se,i)=>{
//   console.log("SALDO EVOLUCAO",i,se);
// });
console.log("saldo_evolucao",saldo_evolucao.length)
console.log("=============QTD=============\n\t\t", resultados.filter(r=> r.tipo == 'COMPRA').length)
console.log("=============TAXA DE ACERTO GERAL=============\n\t\t", taxa_acerto_geral )
console.log("=============TAXA DE PERDA GERAL=============\n\t\t", taxa_perda_geral )
console.log("=============TAXA INDEFINIDA=============\n\t\t", taxa_indefinida,'\n\n' )
console.log("=============GANHO ACUMULADO=============\n\t\t$", ganho_acumulado.toFixed(2) )
console.log("=============PERDA ACUMULADA=============\n\t\t$", perda_acumulada.toFixed(2),'\n\n' )
console.log("=============SALDO ACUMULADO=============\n\t\t$", saldo_acumulado.toFixed(2),'\n\n' )


var r = Funcoes.calcularEstatisticas(saldo_evolucao);
console.log("ESTATISTICAS",r)
}//fim do buscaTarget


async function backTest({MOEDA_A,TP_SIZE,SL_SIZE,BANCA,VOLUME_A,CICLO,ESPERA,INTERVALO,BERSERK,BOTS_ATIVOS,CRUZER,STEP_OUT,SKIP_DAY}){
  const nomeArquivo = `[RATES]${MOEDA_A}.json`; // Nome do arquivo para salvar os rates
  var dados         = await new Promise((resolve, reject)=>{
                          fs.access(nomeArquivo, async (err) => {
                              if (!err) {
                                  try {
                                      const conteudoArquivo = fs.readFile(nomeArquivo, 'utf-8',(err,conteudoArquivo)=>{
                                        // console.log("conteudoArquivo",conteudoArquivo)

                                        ratesExistente = JSON.parse(conteudoArquivo); // Ler o conteúdo do arquivo e converter para array
                                        console.log('Arquivo encontrado e lido com sucesso:', nomeArquivo);
                                        resolve(ratesExistente);
                                      });
                                  } catch (error) {
                                      console.error('Erro ao ler o arquivo:', error);
                                      reject();
                                  }
                              } else {
                                  console.error('Arquivo não encontrado:', nomeArquivo);
                                  resolve([]);
                              }
                          });
                        })//FIM DA PROMISE
/*
    Open: Preço de abertura M1
    Close: Preço de fechamento M15
    HIGH: Maior valor do intervalo
    LOW: Menor valor do intervalo
    MAX CLOSE: Maior preço de venda do intervalo
    MIN CLOSE: Menor preço de venda do intervalo
*/
  var base          = [];
  var resultados    = [];
   dados             = dados.sort((a,b)=>{
                                            if(a.TIME > b.TIME) return -1;
                                            return 1;
                                         }).filter((dado,i)=>i<1440*30)
                                         .sort((a,b)=>{
                                              if(a.TIME < b.TIME) return -1;
                                              return 1;
                                           });
  console.log("\n==========DADOS==========\n\n"
                                              // ,dados[0],dados[1]
                                              ,dados.length);
  const VOLUME            = {ETHUSD:VOLUME_A, BTCUSD:VOLUME_A, EURUSD:VOLUME_A, GBPUSD:VOLUME_A, GOLD:VOLUME_A, USDJPY:VOLUME_A,EURGBP:VOLUME_A, USDCHF:VOLUME_A};
  var CONTRATO            = MOEDA_A == 'EURUSD' || MOEDA_A == 'GBPUSD' ? 100000 :
                                                   MOEDA_A == 'USDCHF' ? 100000 :
                                                   MOEDA_A == 'EURGBP' ? 100000 :
                                                   MOEDA_A == 'USDJPY' ? 1000 :
                                                   MOEDA_A == 'GOLD' ? 100 :
                                                  (MOEDA_A == 'BTCUSD' || MOEDA_A == 'ETHUSD' ? 100 :
                                                  (MOEDA_A == 'DOGEUSD' ? 10000 : 1)) ;
  var contrato_ajustado = MOEDA_A == 'BTCUSD' || MOEDA_A == 'ETHUSD' ? 1 : CONTRATO;
  // const BOTS_ATIVOS       = BOTS_ATIVOS;
  const MOEDAS_ATIVAS     = ['ETHUSD'];//,'BTCUSD','EURUSD','GBPUSD',/*'GOLD',*/'USDJPY','EURGBP'];
  var   NEGOCIACAO_ATIVA  = {};
  const PERIODO_SEMANA    = 1440*7+1;
  const TRADES_INTERVAL   = INTERVALO;
  const LUCRO_DIA         = {};
  const TRADES_DIA        = {};
  const DERROTAS_DIA      = {};
  var   ciclo             = CICLO;
  var trades_positivos    = 0;
  var trades_recuperacao  = 0;
  var vendas              = [BANCA];
  var resultados          = [0];
  var variacoes           = [];
  //CALCULAR M15
  // dados.map(async (dado,i)=>{
  for(var i=0; i < dados.length; i++)
  {
    var dados_atuais = dados;
    dados_atuais = dados_atuais.slice(i-PERIODO_SEMANA,i)
    .sort((a,b)=>{if(a<b)return 1;return -1;})
     var dado = dados[i];
     //INICADORES
     var mult = CRUZER.interval*1;//H4
     var rsiM7    = Funcoes.calcularRSI(dados_atuais.slice((0),(7*mult)).map(d=>d.CLOSE),7*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
     var rsiM14   = Funcoes.calcularRSI(dados_atuais.slice((0),(14*mult)).map(d=>d.CLOSE),14*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
     var rsiM21   = Funcoes.calcularRSI(dados_atuais.slice((0),(21*mult)).map(d=>d.CLOSE),21*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS

     var mfiM7    = Funcoes.calcularMFI(dados_atuais.slice((0),(7*mult)).map(d=>d.CLOSE),dados_atuais.slice((0),(7*mult)).map(d=>d.TICK_VOLUME),7*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
     var mfiM14   = Funcoes.calcularMFI(dados_atuais.slice((0),(14*mult)).map(d=>d.CLOSE),dados_atuais.slice((0),(14*mult)).map(d=>d.TICK_VOLUME),14*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
     var mfiM21   = Funcoes.calcularMFI(dados_atuais.slice((0),(21*mult)).map(d=>d.CLOSE),dados_atuais.slice((0),(21*mult)).map(d=>d.TICK_VOLUME),21*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS

     var smaM7    = Funcoes.calcularMediaMovel(dados_atuais.slice((0),(7*mult)).map(d=>d.CLOSE),7*mult-1);
     var smaM14   = Funcoes.calcularMediaMovel(dados_atuais.slice((0),(14*mult)).map(d=>d.CLOSE),14*mult-1);
     var smaM21   = Funcoes.calcularMediaMovel(dados_atuais.slice((0),(21*mult)).map(d=>d.CLOSE),21*mult-1);

     var analiseRSI = rsiM7 < 30 && rsiM14 < 30 && rsiM21 < 30 ? 'COMPRA' : (rsiM7 > 70 && rsiM14 > 70 && rsiM21 > 70 ? 'VENDA' : 'INDEFINIDO');
     var analiseMFI = mfiM7 < 30 && mfiM14 < 30 && mfiM21 < 30 ? 'COMPRA' : (mfiM7 > 70 && mfiM14 > 70 && mfiM21 > 70 ? 'VENDA' : 'INDEFINIDO');
     var analiseSMA = smaM7 > smaM14 && smaM14 > smaM21 ? 'VENDA' : (smaM7 < smaM14 && smaM14 < smaM21 ? 'COMPRA' : 'INDEFINIDO');
     var analiseTRSI= rsiM7 > rsiM14 && rsiM14 > rsiM21 ? 'VENDA' : (rsiM7 < rsiM14 && rsiM14 < rsiM21 ? 'COMPRA' : 'INDEFINIDO');
     var analiseTMFI= mfiM7 > mfiM14 && mfiM14 > mfiM21 ? 'VENDA' : (mfiM7 < mfiM14 && mfiM14 < mfiM21 ? 'COMPRA' : 'INDEFINIDO');

     // if(i < PERIODO_SEMANA )
     if(i < PERIODO_SEMANA)// || i > PERIODO_SEMANA + 5*1440 )// || i !=1445)//GARANTINDO O INTERVALO DE TEMPO E 60 MIN NO FUTURO
        continue;
      //CONFIGURAÇÕES DE COMPRA
          //COMPRA
          var preco_compra  = dado.OPEN + dado.SPREAD/CONTRATO;//ask
          var preco_venda   = (dado.HIGH + dado.LOW + 2*dado.CLOSE)/4;// - dado.SPREAD/CONTRATO;//bid
          //COMPRA
          var TP            = preco_compra + TP_SIZE * dado.SPREAD/CONTRATO;// + preco_compra *0.01;// + preco_compra * 5 * PERCENTUAL_C_V;
          var SL            = preco_compra - preco_compra*SL_SIZE;
          // var SL            = dado.OPEN - dado.OPEN*SL_SIZE;//  - preco_venda *0.01;
          //VENDA
          var preco_compra_V  = dado.OPEN - dado.SPREAD/CONTRATO;//ask
          var preco_venda_V   = (dado.HIGH + dado.LOW + 2*dado.CLOSE)/4;// - dado.SPREAD/CONTRATO;//bid
          //VENDA
          var TP_V            = preco_compra_V - TP_SIZE * dado.SPREAD/CONTRATO;// + preco_compra *0.01;// + preco_compra * 5 * PERCENTUAL_C_V;
          var SL_V            = preco_compra_V + preco_compra_V*SL_SIZE;//  - preco_venda *0.01;
          // var SL_V            = dado.OPEN + dado.OPEN*SL_SIZE;//  - preco_venda *0.01;
          var VARIACAO        = 0;
          var TRADES          = 0;

          if(STEP_OUT.ativo &&
             Number(VARIACAO) > STEP_OUT.target &&
             NEGOCIACAO_ATIVA[MOEDA_A] &&
             NEGOCIACAO_ATIVA[MOEDA_A].filter(na=>na.ativo).length > 0)
          {
            console.log("PULA FORA",dado.TIME.substring(0,10),lucro,VARIACAO,NEGOCIACAO_ATIVA[MOEDA_A].filter(na=>na.ativo).length);
            var perda = -STEP_OUT.target;
            NEGOCIACAO_ATIVA[MOEDA_A] = NEGOCIACAO_ATIVA[MOEDA_A].map(negociacao=>{return {...negociacao, ativo:false, profit:perda}});
            resultados.push(perda);
            atualizou = true;
            // lucro += perda;
            // lucro = 0;
            // console.log("LUCRO",lucro);
            // continue;
          }

          //VERIFICANDO POSICOES ABERTAS
          if(NEGOCIACAO_ATIVA[MOEDA_A] && NEGOCIACAO_ATIVA[MOEDA_A].filter(na=>na.ativo).length > 0)
          {
            var atualizou = false;
            // console.log("I",i,dado.TIME)
            //NEGOCIACAO_ATIVA[MOEDA] = {...NEGOCIACAO_ATIVA[MOEDA]}
            NEGOCIACAO_ATIVA[MOEDA_A] = NEGOCIACAO_ATIVA[MOEDA_A].map(negociacao=>{
              if(!negociacao.ativo)
                 return negociacao;

               var data = dado.TIME.substring(0,10);
              //COMPRA
              if(negociacao.tipo == 'COMPRA')
              {

                var r = ((dado.HIGH + dado.LOW + 2*dado.CLOSE)/4-negociacao.preco) * (negociacao.volume*contrato_ajustado);
                // variacoes.push(r);
                VARIACAO += r;
                if(preco_venda > negociacao.tp )
                {
                  r = (preco_venda-negociacao.preco) * (negociacao.volume*contrato_ajustado)
                  atualizou = true;
                  console.log(data,'\x1b[34m',"[COMPRA] VENDA COM LUCRO",r)//preco_venda,negociacao.preco,(preco_venda-negociacao.preco),(negociacao.volume*contrato_ajustado))
                  TRADES += 1;
                  return {...negociacao, ativo:false, profit:r}
                }
                else if( preco_venda_V < negociacao.sl ||
                        (CRUZER.ativo && r < 0 && analiseSMA == 'VENDA' && analiseTRSI == 'VENDA')
                       )
                {
                  r = (preco_venda-negociacao.preco) * (negociacao.volume*contrato_ajustado)
                  atualizou = true;
                  console.log(data,'\x1b[31m',"[COMPRA] VENDA COM PREJUIZO", r,lucro, VARIACAO)
                  TRADES += 1;
                  ciclo = ESPERA;
                  DERROTAS_DIA[dado.TIME.substring(0,10)] = true;
                  return {...negociacao, ativo:false, profit:r}
                }
              }//IF COMPRA
              else if (negociacao.tipo == 'VENDA')
              {
                var r = -((dado.HIGH + dado.LOW + 2*dado.CLOSE)/4-negociacao.preco) * (negociacao.volume*contrato_ajustado);
                // variacoes.push(r);
                VARIACAO += r;

                if(preco_venda_V < negociacao.tp )
                {
                  r = -((dado.HIGH + dado.LOW + 2*dado.CLOSE)/4-negociacao.preco) * (negociacao.volume*contrato_ajustado)
                  atualizou = true;
                  console.log(data,'\x1b[34m',"[VENDA] VENDA COM LUCRO",r)//preco_venda,negociacao.preco,(preco_venda-negociacao.preco),(negociacao.volume*contrato_ajustado))
                  TRADES += 1;
                  return {...negociacao, ativo:false, profit:r}
                }
                else if( preco_venda > negociacao.sl  ||
                       (CRUZER.ativo &&  r < 0 &&  analiseSMA == 'COMPRA' && analiseTRSI == 'COMPRA'))
                {
                  r = -((dado.HIGH + dado.LOW + 2*dado.CLOSE)/4-negociacao.preco) * (negociacao.volume*contrato_ajustado)
                  atualizou = true;
                  console.log(data,'\x1b[31m',"[VENDA] VENDA COM PREJUIZO", r,lucro, VARIACAO)
                  TRADES += 1;
                  ciclo = ESPERA;
                  DERROTAS_DIA[dado.TIME.substring(0,10)] = true;
                  return {...negociacao, ativo:false, profit:r}
                }
              }
              return negociacao;



            })//fim do map
            // console.log("VARIACAO",Number(lucro),Number(VARIACAO), Number(lucro) + Number(VARIACAO));
            variacoes.push(VARIACAO);



            var lucro =(vendas[0] + resultados.reduce((acum,next)=>acum+next,0)).toFixed(2);

            // var trades = 0:
            LUCRO_DIA[dado.TIME.substring(0,10)] = LUCRO_DIA[dado.TIME.substring(0,10)] ?  LUCRO_DIA[dado.TIME.substring(0,10)] : 0 ;
            LUCRO_DIA[dado.TIME.substring(0,10)] = Number( lucro );

            TRADES_DIA[dado.TIME.substring(0,10)] = TRADES_DIA[dado.TIME.substring(0,10)] ? TRADES_DIA[dado.TIME.substring(0,10)] : 0;
            TRADES_DIA[dado.TIME.substring(0,10)] += TRADES;



            // console.log(TRADES_DIA)
            if( Number(lucro) + Number(VARIACAO) < 0)
            {
              console.log('\x1b[31m',`\n\n QUEBROU!!\n\n LUCRO=${lucro} VARIACAO=${VARIACAO}\n\n`,"\x1b[37m");
              return;
              break;
            }
            //CÁLCULO PROFIT
            if(atualizou)
            {
              var resultados = NEGOCIACAO_ATIVA[MOEDA_A].filter(na=>!na.ativo).map(n=>Number(''+n.profit) );
              var lucro = (vendas[0] + resultados.reduce((acum,next)=>acum+next,0)).toFixed(2);
              vendas.push(Number(lucro) ) ;
              resultados.push(resultados[resultados.length-1] )
              if(resultados[resultados.length-1] > 0)
              {
                trades_positivos += 1;
                // trades_recuperacao += 1;
              }
              else
              {
                  // trades_positivos = trades_positivos;
                  trades_positivos = 0;
                  DERROTAS_DIA[dado.TIME.substring(0,10)] = true;
                //trades_positivos   = TRADES_INTERVAL*3//*10/BERSERK;
                // trades_recuperacao = 0;
              }
              console.log(`[${i}] Lucro`,lucro,trades_positivos);//,dado.OPEN,dado.SPREAD/CONTRATO,dado.OPEN + dado.SPREAD/CONTRATO);
            }
          }


          // console.log("d[0].TIME",dados[i].TIME)
          //ABRINDO NOVAS POSIÇÔES
          if(i%ciclo == 0 && (!NEGOCIACAO_ATIVA[MOEDA_A] || NEGOCIACAO_ATIVA[MOEDA_A].filter(na=>na.ativo).length < BOTS_ATIVOS) )
          {
            ciclo = CICLO;
            //if(SKIP_DAY && DERROTAS_DIA[dado.TIME.substring(0,10)]){
            if(SKIP_DAY && TRADES_DIA[dado.TIME.substring(0,10)]){
              //console.log("TRADES_DIA",DERROTAS_DIA);
              continue;
            }

            // var recomendacao    =  await new Promise((resolve,reject)=>resolve(false));//await IAPredict(MOEDA,d);
            var recomendacao    =  await IAPredict(MOEDA_A,dados_atuais);
            var recomendacaoV   =  await IAPredict(MOEDA_A,dados_atuais,'VENDA');
            // console.log("recomendacao",recomendacao)
            // console.log(dados_atuais[0].TIME, dados_atuais[dados_atuais.length-1].TIME,recomendacao,recomendacaoV,i-PERIODO_SEMANA,i)
            //INICADORES
            mult = CRUZER.tripple*1;//H4
            rsiM7    = Funcoes.calcularRSI(dados_atuais.slice((0),(7*mult)).map(d=>d.CLOSE),7*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
            rsiM14   = Funcoes.calcularRSI(dados_atuais.slice((0),(14*mult)).map(d=>d.CLOSE),14*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
            rsiM21   = Funcoes.calcularRSI(dados_atuais.slice((0),(21*mult)).map(d=>d.CLOSE),21*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS

            mfiM7    = Funcoes.calcularMFI(dados_atuais.slice((0),(7*mult)).map(d=>d.CLOSE),dados_atuais.slice((0),(7*mult)).map(d=>d.TICK_VOLUME),7*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
            mfiM14   = Funcoes.calcularMFI(dados_atuais.slice((0),(14*mult)).map(d=>d.CLOSE),dados_atuais.slice((0),(14*mult)).map(d=>d.TICK_VOLUME),14*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS
            mfiM21   = Funcoes.calcularMFI(dados_atuais.slice((0),(21*mult)).map(d=>d.CLOSE),dados_atuais.slice((0),(21*mult)).map(d=>d.TICK_VOLUME),21*mult-1);//MÉDIA MÓVEL DOS ÚLTIMOS 5 PERÍODOS

            smaM7    = Funcoes.calcularMediaMovel(dados_atuais.slice((0),(7*mult)).map(d=>d.CLOSE),7*mult-1);
            smaM14   = Funcoes.calcularMediaMovel(dados_atuais.slice((0),(14*mult)).map(d=>d.CLOSE),14*mult-1);
            smaM21   = Funcoes.calcularMediaMovel(dados_atuais.slice((0),(21*mult)).map(d=>d.CLOSE),21*mult-1);

            analiseRSI = rsiM7 < 30 && rsiM14 < 30 && rsiM21 < 30 ? 'COMPRA' : (rsiM7 > 70 && rsiM14 > 70 && rsiM21 > 70 ? 'VENDA' : 'INDEFINIDO');
            analiseMFI = mfiM7 < 30 && mfiM14 < 30 && mfiM21 < 30 ? 'COMPRA' : (mfiM7 > 70 && mfiM14 > 70 && mfiM21 > 70 ? 'VENDA' : 'INDEFINIDO');
            analiseSMA = smaM7 > smaM14 && smaM14 > smaM21 ? 'VENDA' : (smaM7 < smaM14 && smaM14 < smaM21 ? 'COMPRA' : 'INDEFINIDO');
            analiseTRSI= rsiM7 > rsiM14 && rsiM14 > rsiM21 ? 'VENDA' : (rsiM7 < rsiM14 && rsiM14 < rsiM21 ? 'COMPRA' : 'INDEFINIDO');
            analiseTMFI= mfiM7 > mfiM14 && mfiM14 > mfiM21 ? 'VENDA' : (mfiM7 < mfiM14 && mfiM14 < mfiM21 ? 'COMPRA' : 'INDEFINIDO');

            // console.log(`[${MOEDA}] recomendacao MFI SMA 7 14 21`,recomendacao,analiseMFI,analiseSMA);//,mfiM7.toFixed(4),mfiM14.toFixed(4),mfiM21.toFixed(4));
            // console.log(`[${MOEDA}] SMA 7 14 21`,analiseSMA);//,smaM7.toFixed(4),smaM14.toFixed(4),smaM21.toFixed(4));

            // else if(recomendacao == 'VAI PERDER' || recomendacao == 'VAI PERDER 3 OU 4 X')
            // else if(analiseTRSI == 'VENDA' && analiseSMA == 'VENDA' )


            // console.log("DERROTA_DIA",DERROTAS_DIA)


            // if(recomendacao == 'DEVE GANHAR 3 OU 4 X' && i % 30 == 0)
            // if(true)
            // if(analiseTRSI == 'COMPRA' && analiseSMA == 'COMPRA')// || recomendacaoV == 'DEVE GANHAR 3 OU 4 X')
          //console.log("recomendacao",recomendacao,"analise",analiseTRSI)
          if(recomendacao.compra /*&& analiseTRSI == 'COMPRA'*/)/*|| (analiseTRSI == 'COMPRA' && analiseSMA == 'COMPRA')*/ // || recomendacaoV == 'DEVE GANHAR 3 OU 4 X')
            // if(recomendacao == 'DEVE GANHAR 3 OU 4 X')// || recomendacaoV == 'DEVE GANHAR 3 OU 4 X')
          {
            //console.log("COMPRE!!","recomendacao",recomendacao,"analise",analiseSMA,"Negociações ativas",NEGOCIACAO_ATIVA[MOEDA_A] ? NEGOCIACAO_ATIVA[MOEDA_A].filter(a=>a.ativo).length+1 : 0)
                if(trades_positivos >= TRADES_INTERVAL)
                {
                  console.log("\x1b[32m","\nBERSERK!!!\n","\x1b[37m")//,d.map(dd=>d.TIME));
                }

                var tipo    =  'COMPRA';//recomendacao == 'DEVE GANHAR 3 OU 4 X' ? 'COMPRA' : 'VENDA';
                var volume  = ( trades_positivos >= TRADES_INTERVAL
                               ? VOLUME[MOEDA_A] * BERSERK : VOLUME[MOEDA_A]);
                trades_positivos = trades_positivos >= TRADES_INTERVAL? trades_positivos - TRADES_INTERVAL : trades_positivos;

                var negociacoes_ativas = NEGOCIACAO_ATIVA[MOEDA_A] ? NEGOCIACAO_ATIVA[MOEDA_A] : [];
                //COMPRA
                var nova_negociacao = {moeda:MOEDA_A,preco:preco_compra,tipo:tipo,tp:TP,sl:SL,volume:volume,profit:Number(''+(preco_venda-preco_compra) * (VOLUME[MOEDA_A]*CONTRATO*2)).toFixed(2), ativo:true};//(preco_compra) * (VOLUME[MOEDA]*CONTRATO)
                //VENDA
                // var nova_negociacao = {preco:preco_compra_V,tipo:tipo,tp:TP_V,sl:SL_V,volume:volume,profit:Number(''+(preco_venda_V-preco_compra_V) * (VOLUME[MOEDA_A]*CONTRATO*2)).toFixed(2), ativo:true};//(preco_compra) * (VOLUME[MOEDA]*CONTRATO)
                negociacoes_ativas.push(nova_negociacao)
                NEGOCIACAO_ATIVA[MOEDA_A] = negociacoes_ativas;
                //console.log("I",i,"COMPRA",NEGOCIACAO_ATIVA);
                // return;
            }
            if((recomendacao.venda/*== 'VENDA'*/ /*|| analiseTRSI == 'VENDA' && analiseSMA == 'VENDA'*/))
            {

            //  console.log("VENDA!!","recomendacao",recomendacao,"analise",analiseSMA,"Negociações ativas",NEGOCIACAO_ATIVA[MOEDA_A] ? NEGOCIACAO_ATIVA[MOEDA_A].filter(a=>a.ativo).length+1 : 0)
              if(trades_positivos >= TRADES_INTERVAL)
              {
                console.log("BERSERK!!!")//,d.map(dd=>d.TIME));
              }

              var tipo    =  'VENDA';//recomendacao == 'DEVE GANHAR 3 OU 4 X' ? 'COMPRA' : 'VENDA';
              var volume  = ( trades_positivos >= TRADES_INTERVAL
                             ? VOLUME[MOEDA_A] * BERSERK : VOLUME[MOEDA_A]);
              trades_positivos = trades_positivos >= TRADES_INTERVAL? trades_positivos - TRADES_INTERVAL : trades_positivos;

              var negociacoes_ativas = NEGOCIACAO_ATIVA[MOEDA_A] ? NEGOCIACAO_ATIVA[MOEDA_A] : [];
              var nova_negociacao = {preco:preco_compra_V,tipo:tipo,tp:TP_V,sl:SL_V,volume:volume,profit:Number(''+(preco_venda_V-preco_compra_V) * (VOLUME[MOEDA_A]*CONTRATO*2)).toFixed(2), ativo:true};//(preco_compra) * (VOLUME[MOEDA]*CONTRATO)
              negociacoes_ativas.push(nova_negociacao)
              NEGOCIACAO_ATIVA[MOEDA_A] = negociacoes_ativas;
              // console.log("I",i,"COMPRA",NEGOCIACAO_ATIVA);
            }
            else{
              continue;
            }

            // else {
            //   console.log(`[${MOEDA}] recomendacao MFI SMA 7 14 21`,recomendacaoV,analiseRSI,analiseSMA);//,mfiM7.toFixed(4),mfiM14.toFixed(4),mfiM21.toFixed(4));
            //   }


          }
};//FIM DO FOR DADOS
/*

//COMPRA
var taxa_acerto_geral  = (100*(resultados.filter(r=>r.resultado && r.tipo=='COMPRA').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
var ganho_acumulado    = 3*resultados.filter(r=>r.resultado && r.tipo=='COMPRA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);
var perda_acumulada    = 3*resultados.filter(r=>r.resultado === false && r.resultado !== undefined && r.tipo=='COMPRA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);
var saldo_acumulado    = 3*resultados.filter(r=>r.resultado !== undefined && r.tipo=='COMPRA').map(r=>r.lucro).reduce((acum,next)=>acum+next,0);

var saldo_evolucao = [50]
resultados.filter(r=>r.resultado !== undefined && r.tipo=='COMPRA').map(r=>r.lucro).map(l=>saldo_evolucao.push(saldo_evolucao[saldo_evolucao.length-1]+Number(l.toFixed(2)) ))

var taxa_perda_geral   = (100*(resultados.filter(r=>!r.resultado && r.resultado != undefined && r.tipo=='COMPRA').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);
var taxa_indefinida    = (100*(resultados.filter(r=>r.resultado === undefined && r.tipo=='COMPRA').length/resultados.filter(r=> r.tipo == 'COMPRA').length)).toFixed(2);

// saldo_evolucao.map((se,i)=>{
//   console.log("SALDO EVOLUCAO",i,se);
// });

console.log("saldo_evolucao",saldo_evolucao.length)
console.log("=============QTD=============\n\t\t", resultados.filter(r=> r.tipo == 'COMPRA').length)
console.log("=============TAXA DE ACERTO GERAL=============\n\t\t", taxa_acerto_geral )
console.log("=============TAXA DE PERDA GERAL=============\n\t\t", taxa_perda_geral )
console.log("=============TAXA INDEFINIDA=============\n\t\t", taxa_indefinida,'\n\n' )
console.log("=============GANHO ACUMULADO=============\n\t\t$", ganho_acumulado.toFixed(2) )
console.log("=============PERDA ACUMULADA=============\n\t\t$", perda_acumulada.toFixed(2),'\n\n' )
console.log("=============SALDO ACUMULADO=============\n\t\t$", saldo_acumulado.toFixed(2),'\n\n' )


var r = Funcoes.calcularEstatisticas(saldo_evolucao);
console.log("ESTATISTICAS",r)
*/

// LUCRO_DIA['11/05/2024']=12;
// LUCRO_DIA['12/05/2024']=-5;
var lucro_diario = Object.keys(LUCRO_DIA).map(dia=>{
  return LUCRO_DIA[dia];
})
var trade_diario = Object.keys(LUCRO_DIA).map(dia=>{
  return TRADES_DIA[dia];
})
console.log("vendas",vendas,'resultados',resultados,'variacoes',variacoes,'lucro_diario',lucro_diario,'trade_diario',trade_diario);

console.log('LUCRO DIÁRIO');
console.log(asciichart.plot ([lucro_diario], { height: 6,  colors: [
        asciichart.blue,
        // asciichart.green,
    ] })) ;
console.log('QTD_TRADES_DIA');
console.log(asciichart.plot ([trade_diario], { height: 6,  colors: [
        // asciichart.blue,
        asciichart.green,
    ] })) ;
console.log("QTD",NEGOCIACAO_ATIVA[MOEDA_A].length)
var lucro_final = NEGOCIACAO_ATIVA[MOEDA_A].filter(na=>!na.ativo).map(n=>Number(''+n.profit) ).reduce((acum,next)=>acum+next,0);
console.log("=============SALDO=============\n\t\t$", lucro_final.toFixed(2),'R$', (lucro_final * 5.9).toFixed(2) )

console.log("\n\nESTATISTICAS DA EVOLUÇÃO DO LUCRO",Funcoes.calcularEstatisticas(vendas));
console.log("ESTATISTICAS DAS VARIACOES",Funcoes.calcularEstatisticas(variacoes));
console.log("=============WIN/LOSS=============\n\t\t", resultados.filter(r=>r>0).length,resultados.filter(r=>r<0).length)
console.log("=============WIN/LOSS RATIO=============\n\t\t", (resultados.filter(r=>r>0).length/resultados.filter(r=>r<0).length).toFixed(2))
console.log("ESTATISTICAS DAS NEGOCIAÇÕES",Funcoes.calcularEstatisticas(resultados));
}//fim do backTest
/*
  INPUTS: eu vou usar últimos 15 min de OPEN, CLOSE, HIGH, LOW (60 colunas).
  Vou usar RSI, Média Móvel, Outros 4-5 indicadores dos últimos 15 min agrupados
  Vou usar RSI, MEDIA MÓVEL, OPEN, CLOSE, HIGH e LOW de 15 min, 30 min, 1h, 4h, 1D

  Output:
  se em até 1h eu consigo o profit que eu quero (ex: $1)

  UMA IA pra entrar e outra pra saber se o tombo vai ser grande
*/
montarBase('GOLD');return;
 //teste();
// carregarDados();
// buscaTarget(3,0.015);

// backTest(
//   {
//     MOEDA_A     :'GOLD',//USDJPY GOLD EURUSD ETHUSD BTCUSD USDJPY GBPUSD EURGBP USDCHF
//     TP_SIZE     :5,//3x o SPREAD
//     SL_SIZE     :0.01,//1,5%
//     BANCA       :5000,//em dólares
//     VOLUME_A    :0.01,
//     CICLO       :5,
//     ESPERA      :5,
//     INTERVALO   :6, //6 PERÍODOS POSITIVOS
//     BERSERK     :1,//AUMENTA X vezes
//     BOTS_ATIVOS :1,
//     SKIP_DAY    :false,
//     STEP_OUT    :{ativo:false, target:20},
//     CRUZER      :{ativo:false,interval:60*4,tripple:5}
//   }
// );

module.exports = {
  IAPredict
}
