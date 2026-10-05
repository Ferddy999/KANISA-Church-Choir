```javascript
// ============================================================
// CHURCH CHOIR PUBLIC WEBSITE
// Connected to Local Node.js + SQLite Backend
// ============================================================


// ============================================================
// MOBILE MENU
// ============================================================

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {

        nav.classList.toggle("active");

    });

}


// Close mobile menu after clicking a link

document.querySelectorAll(".nav a").forEach(link => {

    link.addEventListener("click", () => {

        if (nav) {
            nav.classList.remove("active");
        }

    });

});


// ============================================================
// SECURITY HELPER
// ============================================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    // Database format: YYYY-MM-DD

    const parts = String(dateValue).split("-");

    if (parts.length === 3) {

        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }

    return dateValue;

}


// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(timeValue) {

    if (!timeValue) {
        return "";
    }

    const parts = String(timeValue).split(":");

    if (parts.length < 2) {
        return timeValue;
    }

    let hour = parseInt(parts[0], 10);

    const minute = parts[1];

    if (Number.isNaN(hour)) {
        return timeValue;
    }

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minute} ${period}`;

}


// ============================================================
// LOAD CHOIR MEMBERS
// ============================================================

async function loadMembers() {

    const container =
        document.getElementById("membersList");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch("/api/members");

        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load choir members."
            );

        }


        if (
            !data.members ||
            data.members.length === 0
        ) {

            container.innerHTML = `

                <p>
                    No choir members have been added yet.
                </p>

            `;

            return;

        }


        container.innerHTML = "";


        data.members.forEach(member => {

            const card =
                document.createElement("article");

            card.className =
                "member-card";


            // Ignore invalid placeholder values

            let photo = member.photo;

            if (
                !photo ||
                photo === ":" ||
                photo.length < 5
            ) {

                photo =
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80";

            }


            card.innerHTML = `

                <img
                    src="${escapeHTML(photo)}"
                    alt="${escapeHTML(member.name)}"
                    class="member-photo"
                    loading="lazy"
                >

                <div class="member-info">

                    <h3>
                        ${escapeHTML(member.name)}
                    </h3>

                    <div class="member-role">

                        ${escapeHTML(
                            member.position ||
                            "Choir Member"
                        )}

                    </div>

                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Members error:",
            error
        );


        container.innerHTML = `

            <p>
                Unable to connect to the server.
            </p>

        `;

    }

}


// ============================================================
// LOAD SERVICES
// ============================================================

async function loadServices() {

    const container =
        document.getElementById("servicesList");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch("/api/services");

        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load services."
            );

        }


        if (
            !data.services ||
            data.services.length === 0
        ) {

            container.innerHTML = `

                <p>
                    No services have been added yet.
                </p>

            `;

            return;

        }


        container.innerHTML = "";


        data.services.forEach(service => {

            const card =
                document.createElement("article");

            card.className =
                "service-card";


            card.innerHTML = `

                <div class="service-icon">

                    <i class="fas fa-church"></i>

                </div>


                <h3>
                    ${escapeHTML(service.title)}
                </h3>


                <p>
                    ${escapeHTML(
                        service.description || ""
                    )}
                </p>


                <div class="service-meta">


                    <div>

                        <i class="far fa-clock"></i>

                        ${escapeHTML(
                            service.service_time ||
                            "Time not specified"
                        )}

                    </div>


                    <div>

                        <i class="fas fa-location-dot"></i>

                        ${escapeHTML(
                            service.location ||
                            "Location not specified"
                        )}

                    </div>


                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Services error:",
            error
        );


        container.innerHTML = `

            <p>
                Unable to connect to the server.
            </p>

        `;

    }

}


// ============================================================
// LOAD ACTIVITIES
// ============================================================

