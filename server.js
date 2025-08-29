import express from "express";
import cors from "cors";
import OpenAI from "openai";

// Railway provides environment variables automatically; no dotenv needed
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

if (!process.env.OPENAI_API_KEY) {
  console.error("⚠️ OPENAI_API_KEY is missing!");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/translate", async (req, res) => {
  const { text, language } = req.body;

  if (!text || !language) {
    return res.status(400).json({ error: "Text and language are required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Translate the following text into ${language}`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    res.json({ translation: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.post("/api/image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt,
      n: 1,
      size: "256x256",
      response_format: "b64_json",
    });

    res.json({ image: response.data[0].b64_json });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
