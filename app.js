const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { spawn } = require("child_process");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(
    "mongodb://127.0.0.1:27017/ocean_data_visualization"
)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log(
            "MongoDB connection error:",
            error
        );
    });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model(
    "User",
    userSchema
);

app.use(
    session({
        secret: process.env.SESSION_SECRET || "ocean-intelligence-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

function requireLogin(req, res, next) {

    if (req.session && req.session.userId) {
        return next();
    }

    if (req.path.startsWith("/api/")) {

        return res.status(401).json({
            success: false,
            error: "Unauthorized. Please login first."
        });
    }

    res.redirect("/login");
}

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {

    if (req.session && req.session.userId) {
        return res.redirect("/dashboard");
    }

    res.render("login");
});

app.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.send(
                "Email and password are required"
            );
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.send(
                "Invalid email or password"
            );
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.send(
                "Invalid email or password"
            );
        }

        req.session.userId =
            user._id.toString();

        req.session.userName =
            user.name;

        res.redirect("/dashboard");

    } catch (error) {

        console.log(
            "Login error:",
            error
        );

        res.send("Login error");
    }
});

app.get("/signup", (req, res) => {

    if (req.session && req.session.userId) {
        return res.redirect("/dashboard");
    }

    res.render("signup");
});

app.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.send(
                "Name, email and password are required"
            );
        }

        const cleanEmail =
            email.toLowerCase().trim();

        const existingUser =
            await User.findOne({
                email: cleanEmail
            });

        if (existingUser) {
            return res.send(
                "Email already registered"
            );
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        const newUser = new User({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword
        });

        await newUser.save();

        req.session.userId =
            newUser._id.toString();

        req.session.userName =
            newUser.name;

        res.redirect("/dashboard");

    } catch (error) {

        console.log(
            "Signup error:",
            error
        );

        res.send("Signup error");
    }
});

app.get(
    "/logout",
    (req, res) => {

        req.session.destroy(
            (error) => {

                if (error) {
                    console.log(
                        "Logout error:",
                        error
                    );

                    return res.send(
                        "Logout error"
                    );
                }

                res.clearCookie("connect.sid");

                res.redirect("/login");
            }
        );
    }
);

app.get(
    "/dashboard",
    requireLogin,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.session.userId
                );

            if (!user) {

                req.session.destroy(
                    () => {}
                );

                return res.redirect("/login");
            }

            res.render("dashboard", {
                userName: user.name
            });

        } catch (error) {

            console.log(
                "Dashboard error:",
                error
            );

            res.redirect("/login");
        }
    }
);

function runPython(args) {

    return new Promise(
        (resolve, reject) => {

            const pythonScript =
                path.join(
                    __dirname,
                    "ocean_api",
                    "ocean_data.py"
                );

            const pythonCommand =
                process.env.PYTHON_PATH ||
                "python";

            const pythonProcess =
                spawn(
                    pythonCommand,
                    [
                        pythonScript,
                        ...args.map(String)
                    ]
                );

            let stdout = "";
            let stderr = "";
            let finished = false;

            const timeout =
                setTimeout(() => {

                    if (finished) return;

                    finished = true;

                    pythonProcess.kill();

                    reject(
                        new Error(
                            "Ocean data request timed out."
                        )
                    );

                }, 60000);

            pythonProcess.stdout.on(
                "data",
                (data) => {
                    stdout +=
                        data.toString();
                }
            );

            pythonProcess.stderr.on(
                "data",
                (data) => {

                    const message =
                        data.toString();

                    stderr += message;

                    console.log(
                        "Python:",
                        message.trim()
                    );
                }
            );

            pythonProcess.on(
                "error",
                (error) => {

                    if (finished) return;

                    finished = true;

                    clearTimeout(
                        timeout
                    );

                    reject(error);
                }
            );

            pythonProcess.on(
                "close",
                (code) => {

                    if (finished) return;

                    finished = true;

                    clearTimeout(
                        timeout
                    );

                    console.log(
                        "Python process finished with code:",
                        code
                    );

                    const lines =
                        stdout
                            .split(/\r?\n/)
                            .map(
                                line =>
                                    line.trim()
                            )
                            .filter(Boolean);

                    let result = null;

                    for (
                        let i = lines.length - 1;
                        i >= 0;
                        i--
                    ) {

                        try {

                            const parsed =
                                JSON.parse(
                                    lines[i]
                                );

                            if (
                                parsed &&
                                typeof parsed ===
                                    "object" &&
                                parsed.success !==
                                    undefined
                            ) {

                                result = parsed;

                                break;
                            }

                        } catch (error) {
                        }
                    }

                    if (!result) {

                        console.log(
                            "Python stdout:",
                            stdout
                        );

                        console.log(
                            "Python stderr:",
                            stderr
                        );

                        return reject(
                            new Error(
                                "No valid ocean data response from Python."
                            )
                        );
                    }

                    if (
                        result.success !== true
                    ) {

                        return reject(
                            new Error(
                                result.error ||
                                "Ocean data unavailable."
                            )
                        );
                    }

                    resolve(result);
                }
            );
        }
    );
}

