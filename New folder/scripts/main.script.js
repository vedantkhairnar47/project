const API_BASE = "https://memento-v9jd.onrender.com/api/v1";
const BASE_URL = "https://memento-v9jd.onrender.com";

document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  // Load all posts
  await loadPosts(token);

  // Chat functionality
  // document.getElementById('open-chat').addEventListener('click', function() {
  //     document.getElementById('chat-section').style.display = 'block';
  // });

  document.getElementById("close-chat").addEventListener("click", function () {
    document.getElementById("chat-section").style.display = "none";
  });

  // Search functionality
  document
    .getElementById("search-button")
    .addEventListener("click", handleSearch);
  document
    .getElementById("search-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") handleSearch();
    });

  // Close search results when clicking outside
  document.addEventListener("click", function (e) {
    if (!document.querySelector(".search-container").contains(e.target)) {
      document.getElementById("search-results").style.display = "none";
    }
  });
});

async function loadPosts(token) {
  try {
    const response = await fetch(`${API_BASE}/post/get-posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Posts API response:", responseData);

    const posts = responseData.data || responseData.posts || responseData;

    if (!Array.isArray(posts)) {
      throw new Error("Invalid posts data format");
    }

    const postSection = document.getElementById("post-section");
    postSection.innerHTML = "";

    if (posts.length === 0) {
      postSection.innerHTML =
        '<p style="text-align: center; margin-top: 20px;">No posts yet. Be the first to post!</p>';
      return;
    }

    const DEFAULT_PROFILE_PICTURE =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIgc3Ryb2tlPSIjYmJiIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNCwyMGMwLTQgNC02IDgtNnM4LDIgOCw2IiBzdHJva2U9IiNiYmIiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==";
    const DEFAULT_POST_IMAGE =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8J5dTAAAAmklEQVRIDbXBAQEAAAABIP6PzgpVx0d73z8Nd3H/cbqJdA2ogwDX3UuMubgtUw2pdMKz8FOxwTHn6duqeVzAzxmg0eFc1q7G+sdnxjgxCpM3f4/cQFe9wbF0OpnR6HLNJoIrgL6zYen1Wez9Y4FYzhimSmYfY9lsY6y7fd3A0tq6a7KKI8ZgWw6UBzme/Yd7P/d/08Z1z0lLpkS37UpyWzK6pqkV0vRKn9uF0iD+dV91UnN1hvzvqJbpFgi/iv2t6hOco3K5wrZZOtjhbJlzIWLW5a/YOLgo5Pfhsjpoy3hEC3coz7rvm6wAAIABJREFU2Q5yS7dwEO3mAqA0AwAAL2TMEgGZocAf/FqzAN+53FYdZomAjoYGXU/j6QnQtYfnMCp+fkwL40yo7tnTugGAiD7gczdOopxwStgg3yygT3MIyux6YnDew4wrj1NfRqlgVubwdbV0uR3y1W0y5bPRM+j3DW9l5VEy42SOJ9rCz4PbZ8yVxvVtZTUKQrc5kPpkQDbhf0sgpp6iCgx8l7w51Qm85duX8ljKTYrT2gCvZX94E0TZ0XlEwjLB4InIkdHiQghegnHuj33e4eYw2QwgyROmFr6wLMo9quOeV2y0dRt9HkhZhi12Re/efgQAT7KvBr13HeR8Wxj49onrPYFWU7ZlIuKSPws5d85ktAP1V6Xuo62oSTnsl5NlXbpwsA==";

    posts.forEach((post) => {
      if (!post || !post.user) {
        console.warn("Invalid post structure:", post);
        return;
      }

      const profilePicture = post?.user?.profilePicture
        ? BASE_URL + "/" + post.user.profilePicture
        : DEFAULT_PROFILE_PICTURE;

      const postImage = post?.image
        ? `<img src="${BASE_URL}/${post.image}"  class="post-image" alt="Post by ${post.user.username}">`
        : `<img src=${DEFAULT_POST_IMAGE}  class="post-image" alt="Post by ${post.user.username}">`;

      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.innerHTML = `
                <div class="post-header">
                    <img src="${profilePicture}" class="post-user-avatar" alt="${
        post.user.username
      }'s profile">
                    <span class="post-username">${post.user.username}</span>
                </div>
                ${postImage}
                <div class="post-actions">
                    <button class="like-btn">❤️</button>
                    <button class="comment-btn" data-post-id="${
                      post._id
                    }">💬</button>
                </div>
                <div class="post-likes">${post.likes?.length || 0} likes</div>
                <div class="post-caption">
                    <strong>${post.user.username}</strong> ${post.caption || ""}
                </div>
                <div class="post-comments">
                    <div class="comments-section" id="comments-${
                      post._id
                    }" style="display: none;"></div>
                </div>
                <div class="comment-input-container">
                    <input type="text" id="comment-input-${
                      post._id
                    }" class="comment-input" placeholder="Write a comment...">
                    <button class="add-comment-btn" onclick="addComment('${
                      post._id
                    }')">➕</button>
                </div>
            `;

      postSection.appendChild(postElement);
    });

    // Attach event listeners for comment buttons
    document.querySelectorAll(".comment-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const postId = this.getAttribute("data-post-id");
        toggleComments(postId);
      });
    });
  } catch (error) {
    console.error("Error loading posts:", error);
    document.getElementById(
      "post-section"
    ).innerHTML = `<p style="text-align: center; margin-top: 20px; color: red;">
                Error loading posts: ${error.message}
            </p>`;
  }
}

async function loadComments(postId) {
  const commentsContainer = document.getElementById(`comments-${postId}`);
  commentsContainer.innerHTML = `<p>Loading comments...</p>`;

  try {
    const response = await fetch(
      `${API_BASE}/comments/get-comments/${postId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }

    const data = await response.json();
    commentsContainer.innerHTML = "";

    // Extract comments array from response
    const comments = data.comments || [];

    if (comments.length === 0) {
      commentsContainer.innerHTML = `<p style="color: gray;">No comments yet.</p>`;
      return;
    }

    for (const comment of comments) {
      // Fetch user details if needed
      //const userResponse = await fetch(`${API_BASE}/user/${comment.user}`, {
      //   headers: {
      //         "Authorization": `Bearer ${localStorage.getItem('authToken')}`
      //    }
      //});

      const userData = {}; // || await userResponse.json();
      const username = userData?.user?.username || "Unknown User";

      const commentElement = document.createElement("div");
      commentElement.className = "comment-item";
      commentElement.innerHTML = `
                <strong>${username}:</strong> ${comment.text}
                <small style="color: gray; display: block;">${new Date(
                  comment.createdAt
                ).toLocaleString()}</small>
            `;
      commentsContainer.appendChild(commentElement);
    }
  } catch (error) {
    console.error("Error loading comments:", error);
    commentsContainer.innerHTML = `<p style="color: red;">Error loading comments.</p>`;
  }
}

