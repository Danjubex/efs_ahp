const normalizar_valor = (arr) =>
{
  // console.log(vetor);
  //para cada input:
  //se for classe, ordenar e normalizar
  //se for numérico, encontrar o máximo e o mínimo e normalizar

  var class_mad = arr.map(v=>v.CLASS_MAD);
  // console.log('MAX',MAX,'MIN',MIN,'class_mad',class_mad)
  var class_mad_norm = normalizar(arr.map(v=>v.CLASS_MAD));
  var class_mad_hist_norm = normalizar(arr.map(v=>v.CLASS_MAD_HIST_TALHAO));
  var influencia_vizinhos_norm = normalizar(arr.map(v=>v.INFLUENCIA_VIZINHOS));
  var descontrole_vizinhanca_norm = normalizar(arr.map(v=>v.DESCONTROLE_VIZINHANCA));
  // var horas_norm = normalizar(arr.map(v=>v.HORAS));
  var fazenda_distinct = normalizar_classe(arr.map(v=>v.FAZENDA));
  var variedade_distinct = normalizar_classe(arr.map(v=>v.VARIEDADE));
  var fase_distinct = normalizar_classe(arr.map(v=>v.FASE));
  var talhao_distinct = normalizar_classe(arr.map(v=>v.TALHAO));


  var QTD_SERVICO_MOSCA_norm = normalizar(arr.map(v=>v.QTD_SERVICO_MOSCA),'QTD_SERVICO_MOSCA');
  var MIN_TEMP_norm = normalizar(arr.map(v=>v.MIN_TEMP));
  var MAX_TEMP_norm = normalizar(arr.map(v=>v.MAX_TEMP));
  var AVG_TEMP_norm = normalizar(arr.map(v=>v.AVG_TEMP));
  var STD_TEMP_norm = normalizar(arr.map(v=>v.STD_TEMP));
  var ACUMULADO_TEMP_norm = normalizar(arr.map(v=>v.ACUMULADO_TEMP));
  var FRUTOS_VIZINHOS_norm = normalizar(arr.map(v=>v.FRUTO_VIZINHO),'FRUTO_VIZINHO');
  // var MIN_UMI_norm = normalizar(arr.map(v=>v.MIN_UMI));
  // var MAX_UMI_norm = normalizar(arr.map(v=>v.MAX_UMI));
  // var AVG_UMI_norm = normalizar(arr.map(v=>v.AVG_UMI));
  // var STD_UMI_norm = normalizar(arr.map(v=>v.STD_UMI));
  // var ACUMULADO_UMI_norm = normalizar(arr.map(v=>v.ACUMULADO_UMI));
  // var MIN_PRESSAO_norm = normalizar(arr.map(v=>v.MIN_PRESSAO));
  // var MAX_PRESSAO_norm = normalizar(arr.map(v=>v.MAX_PRESSAO));
  // var AVG_PRESSAO_norm = normalizar(arr.map(v=>v.AVG_PRESSAO));
  // var STD_PRESSAO_norm = normalizar(arr.map(v=>v.STD_PRESSAO));
  // var ACUMULADO_PRESSAO_norm = normalizar(arr.map(v=>v.ACUMULADO_PRESSAO));
  // var MIN_VEL_VENTO_norm = normalizar(arr.map(v=>v.MIN_VEL_VENTO));
  // var MAX_VEL_VENTO_norm = normalizar(arr.map(v=>v.MAX_VEL_VENTO));
  // var AVG_VEL_VENTO_norm = normalizar(arr.map(v=>v.AVG_VEL_VENTO));
  // var STD_VEL_VENTO_norm = normalizar(arr.map(v=>v.STD_VEL_VENTO));
  // var ACUMULADO_VEL_VENTO_norm = normalizar(arr.map(v=>v.ACUMULADO_VEL_VENTO));
  // var MIN_DIR_VENTO_norm = normalizar(arr.map(v=>v.MIN_DIR_VENTO));
  // var MAX_DIR_VENTO_norm = normalizar(arr.map(v=>v.MAX_DIR_VENTO));
  // var AVG_DIR_VENTO_norm = normalizar(arr.map(v=>v.AVG_DIR_VENTO));
  // var STD_DIR_VENTO_norm = normalizar(arr.map(v=>v.STD_DIR_VENTO));
  // var ACUMULADO_DIR_VENTO_norm = normalizar(arr.map(v=>v.ACUMULADO_DIR_VENTO));
  // var MIN_NEBULOSIDADE_norm = normalizar(arr.map(v=>v.MIN_NEBULOSIDADE));
  // var MAX_NEBULOSIDADE_norm = normalizar(arr.map(v=>v.MAX_NEBULOSIDADE));
  // var AVG_NEBULOSIDADE_norm = normalizar(arr.map(v=>v.AVG_NEBULOSIDADE));
  // var STD_NEBULOSIDADE_norm = normalizar(arr.map(v=>v.STD_NEBULOSIDADE));
  // var ACUMULADO_NEBULOSIDADE_norm = normalizar(arr.map(v=>v.ACUMULADO_NEBULOSIDADE));
  // var MIN_INSOLACAO_norm = normalizar(arr.map(v=>v.MIN_INSOLACAO));
  // var MAX_INSOLACAO_norm = normalizar(arr.map(v=>v.MAX_INSOLACAO));
  // var AVG_INSOLACAO_norm = normalizar(arr.map(v=>v.AVG_INSOLACAO));
  // var STD_INSOLACAO_norm = normalizar(arr.map(v=>v.STD_INSOLACAO));
  // var ACUMULADO_INSOLACAO_norm = normalizar(arr.map(v=>v.ACUMULADO_INSOLACAO));
  // var ACUMULADO_CHUVA_norm = normalizar(arr.map(v=>v.ACUMULADO_CHUVA));


  // console.log("fase_distinct",fase_distinct,"fase",arr[1].FASE, ( fase_distinct.indexOf(arr[1].FASE) - 0 )/(fase_distinct.length))
  return arr.map((a,i)=>{
    return {
      ...a,
      CLASS_MAD:class_mad_norm[i],
      CLASS_MAD_HIST_TALHAO:class_mad_hist_norm[i],
      INFLUENCIA_VIZINHOS:influencia_vizinhos_norm[i],
      DESCONTROLE_VIZINHANCA:descontrole_vizinhanca_norm[i],
      FASE: ( fase_distinct.indexOf(a.FASE) - 0 )/(fase_distinct.length),
      FAZENDA_NORMALIZADA: ( fazenda_distinct.indexOf(a.FAZENDA) - 0 )/(fazenda_distinct.length),
      VARIEDADE: ( variedade_distinct.indexOf(a.VARIEDADE) - 0 )/(variedade_distinct.length),
      TALHAO_NORMALIZADO: ( talhao_distinct.indexOf(a.TALHAO) - 0 )/(talhao_distinct.length),

      FRUTOS_VIZINHOS: FRUTOS_VIZINHOS_norm[i],
      QTD_SERVICO_MOSCA:QTD_SERVICO_MOSCA_norm[i],
      MIN_TEMP:MIN_TEMP_norm[i],
      MAX_TEMP:MAX_TEMP_norm[i],
      AVG_TEMP:AVG_TEMP_norm[i],
      STD_TEMP:STD_TEMP_norm[i],
      ACUMULADO_TEMP:ACUMULADO_TEMP_norm[i],
      // MIN_UMI:MIN_UMI_norm[i],
      // MAX_UMI:MAX_UMI_norm[i],
      // AVG_UMI:AVG_UMI_norm[i],
      // STD_UMI:STD_UMI_norm[i],
      // ACUMULADO_UMI:ACUMULADO_UMI_norm[i],
      // MIN_PRESSAO:MIN_PRESSAO_norm[i],
      // MAX_PRESSAO:MAX_PRESSAO_norm[i],
      // AVG_PRESSAO:AVG_PRESSAO_norm[i],
      // STD_PRESSAO:STD_PRESSAO_norm[i],
      // ACUMULADO_PRESSAO:ACUMULADO_PRESSAO_norm[i],
      // MIN_VEL_VENTO:MIN_VEL_VENTO_norm[i],
      // MAX_VEL_VENTO:MAX_VEL_VENTO_norm[i],
      // AVG_VEL_VENTO:AVG_VEL_VENTO_norm[i],
      // STD_VEL_VENTO:STD_VEL_VENTO_norm[i],
      // ACUMULADO_VEL_VENTO:ACUMULADO_VEL_VENTO_norm[i],
      // MIN_DIR_VENTO:MIN_DIR_VENTO_norm[i],
      // MAX_DIR_VENTO:MAX_DIR_VENTO_norm[i],
      // AVG_DIR_VENTO:AVG_DIR_VENTO_norm[i],
      // STD_DIR_VENTO:STD_DIR_VENTO_norm[i],
      // ACUMULADO_DIR_VENTO:ACUMULADO_DIR_VENTO_norm[i],
      // MIN_NEBULOSIDADE:MIN_NEBULOSIDADE_norm[i],
      // MAX_NEBULOSIDADE:MAX_NEBULOSIDADE_norm[i],
      // AVG_NEBULOSIDADE:AVG_NEBULOSIDADE_norm[i],
      // STD_NEBULOSIDADE:STD_NEBULOSIDADE_norm[i],
      // ACUMULADO_NEBULOSIDADE:ACUMULADO_NEBULOSIDADE_norm[i],
      // MIN_INSOLACAO:MIN_INSOLACAO_norm[i],
      // MAX_INSOLACAO:MAX_INSOLACAO_norm[i],
      // AVG_INSOLACAO:AVG_INSOLACAO_norm[i],
      // STD_INSOLACAO:STD_INSOLACAO_norm[i],
      // ACUMULADO_INSOLACAO:ACUMULADO_INSOLACAO_norm[i],
      // ACUMULADO_CHUVA:ACUMULADO_CHUVA_norm[i]
      // HORAS:horas_norm[i],
    }
  })
  // return
  // return arr;

}//fim da funcao normalizar_valor
const normalizar_classe = (vetor) =>{
    // console.log('vetor',vetor)
    var distintos = vetor.filter((value, index, self) => self.indexOf(value) === index )
    return distintos.sort(); //console.log('distintos',)
}

