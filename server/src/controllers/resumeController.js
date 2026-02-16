const PDFParser = require("pdf2json");

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

module.exports = { parseResume };
