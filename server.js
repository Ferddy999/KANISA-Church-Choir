const express = require("express");
const path = require("path");

// Connect to our SQLite database
const db = require("./database.js");
const multer = require("multer");
const app = express();
const PORT = 3000;

// Allow the server to receive JSON
app.use(express.json());

// Allow form data
app.use(express.urlencoded({ extended: true }));

// Serve files from the public folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/ChurchChoir", express.static(
    path.join(__dirname, "ChurchChoir")
));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/uploads", express.static(
    path.join(__dirname, "uploads")
));
// =========================
// IMAGE UPLOAD CONFIGURATION
// =========================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "uploads/");

    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes =
            /jpeg|jpg|png|webp/;

        const extension =
            allowedTypes.test(
                path.extname(file.originalname).toLowerCase()
            );

        const mimeType =
            allowedTypes.test(file.mimetype);

        if (extension && mimeType) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
                )
            );

        }

    }

});

// =========================
// HOME PAGE
// =========================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// =========================
// DATABASE TEST
// =========================

app.get("/api/test", (req, res) => {

    db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        (err, tables) => {

            if (err) {
                console.error(err.message);

                return res.status(500).json({
                    success: false,
                    message: "Database error",
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Backend and database are connected!",
                tables: tables
            });

        }
    );

});
// =========================
// ADMIN LOGIN
// =========================

app.post("/api/admin/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {

        return res.json({
            success: false,
            message: "Please enter username and password."
        });

    }

    db.get(
        "SELECT * FROM admins WHERE username = ? AND password = ?",
        [username, password],
        (err, admin) => {

            if (err) {

                console.error(err.message);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });

            }

            if (!admin) {

                return res.json({
                    success: false,
                    message: "Invalid username or password."
                });

            }

            res.json({
                success: true,
                message: "Login successful."
            });

        }
    );

});
// =========================
// MEMBERS API
// =========================

// Get all members
app.get("/api/members", (req, res) => {

    db.all(
        "SELECT * FROM members ORDER BY id DESC",
        [],
        (err, members) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to load members.",
                    error: err.message
                });
            }

            res.json({
                success: true,
                members: members
            });

        }
    );

});


// Add a new member
app.post("/api/members", (req, res) => {

    const {
        name,
        position,
        phone,
        email,
        photo
    } = req.body;

    if (!name) {

        return res.status(400).json({
            success: false,
            message: "Member name is required."
        });

    }

    db.run(
        `INSERT INTO members
        (name, position, phone, email, photo)
        VALUES (?, ?, ?, ?, ?)`,
        [
            name,
            position || "",
            phone || "",
            email || "",
            photo || ""
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to add member.",
                    error: err.message
                });

            }

            res.json({
                success: true,
                message: "Member added successfully.",
                memberId: this.lastID
            });

        }
    );

});


// Delete a member
app.delete("/api/members/:id", (req, res) => {

    const { id } = req.params;

    db.run(
        "DELETE FROM members WHERE id = ?",
        [id],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete member.",
                    error: err.message
                });

            }

            res.json({
                success: true,
                message: "Member deleted successfully."
            });

        }
    );

});
// =========================
// DASHBOARD STATISTICS
// =========================

app.get("/api/dashboard/stats", (req, res) => {

    const queries = {
        members: "SELECT COUNT(*) AS count FROM members",
        songs: "SELECT COUNT(*) AS count FROM songs",
        activities: "SELECT COUNT(*) AS count FROM activities",
        gallery: "SELECT COUNT(*) AS count FROM gallery"
    };

    db.get(queries.members, [], (err, members) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        db.get(queries.songs, [], (err, songs) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            db.get(queries.activities, [], (err, activities) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });
                }

                db.get(queries.gallery, [], (err, gallery) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    res.json({
                        success: true,
                        members: members.count,
                        songs: songs.count,
                        activities: activities.count,
                        gallery: gallery.count
                    });

                });

            });

        });

    });

});
// =========================
// SONGS API
// =========================

// Get all songs
app.get("/api/songs", (req, res) => {

    db.all(
        "SELECT * FROM songs ORDER BY id DESC",
        [],
        (err, songs) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to load songs.",
                    error: err.message
                });
            }

            res.json({
                success: true,
                songs: songs
            });

        }
    );

});


// Add a song
app.post("/api/songs", (req, res) => {

    const {
        title,
        category,
        description,
        audio,
        cover_image
    } = req.body;

    if (!title) {

        return res.status(400).json({
            success: false,
            message: "Song title is required."
        });

    }

    db.run(
        `INSERT INTO songs
        (title, category, description, audio, cover_image)
        VALUES (?, ?, ?, ?, ?)`,
        [
            title,
            category || "",
            description || "",
            audio || "",
            cover_image || ""
        ],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to add song.",
                    error: err.message
                });

            }

            res.json({
                success: true,
                message: "Song added successfully.",
                songId: this.lastID
            });

        }
    );

});