function getOceanData(
    latitude,
    longitude,
    depth
) {

    return runPython([
        latitude,
        longitude,
        depth
    ]);
}

function getOceanProfile(
    latitude,
    longitude,
    maxDepth
) {

    return runPython([
        "profile",
        latitude,
        longitude,
        maxDepth
    ]);
}

app.get(
    "/api/ocean-data",
    requireLogin,
    async (req, res) => {

        const latitude =
            Number(req.query.lat);

        const longitude =
            Number(req.query.lon);

        const depth =
            Number(req.query.depth);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            !Number.isFinite(depth)
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Invalid coordinates or depth."
            });
        }

        if (
            latitude < -90 ||
            latitude > 90
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Latitude must be between -90 and 90."
            });
        }

        if (
            longitude < -180 ||
            longitude > 180
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Longitude must be between -180 and 180."
            });
        }

        if (
            depth < 0 ||
            depth > 6000
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Depth must be between 0 and 6000 meters."
            });
        }

        try {

            console.log(
                `LOCAL OCEAN LOOKUP: ${latitude}, ${longitude}, ${depth}m`
            );

            const data =
                await getOceanData(
                    latitude,
                    longitude,
                    depth
                );

            console.log(
                "Ocean data received successfully."
            );

            res.json(data);

        } catch (error) {

            console.log(
                "Ocean data error:",
                error.message
            );

            res.status(500).json({
                success: false,
                error:
                    error.message
            });
        }
    }
);

app.get(
    "/api/ocean-profile",
    requireLogin,
    async (req, res) => {

        const latitude =
            Number(req.query.lat);

        const longitude =
            Number(req.query.lon);

        const maxDepth =
            Number(
                req.query.maxDepth || 6000
            );

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            !Number.isFinite(maxDepth)
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Invalid coordinates or depth."
            });
        }

        if (
            latitude < -90 ||
            latitude > 90
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Latitude must be between -90 and 90."
            });
        }

        if (
            longitude < -180 ||
            longitude > 180
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Longitude must be between -180 and 180."
            });
        }

        if (
            maxDepth < 0 ||
            maxDepth > 6000
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Maximum depth must be between 0 and 6000 meters."
            });
        }

        try {

            console.log(
                `OCEAN PROFILE: ${latitude}, ${longitude}, ${maxDepth}m`
            );

            const profile =
                await getOceanProfile(
                    latitude,
                    longitude,
                    maxDepth
                );

            console.log(
                "Ocean profile received successfully."
            );

            res.json(profile);

        } catch (error) {

            console.log(
                "Ocean profile error:",
                error.message
            );

            res.status(500).json({
                success: false,
                error:
                    error.message
            });
        }
    }
);

app.listen(8080, () => {

    console.log(
        "Server running on http://localhost:8080"
    );
});