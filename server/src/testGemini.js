require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in environment variables.");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log("Fetching models from API...");

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching models: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response body:", text);
            return;
        }

        const data = await response.json();

        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => {
                // Log all models to see exactly what we have
                console.log(`- ${m.name}`);
                if (m.supportedGenerationMethods) {
                    console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.log("No models property in response:", data);
        }
    } catch (err) {
        console.error("Exception during fetch:", err);
    }
}

listModels();
