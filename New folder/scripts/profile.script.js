const BASE_URL = "https://memento-v9jd.onrender.com";

// Initialize with bio buttons in correct state
document.getElementById("save-bio-btn").style.display = "none";

async function fetchProfile() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Authentication required. Redirecting to login.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(
      "https://memento-v9jd.onrender.com/api/v1/profile/my-profile-details",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch profile");
    }

    const data = await response.json();
    const user = data.user;

    // Update profile information
    document.getElementById("profile-username").textContent =
      user.username || "Username not available";
    document.getElementById("profile-fullname").textContent =
      user.fullName || "Full name not available";
    document.getElementById("profile-email").textContent =
      user.email || "Email not available";
    document.getElementById("profile-bio").textContent =
      user.bio || "No bio yet. Click to edit.";

    // Set profile picture
    const profilePic = document.getElementById("profile-photo");
    profilePic.src = `${BASE_URL}/${user.profilePicture}`;
    profilePic.alt = `profile`;

    // Update friends list
    updateFriendsList(user.following);
  } catch (error) {
    console.error("Error fetching profile:", error);
    document.getElementById("friends-list").innerHTML =
      '<div class="no-friends">Error loading friends</div>';
    alert("Error fetching profile: " + error.message);
  }
}

function updateFriendsList(following) {
  const friendsList = document.getElementById("friends-list");
  friendsList.innerHTML = "";

  if (following && following.length > 0) {
    following.forEach((friendId) => {
      const li = document.createElement("li");
      li.innerHTML = `
                    User ${friendId.slice(0, 6)}
                    <button class="remove-friend" data-id="${friendId}" title="Remove friend">×</button>
                `;
      friendsList.appendChild(li);
    });
  } else {
    friendsList.innerHTML = '<div class="no-friends">No friends yet</div>';
  }

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-friend").forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      const friendId = button.getAttribute("data-id");
      if (confirm(`Are you sure you want to remove this friend?`)) {
        await removeFriend(friendId);
      }
    });
  });
}

