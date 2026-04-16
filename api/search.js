const handler = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Falta a chave na Vercel" });
  }

  try {
    const { messages, system } = req.body;
    const userPrompt = messages[messages.length - 1].content;

    // Usamos o endpoint v1 (estável) que é o que as chaves AQ preferem
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: system + "\n\nPergunta: " + userPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Isso vai nos mostrar no log da Vercel o erro exato se falhar
      console.error("Erro detalhado:", data);
      return res.status(response.status).json({ error: data.error?.message || "Erro na API" });
    }

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ error: "O Gemini não devolveu resposta." });
    }

    const aiText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      content: [{ text: aiText }]
    });

  } catch (error) {
    return res.status(500).json({ error: "Erro interno: " + error.message });
  }
};

module.exports = handler;
