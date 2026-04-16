export default async function handler(req, res) {
  // 1. Pega a tua chave do Gemini que configuraste na Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Chave GEMINI_API_KEY não encontrada na Vercel" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // 2. Extraímos o que o utilizador escreveu e as regras do sistema
    const { messages, system } = req.body;
    const lastUserMessage = messages[messages.length - 1].content;

    // 3. Chamada para a API do Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: lastUserMessage }] }],
        generationConfig: {
            response_mime_type: "application/json"
        }
      })
    });

    const data = await response.json();
    
    // 4. Adaptamos a resposta do Gemini para o formato que o teu site espera
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // O teu site espera um formato específico da Anthropic, vamos simular aqui:
    return res.status(200).json({
      content: [{ text: aiResponse }]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao ligar ao Gemini" });
  }
}
