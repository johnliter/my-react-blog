import React, { useState, useEffect } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import "./App.css";

// Component for displaying a single post
function PostPage({ posts, comments, handleCommentSubmit, renderContent }) {
  const { id } = useParams();
  const post = posts.find((p) => p.id === parseInt(id));

  if (!post) {
    return <div className="post">Post not found.</div>;
  }

  return (
    <div className="post">
      <div className="post-header">
        <h2>{post.title}</h2>
        <Link to="/">
          <button className="share-btn">Back to Blog</button>
        </Link>
      </div>
      <div className="post-content">{renderContent(post.content)}</div>
      <span className="timestamp">
        Posted on: {new Date(post.timestamp).toLocaleString()} | Category: {post.category}
      </span>
      <div className="comments-section">
        <h3>Comments</h3>
        <ul>
          {comments[id] &&
            Object.entries(comments[id]).map(([commentId, comment]) => (
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
  );
}

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
  const [comments, setComments] = useState({});

  const firebaseConfig = {
    apiKey: "AIzaSyC_tevdJYc52sRQkowltufSIvmpMYvReEc",
    authDomain: "myreactblog-a9e51.firebaseapp.com",
    projectId: "myreactblog-a9e51",
    storageBucket: "myreactblog-a9e51.firebasestorage.app",
    messagingSenderId: "981993871401",
    appId: "1:981993871401:web:52a98a6efe42fb6b926438",
    databaseURL: "https://myreactblog-a9e51.firebaseio.com",
  };

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  const categories = ["All", "React Basics", "Styling", "Functionality", "Deployment"];

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    const commentsRef = ref(database, "comments");
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      setComments(data || {});
    });
  }, [isDarkMode, database]);

  const sharePost = (id) => {
    const postUrl = `${window.location.origin}/post/${id}`;
    const shareData = {
      title: `Check out this post from John's Cosmic Coding Journey`,
      text: `I found this interesting post on John's Cosmic Coding Journey:`,
      url: postUrl,
    };

    // Log to help debug
    console.log("Attempting to share with Web Share API:", navigator.share ? "Supported" : "Not supported");
    console.log("Clipboard API support:", navigator.clipboard ? "Supported" : "Not supported");

    // Check if Web Share API is supported
    if (navigator.share && typeof navigator.share === "function") {
      navigator
        .share(shareData)
        .then(() => {
          console.log("Shared successfully!");
        })
        .catch((error) => {
          console.error("Error with Web Share API:", error);
          // Fallback to clipboard if Web Share API fails
          copyToClipboard(postUrl);
        });
    } else {
      // Fallback to Clipboard API
      copyToClipboard(postUrl);
    }
  };

  const copyToClipboard = (text) => {
    // First, try the Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Successfully copied to clipboard using Clipboard API");
          alert("Post URL copied to clipboard!");
        })
        .catch((error) => {
          console.error("Failed to copy with Clipboard API:", error);
          // Fallback to textarea method if Clipboard API fails
          fallbackCopyToClipboard(text);
        });
    } else {
      // Fallback to textarea method if Clipboard API is not supported
      console.log("Clipboard API not supported, using textarea fallback");
      fallbackCopyToClipboard(text);
    }
  };

  // Fallback method using a temporary textarea element
  const fallbackCopyToClipboard = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Prevent scrolling to bottom of page in Safari
      textArea.style.opacity = "0"; // Make it invisible
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        console.log("Successfully copied to clipboard using textarea fallback");
        alert("Post URL copied to clipboard!");
      } else {
        console.error("Textarea copy failed");
        alert("Failed to copy URL. Please copy it manually: " + text);
      }
    } catch (error) {
      console.error("Error with textarea fallback:", error);
      alert("Failed to copy URL. Please copy it manually: " + text);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  const aboutMeContent = `
    Hi! I'm John Liter, a web development enthusiast exploring React and creative design. 
    This blog is my space to share my learning journey, from mastering React components to deploying apps on Netlify. 
    I enjoy coding cosmic-themed interfaces and building interactive features in my free time. 
    [Connect with me on GitHub](https://github.com/johliter) | [Email me](mailto:jliterblog@gmail.com)
  `;

  const handleCommentSubmit = (postId, commentText) => {
    const commentsRef = ref(database, "comments/" + postId);
    push(commentsRef, {
      text: commentText,
      timestamp: new Date().toISOString(),
      author: "Anonymous",
    });
  };

  return (
    <Router>
      <div className={`App ${isDarkMode ? "dark-mode" : ""}`}>
        <canvas id="star-canvas" style={{ pointerEvents: "none" }}></canvas>
        <button
          className="dark-mode-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <h1>John's Cosmic Coding Journey</h1>
        <div className="nav-buttons">
          <Link to="/">
            <button className={window.location.pathname === "/" ? "active" : ""}>
              Blog
            </button>
          </Link>
          <Link to="/about">
            <button className={window.location.pathname === "/about" ? "active" : ""}>
              About Me
            </button>
          </Link>
        </div>
        <Routes>
          <Route
            path="/"
            element={
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
            }
          />
          <Route
            path="/about"
            element={
              <div className="about-me">
                <h2>About Me</h2>
                <div className="about-content">{renderContent(aboutMeContent)}</div>
              </div>
            }
          />
          <Route
            path="/post/:id"
            element={
              <PostPage
                posts={posts}
                comments={comments}
                handleCommentSubmit={handleCommentSubmit}
                renderContent={renderContent}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;