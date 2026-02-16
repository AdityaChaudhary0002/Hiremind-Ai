require('dotenv').config();
const Groq = require("groq-sdk");

async function listModels() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("No GROQ_API_KEY found in environment variables.");
        return;
    }

    const groq = new Groq({ apiKey });

    try {
        const models = await groq.models.list();
        console.log("Available Groq Models:");
        models.data.forEach((model) => {
            console.log(`- ${model.id}`);
        });
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
