const PDFParser = require("pdf2json");

const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const parseResume = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }

        console.log("📂 Parsing PDF with pdf2json...");

        const pdfParser = new PDFParser(this, 1); // 1 = text content

        // Wrap callback-based library in a Promise
        const text = await new Promise((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));

            pdfParser.on("pdfParser_dataReady", pdfData => {
                const rawText = pdfParser.getRawTextContent();
                resolve(rawText);
            });

            pdfParser.parseBuffer(req.file.buffer);
        });

        console.log("✅ PDF Parsed successfully. Raw length:", text.length);

        // Clean up text (remove page breaks, excessive whitespace)
        const cleanText = text
            .replace(/----------------Page \(\d+\) Break----------------/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        res.status(200).json({ text: cleanText });

    } catch (error) {
        console.error("❌ Error in parseResume (pdf2json):", error);
        // Send a 500 if it's a parse error, but keep it JSON
        res.status(500).json({ message: "Failed to parse PDF", error: error.message || error });
    }
};

const generateCoverLetter = async (req, res, next) => {
    const { resumeText, jobRole, companyName } = req.body;

    if (!resumeText) {
        res.status(400);
        return next(new Error("Resume text is required"));
    }

    try {
        const prompt = `
        You are a professional career coach. Write a compelling cover letter based on the following candidate resume.
        
        Target Role: ${jobRole || "Software Engineer"}
        Target Company: ${companyName || "the hiring company"}
        
        Resume Content:
        """${resumeText.substring(0, 5000)}"""
        
        Usage specific achievements from the resume to highlight fit. Keep it professional, concise (under 400 words), and impactful.
        Return ONLY the cover letter text. No markdown, no preamble.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        const coverLetter = completion.choices[0]?.message?.content || "Could not generate cover letter.";

        res.status(200).json({ coverLetter });

    } catch (error) {
        console.error("Error generating cover letter:", error);
        next(error);
    }
};

module.exports = { parseResume, generateCoverLetter };