async function removeFriend(friendId) {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(
      `https://memento-v9jd.onrender.com/api/v1/friends/remove/${friendId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Friend removed successfully");
      fetchProfile(); // Refresh the profile
    } else {
      throw new Error("Failed to remove friend");
    }
  } catch (error) {
    console.error("Error removing friend:", error);
    alert("Error removing friend: " + error.message);
  }
}

// Bio editing functionality
document.getElementById("save-bio-btn").style.display = "none";

// async function fetchProfile() {
//   const token = localStorage.getItem("authToken");

//   if (!token) {
//     alert("Authentication required. Redirecting to login.");
//     window.location.href = "login.html";
//     return;
//   }

//   try {
//     const response = await fetch(
//       "https://memento-v9jd.onrender.com/api/v1/profile/my-profile-details",
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Failed to fetch profile");
//     }

//     const data = await response.json();
//     const user = data.user;

//     // Update profile information
//     document.getElementById("profile-username").textContent =
//       user.username || "Username not available";
//     document.getElementById("profile-fullname").textContent =
//       user.fullName || "Full name not available";
//     document.getElementById("profile-email").textContent =
//       user.email || "Email not available";
//     document.getElementById("profile-bio").textContent =
//       user.bio || "No bio yet. Click to edit.";

//     // Set profile picture
//     const profilePic = document.getElementById("profile-photo");
//     profilePic.src = user.profilePicture || "https://via.placeholder.com/150";
//     profilePic.alt = `profile`;

//     // Update friends list
//     updateFriendsList(user.following);
//   } catch (error) {
//     console.error("Error fetching profile:", error);
//     document.getElementById("friends-list").innerHTML =
//       '<div class="no-friends">Error loading friends</div>';
//     alert("Error fetching profile: " + error.message);
//   }
// }

// Bio editing functionality - PROPERLY MAPPED API RESPONSE
document.getElementById("edit-bio-btn").addEventListener("click", () => {
  const bioDisplay = document.getElementById("profile-bio");
  const bioEdit = document.getElementById("bio-edit");

  bioEdit.value = bioDisplay.textContent;
  bioDisplay.style.display = "none";
  bioEdit.style.display = "block";
  document.getElementById("edit-bio-btn").style.display = "none";
  document.getElementById("save-bio-btn").style.display = "inline-block";
});

document.getElementById("save-bio-btn").addEventListener("click", async () => {
  const newBio = document.getElementById("bio-edit").value.trim();
  const bioDisplay = document.getElementById("profile-bio");

  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      "https://memento-v9jd.onrender.com/api/v1/profile/update-bio",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio: newBio }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update bio");
    }

    // PROPERLY MAP THE API RESPONSE HERE
    if (result && result.user && result.user.bio) {
      bioDisplay.textContent = result.user.bio;
    } else if (result && result.bio) {
      bioDisplay.textContent = result.bio;
    } else {
      bioDisplay.textContent = newBio;
    }

    bioDisplay.style.display = "block";
    document.getElementById("bio-edit").style.display = "none";
    document.getElementById("edit-bio-btn").style.display = "inline-block";
    document.getElementById("save-bio-btn").style.display = "none";

    alert("Bio updated successfully!");
  } catch (error) {
    console.error("Bio update error:", error);
    alert("Failed to update bio: " + error.message);

    // Revert UI on error
    bioDisplay.style.display = "block";
    document.getElementById("bio-edit").style.display = "none";
    document.getElementById("edit-bio-btn").style.display = "inline-block";
    document.getElementById("save-bio-btn").style.display = "none";
  }
});

// Profile picture upload functionality
document.getElementById("change-photo-btn").addEventListener("click", () => {
  document.getElementById("profile-photo-upload").click();
});

document
  .getElementById("profile-photo-upload")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profilePicture", file);

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          "https://memento-v9jd.onrender.com/api/v1/profile/update-profile-picture",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const result = await response.json();
          document.getElementById("profile-photo").src =
            result.user.profilePicture;
          alert("Profile picture updated successfully");
        } else {
          throw new Error("Failed to update profile picture");
        }
      } catch (error) {
        console.error("Error updating profile picture:", error);
        alert("Error updating profile picture: " + error.message);
      }
    }
  });

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  fetchProfile();
  showPostsTab();
  fetchTagsFromAPI();
});

const tagSelect = document.getElementById("job-tags");
const selectedTagsContainer = document.getElementById("selected-tags");

tagSelect.addEventListener("change", () => {
  updateSelectedTags();
});

function updateSelectedTags() {
  // selectedTagsContainer.innerHTML = selectedTagsContainer.innerHTML;

  console.log("tagSelect.selectedOptions", selectedTagsContainer);

  Array.from(tagSelect.selectedOptions).forEach((option) => {
    console.log("option", option);
    const tagChip = document.createElement("div");
    tagChip.className = "selected-tag";
    tagChip.textContent = option.textContent;
    tagChip.dataset.value = option.value; // Store the value in a data attribute

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-tag";
    removeBtn.innerHTML = "&times;";
    removeBtn.onclick = () => {
      option.selected = false;
      updateSelectedTags();
    };

    tagChip.appendChild(removeBtn);
    selectedTagsContainer.appendChild(tagChip);
  });
}

function fetchTagsFromAPI() {
  fetch(`${BASE_URL}/api/v1/jobs/tags`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  }) // Change to your actual endpoint
    .then((res) => res.json())
    .then((tags) => {
      const tagSelect = document.getElementById("job-tags");
      tags.forEach((tag) => {
        const option = document.createElement("option");
        option.value = tag._id; // depending on your schema
        option.textContent = tag.name;
        tagSelect.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Error fetching tags:", err);
    });
}

async function fetchCreatedJobs() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("You must be logged in to view created jobs.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/jobs/jobs/created`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch created jobs");
    }

    const data = await response.json();
    const jobsList = document.getElementById("created-jobs-list");
    jobsList.innerHTML = ""; // Clear previous content

    if (data && data.length > 0) {
      data.forEach((job) => {
        const jobDiv = document.createElement("div");
        jobDiv.classList.add("job-item");
        jobDiv.innerHTML = `
            <h5>${job.title}</h5>
            <p>${job.description}</p>
            <small>Expires on: ${new Date(
              job.expiryDate
            ).toLocaleDateString()}</small>
          `;
        jobsList.appendChild(jobDiv);
      });
    } else {
      jobsList.innerHTML = "<p>No created jobs yet.</p>";
    }
  } catch (error) {
    console.error("Error fetching created jobs:", error);
    document.getElementById(
      "created-jobs-list"
    ).innerHTML = `<p>Error: ${error.message}</p>`;
  }
}
async function fetchAppliedJobs() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("You must be logged in to view applied jobs.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/jobs/jobs/applied`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch applied jobs");
    }

    const data = await response.json();
    const appliedList = document.getElementById("applied-jobs-list");
    appliedList.innerHTML = ""; // Clear previous content

    if (data && data.length > 0) {
      data.forEach((job) => {
        const jobDiv = document.createElement("div");
        jobDiv.classList.add("job-item");
        jobDiv.innerHTML = `
              <h5>${job.title}</h5>
              <p>${job.description}</p>
              <small>Applied on: ${new Date(
                job.appliedDate
              ).toLocaleDateString()}</small>
            `;
        appliedList.appendChild(jobDiv);
      });
    } else {
      appliedList.innerHTML = "<p>No applied jobs yet.</p>";
    }
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    document.getElementById(
      "applied-jobs-list"
    ).innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

