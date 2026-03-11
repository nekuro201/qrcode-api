# QR Code Ticket API 🎫

API robusta desenvolvida em Node.js para geração de ingressos digitais com QR Code e códigos de contingência legíveis. O projeto foi otimizado para rodar em ambientes conteinerizados (Docker) com foco em alta performance e baixo consumo de recursos.

## 🚀 Tecnologias

* **Fastify:** Framework web focado em performance e baixa latência.
* **TypeScript:** Tipagem estática para maior segurança no desenvolvimento.
* **QRCode (npm):** Biblioteca para geração das imagens dos tickets.
* **Docker & Docker Compose:** Orquestração e isolamento do ambiente.
* **TSX:** Execução rápida de TypeScript em desenvolvimento.

---

## 🛠️ Como Rodar Localmente

### Pré-requisitos
* Node.js (v20 ou superior)
* pnpm (`npm install -g pnpm`)

### Instalação e Execução
1. Instale as dependências:
  ```bash
    pnpm install
  ```

2. Inicie o servidor em modo de desenvolvimento (watch mode):
  ```bash
    pnpm dev
  ```
  A API estará disponível em http://localhost:3000.
  
## 🐳 Como Rodar via Docker (Produção)

O projeto utiliza um Multi-stage Build para garantir uma imagem final leve e segura, contendo apenas o JavaScript compilado.

Construa e suba o container:
  ```bash
    docker compose up -d --build
  ```

## 📈 Testes de Carga & Performance

Durante a fase de testes, validamos o comportamento da API sob estresse:

 - Cenário: 50 requisições simultâneas (Total 500 requisições).
 - Média de Latência: ~350ms - 450ms (gerando QR Code de 200px).
 - Vazão: ~125 requisições/segundo.
 - Estabilidade: 0% de erro em ambiente limitado a 0.5 CPU.

Para rodar o teste de carga novamente:
```bash
pnpm exec tsx test-load.ts
```

## 🟢 Endpoints Principais

 - `GET /preview/:id` - Visualização HTML do ingresso.
 - `GET /simular-ticket` - Endpoint otimizado para testes de carga (retorna JSON).

## 💡 Estrátegia de escabilidade

### Escalonamento por Réplicas (Nativo do Coolify)

- O Coolify permite que você defina o número de "Instâncias" (Replicas) de um serviço.
- O Coolify sobe 2, 3 ou 10 containers idênticos da sua imagem Docker.
- Load Balancer: O Coolify usa o Traefik como porta de entrada. Ele recebe o tráfego na porta 80/443 e distribui para os seus containers.

### Escalonamento por Filas (Background Jobs) - A "Prova de Balas"

- Para um sistema de ingressos, o maior perigo não é a CPU, mas sim o bloqueio. Se 10.000 pessoas tentarem gerar QR Codes ao mesmo tempo, a API pode ficar lenta para quem quer apenas validar um ingresso na porta.

  A solução profissional no Coolify é:
- API Service: Recebe o pedido e apenas salva no banco.
- Worker Service: Um container separado que fica "escutando" uma fila (Redis). Ele gera o QR Code e envia o e-mail sem pressa, sem travar a API principal.