async function loadActivities() {

    const container =
        document.getElementById("activitiesList");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch("/api/activities");

        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load activities."
            );

        }


        if (
            !data.activities ||
            data.activities.length === 0
        ) {

            container.innerHTML = `

                <p>
                    No upcoming activities yet.
                </p>

            `;

            return;

        }


        container.innerHTML = "";


        data.activities.forEach(activity => {

            const card =
                document.createElement("article");

            card.className =
                "activity-card";


            // Only use image if one was actually provided

            let image = activity.image;

            const hasImage =
                image &&
                image.trim() !== "" &&
                image !== ":";


            card.innerHTML = `


                ${
                    hasImage

                    ? `

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(
                                activity.title ||
                                "Choir activity"
                            )}"
                            loading="lazy"
                        >

                    `

                    : `

                        <div class="activity-placeholder">

                            <i class="fas fa-calendar-day"></i>

                        </div>

                    `
                }


                <div class="activity-info">


                    ${
                        activity.event_date

                        ? `

                            <div class="activity-date">

                                <i class="far fa-calendar"></i>

                                ${escapeHTML(
                                    formatDate(
                                        activity.event_date
                                    )
                                )}

                            </div>

                        `

                        : ""

                    }


                    <h3>

                        ${escapeHTML(
                            activity.title ||
                            "Choir Activity"
                        )}

                    </h3>


                    ${
                        activity.description

                        ? `

                            <p>

                                ${escapeHTML(
                                    activity.description
                                )}

                            </p>

                        `

                        : ""

                    }


                    ${
                        activity.event_time

                        ? `

                            <p class="activity-location">

                                <i class="far fa-clock"></i>

                                ${escapeHTML(
                                    formatTime(
                                        activity.event_time
                                    )
                                )}

                            </p>

                        `

                        : ""

                    }


                    ${
                        activity.location

                        ? `

                            <p class="activity-location">

                                <i class="fas fa-location-dot"></i>

                                ${escapeHTML(
                                    activity.location
                                )}

                            </p>

                        `

                        : ""

                    }


                </div>

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Activities error:",
            error
        );


        container.innerHTML = `

            <p>
                Unable to connect to the server.
            </p>

        `;

    }

}


// ============================================================
// LOAD SONGS
// ============================================================

async function loadSongs() {

    const container =
        document.getElementById("songsList");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch("/api/songs");

        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load songs."
            );

        }


        if (
            !data.songs ||
            data.songs.length === 0
        ) {

            container.innerHTML = `

                <p>
                    No songs have been added yet.
                </p>

            `;

            return;

        }


        container.innerHTML = "";


        data.songs.forEach((song, index) => {

            const card =
                document.createElement("article");

            card.className =
                "song-card";


            card.innerHTML = `

                <div class="song-number">

                    ${String(index + 1).padStart(2, "0")}

                </div>


                <div class="song-info">

                    <h3>

                        ${escapeHTML(
                            song.title ||
                            "Untitled Song"
                        )}

                    </h3>


                    <p>

                        ${
                            song.category
                            ? escapeHTML(song.category)
                            : "Choir Worship"
                        }


                        ${
                            song.description
                            ? " · " +
                              escapeHTML(
                                  song.description
                              )
                            : ""
                        }

                    </p>

                </div>


                ${
                    song.audio

                    ? `

                        <audio
                            controls
                            preload="none">

                            <source
                                src="${escapeHTML(
                                    song.audio
                                )}">

                            Your browser does not support
                            audio playback.

                        </audio>

                    `

                    : `

                        <span class="no-audio">

                            Audio coming soon

                        </span>

                    `
                }

            `;


            container.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Songs error:",
            error
        );


        container.innerHTML = `

            <p>
                Unable to connect to the server.
            </p>

        `;

    }

}


// ============================================================
// LOAD GALLERY
// ============================================================

async function loadGallery() {

    const container =
        document.getElementById("galleryList");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch("/api/gallery");

        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load gallery."
            );

        }


        if (
            !data.gallery ||
            data.gallery.length === 0
        ) {

            container.innerHTML = `

                <p>
                    No photographs have been added yet.
                </p>

            `;

            return;

        }


        container.innerHTML = "";


        data.gallery.forEach(item => {

            const galleryItem =
                document.createElement("div");

            galleryItem.className =
                "gallery-item";


            galleryItem.innerHTML = `

                <img

                    src="${escapeHTML(
                        item.image || ""
                    )}"

                    alt="${escapeHTML(
                        item.title ||
                        "Choir photograph"
                    )}"

                    loading="lazy"

                >


                <div class="gallery-caption">

                    <strong>

                        ${escapeHTML(
                            item.title || ""
                        )}

                    </strong>


                    ${
                        item.description

                        ? `

                            <p>

                                ${escapeHTML(
                                    item.description
                                )}

                            </p>

                        `

                        : ""

                    }

                </div>

            `;


            container.appendChild(galleryItem);

        });


    } catch (error) {

        console.error(
            "Gallery error:",
            error
        );


        container.innerHTML = `

            <p>
                Unable to connect to the server.
            </p>

        `;

    }

}


// ============================================================
// START WEBSITE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMembers();

        loadServices();

        loadActivities();

        loadSongs();

        loadGallery();

    }
);
```
