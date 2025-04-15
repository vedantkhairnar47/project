const BASE_URL = "https://memento-v9jd.onrender.com";

let appliedJobIds = [];
let availableTags = [];
let selectedTags = [];
const filters = {};

window.onload = async () => {
  fetchFilterTags();
  await fetchAppliedJobs();
  fetchJobs();
};

function toggleTag(tagName) {
  if (selectedTags.includes(tagName)) {
    selectedTags = selectedTags.filter((tag) => tag !== tagName);
  } else {
    selectedTags.push(tagName);
  }

  updateSelectedTagsDisplay();
  updatePreviewText();
  filters.tags = selectedTags;
  fetchJobs(filters);
}

function updateSelectedTagsDisplay() {
  const container = document.getElementById("selectedTagsDisplay");
  container.innerHTML = "";

  selectedTags.forEach((tag) => {
    const tagEl = document.createElement("div");
    tagEl.className = "selected-tag";
    tagEl.textContent = tag;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.onclick = () => toggleTag(tag);
    tagEl.appendChild(removeBtn);

    container.appendChild(tagEl);
  });
}

function updatePreviewText() {
  const preview = document.getElementById("selectedPreview");
  preview.textContent =
    selectedTags.length > 0 ? selectedTags.join(", ") : "Select Tags";
}

function toggleDropdown() {
  const dropdown = document.getElementById("dropdownOptions");
  dropdown.classList.toggle("hidden");
}

window.onclick = function (e) {
  const dropdown = document.getElementById("dropdownOptions");
  if (!e.target.closest(".custom-dropdown")) {
    dropdown.classList.add("hidden");
  }
};

// Remove tag function when clicking the "×" button
function removeTag(tagToRemove) {
  const dropdown = document.getElementById("tagDropdown");
  const option = Array.from(dropdown.options).find(
    (option) => option.value === tagToRemove
  );

  // Remove the tag from the multi-select dropdown
  option.selected = false;

  // Update the displayed selected tags
  updateSelectedTags();
}

async function fetchFilterTags() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/tags`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    const tags = await res.json();
    availableTags = tags;
    const dropdown = document.getElementById("dropdownOptions");

    tags.forEach((tag) => {
      const option = document.createElement("div");
      option.textContent = tag.name;
      option.onclick = (e) => {
        e.stopPropagation();
        toggleTag(tag.name);
      };
      dropdown.appendChild(option);
    });
  } catch (err) {
    console.error("Error fetching tags", err);
  }
}

async function fetchAppliedJobs() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/applied`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    const data = await res.json();
    appliedJobIds = data.map((a) => a.jobId); // Assume backend returns [{jobId: "..."}]
  } catch (err) {
    console.error("Error fetching applied jobs:", err);
  }
}

async function fetchJobs(filters = {}) {
  try {
    let query = "?"; // search param supports both tag and title
    if (filters.search) {
      query += `search=${filters.search}&`;
    }
    if (filters.tags) {
      query += `tags=${filters.tags.join(",")}&`;
    }
    const response = await fetch(`${BASE_URL}/api/v1/jobs/jobs${query}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    const jobs = await response.json();
    displayJobs(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    document.getElementById("jobsContainer").innerHTML =
      "<p>Failed to load jobs.</p>";
  }
}

// function openApplyModal(jobId) {
//   document.getElementById("apply-job-id").value = jobId;
//   document.getElementById("application-text").value = "";
//   document.getElementById("apply-modal").style.display = "block";
// }

document.getElementById("close-apply-modal").onclick = function () {
  document.getElementById("apply-modal").style.display = "none";
};

const applyJob = async function (jobId) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/jobs/${jobId}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (res.ok) {
      appliedJobIds.push(jobId);
      // document.getElementById("apply-modal").style.display = "none";
      fetchJobs(); // reload updated jobs
    } else {
      alert("Failed to apply for job.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
};

function decodeAuthToken() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    return JSON.parse(payloadJson);
  } catch (error) {
    console.error("Failed to decode authToken:", error);
    return null;
  }
}

function displayJobs(jobs) {
  const user = decodeAuthToken();
  const container = document.getElementById("jobsContainer");
  container.innerHTML = "";

  if (!jobs.length) {
    container.innerHTML = "<p>No jobs found.</p>";
    return;
  }

  jobs.forEach((job) => {
    const card = document.createElement("div");
    card.className = "job-card";

    const isApplied = job.applicants.includes(user._id);
    const applyButton = isApplied
      ? `<button disabled style="margin-top:10px;">Already Applied</button>`
      : `<button onclick="applyJob('${job._id}')" style="margin-top:10px;">Apply</button>`;

    card.innerHTML = `
        <h3>${job.title}</h3>
        <p><strong>Creator:</strong> ${job.createdBy.username}</p>
        <p>${job.description}</p>
        <div>${job.tags
          .map((tag) => `<span class="tag">${tag.name}</span>`)
          .join(" ")}</div>
        ${applyButton}
      `;

    container.appendChild(card);
  });
}

// document
//   .getElementById("dropdownOptions")
//   .addEventListener("click", function (event) {
//     console.log("Hello");
//   });

function searchJobs() {
  const tags = document
    .getElementById("searchInput")
    .value.split(",")
    .map((t) => t.trim())
    .filter((t) => t)
    .join(",");
  filters.search = tags;
  fetchJobs(filters);
}
