import { GoogleGenAI, Type } from "@google/genai";
import { GenerationOutput } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generationSchema = {
  type: Type.OBJECT,
  properties: {
    resume: {
      type: Type.STRING,
      description: "Полное, адаптированное резюме в формате Markdown. Оно должно быть подогнано под описание вакансии, выделяя релевантный опыт и навыки из профиля кандидата.",
    },
    coverLetter: {
      type: Type.STRING,
      description: "Полное, персонализированное сопроводительное письмо в формате Markdown. Оно должно создавать убедительное повествование, связывающее достижения кандидата с потребностями работодателя.",
    },
  },
  required: ["resume", "coverLetter"],
};

const getPrompt = (vacancy: string, profile: string): string => {
  return `
    **Роль:** Ты — эксперт-карьерный консультант и профессиональный составитель резюме, работающий как интеллектуальный 'Генератор резюме на базе LLM'.

    **Контекст:** Тебе будет предоставлена два блока информации: 'Профиль кандидата' в формате JSON и 'Вакансия' в виде обычного текста.

    **Основная цель:** Сгенерировать персонализированное, адаптированное резюме и убедительное сопроводительное письмо, которые максимизируют шансы кандидата на получение приглашения на собеседование. Проанализируй вакансию, чтобы понять ее ключевые требования, технологический стек, обязанности и культуру компании. Затем сопоставь это с профилем кандидата, чтобы выделить наиболее релевантные навыки, опыт и достижения. Весь результат должен быть на русском языке.

    **Инструкции:**
    1.  **Сгенерируй адаптированное резюме:** Перепиши и пересортируй опыт и навыки кандидата, чтобы они напрямую отвечали требованиям вакансии. Используй сильные глаголы действия и количественно оценивай достижения, где это возможно. Тон должен соответствовать предполагаемой культуре компании. Сконцентрируйся на наиболее релевантных аспектах и преуменьши значение нерелевантных. Отформатируй вывод в чистом, профессиональном Markdown на русском языке.
    2.  **Сгенерируй сопроводительное письмо:** Напиши краткое, профессиональное и воодушевленное сопроводительное письмо (около 3-4 абзацев). Оно НЕ должно просто повторять резюме. Вместо этого оно должно создавать повествование, которое связывает 2-3 ключевых достижения или проекта кандидата непосредственно с наиболее важными потребностями, выраженными в описании вакансии. Отформатируй вывод в чистом, профессиональном Markdown на русском языке.

    **Профиль кандидата (JSON):**
    \`\`\`json
    ${profile}
    \`\`\`

    **Описание вакансии (Текст):**
    \`\`\`
    ${vacancy}
    \`\`\`
  `;
};


export const generateResumeAndCoverLetter = async (
  vacancy: string,
  profile: string,
): Promise<GenerationOutput> => {

  const prompt = getPrompt(vacancy, profile);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: generationSchema,
        temperature: 0.5,
      },
    });
    
    // Fix: Correctly parse the JSON string from response.text.
    // The previous logic was convoluted and based on the incorrect assumption that the response was already a parsed object.
    const jsonText = response.text.trim();
    try {
      return JSON.parse(jsonText) as GenerationOutput;
    } catch (e) {
      console.error("Failed to parse JSON response:", jsonText);
      throw new Error("Получен некорректный JSON от API.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Не удалось сгенерировать контент с помощью Gemini API.");
  }
};