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

- **Frontend**: React.js, Tailwind CSS, Framer Motion (for complex animations & drift effects).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **AI & ML**: 
  - **Groq API** (Llama 3.3 70B Versatile) for ultra-fast inference.
  - **Google Gemini** (Contextual assistance).
  - **Multimedia**: Web Speech API for Speech-to-Text & Text-to-Speech.
- **Authentication**: Clerk (Secure, seamless user management).

---

## ⚡ Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AdityaChaudhary0002/Hiremind-Ai.git
   cd Hiremind-Ai
   ```

2. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
    Create `.env` files in both `server` and `client` directories.

    **Server (`/server/.env`)**:
    ```env
    PORT=5001
    MONGO_URI=your_mongodb_connection_string
    GROQ_API_KEY=your_groq_api_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    ```

    **Client (`/client/.env`)**:
    ```env
    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    VITE_API_URL=http://localhost:5001
    ```

4. **Ignite the System**
   ```bash
   # Run Backend (from /server)
   npm start

   # Run Frontend (from /client)
   npm run dev
   ```

---

## 📸 Glimpse of the Interface

*(Add screenshots here manually after pushing)*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ and ☕ by <b>Aditya Chaudhary</b></p>
</div>
