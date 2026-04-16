export default async function handler(req, res) {
  // Pega a chave que começa por AQ que colaste na Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Chave não configurada na Vercel" });
  }

  try {
    const { messages, system } = req.body;
    const userPrompt = messages[messages.length - 1].content;

    // Ajustamos a chamada para aceitar o teu formato de chave
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const aiText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      content: [{ text: aiText }]
    });

  } catch (error) {
    return res.status(500).json({ error: "Erro ao processar: " + error.message });
  }
}