// Delete a song
app.delete("/api/songs/:id", (req, res) => {

    const { id } = req.params;

    db.run(
        "DELETE FROM songs WHERE id = ?",
        [id],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete song.",
                    error: err.message
                });

            }

            res.json({
                success: true,
                message: "Song deleted successfully."
            });

        }
    );

});
// =========================
// SONGS API
// =========================

// Get all songs
app.get("/api/songs", (req, res) => {

    db.all(
        "SELECT * FROM songs ORDER BY id DESC",
        [],
        (err, songs) => {

            if (err) {
                console.error("Songs error:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Failed to load songs.",
                    error: err.message
                });
            }

            res.json({
                success: true,
                songs: songs
            });
        }
    );

});


// Add song
app.post("/api/songs", (req, res) => {

    const {
        title,
        category,
        description,
        audio,
        cover_image
    } = req.body;

    if (!title) {

        return res.status(400).json({
            success: false,
            message: "Song title is required."
        });

    }

    db.run(
        `INSERT INTO songs
        (title, category, description, audio, cover_image)
        VALUES (?, ?, ?, ?, ?)`,
        [
            title,
            category || "",
            description || "",
            audio || "",
            cover_image || ""
        ],
        function (err) {

            if (err) {

                console.error("Add song error:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Failed to add song.",
                    error: err.message
                });

            }

            res.json({
                success: true,
                message: "Song added successfully.",
                songId: this.lastID
            });

        }
    );

});


// Delete song
app.delete("/api/songs/:id", (req, res) => {

    const { id } = req.params;

    db.run(
        "DELETE FROM songs WHERE id = ?",
        [id],
        function (err) {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete song.",
                    error: err.message
                });

            }

            res.json({
                success: true,
                message: "Song deleted successfully."
            });

        }
    );

});
// ==========================================
// ACTIVITIES API
// ==========================================

// GET ALL ACTIVITIES
app.get("/api/activities", (req, res) => {

    db.all(
        "SELECT * FROM activities ORDER BY id DESC",
        [],
        (err, activities) => {

            if (err) {
                console.error("Activities error:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Failed to load activities.",
                    error: err.message
                });
            }

            res.json({
                success: true,
                activities: activities
            });
        }
    );

});


