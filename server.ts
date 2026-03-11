import Fastify, { FastifyInstance } from "fastify";
import QRCode from "qrcode";
import { randomBytes } from "crypto";

const fastify: FastifyInstance = Fastify({ logger: false });

function gerarCodigoReserva(): string {
  const letras = "ABCDEFGHIJKLMNPQRSTUVWXYZ"; // Removi o 'O' para não confundir com zero
  const numeros = "123456789"; // Removi o '0' para não confundir com 'O'

  // Pega 2 letras e 3 números aleatórios
  let resultado = "";
  for (let i = 0; i < 2; i++)
    resultado += letras.charAt(Math.floor(Math.random() * letras.length));
  for (let i = 0; i < 3; i++)
    resultado += numeros.charAt(Math.floor(Math.random() * numeros.length));

  // Embaralha a string resultante
  return resultado
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

function gerarTicketId(): string {
  return `tk-${randomBytes(3).toString("hex")}`;
}

async function gerarHtmlEmail(ticketId: string): Promise<string> {
  const codigoReserva = gerarCodigoReserva();
  const dadosParaOQRCode = `https://qentre.com/ticket/${ticketId}`;

  try {
    const base64Image = await QRCode.toDataURL(dadosParaOQRCode, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 200,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return `
      <!DOCTYPE html>
      <html lang="pt-br">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="background-color: #7d32a8; padding: 20px; font-family: sans-serif;">
            <div style="background: #dfdfdf; max-width: 400px; margin: auto; padding: 30px; border-radius: 16px; border: 1px solid #e0e0e0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #222; margin-bottom: 8px;">Seu Ingresso Chegou!</h2>
                <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Apresente o código abaixo na portaria:</p>

                <div style="
                    display: inline-block;
                    padding: 15px;
                    background: #ffffff;
                    border: 2px solid #f0f0f0;
                    border-radius: 24px;
                    line-height: 0;
                    overflow: hidden;
                ">
                  <img src="${base64Image}" alt="QR Code" width="220" height="220" style="display: block;" />
                </div>

                <div style="margin-top: 2px; padding-top: 20px; border-top: 1px dashed #eee;">
                  <p style="color: #999; font-size: 12px; margin-bottom: 4px;">ID DO TICKET</p>
                  <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #333;">${codigoReserva}</code>
                </div>

                <p style="color: #555; font-size: 13px; margin-top: 14px">
                  <strong>Dica:</strong> Aumente o brilho do celular ao validar.
                </p>
            </div>
        </body>
      </html>
    `;
  } catch (err) {
    console.error("Erro ao gerar QR Code:", err);
    return "<h1>Erro ao gerar ingresso</h1>";
  }
}

// Rota com tipagem de parâmetros
fastify.get<{ Params: { id: string } }>(
  "/preview/:id",
  async (request, reply) => {
    const { id } = request.params;
    const html = await gerarHtmlEmail(id);

    reply.type("text/html").send(html);
  },
);

fastify.get("/simular-ticket", async (_request, reply) => {
  const id = gerarTicketId();
  await gerarHtmlEmail(id);

  return {
    status: "ok",
    message: "Ticket gerado com sucesso",
    id,
  };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log(
      "🚀 Servidor TS rodando em http://localhost:3000/preview/TICKET-789",
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
