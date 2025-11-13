<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>File2Task - Project Overview</title>
  <style>
    * {
      box-sizing: border-box;
      font-family: 'Poppins', sans-serif;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #f9fafb;
      color: #222;
      line-height: 1.6;
    }

    header {
      background: linear-gradient(135deg, #0078ff, #00c6ff);
      color: white;
      text-align: center;
      padding: 60px 20px;
    }

    header h1 {
      font-size: 2.8rem;
      margin-bottom: 10px;
    }

    header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .container {
      max-width: 1000px;
      margin: 40px auto;
      padding: 20px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
    }

    h2 {
      color: #0078ff;
      border-left: 5px solid #00c6ff;
      padding-left: 10px;
      margin: 25px 0 10px;
    }

    p {
      margin-bottom: 15px;
      font-size: 1rem;
    }

    .features ul {
      list-style: none;
      padding: 0;
    }

    .features li {
      background: #e8f4ff;
      border-radius: 10px;
      padding: 10px 15px;
      margin: 8px 0;
    }

    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .screenshots img {
      width: 100%;
      border-radius: 12px;
      transition: transform 0.3s ease;
    }

    .screenshots img:hover {
      transform: scale(1.03);
    }

    .tech-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }

    .tech-table th,
    .tech-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: center;
    }

    .tech-table th {
      background-color: #0078ff;
      color: white;
    }

    footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      background: #f1f5f9;
      color: #555;
      border-radius: 10px;
    }

    footer a {
      color: #0078ff;
      text-decoration: none;
      font-weight: 600;
    }

    footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      header h1 {
        font-size: 2rem;
      }
      .container {
        margin: 20px;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>📘 File2Task</h1>
    <p>Turn your study files into smart, actionable tasks with AI-powered insights.</p>
  </header>

  <div class="container">
    <section>
      <h2>🚀 Project Overview</h2>
      <p><b>File2Task</b> is an intelligent study tool that allows users to upload documents (PDF, DOCX, TXT)
        and automatically generates organized tasks and summaries to help them study efficiently.</p>
    </section>

    <section class="screenshots">
      <div>
        <h2>🏠 Landing Page</h2>
        <img src="Screenshot 2025-11-13 232547.png" alt="Landing Page">
      </div>
      <div>
        <h2>📂 Upload Page</h2>
        <img src="Screenshot 2025-11-13 232813.png" alt="Upload Page">
      </div>
      <div>
        <h2>🤖 AI Chat Assistant</h2>
        <img src="Screenshot 2025-11-13 233030.png" alt="Chat Page">
      </div>
    </section>

    <section class="features">
      <h2>💡 Features</h2>
      <ul>
        <li>📄 Upload PDF, DOCX, and TXT documents</li>
        <li>🧠 AI-generated study tasks</li>
        <li>💬 Interactive chatbot for queries</li>
        <li>📊 Track your progress</li>
        <li>🎨 Modern responsive interface</li>
      </ul>
    </section>

    <section>
      <h2>🧑‍💻 Tech Stack</h2>
      <table class="tech-table">
        <tr><th>Category</th><th>Technology</th></tr>
        <tr><td>Frontend</td><td>HTML, CSS, JavaScript</td></tr>
        <tr><td>Backend</td><td>Node.js, Express.js</td></tr>
        <tr><td>Database</td><td>MongoDB</td></tr>
        <tr><td>AI Integration</td><td>OpenAI API</td></tr>
        <tr><td>Version Control</td><td>Git & GitHub</td></tr>
      </table>
    </section>

    <section>
      <h2>⚙️ Setup Instructions</h2>
      <pre>
1️⃣ Clone the repository:
git clone https://github.com/VamshiPendam/File-2-Task.git

2️⃣ Navigate into folder:
cd File-2-Task

3️⃣ Install dependencies:
npm install

4️⃣ Start server:
node app.js

5️⃣ Open browser:
http://localhost:2005
      </pre>
    </section>

    <footer>
      <p>👤 <b>Pendam Vamshi</b></p>
      <p>📧 <a href="mailto:your-email@example.com">your-email@example.com</a></p>
      <p>🌐 <a href="https://github.com/VamshiPendam" target="_blank">GitHub: VamshiPendam</a></p>
      <p>❤️ Built with passion to make studying smarter.</p>
    </footer>
  </div>
</body>
</html>
