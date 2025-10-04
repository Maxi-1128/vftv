// ===== Constants =====
const PASSWORD = "vfms123";

// ===== Local Storage Helpers =====
function getVideos() { 
    return JSON.parse(localStorage.getItem('videos') || '[]'); 
}

function setVideos(videos) { 
    localStorage.setItem('videos', JSON.stringify(videos)); 
}

function getPastVideos() { 
    return JSON.parse(localStorage.getItem('pastVideos') || '[]'); 
}

function setPastVideos(videos) { 
    localStorage.setItem('pastVideos', JSON.stringify(videos)); 
}

function submitVideo(src, title = "Untitled", description = "") {
    const videos = getVideos();
    const today = new Date().toISOString().slice(0, 10);
    videos.push({ src, title, description, date: today });
    setVideos(videos);
}

// ===== Submit Page Logic =====
if (document.getElementById('login-button')) {
    const loginBtn = document.getElementById('login-button');
    const submitBtn = document.getElementById('submit-button');
    const loginForm = document.getElementById('login-form');
    const submitForm = document.getElementById('submit-form');
    const loginError = document.getElementById('login-error');
    const successMsg = document.getElementById('submit-success');
    const toTodayBtn = document.getElementById('to-today');

    // Login check
    loginBtn.addEventListener('click', () => {
        const input = document.getElementById('password').value;
        if (input === PASSWORD) {
            loginForm.classList.add('hidden');
            submitForm.classList.remove('hidden');
            loginError.classList.add('hidden');
        } else {
            loginError.classList.remove('hidden');
        }
    });

    // Submit announcement
    submitBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('announcement-file').files[0];
        const videoLink = document.getElementById('video-link').value.trim();

        if (!fileInput && !videoLink) {
            alert("Please upload a file or enter a video link.");
            return;
        }

        if (fileInput) {
            const fileURL = URL.createObjectURL(fileInput);
            submitVideo(fileURL, fileInput.name, "Uploaded file (temporary until refresh)");
        }

        if (videoLink) {
            submitVideo(videoLink, "Video Link", "Submitted video link");
        }

        // Show success and "Go to Today"
        successMsg.classList.remove('hidden');
        toTodayBtn.classList.remove('hidden');

        // Clear inputs
        document.getElementById('announcement-file').value = "";
        document.getElementById('video-link').value = "";
    });

    // Go to today page
    toTodayBtn.addEventListener('click', () => {
        window.location.href = 'today.html';
    });
}

// ===== Today Page Logic =====
function displayTodayVideo() {
    const container = document.getElementById("video-container");
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];
    let videos = getVideos();
    let pastVideos = getPastVideos();

    // Filter today's videos
    let todaysVideos = videos.filter(v => v.date === today);

    // If more than one, move first to past
    while (todaysVideos.length > 1) {
        pastVideos.push(todaysVideos.shift());
    }
    setPastVideos(pastVideos);

    // Save only latest today
    videos = [...videos.filter(v => v.date !== today), ...todaysVideos];
    setVideos(videos);

    container.innerHTML = "";

    if (todaysVideos.length > 0) {
        const v = todaysVideos[0];
        const card = document.createElement('div');
        card.className = "video-card";

        // Check for YouTube links
        if (v.src.includes("youtube.com") || v.src.includes("youtu.be")) {
            let videoId = v.src.includes("youtu.be") 
                ? v.src.split("/").pop() 
                : new URL(v.src).searchParams.get("v");
            card.innerHTML = `<iframe width="560" height="315"
                src="https://www.youtube.com/embed/${videoId}"
                frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                <h3>${v.title}</h3><p>${v.description}</p>`;
        } else {
            card.innerHTML = `<video src="${v.src}" controls></video>
                              <h3>${v.title}</h3><p>${v.description}</p>`;
        }

        container.appendChild(card);
    } else {
        container.innerHTML = `<p class="no-video">No videos uploaded today yet.</p>`;
    }
}

// Run on today.html
displayTodayVideo();
