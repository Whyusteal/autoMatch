export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Chave não configurada na Vercel" });
  }

  try {
    const { messages, system } = req.body;
    const userPrompt = messages[messages.length - 1].content;

    // Tentativa de chamada com o formato padrão
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da Google API:", data);
      return res.status(response.status).json({ error: data.error?.message || "Erro na API do Google" });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ content: [{ text: aiText }] });

  } catch (error) {
    return res.status(500).json({ error: "Erro interno: " + error.message });
  }
}
