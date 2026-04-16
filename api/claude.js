const handler = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  try {
    const { messages } = req.body;
    const prompt = messages[messages.length - 1].content;

    // Usando o modelo 'gemini-pro' (versão 1.0) que é o mais compatível
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(response.status).json({ 
        error: `Google diz: ${data.error.message} (Código: ${data.error.code})` 
      });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ content: [{ text: aiText }] });

  } catch (e) {
    return res.status(500).json({ error: "Erro: " + e.message });
  }
};

module.exports = handler;
module.exports = handler;
