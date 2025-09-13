require("dotenv").config();
const express = require("express");
const multer = require("multer");
const passport = require("passport");
const cors = require("cors");
const bcrypt = require("bcrypt");
const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// --- SCHEMA  ---
const { uploadOnCloudinary } = require('./config/cloudinary.js');
const connectDB = require('./config/db');
const contactUs = require("./models/contactUs.js");
const UserIntern = require('./models/userIntern');
const internForm = require('./models/internForm');
const UserRecruiter = require('./models/userRecruiter.js');
const Job = require("./models/postJob.js");
const applyInternship = require("./models/applyInternship.js");
const EditProfile = require("./models/editProfile.js");
const contactEditProfile = require("./models/contactEditProfile.js");
// const experience = require("./models/experience.js");
// const about = require("./models/about.js");
// const education = require("./models/education.js");
// const skills = require("./models/skills.js");
// const profile = require("./models/profile.js");
// const myWork = require("./models/myWork.js"); 

// --- Connect to DB ---
connectDB();
const app = express();
const dirname = "C://Users//hp//Downloads//today portfolio-hub";
// --- Middleware ---
app.use(cors({ origin: "http://127.0.0.1:5500", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(express.static(path.join(dirname)));

// --- Multer Setup ---
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir); }
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: storage, limits: { fieldSize: 10 * 1024 * 1024 } }); // 10MB limit

// File storage (images + resume)  EDIT PROFILE
const storageEditProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, "uploads/resumes");
    else cb(null, "uploads/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadEditProfile = multer({ storageEditProfile });

// ===================================================
// --- User Model & JWT Strategy for Authentication ---
// ===================================================

// --- Passport JWT Strategy Configuration ---
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'a-very-strong-secret-key'
};

// Reusable function to update any section of the EDIT-PROFILE PAGE
const updateSection = async (Model, query, data, res) => {
    try {
        const updatedDoc = await Model.findOneAndUpdate(query, data, {
            new: true, // Return the updated document
            upsert: true, // Create if it doesn't exist
        });
        res.status(200).json({ message: 'Section saved successfully!', data: updatedDoc });
    } catch (error) {
              console.error("Error saving section:", error);
        res.status(500).json({ message: 'Error saving section', error });
    }
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
        const user = await UserIntern.findById(jwt_payload.id);
        if (user) return done(null, user);
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

// ============================================
// ------------------ RECRUITER AUTH  ------------------
// ============================================

const authenticateRecruiter = async(req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, jwtOptions.secretOrKey);
      const recruiter = await UserRecruiter.findById(decoded.id);

    // 3. If no user is found, they are not a valid recruiter
    if (!recruiter) {
      return res.status(401).json({ message: "Unauthorized: Not a recruiter" });
    }

    // 4. Attach the full recruiter document to the request
    req.user = recruiter; // Standardizing on req.user is common practice
    next();
    // req.recruiter = decoded; // { id, username }
    // next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
// ============================================
// ------------------ Intern AUTH  ------------------
// ============================================
const authenticateIntern = async(req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, jwtOptions.secretOrKey);
    const user = await UserIntern.findById(decoded.id);

    // 3. If no user is found in that collection, they are not a valid intern
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Not an intern" });
    }

    // 4. Attach the full user document (not just the decoded part) to the request
    req.user = user; 
    next();
    // req.user = decoded; // { id, username }
    // next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

app.get('/intern-signup', (req,res)=> {
    res.send("Intern signup sucessfull");
})

app.get('/login', (req,res)=>{
    res.send("Login sucessfull ");
})

app.get('/contactUs', (req,res)=> {
  res.send(" Contact Us sucessfull ");
})

app.get('/forms',(req,res)=> {
    res.send(" FOrms ")
})

app.get('/recruiter-signup',(req,res)=> { 
    res.send("Recruiter signup sucessfull");
})