const normalizar = (vetor, nome) =>{
  var MAX = Math.max(...vetor);
  var MIN = Math.min(...vetor);
    // console.log("MAX",MAX,'MIN',MIN);
  return vetor.map(v=>{

    // if(nome == 'FRUTO_VIZINHO')
    //   console.log("nome",nome,(v - MIN)/(MAX - MIN),"MAX",MAX,'MIN',MIN );
      return (v - MIN)/(MAX - MIN);
      // return (2*((v-MIN)/(MAX-MIN)) - 1);
  });
}

const normalizar_numeric = (vetor, v) =>{
  var MAX = Math.max(...vetor);
  var MIN = Math.min(...vetor);
  // console.log("V",v,MIN,MAX,'(v - MIN)/(MAX - MIN)',(v - MIN)/(MAX - MIN))
  return (v - MIN)/(MAX - MIN);
}

const desnormalizar = (vetor, n) =>{
  var MAX = Math.max(...vetor);
  var MIN = Math.min(...vetor);
  // console.log("V",v,MIN,MAX,'(v - MIN)/(MAX - MIN)',(v - MIN)/(MAX - MIN))
  return n*(MAX - MIN) + MIN;
}
module.exports = {
  normalizar_valor:normalizar_valor,
  normalizar_numeric:normalizar_numeric,
  desnormalizar:desnormalizar
}