async function addComment(postId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  const text = commentInput.value.trim();

  if (!text) return alert("Comment cannot be empty!");

  try {
    const response = await fetch(`${API_BASE}/comments/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ postId, text }),
    });

    if (!response.ok) throw new Error("Failed to add comment");

    commentInput.value = "";
    loadComments(postId);
  } catch (error) {
    console.error("Error adding comment:", error);
  }
}

async function editComment(commentId, oldText) {
  const newText = prompt("Edit your comment:", oldText);
  if (!newText) return;

  try {
    await fetch(`${API_BASE}/comment/update/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ text: newText }),
    });

    loadPosts(localStorage.getItem("authToken"));
  } catch (error) {
    console.error("Error updating comment:", error);
  }
}

async function deleteComment(commentId) {
  if (!confirm("Are you sure you want to delete this comment?")) return;

  try {
    await fetch(`${API_BASE}/comment/delete/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    loadPosts(localStorage.getItem("authToken"));
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
}

function toggleComments(postId) {
  const commentsContainer = document.getElementById(`comments-${postId}`);
  commentsContainer.style.display =
    commentsContainer.style.display === "block" ? "none" : "block";
  if (commentsContainer.style.display === "block") loadComments(postId);
}
async function handleSearch() {
  const query = document.getElementById("search-input").value.trim();
  const resultsContainer = document.getElementById("search-results");

  if (!query) {
    resultsContainer.style.display = "none";
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${API_BASE}/search/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    const users = data.data || data.users || data;

    resultsContainer.innerHTML = "";

    if (!Array.isArray(users) || users.length === 0) {
      resultsContainer.innerHTML =
        '<div class="search-result-item">No users found</div>';
    } else {
      users.forEach((user) => {
        const userElement = document.createElement("div");
        userElement.className = "search-result-item";
        userElement.innerHTML = `
                    <img src="${BASE_URL}/${user.profilePicture}" 
                         alt="${user.username}'s profile">
                    <span>${user.username}</span>
                `;
        userElement.addEventListener("click", () => {
          // window.location.href = `profile.html?userId=${user._id}`;
          openProfilePopup(user);
        });
        resultsContainer.appendChild(userElement);
      });
    }

    resultsContainer.style.display = "block";
  } catch (error) {
    console.error("Search error:", error);
    resultsContainer.innerHTML = `<div class="search-result-item">Error: ${error.message}</div>`;
    resultsContainer.style.display = "block";
  }
}

function sendMessage() {
  const chatInput = document.getElementById("chat-input");
  const message = chatInput.value.trim();
  const chatBox = document.querySelector(".chat-box");

  if (message) {
    const newMessage = document.createElement("div");
    newMessage.className = "chat-message";
    newMessage.textContent = message;
    chatBox.appendChild(newMessage);

    chatInput.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
      const replyMessage = document.createElement("div");
      replyMessage.className = "chat-message";
      replyMessage.textContent = "Thanks for your message!";
      chatBox.appendChild(replyMessage);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);
  }
}

document.getElementById("send-message").addEventListener("click", sendMessage);
document
  .getElementById("chat-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });

function openProfilePopup(user) {
  document.getElementById("popupProfilePic").src =
    BASE_URL + "/" + user.profilePicture || "/images/default.png";
  document.getElementById("popupFullName").innerText = user.fullName;
  document.getElementById("popupUsername").innerText = `@${user.username}`;
  document.getElementById("popupBio").innerText =
    user.bio || "No bio available.";

  document.getElementById("popupEmail").innerText = user.email || "-";
  document.getElementById("popupLocation").innerText = user.location || "-";
  document.getElementById("popupWebsite").innerText = user.website || "-";
  document.getElementById("popupGender").innerText = user.gender || "-";
  document.getElementById("popupDob").innerText = user.dob
    ? new Date(user.dob).toLocaleDateString()
    : "-";
  document.getElementById("popupStatus").innerText = user.status || "-";
  document.getElementById("popupVerified").innerText = user.isVerified
    ? "Yes"
    : "No";
  document.getElementById("popupPrivate").innerText = user.isPrivate
    ? "Yes"
    : "No";

  document.getElementById("sendRequestBtn").onclick = () =>
    sendFriendRequest(user._id);

  document.getElementById("profilePopupOverlay").style.display = "flex";
}

function closeProfilePopup() {
  document.getElementById("profilePopupOverlay").style.display = "none";
}

async function sendFriendRequest(receiverId) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/friend-request/send/${receiverId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        // body: JSON.stringify({ receiverId }),
      }
    );

    const data = await res.json();
    alert(data.message || "Request sent!");
    closeProfilePopup();
  } catch (error) {
    console.error("Friend request failed:", error);
    alert("Failed to send request.");
  }
}