// Get logged-in user's portfolio (only if they filled the form)
app.get(
  '/profile', authenticateIntern, async (req, res) => {
    try {
      // Find portfolio by userId
      const portfolio = await internForm.findOne({ userId: req.user._id });
      console.log("Fetched portfolio in server:", portfolio);

      if (!portfolio) {
        return res.status(404).json({
          message: "Portfolio not found. Please fill the form to create one.",
        });
      }

      return res.status(200).json({
        message: "Portfolio fetched successfully!",
        data: portfolio,
      });

    } catch (err) {
      console.error("❌ Error fetching portfolio:", err);
      return res.status(500).json({ message: "Server error while fetching portfolio." });
    }
  }
);


app.get('/send-contact', (req,res)=> {
    res.send("Contact me sucessfull");
});

// =============== Get paginated list of intern profiles for recruiters , in receuit-Index.html =================

app.get('/recruiter/profiles', async (req, res) => {
  try {
    const { page = 1, limit = 6 } = req.query;
    const skip = (page - 1) * limit;

    const total = await internForm.countDocuments();
    const profiles = await internForm
      .find({}, "fullName role city aboutMe skills photo") // only preview fields
      .skip(skip)
      .limit(Number(limit));

    res.json({
      profiles,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching profiles." });
  }
});

//  GET PORTFOLIO BY USERID (FOR RECRUITERS TO VIEW INTERN PORTFOLIOS)
// Get portfolio by userId (for recruiters to view)
app.get('/profile/:id', async (req, res) => {
    console.log("🔍 Looking for portfolio of user:", req.params.id);
  try {
    const portfolio = await internForm.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.status(200).json(portfolio);
  } catch (err) {
    console.error("❌ Error fetching portfolio by ID:", err);
    res.status(500).json({ message: "Server error while fetching portfolio" });
  }
});

// ======================================================
// GET all jobs (for recruiters dashboard or interns to browse)
// ======================================================

app.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.find();

    const jobsWithApplicants = await Promise.all(
      jobs.map(async job => {
        const applicantCount = await applyInternship.countDocuments({
          internshipId: job._id
        });
        return {
          ...job.toObject(),
          applicantCount
        };
      })
    );

    res.json(jobsWithApplicants);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    res.status(500).json({ message: "Server error while fetching jobs" });
  }
});



app.get("/recruiter/jobs", authenticateRecruiter, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching recruiter jobs" });
  }
});

