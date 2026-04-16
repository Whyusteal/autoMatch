const handler = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Falta a chave na Vercel" });
  }

  try {
    const { messages, system } = req.body;
    const userPrompt = messages[messages.length - 1].content;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: system + "\n\nPergunta do utilizador: " + userPrompt }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(response.status || 500).json({ error: data.error.message });
    }

    const aiText = data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      content: [{ text: aiText }]
    });

  } catch (error) {
    return res.status(500).json({ error: "Erro: " + error.message });
  }
};

module.exports = handler;
