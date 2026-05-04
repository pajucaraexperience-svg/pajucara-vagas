/**
 * Cloudflare Worker — Proxy de /trabalheconosco → Vagas e Talentos (Vercel)
 *
 * Como implantar:
 * 1. Acesse dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Cole este código, salve e publique
 * 3. Em "Settings > Triggers > Routes", adicione a rota:
 *    www.pajucarahotel.com.br/trabalheconosco*
 *    (selecione a zona pajucarahotel.com.br)
 */

const VERCEL_HOST = "pajucara-vagas.vercel.app";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Passa adiante qualquer rota que NÃO seja /trabalheconosco
    if (!url.pathname.startsWith("/trabalheconosco")) {
      return fetch(request);
    }

    // Monta a URL de destino no Vercel (mantém path + querystring)
    const target = new URL(url.pathname + url.search, `https://${VERCEL_HOST}`);

    // Copia headers e substitui o Host para o Vercel reconhecer o projeto
    const headers = new Headers(request.headers);
    headers.set("Host", VERCEL_HOST);
    headers.set("X-Forwarded-Host", url.hostname);
    headers.set("X-Forwarded-Proto", "https");

    const proxyRequest = new Request(target.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual", // deixamos o browser seguir redirects normalmente
    });

    const response = await fetch(proxyRequest);

    // Reescreve o header Location se o Vercel devolver redirect absoluto
    // (ex.: 307 para https://pajucara-vagas.vercel.app/trabalheconosco/login)
    const newHeaders = new Headers(response.headers);
    const location = response.headers.get("Location");
    if (location && location.includes(VERCEL_HOST)) {
      newHeaders.set(
        "Location",
        location.replace(`https://${VERCEL_HOST}`, `https://${url.hostname}`)
      );
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
