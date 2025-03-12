// Handle modal for adding a post
document.getElementById("add-post-btn").addEventListener("click", function() {
    document.getElementById("post-modal").style.display = "flex"; // Open the modal
});

// Handle closing the modal
document.getElementById("close-modal").addEventListener("click", function() {
    document.getElementById("post-modal").style.display = "none"; // Close the modal
});

// Handle form submission to add a post
document.getElementById("post-form").addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent the form from refreshing the page

    const imageUrl = document.getElementById("post-image").value;
    const description = document.getElementById("post-description").value;

    if (imageUrl && description) {
        // Create the post element dynamically
        const postSection = document.getElementById("post-section");
        
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        postDiv.innerHTML = `
            <div class="user">
                <span class="username">New User</span>
                <span class="timestamp">Just now</span>
            </div>
            <img class="post-image" src="${imageUrl}" alt="Post">
            <div class="post-caption">${description}</div>
            <button class="like-btn">❤️ Like</button>
            <div class="likes-count">Liked by 0 people</div>
        `;

        // Add the new post to the post section
        postSection.appendChild(postDiv);

        // Reinitialize the like button for new posts
        initializeLikeButtons();

        // Reset the form and close the modal
        document.getElementById("post-form").reset();
        document.getElementById("post-modal").style.display = "none";
    } else {
        alert("Please fill in both fields.");
    }
});

// Function to initialize like buttons
function initializeLikeButtons() {
    const likeButtons = document.querySelectorAll(".like-btn");
    likeButtons.forEach(button => {
        button.addEventListener("click", function() {
            const likesCount = this.nextElementSibling;
            let currentLikes = parseInt(likesCount.textContent.split(' ')[2]);
            currentLikes += 1;
            likesCount.textContent = `Liked by ${currentLikes} people`;
        });
    });
}// Open Chat
document.getElementById("open-chat").addEventListener("click", function () {
    document.getElementById("chat-section").classList.add("show");
});

// Close Chat
document.getElementById("close-chat").addEventListener("click", function () {
    document.getElementById("chat-section").classList.remove("show");
});

// Open Post Modal (when "Add Post" button is clicked)
document.getElementById("add-post-btn").addEventListener("click", function () {
    document.getElementById("post-modal").style.display = "flex";
});

// Close Modal (when "Cancel" button is clicked)
document.getElementById("close-modal").addEventListener("click", function () {
    document.getElementById("post-modal").style.display = "none";
});

// Handle Post Form Submission
document.getElementById("post-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from reloading the page
    
    const imageURL = document.getElementById("post-image").value;
    const description = document.getElementById("post-description").value;

    if (imageURL && description) {
        // Create a new post element
        const post = document.createElement("div");
        post.classList.add("post");

        // Add the username, timestamp, and the image and description
        post.innerHTML = `
            <div class="user">
                <span class="username">User1</span>
                <span class="timestamp">${new Date().toLocaleString()}</span>
            </div>
            <img src="${imageURL}" alt="Post Image" class="post-image">
            <div class="post-caption">${description}</div>
            <button class="like-btn">Like</button>
            <div class="likes-count">0 Likes</div>
        `;

        // Add the post to the post section
        document.getElementById("post-section").prepend(post);

        // Hide the modal and clear the form
        document.getElementById("post-modal").style.display = "none";
        document.getElementById("post-form").reset();
    }
});

// Open Chat
document.getElementById("open-chat").addEventListener("click", function () {
    document.getElementById("chat-section").style.display = "block";
});

// Close Chat
document.getElementById("close-chat").addEventListener("click", function () {
    document.getElementById("chat-section").style.display = "none";
});


// Initialize like buttons for any posts that already exist when the page loads
initializeLikeButtons();


