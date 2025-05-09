import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { BotMessageSquare, X } from "lucide-react";
import styles from "./chatbot.module.css"; // Import CSS module

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you? I can suggest the right equipment, give you the latest weather updates, and answer your farming questions." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  // Scroll to the latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle sending messages
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput(""); // Clear input immediately

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chatbot/`,
        { message: input }
      );

      const botReply = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, something went wrong." }]);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div>
      {/* Floating Chatbot Button */}
      <button className={styles.chatButton} onClick={toggleChat} aria-label="Open Chatbot">
        <BotMessageSquare size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <span className={styles.ChatbotName}>Chatbot</span>
            <button onClick={toggleChat} aria-label="Close Chatbot">
              <X size={21} />
            </button>
          </div>

          {/* Messages */}
          <div className={styles.chatMessages}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "bot" ? styles.botMessage : styles.userMessage}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className={styles.chatInput}>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              aria-label="Chat Input"
            />
            <button onClick={sendMessage} aria-label="Send Message">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
