import React, { useState, useEffect } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";
import "./App.css";

function App() {
  const posts = [
    {
      id: 1,
      title: "My First React Lesson",
      content: `
        I learned the basics of setting up a React app using Create React App! This included understanding the project structure, 
        such as the 'public' and 'src' folders, and how to run the development server with 'npm start'. 
        One key concept was components—reusable building blocks of a React application. For example, I created a simple component:\n
        function Welcome() {
          return <h1>Hello, World!</h1>;
        }\n
        This helped me grasp how to render dynamic content. 
        [Reference: React Official Docs - Getting Started](https://reactjs.org/docs/getting-started.html)
      `,
      timestamp: new Date("2025-03-01T10:00:00").toISOString(),
      category: "React Basics",
    },
    {
      id: 2,
      title: "Styling with CSS",
      content: `
        I explored CSS to create a cosmic theme with twinkling stars for my blog! I learned about linear gradients to simulate a nebula effect 
        and used the '@media' query for responsive design. For example, I added this gradient to the body:\n
        background: linear-gradient(135deg, #0a0f2a 0%, #1a2c38 20%, #26c6da 40%, #ab47bc 60%);\n
        I also implemented a canvas animation for the stars, adjusting their opacity for a twinkling effect. 
        [Reference: MDN Web Docs - Using CSS Gradients](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Images/Using_CSS_gradients)
      `,
      timestamp: new Date("2025-03-02T12:00:00").toISOString(),
      category: "Styling",
    },
    {
      id: 3,
      title: "Adding Functionality",
      content: `
        I added interactive features like search, category filtering, and a share button. I learned to use the 'filter()' method to dynamically 
        filter posts based on user input. For example, this code filters posts by search term:\n
        const filteredPosts = posts.filter(post => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );\n
        The share button uses the Clipboard API to copy URLs, enhancing user experience. 
        [Reference: MDN Web Docs - Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
      `,
      timestamp: new Date("2025-03-03T15:00:00").toISOString(),
      category: "Functionality",
    },
    {
      id: 4,
      title: "Responsive Design",
      content: `
        I made my blog mobile-friendly using media queries! I learned to adjust layouts for different screen sizes, 
        such as stacking elements on screens below 768px. For example, I used this media query:\n
        @media (max-width: 768px) {
          .search-bar {
            flex-direction: column;
            align-items: center;
          }
        }\n
        This ensured a smooth experience on phones and tablets. 
        [Reference: CSS-Tricks - A Guide to CSS Media Queries](https://css-tricks.com/css-media-queries/)
      `,
      timestamp: new Date("2025-03-04T09:00:00").toISOString(),
      category: "Styling",
    },
    {
      id: 5,
      title: "Deploying to Netlify",
      content: `
        I’m preparing to deploy my app to Netlify! I learned the deployment process, including building the app with 'npm run build' 
        and connecting it to a GitHub repository. For example, I ran these commands:\n
        npm run build\n
        git push origin main\n
        Netlify will host my app, providing a live URL. This step taught me about CI/CD basics. 
        [Reference: Netlify Docs - Deploy with Git](https://docs.netlify.com/get-started/)
      `,
      timestamp: new Date("2025-03-05T14:00:00").toISOString(),
      category: "Deployment",
    },
    {
      id: 6,
      title: "Adding Firebase for Comments",
      content: `
        I added Firebase to my blog to implement a comments section for each post! Firebase is a backend-as-a-service platform that provides a Realtime Database, which I used to store and retrieve user comments. I started by setting up a Firebase project in the Firebase Console, creating a Realtime Database, and adding the configuration to my app. Then, I installed the Firebase SDK with:\n
        npm install firebase\n
        I used Firebase to save comments under each post’s ID and fetch them in real-time using the 'onValue' method. This allows users to add comments by typing in an input field and pressing Enter, and the comments appear immediately below each post. This feature makes my blog more interactive and engaging for readers. 
        [Reference: Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
      `,
      timestamp: new Date("2025-03-06T11:00:00").toISOString(),
      category: "Functionality",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activePage, setActivePage] = useState("blog");
  const [comments, setComments] = useState({});

  // Firebase configuration (replace with your own config)
  const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    databaseURL: "your-database-url",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const categories = ["All", "React Basics", "Styling", "Functionality", "Deployment"];

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    // Fetch comments from Firebase
    const commentsRef = ref(database, "comments");
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      setComments(data || {});
    });
  }, [isDarkMode, database]);

  const sharePost = (id) => {
    const postUrl = `${window.location.origin}/post/${id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert("Post URL copied to clipboard!");
    });
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Function to render post content with syntax highlighting
  const renderContent = (content) => {
    const parts = content.split(/\n\s*\n/);
    const elements = [];

    parts.forEach((part, index) => {
      part = part.trim();

      if (
        part.includes("function ") ||
        part.includes("const ") ||
        part.includes("@media") ||
        part.includes("background: ") ||
        part.includes("npm run build")
      ) {
        elements.push(
          <SyntaxHighlighter key={`code-${index}`} language="javascript" style={dark}>
            {part}
          </SyntaxHighlighter>
        );
      } else {
        const linkRegex = /\[(.*?)\]\((.*?)\)/g;
        const textParts = part.split(linkRegex);
        const formattedText = textParts.map((text, i) => {
          if (i % 3 === 0) return text;
          else if (i % 3 === 1) {
            const url = textParts[i + 1];
            return (
              <a key={`link-${i}`} href={url} target="_blank" rel="noopener noreferrer">
                {text}
              </a>
            );
          }
          return null;
        });

        elements.push(<p key={`para-${index}`}>{formattedText}</p>);
      }
    });

    return elements;
  };

  // About Me content
  const aboutMeContent = `
    Hi! I'm John Liter, a web development enthusiast exploring React and creative design. 
    This blog is my space to share my learning journey, from mastering React components to deploying apps on Netlify. 
    I enjoy coding cosmic-themed interfaces and building interactive features in my free time. 
    [Connect with me on GitHub](https://github.com/johliter) | [Email me](mailto:jliterblog@gmail.com)
  `;

  // Handle comment submission
  const handleCommentSubmit = (postId, commentText) => {
    const commentsRef = ref(database, "comments/" + postId);
    push(commentsRef, {
      text: commentText,
      timestamp: new Date().toISOString(),
      author: "Anonymous",
    });
  };

  return (
    <div className={`App ${isDarkMode ? "dark-mode" : ""}`}>
      <canvas id="star-canvas" style={{ pointerEvents: "none" }}></canvas>
      <button
        className="dark-mode-toggle"
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <h1>My React Learning Blog</h1>
      <div className="nav-buttons">
        <button
          className={activePage === "blog" ? "active" : ""}
          onClick={() => setActivePage("blog")}
        >
          Blog
        </button>
        <button
          className={activePage === "about" ? "active" : ""}
          onClick={() => setActivePage("about")}
        >
          About Me
        </button>
      </div>
      {activePage === "blog" ? (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="category-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            {filteredPosts.map((post) => (
              <div key={post.id} className="post">
                <div className="post-header">
                  <h2>{post.title}</h2>
                  <button className="share-btn" onClick={() => sharePost(post.id)}>
                    Share
                  </button>
                </div>
                <div className="post-content">{renderContent(post.content)}</div>
                <span className="timestamp">
                  Posted on: {new Date(post.timestamp).toLocaleString()} | Category: {post.category}
                </span>
                <div className="comments-section">
                  <h3>Comments</h3>
                  <ul>
                    {comments[post.id] &&
                      Object.entries(comments[post.id]).map(([commentId, comment]) => (
                        <li key={commentId}>
                          {comment.text} (by {comment.author} on{" "}
                          {new Date(comment.timestamp).toLocaleString()})
                        </li>
                      ))}
                  </ul>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        handleCommentSubmit(post.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="about-me">
          <h2>About Me</h2>
          <div className="about-content">{renderContent(aboutMeContent)}</div>
        </div>
      )}
    </div>
  );
}

export default App;