import React, { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import "./Help.css";
const Help = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]); // Lưu trữ danh sách tin nhắn
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false); // Trạng thái mở/đóng khung chat
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Đã kết nối! Hỏi tôi về sách nhé!" },
      ]);
    }

    // Xử lý khi mất kết nối
    function onDisconnect() {
      setIsConnected(false);
      setMessages((prev) => [...prev, { sender: "bot", text: "Mất kết nối!" }]);
    }

    // Xử lý phản hồi từ chatbot
    function onChatResponse(data) {
      setMessages((prev) => [...prev, { sender: "bot", text: data.message }]);
    }

    // Đăng ký các sự kiện Socket.IO
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chatResponse", onChatResponse);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chatResponse", onChatResponse);
    };
  }, []);
  const sendMessage = () => {
    if (input.trim() && isConnected) {
      socket.emit("askQuestion", { question: input }); // Gửi sự kiện askQuestion
      setMessages((prev) => [...prev, { sender: "user", text: input }]); // Thêm tin nhắn người dùng
      setInput(""); // Xóa ô nhập liệu
    }
  };

  // Xử lý khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  return (
    <div className="chat-wrapper">
      {/* Nút mở khung chat */}
      {!isChatOpen && (
        <button className="chat-toggle-btn" onClick={toggleChat}>
          <span role="img" aria-label="chat">
            💬
          </span>{" "}
          Chat
        </button>
      )}

      {/* Khung chat khi mở */}
      {isChatOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <h2>Chat với Chatbot</h2>
            <button className="close-btn" onClick={toggleChat}>
              ×
            </button>
          </div>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <strong>{msg.sender === "user" ? "Bạn: " : "Bot: "}</strong>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi về sách..."
              disabled={!isConnected}
            />
            <button onClick={sendMessage} disabled={!isConnected}>
              Gửi
            </button>
          </div>
          <p className="status">
            Trạng thái: {isConnected ? "Đã kết nối" : "Đang kết nối..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Help;
