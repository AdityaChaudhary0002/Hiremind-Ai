<div align="center">

# 🧠 HireMind AI
### The Future of AI-Powered Career Ascension
[Report Bug](https://github.com/AdityaChaudhary0002/Hiremind-Ai/issues) · [Request Feature](https://github.com/AdityaChaudhary0002/Hiremind-Ai/issues)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)

</div>

## 🚀 Overview

**HireMind AI** is not just an interview preparation tool; it's a **cybernetic training ground** for your career. Built with a futuristic, "Mission Control" aesthetic, it leverages state-of-the-art LLMs (Llama 3 via Groq) to simulate realistic technical and behavioral interviews.

Whether you're a Recruit or a System Legend, HireMind AI adapts to your level, providing real-time feedback, strategic roadmaps, and gamified progression.

---

## ✨ Key Features

### 🎙️ AI Mock Interviews
- **Dynamic Question Generation**: Tailored to your specific role (e.g., "Senior React Developer") and difficulty level.
- **Audio-First Experience**: Speak your answers naturally. The AI listens, transcribes, and responds with synthesized voice.
- **Real-time Feedback**: Instant analysis of your answers with scores for technical accuracy, communication, and confidence.

### 🕹️ Mission Control (Goals System)
- **Gamified Objectives**: Track your prep like a tactical operation. Set Daily, Weekly, and Milestone "Protocols."
- **AI Strategy Generation**: Stuck on a goal? The AI generates a personalized execution plan and roadmap for you.
- **Visual Analytics**: Monitor your "Velocity," "Streak," and "S.Y.N.C Rate" with stunning, animated charts.

### 📄 Resume Scanner & Analysis
- **Deep Parsing**: Upload your resume (PDF) to extract skills, experience, and gaps.
- **ATS Optimization**: Get actionable advice to beat Applicant Tracking Systems.
- **Personalized Questions**: The AI generates questions *specifically* based on your resume's content.

### 🏆 Leveling System
- **XP & Ranks**: Earn XP for every interview and goal completed.
- **Rank Progression**: Climb from "Recruit" to "System Legend" as you master your domain.

---

## 🛠️ Tech Stack

- **Frontend**: React, TailwindCSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI**: Groq (Llama 3), Google Gemini
- **Auth**: Clerk

## 📦 Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/AdityaChaudhary0002/Hiremind-ai.git
   ```

2. **Install Dependencies**
   ```bash
   # Root
   npm install
   
   # Server
   cd server
   npm install
   
   # Client
   cd ../client
   npm install
   ```

3. **Environment Setup**
   Create `.env` in `client` and `server` directories with your keys (Clerk, MongoDB, Groq).

4. **Run**
   ```bash
   # Terminal 1 (Server)
   cd server && npm start

   # Terminal 2 (Client)
   cd client && npm run dev
   ```

## 🛡️ Robustness

- **Validation**: Strict schema validation using Joi.
- **Rate Limiting**: Protection against API abuse.
- **Error Handling**: Centralized error management and fatal logging.
- **Safe State**: Navigation guards preventing data loss during interviews.