function showTab(tabId) {
  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => (tab.style.display = "none"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));

  document.getElementById(tabId).style.display = "block";
  document
    .querySelector(`[onclick="showTab('${tabId}')"]`)
    .classList.add("active");
  if (tabId === "created") fetchCreatedJobs();
  if (tabId === "applied") fetchAppliedJobs();
  if (tabId === "posts") showPostsTab();
}

// Modal logic
const modal = document.getElementById("job-modal");
const openBtn = document.getElementById("add-job-btn");
const closeBtn = document.getElementById("close-modal");

openBtn.onclick = () => (modal.style.display = "block");
closeBtn.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// Example: form submit
document
  .getElementById("job-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("job-title").value;
    const description = document.getElementById("job-description").value;
    const expiry = document.getElementById("job-expiry").value;

    // Get selected tags from selected-tags container
    const selectedTagsContainer = document.getElementById("selected-tags");
    const tagDivs =
      selectedTagsContainer.getElementsByClassName("selected-tag");
    const tags = Array.from(tagDivs).map((tagDiv) => tagDiv.dataset.value); // assuming each tag has data-value attr

    const jobData = {
      title,
      description,
      tags,
      expiryDate: expiry,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/v1/jobs/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(jobData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Job created successfully!");
        document.getElementById("job-modal").style.display = "none";
        this.reset();
        document.getElementById("selected-tags").innerHTML = ""; // clear selected tags
        fetchCreatedJobs();
      } else {
        console.error(result);
        alert("Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Something went wrong");
    }
  });

async function fetchPosts() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("User is not authenticated.");
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/post/my-posts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch posts.");
    }

    const data = await response.json();
    return data.posts; // Return the posts array
  } catch (error) {
    throw new Error(error.message || "Error fetching posts.");
  }
}

function displayPosts(posts) {
  const postsContainer = document.getElementById("posts");

  // Clear any existing content in the posts container
  postsContainer.innerHTML = "";

  if (posts && posts.length > 0) {
    posts.forEach((post) => {
      const postDiv = document.createElement("div");
      postDiv.classList.add("post-item");
      const postDate = new Date(post.created_at).toLocaleDateString();

      postDiv.innerHTML = `
        <div class="post-header">
          <h5>Post by User ${post.user}</h5>
          <small>Posted on: ${postDate}</small>
        </div>
        <div class="post-content">
          <p>${post.text}</p>
          <img src="${API_BASE}/${post.image}" alt="Post Image" class="post-image" />
        </div>
        <div class="post-actions">
          <button class="like-btn">Like (${post.likes.length})</button>
          <button class="comment-btn">Comment (${post.comments.length})</button>
        </div>
      `;

      postsContainer.appendChild(postDiv);
    });
  } else {
    postsContainer.innerHTML = "<p>No posts available.</p>";
  }
}
async function showPostsTab() {
  try {
    const posts = await fetchPosts();
    console.log("Fetched posts:", posts); // Log the fetched posts
    displayPosts(posts); // Display the posts once they are fetched
  } catch (error) {
    console.error("Error:", error.message);
    document.getElementById("posts-tab").innerHTML = `<p>${error.message}</p>`;
  }
}