// ADD ACTIVITY
app.post("/api/activities", (req, res) => {

    const {
        title,
        description,
        event_date,
        event_time,
        location,
        image
    } = req.body;


    if (!title) {

        return res.status(400).json({
            success: false,
            message: "Activity title is required."
        });

    }


    db.run(
        `INSERT INTO activities
        (title, description, event_date, event_time, location, image)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            title,
            description || "",
            event_date || "",
            event_time || "",
            location || "",
            image || ""
        ],
        function (err) {

            if (err) {

                console.error(
                    "Add activity error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to add activity.",
                    error: err.message
                });

            }


            res.json({

                success: true,

                message: "Activity added successfully.",

                activity: {
                    id: this.lastID,
                    title: title,
                    description: description || "",
                    event_date: event_date || "",
                    event_time: event_time || "",
                    location: location || "",
                    image: image || ""
                }

            });

        }
    );

});


// DELETE ACTIVITY
app.delete("/api/activities/:id", (req, res) => {

    const { id } = req.params;


    db.run(
        "DELETE FROM activities WHERE id = ?",
        [id],
        function (err) {

            if (err) {

                console.error(
                    "Delete activity error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete activity.",
                    error: err.message
                });

            }


            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Activity not found."
                });

            }


            res.json({
                success: true,
                message: "Activity deleted successfully."
            });

        }
    );

});
// =========================
// SERVICES API
// =========================

// Get all services
app.get("/api/services", (req, res) => {

    db.all(
        "SELECT * FROM services ORDER BY id DESC",
        [],
        (err, services) => {

            if (err) {
                console.error("Services error:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Failed to load services.",
                    error: err.message
                });
            }

            res.json({
                success: true,
                services: services
            });
        }
    );

});


// Add a service
app.post("/api/services", (req, res) => {

    const {
        title,
        description,
        service_time,
        location
    } = req.body;

    if (!title) {

        return res.status(400).json({
            success: false,
            message: "Service title is required."
        });

    }

    db.run(
        `INSERT INTO services
        (title, description, service_time, location)
        VALUES (?, ?, ?, ?)`,
        [
            title,
            description || "",
            service_time || "",
            location || ""
        ],
        function (err) {

            if (err) {
                console.error("Add service error:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Failed to add service.",
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Service added successfully.",
                serviceId: this.lastID
            });

        }
    );

});


// Delete a service
app.delete("/api/services/:id", (req, res) => {

    const { id } = req.params;

    db.run(
        "DELETE FROM services WHERE id = ?",
        [id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete service.",
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Service deleted successfully."
            });
        }
    );

});
// =========================
// GALLERY API
// =========================

// Get gallery images
app.get("/api/gallery", (req, res) => {

    db.all(
        "SELECT * FROM gallery ORDER BY id DESC",
        [],
        (err, images) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to load gallery.",
                    error: err.message
                });

            }

            res.json({
                success: true,
                gallery: images
            });

        }
    );

});


// Upload gallery image
app.post(
    "/api/gallery",
    upload.single("image"),
    (req, res) => {

        const {
            title,
            description
        } = req.body;


        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });

        }


        const imagePath =
            "/uploads/" + req.file.filename;


        db.run(
            `INSERT INTO gallery
            (title, image, description)
            VALUES (?, ?, ?)`,
            [
                title || "",
                imagePath,
                description || ""
            ],
            function (err) {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: "Failed to save gallery image.",
                        error: err.message
                    });

                }


                res.json({

                    success: true,

                    message:
                        "Gallery image uploaded successfully.",

                    imageId:
                        this.lastID,

                    image:
                        imagePath

                });

            }
        );

    }
);


// Delete gallery image
app.delete("/api/gallery/:id", (req, res) => {

    const { id } = req.params;


    db.get(
        "SELECT image FROM gallery WHERE id = ?",
        [id],
        (err, item) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }


            db.run(
                "DELETE FROM gallery WHERE id = ?",
                [id],
                function (err) {

                    if (err) {

                        return res.status(500).json({
                            success: false,
                            message: "Failed to delete image.",
                            error: err.message
                        });

                    }


                    res.json({
                        success: true,
                        message: "Gallery image deleted successfully."
                    });

                }
            );

        }
    );

});
// ===============================
// DASHBOARD STATISTICS
// ===============================

app.get("/api/stats", (req, res) => {

    const queries = {

        members:
            "SELECT COUNT(*) AS count FROM members",

        songs:
            "SELECT COUNT(*) AS count FROM songs",

        activities:
            "SELECT COUNT(*) AS count FROM activities",

        services:
            "SELECT COUNT(*) AS count FROM services",

        gallery:
            "SELECT COUNT(*) AS count FROM gallery"

    };


    db.get(queries.members, (err, members) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to count members"
            });
        }


        db.get(queries.songs, (err, songs) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to count songs"
                });
            }


            db.get(queries.activities, (err, activities) => {

                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Unable to count activities"
                    });
                }


                db.get(queries.services, (err, services) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Unable to count services"
                        });
                    }


                    db.get(queries.gallery, (err, gallery) => {

                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: "Unable to count gallery"
                            });
                        }


                        res.json({

                            success: true,

                            stats: {

                                members:
                                    members.count,

                                songs:
                                    songs.count,

                                activities:
                                    activities.count,

                                services:
                                    services.count,

                                gallery:
                                    gallery.count

                            }

                        });

                    });

                });

            });

        });

    });

});
// ==========================================
// ACTIVITIES API
// ==========================================

// Get all activities
app.get("/api/activities", (req, res) => {

    db.all(
        "SELECT * FROM activities ORDER BY id DESC",
        [],
        (err, activities) => {

            if (err) {

                console.error(
                    "Activities error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to load activities.",
                    error: err.message
                });

            }

            res.json({
                success: true,
                activities: activities
            });

        }
    );

});


// Add a new activity
app.post("/api/activities", (req, res) => {

    const {
        title,
        description,
        service_time,
        location
    } = req.body;


    if (!title) {

        return res.status(400).json({
            success: false,
            message: "Activity title is required."
        });

    }


    db.run(
        `INSERT INTO activities
        (title, description, service_time, location)
        VALUES (?, ?, ?, ?)`,
        [
            title,
            description || "",
            service_time || "",
            location || ""
        ],
        function (err) {

            if (err) {

                console.error(
                    "Add activity error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to add activity.",
                    error: err.message
                });

            }


            res.json({

                success: true,

                message: "Activity added successfully.",

                activity: {

                    id: this.lastID,
                    title: title,
                    description: description || "",
                    service_time: service_time || "",
                    location: location || ""

                }

            });

        }
    );

});


// Delete an activity
app.delete("/api/activities/:id", (req, res) => {

    const { id } = req.params;


    db.run(
        "DELETE FROM activities WHERE id = ?",
        [id],
        function (err) {

            if (err) {

                console.error(
                    "Delete activity error:",
                    err.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete activity.",
                    error: err.message
                });

            }


            if (this.changes === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Activity not found."
                });

            }


            res.json({

                success: true,

                message: "Activity deleted successfully."

            });

        }
    );

});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {

    console.log("--------------------------------------");
    console.log("   CHURCH CHOIR WEBSITE");
    console.log("--------------------------------------");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("Database: Connected");
    console.log("--------------------------------------");

});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});