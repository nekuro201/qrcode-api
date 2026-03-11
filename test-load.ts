import autocannon from "autocannon";

async function runTest() {
  const connections = 50;
  const totalRequests = 500;

  console.log(
    `🚀 Iniciando teste de carga: ${totalRequests} requisições simultâneas com ${connections} connections...`,
  );

  try {
    const result = await autocannon({
      url: "http://localhost:3000/simular-ticket",
      connections: connections,
      amount: totalRequests,
      method: "GET",
    });

    console.log("\n--- RESULTADO DO TESTE ---");
    console.log(`Requisições Totais: ${result.requests.sent}`);
    console.log(`Tempo Médio (Latency): ${result.latency.average} ms`);
    console.log(`Máximo (Max Latency): ${result.latency.max} ms`);
    console.log(`Requisições/Seg: ${result.requests.average}`);
    console.log(`Erros (Non-2xx): ${result.non2xx}`);
    console.log("--------------------------\n");
  } catch (err) {
    console.error("Erro ao executar o teste:", err);
  }
}

runTest();