app.get('/applyInternship', authenticateIntern, async (req, res) => {
  try {
    const userId = req.user.id;

    const allInternships = await Job.find({});
    const userApplications = await applyInternship.find({ userId });

    const appliedInternshipIds = new Set(
      userApplications.map(app => app.internshipId.toString())
    );

    const internshipsWithStatus = allInternships.map(internship => {
      return {
        ...internship.toObject(),
        hasApplied: appliedInternshipIds.has(internship._id.toString())
      };
    });

    res.json(internshipsWithStatus);

  } catch (error) {
    console.error('Error fetching internships with status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get logged-in user’s applications only
app.get('/myApplications',authenticateIntern, async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await applyInternship.find({ userId }).populate("internshipId");
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================================
// GET ALL APPLICANTS FOR A SPECIFIC RECRUITER
// ======================================================
app.get("/recruiter/applicants", authenticateRecruiter, async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const jobs = await Job.find({ recruiterId: recruiterId }, '_id').lean();
    if (!jobs.length) {
      return res.json([]); // No jobs, so no applicants
    }
    const jobIds = jobs.map(job => job._id);

    const applications = await applyInternship.find({ 
      internshipId: { $in: jobIds } 
    }).lean(); // Use .lean() for better performance

    const applicantUserIds = [...new Set(applications.map(app => app.userId))];

    const portfolios = await internForm.find({ 
      userId: { $in: applicantUserIds } 
    }, 'userId fullName role city skills photo').lean();

    const portfolioMap = new Map(portfolios.map(p => [p.userId.toString(), p]));

    const fullApplicantDetails = applications.map(app => {
      const portfolio = portfolioMap.get(app.userId.toString());
      return {
        applicationId: app._id, 
        status: app.status,    
        portfolio: portfolio   
      };
    }).filter(app => app.portfolio); 

    res.json(fullApplicantDetails);

  } catch (err) {
    console.error("❌ Error fetching applicants for recruiter:", err);
    res.status(500).json({ message: "Server error while fetching applicants" });
  }
});

// ==============================
// INTERN  AUTH CHECK  --- FOR FRONTEND
//  =============================
app.get('/me', (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        console.log("Token received in /me:", token);
        if (token == null) {
            return res.status(401).json({ authenticated: false, message: 'No token provided.' });
        }

        jwt.verify(token, jwtOptions.secretOrKey, (err, user) => {
            if (err) {
               console.error('JWT Verification Error:', err.message);
                return res.status(403).json({ authenticated: false, message: 'Invalid token.' });
            }

            req.user = user;
            console.log("User verified in /me:", user);
            res.status(200).json({ authenticated: true, user: req.user });
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during token verification.' });
    }
});

// ==============================
//   RECRUITER AUTH CHECK  --- FOR FRONTEND
//  =============================

app.get('/recruiter/me', (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

        if (token == null) {
            return res.status(401).json({ authenticated: false, message: 'No token provided.' });
        }

        jwt.verify(token, jwtOptions.secretOrKey, (err, user) => {
            if (err) {
                console.error('Recruiter JWT Verification Error:', err.message);
                return res.status(403).json({ authenticated: false, message: 'Token is invalid or expired.' });
            }
            
            res.status(200).json({ authenticated: true, user: user });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during token verification.' });
    }
});


app.get('/editProfile', async (req, res) => {
  try {
    const profile = await editProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});


// ===================================================
// --------------------- Signup Route FOR INTERNS  ----------------
// ===================================================

app.post('/intern-signup', async (req, res) => {
    try {
      console.log("Request body received at /intern-signup:", req.body);
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const savedUser = await new UserIntern({ username, email, password: hashedPassword }).save();
        const payload = { id: savedUser._id, username: savedUser.username };
        const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1d' }); //1 day expiration
        console.log("token from signup route=  ", token);
        return res.status(201).json({ success: true, message: "Registration successful!", token: token });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Email already registered.' });
        res.status(500).json({ message: 'Server error.' });
    }
});



// ==============================================
// ----------------- Login Route ----------------
// ==============================================

app.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserIntern.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
        const payload = { id: user._id, username: user.username };
        const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '1d' });
        return res.status(200).json({ success: true, message: "Login successful!", token: token });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// ===================================================
// --------------------- Signup Route FOR RECRUITER  ----------------
// ===================================================

app.post('/recruiter-signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPasswordR = await bcrypt.hash(password, 10);
        const savedUserR = await new UserRecruiter({ username, email, password: hashedPasswordR }).save();
        const payloadR = { id: savedUserR._id, username: savedUserR.username };
        const tokenR = jwt.sign(payloadR, jwtOptions.secretOrKey, { expiresIn: '1d' }); //1 day expiration
        console.log("token from signup route For RECRUITER=  ", tokenR);
        return res.status(201).json({ success: true, message: "Registration successful!", token: tokenR  });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Email already registered.' });
        res.status(500).json({ message: 'Server error.' });
    }
});




// ==========================================================
//  NEW: Route for sending emails from the contact form
// ==========================================================

app.post('/contactUs', (req, res) => {
  const { name, email, subject, phoneNumber, message } = req.body;
  // console.log("Contact form data received:", req.body);
  // Create a transporter object using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
// console.log('Email User Loaded:', process.env.EMAIL_USER); 

  // Define the email options
  const mailOptions = {
    from: `"${name}" <${email}>`, 
    to: process.env.EMAIL_USER,    
    subject: `Contact Form Submission: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone Number:</strong> ${phoneNumber}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email.' });
    }
    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Email sent successfully!' });
  });
});



// ===============================================
// --- ----------------- FORM ---------------- ---
// ===============================================


// server.js - UPDATED /forms route


app.post('/forms',passport.authenticate('jwt', { session: false }),
     upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'resume', maxCount: 1 },
        { name: 'projectPhoto1', maxCount: 1 },
        { name: 'projectPhoto2', maxCount: 1 },
        { name: 'projectPhoto3', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            // --- Upload profile photo and resume ---
            let photoUrl = '';
            let resumeUrl = '';
            if (req.files['photo']) {
                const cloudinaryRes = await uploadOnCloudinary(req.files['photo'][0].path);
                photoUrl = cloudinaryRes.secure_url;
            }
            if (req.files['resume']) {
                const cloudinaryRes = await uploadOnCloudinary(req.files['resume'][0].path);
                resumeUrl = cloudinaryRes.secure_url;
            }

            // --- Parse arrays from body ---
            const education = JSON.parse(req.body.education || '[]');
            const skills = JSON.parse(req.body.skills || '[]');
            const experience = JSON.parse(req.body.experience || '[]');
            const projects = JSON.parse(req.body.projects || '[]');

            // --- Upload project photos and update projects array ---
            let projectPhotoUrls = [];
            for (let i = 1; i <= 3; i++) {
                let url = '';
                if (req.files[`projectPhoto${i}`]) {
                    const cloudinaryRes = await uploadOnCloudinary(req.files[`projectPhoto${i}`][0].path);
                    url = cloudinaryRes.secure_url;
                }
                projectPhotoUrls.push(url);
                if (projects[i - 1]) {
                    projects[i - 1].photo = url;
                }
            }

            // --- Build portfolio data object ---
            const portfolioData = {
                userId: req.user._id,
                fullName: req.body.fullName,
                role: req.body.role,
                city: req.body.city,
                dateOfBirth: req.body.dob,
                gender: req.body.gender,
                aboutMe: req.body.aboutMe,
                photo: photoUrl,
                resume: resumeUrl,
                projectPhoto1: projectPhotoUrls[0],
                projectPhoto2: projectPhotoUrls[1],
                projectPhoto3: projectPhotoUrls[2],
                education,
                skills,
                experience,
                projects,
                contactDetails: {
                    phone: req.body.phone,
                    contactEmail: req.body.email,
                    github: req.body.github,
                    linkedin: req.body.linkedin,
                    instagram: req.body.instagram,
                    facebook: req.body.facebook
                }
            };

            // --- Upsert portfolio in MongoDB ---
            const finalPortfolio = await internForm.findOneAndUpdate(
                { userId: req.user._id },
                { $set: portfolioData },
                { new: true, upsert: true, runValidators: true }
            );

            return res.status(201).json({
                message: 'Portfolio saved successfully!',
                data: finalPortfolio
            });

        } catch (error) {
            console.error('--- ❌ Portfolio Save Error ---', error);
            res.status(500).json({ message: 'Server error while saving portfolio.' });
        }
    }
);


// ---- CONTACT ME IN PROFILE ----


app.post('/send-contact', async (req, res) => {
    try {
        const { userId, name, email, message } = req.body;
        // Find the portfolio owner by userId
        const portfolio = await internForm.findOne({ userId });
        if (!portfolio || !portfolio.contactDetails?.contactEmail) {
            return res.status(404).json({ message: "Portfolio owner not found" });
        }

        // Setup nodemailer transporter (use your SMTP credentials)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER, // your email
                pass: process.env.SMTP_PASS  // your app password
            }
        });

        // Compose email
        const mailOptions = {
            from: `"PortfolioHub" <${process.env.SMTP_USER}>`,
            to: portfolio.contactDetails.contactEmail,
            subject: `${name}" WANTS TO CONTACT YOU " `,
            text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({ message: "Email sent successfully!" });
    } catch (err) {
        console.error('Contact email error:', err);
        res.status(500).json({ message: "Failed to send email." });
    }
});

// ======================================
//        AUTHENTICATE RECRUITER
// ======================================


// ===================================================
// ------------------ JOB POSTING ROUTES ---------------
// ===================================================
// POST a job
app.post("/postJob", authenticateRecruiter, async (req, res) => {
  try {
    const newJob = new Job({
      ...req.body,
      recruiterId: req.user.id  
    });  
      console.log("New job data in sever.js :", newJob);
    await newJob.save();
    res.status(201).json({ message: "Job posted successfully", job: newJob });
  } catch (err) {
    console.error("Error posting job:", err);
    res.status(500).json({ message: "Server error while posting job" });
  }
});

//  APPLY (BUTTON) ON INTERNSHIPS 


app.post('/applyInternship', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { internshipId } = req.body;
    const userId = req.user.id; // ✅ use from JWT, not client

    if (!internshipId || !userId) {
      return res.status(400).json({ error: "internshipId and userId required" });
    }

    // Prevent duplicate applications
    const existing = await applyInternship.findOne({ internshipId, userId });
    if (existing) {
      return res.status(400).json({ error: "Already applied" });
    }

    // Fetch internship details for saving in application
    const internship = await Job.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }

    const application = new applyInternship({
      userId, // from JWT
      internshipId: internship._id,
      title: internship.title,
      description: internship.description,
      employmentType: internship.employmentType,
      stipend: internship.stipend,
      duration: internship.duration,
      workType: internship.workType,
      experienceLevel: internship.experienceLevel,
      location: internship.location,
      skills: internship.skills,
      appliedOn: new Date()
    });

    await application.save();
    res.json({ success: true, message: "Application saved" });

  } catch (err) {
    console.error("Error saving application:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Increment applicant count
app.put("/jobs/:id/incrementApplicants", async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { applicantCount: 1 } },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ success: true, applicantCount: job.applicantCount });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ================== UPDATE JOB ==================
app.put("/jobs/:id", authenticateRecruiter, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiterId: req.recruiter.id },
      req.body,
      { new: true }
    );

    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    res.json({ message: "Job updated successfully", job });
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ message: "Server error while updating job" });
  }
});


// ================== DELETE JOB ==================
app.delete("/jobs/:id", authenticateRecruiter, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      recruiterId: req.recruiter.id
    });

    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: "Server error while deleting job" });
  }
});


// ======================================================
// NEW: UPDATE APPLICANT STATUS
// ======================================================
app.patch("/recruiter/applicants/:applicationId/status", authenticateRecruiter, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // Expecting 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const application = await applyInternship.findByIdAndUpdate(
      applicationId,
      { status: status },
      { new: true } // Return the updated document
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.json({ message: `Status updated to ${status}`, application });

  } catch (err) {
    console.error("❌ Error updating applicant status:", err);
    res.status(500).json({ message: "Server error while updating status" });
  }
});


app.post('/logout', (req, res) => {
  console.log("User logged out");
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

app.post('/recruiter/logout', (req, res) => {
    console.log("User logged out");
    res.status(200).json({ success: true, message: 'Recruiter logged out successfully.' });
});

// ===================================================
// -------------- Edit profile (with optional files)
// ===================================================

app.post('/profile', (req, res) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
   const query = { userId: req.user._id }; 
   console.log("User ID in /profile route:", query);
  const data = req.body;
    updateSection(Profile, query, data, res);});

// About Route
app.post('/about', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
   const query = { userId: req.user._id }; 
      console.log("User ID in /about route:", query);
      updateSection(about, query, req.body, res);
    });

// Education Route
app.post('/education', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
   const query = { userId: req.user._id }; 
      console.log("User ID in /education route:", query);
      updateSection(education, query, req.body, res);
});

app.post('/contact', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
   const query = { userId: req.user._id }; 
      console.log("User ID in /contact route:", query);
      updateSection(contactEditProfile, query, req.body, res);
});

app.post('/skills', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
   const query = { userId: req.user._id }; 
      console.log("User ID in /skills route:", query);
      updateSection(skills, query, req.body, res);
});

app.post('/experience', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
   const query = { userId: req.user._id }; 
      console.log("User ID in /experience route:", query);
      updateSection(experience, query, req.body, res);
});


app.post('/myWork', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }
   const query = { userId: req.user._id }; 
      console.log("User ID in /myWork route:", query);
      updateSection(myWork, query, req.body, res);
});


// ===================================================
// ------------------ Start the Server ---------------
// ===================================================

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server is running on http://localhost:${PORT}`));