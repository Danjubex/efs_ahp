const matrizComparacaoDecisor1 = [
  [1    	,8    	,9    	,1],
  [1/8	  ,1    	,3	    ,3],
  [1/9	  ,1/6    ,1    	,1/9],
  [1    	,1/3   	,9	    ,1]
];



function calcularPesos(matriz) {
  const n = matriz.length;
  const pesos = [];

  for (let i = 0; i < n; i++) {
    let somaColuna = 0;
    for (let j = 0; j < n; j++) {
      somaColuna += 1/matriz[j][i];
    }

    const peso = somaColuna / n;
    pesos.push(peso);
  }

  return pesos;
}

function calcularPesosNormalizados(matriz) {
  const pesos = calcularPesos(matriz);
  const somaPesos = pesos.reduce((soma, peso) => soma + peso, 0);
  var pesosReais = pesos.map((peso) => peso / somaPesos);
  return pesosReais;

  var pesoMax = Math.max(...pesosReais);
  var pesoMin = Math.min(...pesosReais);

  console.log("pesoMax",pesoMax,"pesoMin",pesoMin,pesosReais);
  return pesosReais.map((peso) => (peso - pesoMin)/(pesoMax - pesoMin) );

}

function ordenarCritérios(pesos, critérios) {
  const critériosComPesos = critérios.map((critério, index) => ({
    critério,
    peso: pesos[index]
  }));

  console.log("critériosComPesos",critériosComPesos)

  critériosComPesos.sort((a, b) => b.peso - a.peso);

  return critériosComPesos.map((item) => item.critério);
}


function calcularPesosConsolidados(matrizes) {
  const n = matrizes[0].length;
  var pesosConsolidados = Array(n).fill(1);
/*
  for (const matriz of matrizes) {
    for (let i = 0; i < n; i++) {
      let somaColuna = 0;
      for (let j = 0; j < n; j++) {
        somaColuna += matriz[j][i];
        console.log("i",i,"j",j,"matriz[j][i]",matriz[j][i])
      }

      pesosConsolidados[i] *= somaColuna/3;
    }
  }*/
  pesosConsolidados = pesosConsolidados.map((feature,i)=>{
    console.log('matrizes[0][i]',matrizes[0][i])
      return (matrizes[0][i] + matrizes[1][i] + matrizes[2][i])/3
  })
  return pesosConsolidados;
  const somaPesos = pesosConsolidados.reduce((soma, peso) => soma + peso, 0);
  /*
  var pesosReais = pesosConsolidados.map((peso) => peso / somaPesos);
  var pesoMax = Math.max(...pesosReais);
  var pesoMin = Math.min(...pesosReais);
  console.log("pesoMax",pesoMax,"pesoMin",pesoMin,pesosReais);
  return pesosReais.map((peso) => 1 - (peso - pesoMin)/(pesoMax - pesoMin) );
  */
  return pesosConsolidados.map((peso) => peso / somaPesos);
}

function calcuarRazaoDeConsistencia(matriz)
{

      const n = matriz.length; // Ordem da matriz

      // Normalização da Matriz
      const pesosNormalizados = matriz.map(coluna => coluna.reduce((soma, valor) => soma + valor, 0));

      // Cálculo do Vetor Próprio
      const vetorProprio = matriz.map((coluna, i) => coluna.map(valor => valor / pesosNormalizados[i]));
      const mediaLinhas = vetorProprio.map(linha => linha.reduce((soma, valor) => soma + valor, 0) / n);

      // Cálculo do Valor Próprio
      const valorProprio = matriz.map((linha, i) => linha.map((valor, j) => valor * vetorProprio[j][i]).reduce((soma, valor) => soma + valor, 0));
      valorProprio.forEach((valor, i) => valorProprio[i] /= mediaLinhas[i]);
      const somaValorProprio = valorProprio.reduce((soma, valor) => soma + valor, 0);

      // Cálculo da Razão de Consistência (RC)
      const RC = (somaValorProprio - n) / (n - 1);

      // console.log("Razão de Consistência (RC):", RC);
      return RC;

}//calcuarRazaoDeConsistencia


function main() {
  const critérios = [
    "VARIEDADE",
    "DISTANCIA_DIAS",
    "ORDEM",
    "CALIBRES"
  ];

  const pesosNormalizadosDecisor1 = calcularPesosNormalizados(matrizComparacaoDecisor1);
  // const pesosNormalizadosDecisor2 = calcularPesosNormalizados(matrizComparacaoDecisor2);
  // const pesosNormalizadosDecisor3 = calcularPesosNormalizados(matrizComparacaoDecisor3);

  console.log("Pesos normalizados dos critérios pelo Decisor 1:");
  console.log(pesosNormalizadosDecisor1);

  // console.log("\nPesos normalizados dos critérios pelo Decisor 2:");
  // console.log(pesosNormalizadosDecisor2);


  // console.log("\nPesos normalizados dos critérios pelo Decisor 3:");
  // console.log(pesosNormalizadosDecisor3);

  // const pesosConsolidados = calcularPesosConsolidados([pesosNormalizadosDecisor1, pesosNormalizadosDecisor2, pesosNormalizadosDecisor3]);

  // console.log("\nPesos consolidados dos critérios após a decisão em grupo:");
  // console.log(pesosConsolidados);

  const critériosOrdenados = ordenarCritérios(pesosNormalizadosDecisor1, critérios);


  console.log("\nCritérios ordenados por importância:");
  console.log(critériosOrdenados);

  console.log('\nRazão de Consistência (RC) DECISOR 1',calcuarRazaoDeConsistencia(matrizComparacaoDecisor1))
  // console.log('\nRazão de Consistência (RC) DECISOR 2',calcuarRazaoDeConsistencia(matrizComparacaoDecisor2))
  // console.log('\nRazão de Consistência (RC) DECISOR 3',calcuarRazaoDeConsistencia(matrizComparacaoDecisor3))
}

main();
