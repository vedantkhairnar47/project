document.addEventListener('DOMContentLoaded', function() {
    // ===== PROFILE SECTION FUNCTIONALITY =====
    const openProfileBtn = document.getElementById('open-profile');
    const closeProfileBtn = document.getElementById('close-profile');
    const profileSection = document.getElementById('profile-section');
    const profilePhoto = document.getElementById('profile-photo');
    const profilePhotoUpload = document.getElementById('profile-photo-upload');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const editBioBtn = document.getElementById('edit-bio-btn');
    const saveBioBtn = document.getElementById('save-bio-btn');
    const profileBio = document.getElementById('profile-bio');
    const bioEdit = document.getElementById('bio-edit');
    const friendsList = document.getElementById('friends-list');
    const addFriendInput = document.getElementById('add-friend-input');
    const addFriendBtn = document.getElementById('add-friend-btn');
    
    // Open/Close Profile Section
    openProfileBtn.addEventListener('click', function() {
        profileSection.style.display = 'block';
    });
    
    closeProfileBtn.addEventListener('click', function() {
        profileSection.style.display = 'none';
    });
    
    // Change Profile Photo
    changePhotoBtn.addEventListener('click', function() {
        profilePhotoUpload.click();
    });
    
    profilePhotoUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                profilePhoto.src = event.target.result;
                console.log('Profile photo changed (would upload to server)');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
  
// Edit Bio
editBioBtn.addEventListener('click', function() {
    // Store current bio text in the textarea
    bioEdit.value = profileBio.textContent;
    
    // Hide the bio display and show the edit controls
    profileBio.style.display = 'none';
    bioEdit.style.display = 'block';
    editBioBtn.style.display = 'none';
    saveBioBtn.style.display = 'block';
    
    // Focus on the textarea
    bioEdit.focus();
});

saveBioBtn.addEventListener('click', function() {
    // Update the bio text
    profileBio.textContent = bioEdit.value;
    
    // Hide the edit controls and show the bio display
    profileBio.style.display = 'block';
    bioEdit.style.display = 'none';
    editBioBtn.style.display = 'block';
    saveBioBtn.style.display = 'none';
    
    // Here you would typically save the bio to your server
    console.log('Bio saved:', bioEdit.value);
});
    
    // Friends List Functionality
    friendsList.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-friend')) {
            e.target.parentElement.remove();
            console.log('Friend removed (would update server)');
        }
    });
    
    addFriendBtn.addEventListener('click', function() {
        const friendName = addFriendInput.value.trim();
        if (friendName) {
            const newFriend = document.createElement('li');
            newFriend.innerHTML = `${friendName} <button class="remove-friend">Remove</button>`;
            friendsList.appendChild(newFriend);
            addFriendInput.value = '';
            console.log('Friend added (would update server)');
        }
    });

    // ===== POST FUNCTIONALITY =====
    document.getElementById("add-post-btn").addEventListener("click", function() {
        document.getElementById("post-modal").style.display = "flex";
    });

    document.getElementById("close-modal").addEventListener("click", function() {
        document.getElementById("post-modal").style.display = "none";
    });

    document.getElementById("post-form").addEventListener("submit", function(e) {
        e.preventDefault();

        const imageUrl = document.getElementById("post-image").value;
        const description = document.getElementById("post-description").value;

        if (imageUrl && description) {
            const postSection = document.getElementById("post-section");
            
            const postDiv = document.createElement("div");
            postDiv.classList.add("post");

            postDiv.innerHTML = `
                <div class="user">
                    <img src="${profilePhoto.src}" class="post-user-avatar">
                    <span class="username">You</span>
                    <span class="timestamp">Just now</span>
                </div>
                <img class="post-image" src="${imageUrl}" alt="Post">
                <div class="post-caption">${description}</div>
                <div class="post-actions">
                    <button class="like-btn">❤️ Like</button>
                    <button class="comment-btn">💬 Comment</button>
                    <button class="chat-btn">💌 Chat</button>
                </div>
                <div class="likes-count">Liked by 0 people</div>
                <div class="comments-section"></div>
            `;

            postSection.prepend(postDiv);
            initializePostButtons(postDiv);
            document.getElementById("post-form").reset();
            document.getElementById("post-modal").style.display = "none";
        } else {
            alert("Please fill in both fields.");
        }
    });

    // Initialize buttons for new posts
    function initializePostButtons(postElement) {
        // Like button functionality
        const likeBtn = postElement.querySelector('.like-btn');
        const likesCount = postElement.querySelector('.likes-count');
        
        likeBtn.addEventListener('click', function() {
            let currentLikes = parseInt(likesCount.textContent.split(' ')[2]) || 0;
            const isLiked = this.textContent.includes('❤️');
            
            currentLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
            likesCount.textContent = `Liked by ${currentLikes} people`;
            this.textContent = isLiked ? '🤍 Like' : '❤️ Like';
        });

        // Comment button functionality
        const commentBtn = postElement.querySelector('.comment-btn');
        const commentsSection = postElement.querySelector('.comments-section');
        
        commentBtn.addEventListener('click', function() {
            const commentText = prompt("Enter your comment:");
            if (commentText) {
                const commentDiv = document.createElement('div');
                commentDiv.classList.add('comment');
                commentDiv.innerHTML = `
                    <strong>You</strong>: ${commentText}
                `;
                commentsSection.appendChild(commentDiv);
            }
        });

        // Chat button functionality
        const chatBtn = postElement.querySelector('.chat-btn');
        
        chatBtn.addEventListener('click', function() {
            const username = postElement.querySelector('.username').textContent;
            openChatWithUser(username);
        });
    }

    // Initialize buttons for existing posts
    document.querySelectorAll('.post').forEach(post => {
        initializePostButtons(post);
    });

    // ===== CHAT FUNCTIONALITY =====
    function openChatWithUser(username) {
        document.getElementById("chat-section").style.display = "block";
        document.querySelector('.chat-header span').textContent = `Chat with ${username}`;
        document.getElementById("chat-input").focus();
    }

    document.getElementById("open-chat").addEventListener("click", function() {
        openChatWithUser("User");
    });

    document.getElementById("close-chat").addEventListener("click", function() {
        document.getElementById("chat-section").style.display = "none";
    });

    document.getElementById("send-message").addEventListener("click", sendMessage);
    document.getElementById("chat-input").addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    function sendMessage() {
        const chatInput = document.getElementById("chat-input");
        const message = chatInput.value.trim();
        const chatBox = document.querySelector(".chat-box");
        
        if (message) {
            // Add user's message
            const newMessage = document.createElement("div");
            newMessage.classList.add("chat-message", "sent");
            newMessage.textContent = message;
            chatBox.appendChild(newMessage);
            
            chatInput.value = "";
            chatBox.scrollTop = chatBox.scrollHeight;
            
            // Simulate reply after 1 second
            setTimeout(() => {
                const username = document.querySelector('.chat-header span').textContent.replace('Chat with ', '');
                const replyMessage = document.createElement("div");
                replyMessage.classList.add("chat-message", "received");
                replyMessage.textContent = `Hi! This is ${username}. Thanks for your message!`;
                chatBox.appendChild(replyMessage);
                chatBox.scrollTop = chatBox.scrollHeight;
            }, 1000);
        }
    }
    document.getElementById("search-button").addEventListener("click", async function() {
        const query = document.getElementById("search-input").value.trim();
        if (!query) {
            alert("Please enter a search term.");
            return;
        }
    
        const apiUrl = `https://memento-v9jd.onrender.com/api/v1/search?query=${query}`;
        const searchResultsDiv = document.getElementById("search-results");
    
        try {
            const token = localStorage.getItem("authToken"); // Assuming token is stored in localStorage
    
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`  // Add token here
                }
            });
    
            const data = await response.json();
    
            if (response.ok) {
                searchResultsDiv.innerHTML = "<h3>Search Results:</h3>";
                if (data.length === 0) {
                    searchResultsDiv.innerHTML += "<p>No users found.</p>";
                } else {
                    data.forEach(user => {
                        searchResultsDiv.innerHTML += `<p>${user.username}</p>`;
                    });
                }
            } else {
                searchResultsDiv.innerHTML = `<p style="color: red;">Error: ${data.message || "Unauthorized request"}</p>`;
            }
        } catch (error) {
            searchResultsDiv.innerHTML = "<p style='color: red;'>Failed to connect to the server.</p>";
        }
    });
    document.addEventListener("DOMContentLoaded", async function () {
        const apiUrl = "https://memento-v9jd.onrender.com/api/v1/profile/my-profile-details";
        
        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer YOUR_ACCESS_TOKEN`, // Replace with a valid token
                    "Content-Type": "application/json"
                }
            });
    
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById("profile-username").textContent = data.username || "N/A";
                document.getElementById("profile-fullName").textContent = data.fullName || "N/A";
                document.getElementById("profile-email").textContent = data.email || "N/A";
                
                const profilePic = data.profilePicture ? data.profilePicture : "default-profile.png";
                document.getElementById("profile-picture").src = profilePic;
            } else {
                document.getElementById("profile-username").textContent = "Error loading profile";
                document.getElementById("profile-fullName").textContent = "Error loading profile";
                document.getElementById("profile-email").textContent = "Error loading profile";
            }
        } catch (error) {
            console.error("Error fetching profile details:", error);
            document.getElementById("profile-username").textContent = "Failed to load profile";
            document.getElementById("profile-fullName").textContent = "Failed to load profile";
            document.getElementById("profile-email").textContent = "Failed to load profile";
        }
    });
    
    
});