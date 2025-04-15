const BASE_URL = "https://memento-v9jd.onrender.com";

function goBack() {
  if (window.history.length > 1) {
    window.history.back(); // Navigate to the previous page
  } else {
    document.getElementById("chatBox").style.display = "none"; // Hide chat box if no history
  }
}
function closeChat() {
  document.getElementById("chatBox").style.display = "none";
}
function decodeJWTPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid JWT Token:", error);
    return null;
  }
}

const currentUser = decodeJWTPayload(localStorage.getItem("authToken"));
if (!currentUser) {
  alert("Please login to access the chat.");
  window.location.href = "login.html"; // Redirect to login page
} else if (!currentUser._id) {
  alert("Invalid token. Please login again.");
  window.location.href = "login.html"; // Redirect to login page
}
const API_BASE = "https://memento-v9jd.onrender.com";
const API_BASE_PATH = "api/v1/chat";
const socket = io(API_BASE, {
  path: "/socket",
  auth: { token: localStorage.getItem("authToken") },
});

var currentChatUser = null;

let activeChatUser = null;

async function fetchUsers() {
  try {
    const response = await fetch(`${API_BASE}/${API_BASE_PATH}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    console.log("currentUser", currentUser);
    const users = await response.json();
    const usersList = document.getElementById("users");
    usersList.innerHTML = users
      .map((user) => {
        const targetUser = user.members.find(
          (member) => member._id !== currentUser._id
        );
        return `
                          <li onclick="openChat('${user._id}','${
          targetUser.fullName
        }','${targetUser._id}','${targetUser?.socketId}')">
                              <img src="${BASE_URL}/${
          targetUser.profilePicture || "default-avatar.png"
        }" alt="${targetUser.fullName}">
                              ${targetUser.fullName}
                          </li>
                      `;
      })
      .join("");
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

async function openChat(userId, userName, targetUserId, socketId) {
  document.getElementById("chatBox").style.display = "flex";
  document.getElementById("chatTitle").innerText = `Chat with ${userName}`;

  currentChatUser = {
    fullName: userName,
    _id: targetUserId,
    socketId: socketId,
    chatId: userId,
  };

  activeChatUser = targetUserId;

  try {
    const response = await fetch(
      `${API_BASE}/${API_BASE_PATH}/messages/${targetUserId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    const { messages } = await response.json(); // Extract messages array
    const messagesBox = document.getElementById("messages");
    messagesBox.innerHTML = messages
      .map((msg) => {
        const senderName =
          msg.sender._id === currentUser._id ? "You" : msg.sender.fullName;
        return `<p><strong>${senderName}:</strong> ${msg.text}</p>`;
      })
      .join("");
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const messageText = messageInput.value.trim();
  if (!messageText || !activeChatUser) return;

  const messageData = {
    chatId: currentChatUser.chatId,
    receiverId: currentChatUser._id,
    sender: currentUser._id,
    receiver: currentChatUser._id,
    message: messageText,
  };

  socket.emit("send_message", messageData);
  appendMessage("You", messageText);
  messageInput.value = "";
}

function appendMessage(sender, text) {
  const messagesBox = document.getElementById("messages");
  const newMessage = document.createElement("p");
  newMessage.innerHTML = `<strong>${sender}:</strong> ${text}`;
  messagesBox.appendChild(newMessage);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

socket.on("receive_message", (message) => {
  console.log("Received message:", message);
  // if (
  //   message.receiver === currentUser._id &&
  //   message.sender === activeChatUser
  // ) {
  appendMessage(message.senderName, message.message);
  // }
});

document.addEventListener("DOMContentLoaded", fetchUsers);
// }
