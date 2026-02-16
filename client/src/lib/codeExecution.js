import axios from 'axios';

const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

export const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    python: "3.10.0",
    java: "15.0.2",
    c: "10.2.0",
    cpp: "10.2.0",
};

export const CODE_SNIPPETS = {
    javascript: `function solution() {\n  console.log("Hello World");\n}\n\nsolution();`,
    python: `def solution():\n    print("Hello World")\n\nsolution()`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello World");\n    return 0;\n}`,
    cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello World";\n    return 0;\n}`,
};

export const executeCode = async (language, sourceCode) => {
    try {
        const response = await axios.post(PISTON_API_URL, {
            language: language,
            version: LANGUAGE_VERSIONS[language] || "*",
            files: [
                {
                    content: sourceCode,
                },
            ],
        });
        return response.data;
    } catch (error) {
        console.error("Code Execution Failed:", error);
        throw error;
    }
};
