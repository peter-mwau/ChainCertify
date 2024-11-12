const express = require('express');
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const OpenAI = require('openai');


const app = express();

const prisma = new PrismaClient()




const corsOptions = {
    origin: process.env.FRONTEND_CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // This allows cookies to be sent
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Setup multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath;

        // Determine the folder based on the fieldname (you can modify this condition based on your form field names)
        if (file.fieldname === 'profileImage') {
            uploadPath = 'uploads/'; // Profile images go to the root of the uploads folder
        } else if (file.fieldname === 'assignmentFile') {
            uploadPath = 'uploads/assignments/'; // Assignment files go to /uploads/assignments
        } else if (file.fieldname === 'projectImages') {
            uploadPath = 'uploads/projects/'; // Project images go to /uploads/projects
        }

        console.log('Destination Middleware:', file);
        cb(null, uploadPath); // Use the correct folder based on the file type
    },
    filename: (req, file, cb) => {
        console.log('Filename Middleware:', file);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('File Filter:', file);
        cb(null, true);
    }
});

app.use('/uploads', express.static('uploads'));


//A route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to AssignTrack Systems!');
});

//route to send email
app.post('/send-email', async (req, res) => {
    const { email, subject, message } = req.body;

    try {
        // Set up Nodemailer transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Define email options
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email, // Recipient's email
            subject: subject, // Email subject
            text: message, // Email message body
        };

        // Send email
        let info = await transporter.sendMail(mailOptions);
        res.status(200).json({ success: `Email sent: ${info.response}` });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email.' });
    }
});

//USER MANAGEMENT

// POST request to add a user
app.post('/api/register', async (req, res) => {
    const { name, email, role, password, profileImage } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                role: role || 'STUDENT',
                password: hashedPassword,
                profileImage
            },
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('User registration error:', error.message);

        if (error.code === 'P2002') {
            // Prisma unique constraint violation error
            res.status(409).json({ error: 'A user with this email or username already exists.' });
        } else {
            res.status(500).json({ error: 'An error occurred while creating the user.' });
        }
    }
});

// POST request to login a user
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

        // Update the lastLogin field
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date(), loggedIn: true },
        });

        // Generate tokens
        const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });


        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

// Refresh token route
app.post('/api/refresh', async (req, res) => {
    const { refreshToken: clientRefreshToken } = req.cookies;

    if (!clientRefreshToken) return res.status(401).json({ error: 'Refresh token required' });

    try {
        const decoded = jwt.verify(clientRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(403).json({ error: 'User not found' });
        }

        const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(403).json({ error: 'Refresh token expired or invalid' });
    }
});


// User Logout
app.post('/api/logout', async (req, res) => {
    const { userId } = req.body;

    console.log("User ID: ", userId);

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required for logout' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the loggedIn field to false
        await prisma.user.update({
            where: { id: userId },
            data: { loggedIn: false },
        });

        // Clear the refreshToken cookie
        res.clearCookie('refreshToken');

        res.json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'An error occurred during logout' });
    }
});

//get user profile/data
app.get('/api/users/profile', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded user ID:", decoded.userId);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                submissions: true,
                quizAttempts: true,
                projects: true,
                grading: true,
            }
        });

        console.log("Fetched user data:", user);
        res.json(user);
    } catch (error) {
        console.error(error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        res.status(401).json({ error: 'Invalid token' });
    }
});


// PUT request to update user profile
app.put('/api/users/:userId', upload.single('profileImage'), express.json(), async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const { userId } = req.params;
    const { name, email } = req.body;

    // Check if profile image is uploaded
    let profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    // If no new file is uploaded, keep the existing profileImage (if any)
    if (!profileImage && req.body.profileImage) {
        profileImage = req.body.profileImage;
    }

    console.log("Profile Image Path:", profileImage);

    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.userId;

        const updatedUserData = {
            id,
            name,
            ...(profileImage && { profileImage })
        };

        console.log('Updated User Data:', updatedUserData);

        // Update user details in the database
        const updatedUser = await prisma.user.update({
            where: { id },
            data: updatedUserData,
            select: { id: true, name: true, email: true, profileImage: true },
        });
        res.json(updatedUser);
    } catch (error) {
        console.error('User update error:', error.message);
        res.status(500).json({ error: 'An error occurred while updating the user.' });
    }
});

//get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, name: true, role: true, email: true, profileImage: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
});

//endpoint to delete user
app.delete('/api/users/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log("id: ", id);
    try {
        const user = await prisma.user.delete({
            where: { id }
        });
        res.json(user);
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ error: 'An error occurred while deleting the user.' });
    }
});

// Define a route to handle password reset requests
app.post('/api/update-password', async (req, res) => {
    const { email, password, confirmPassword } = req.body.formData;

    console.log("Request Body: ", req.body.formData);

    console.log("Request Body email: ", email);
    console.log("Request Body password: ", password);
    console.log("Request Body confirm: ", confirmPassword);

    // Basic validation
    if (!email || !password || !confirmPassword) {
        return res.status(400).json({ error: 'Please provide email and both passwords.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    try {
        // Find the user by email
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        user.password = hashedPassword;
        await prisma.user.update({
            where: {
                email: email,
            },
            data: {
                password: hashedPassword,
            },
        });

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error.' });
    }
});

//ASSIGNMENT SECTION

// POST request to create a new assignment
app.post('/api/create-assignment', async (req, res) => {
    const { title, description, dueDate, userId } = req.body;

    try {
        const newAssignment = await prisma.assignment.create({
            data: {
                title,
                description,
                deadline: new Date(dueDate),
            },
        });
        res.status(201).json(newAssignment);
    } catch (error) {
        console.error('Assignment creation error:', error.message);
        res.status(500).json({ error: 'An error occurred while creating the assignment.' });
    }
});


// Get all assignments
app.get('/api/assignments', async (req, res) => {
    try {
        const assignments = await prisma.assignment.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                deadline: true,
                createdAt: true,
                submissions: true,
                projects: true
            }
        });
        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching the assignments.' });
    }
});



//get assignment by id
app.get('/api/assignment/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: Number(id) },
            include: {
                user: true,
            },
        });
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found.' });
        }
        res.json(assignment);
    } catch (error) {
        console.error('Error fetching assignment:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching the assignment.' });
    }
});

// POST route to submit assignment
app.post('/api/submit-assignment/:id', upload.single('assignmentFile'), async (req, res) => {
    const { submissionText } = req.body;
    const file = req.file;  // Multer handles the file upload

    const token = req.headers.authorization.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    console.log("Decoded UserId: ", userId);
    console.log("Assignment Id: ", req.params.id);
    console.log("Decoded UserId type: ", typeof (userId));
    console.log("Assignment Id type: ", typeof (req.params.id));

    try {
        const newSubmission = await prisma.submission.create({
            data: {
                content: submissionText,
                file: file ? file.filename : null,
                assignment: { connect: { id: Number(req.params.id) } },
                user: { connect: { id: userId } },
            },
        });
        res.status(201).json(newSubmission);
        console.log("Submission: ", newSubmission.data);
    } catch (error) {
        console.error('Submission error:', error.message);
        res.status(500).json({ error: 'An error occurred while submitting the assignment.' });
    }
});

//get all assignment submissions
app.get('/api/assignment-submissions', async (req, res) => {
    try {
        const submissions = await prisma.submission.findMany({
            include: {
                user: true,
                assignment: true,
                grading: true,
            },
        });
        res.json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching the submissions.' });
    }
});


//update an assignemt
app.patch('/api/update-assignment/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, userId } = req.body;
    try {
        const updatedAssignment = await prisma.assignment.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                dueDate,
                userId: Number(userId),
            },
        });
        res.json(updatedAssignment);
    } catch (error) {
        console.error('Error updating assignment:', error.message);
        res.status(500).json({ error: 'An error occurred while updating the assignment.' });
    }
});

//delete an assignemt
app.delete('/api/delete-assignment/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const assignment = await prisma.assignment.delete({
            where: { id }
        });
        res.json(assignment);
    } catch (error) {
        console.error('Error deleting assignment:', error.message);
        res.status(500).json({ error: 'An error occurred while deleting the assignment.' });
    }
});

// Grade an assignment submission
app.put('/api/grade-submission/:id', async (req, res) => {
    const { id } = req.params;
    const { grade, feedback, userId, assignmentId } = req.body;

    // Validate the grade
    if (grade < 0 || grade > 100) {
        return res.status(400).json({ error: 'Grade must be a percentage between 0 and 100.' });
    }

    try {
        // Check if the submission exists
        const submissionExists = await prisma.submission.findUnique({
            where: { id: Number(id) }
        });

        if (!submissionExists) {
            return res.status(404).json({ error: 'Submission not found.' });
        }

        // Create a new grading entry
        const newGrading = await prisma.grading.create({
            data: {
                submission: { connect: { id: Number(id) } },
                grade,
                feedback,
                user: { connect: { id: userId } },
                assignmentId
            }
        });

        // Optionally, return the newly created grading entry or related submission data
        res.status(201).json(newGrading);
    } catch (error) {
        console.error('Error grading submission:', error.message);
        res.status(500).json({ error: 'An error occurred while grading the submission.' });
    }
});

//PROJECTS SECTION

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                user: true,
                assignment: true,
                grading: true
            },
        });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching the projects.' });
    }
});

// Submit a submission (GitHub link + optional images)
app.post('/api/submit', upload.single('projectImages'), express.json(), async (req, res) => {
    const { title, description, githubLink, assignmentId } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log("Request Body: ", req.body);

    // Check if profile image is uploaded
    let projectImage = req.file ? `${req.file.filename}` : undefined;

    try {

        const newSubmission = await prisma.project.create({
            data: {
                title,
                description,
                githubLink,           // Store the GitHub link
                user: { connect: { id: parseInt(userId) } },
                assignment: assignmentId ? { connect: { id: parseInt(assignmentId) } } : undefined,
                projectImages: projectImage || [],
                assignment: assignmentId ? { connect: { id: parseInt(assignmentId) } } : undefined,
            },
        });
        res.status(201).json(newSubmission);
    } catch (error) {
        console.error('Submission error:', error.message);
        res.status(500).json({ error: 'An error occurred while submitting.' });
    }
});

//submit grading for a project
app.post('/api/grade-project/:id', async (req, res) => {
    const { id } = req.params;
    const { grade, feedback, assignmentId } = req.body;

    // Validate the grade
    if (grade < 0 || grade > 100) {
        return res.status(400).json({ error: 'Grade must be a percentage between 0 and 100.' });
    }
    const token = req.headers.authorization.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    try {
        // Check if the project exists
        const projectExists = await prisma.project.findUnique({
            where: { id: Number(id) }
        });

        if (!projectExists) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        // Create a new grading entry
        const newGrading = await prisma.grading.create({
            data: {
                project: { connect: { id: Number(id) } },
                grade: parseInt(grade),
                feedback,
                user: { connect: { id: userId } },
                assignmentId: assignmentId ? parseInt(assignmentId) : null

            }
        });

        console.log(newGrading);

        // Optionally, return the newly created grading entry or related project data
        res.status(201).json(newGrading);
    } catch (error) {
        console.error('Error grading project:', error.message);
        res.status(500).json({ error: 'An error occurred while grading the project.' });
    }
});


//QUIZ SECTION

// POST request to create a new quiz
app.post('/api/create-quiz', async (req, res) => {
    const { title, description, questions, userId } = req.body;

    try {
        const formattedQuestions = questions.map(question => {
            // Check if the question has non-empty options
            const hasValidOptions = question.options &&
                Array.isArray(question.options) &&
                question.options.some(option => option.text.trim() !== "");

            if (hasValidOptions) {
                // Multiple choice question
                const validOptions = question.options.filter(option => option.text.trim() !== "");

                // Find the index of the correct option based on isCorrect being true
                const correctOptionIndex = validOptions.findIndex(option => option.isCorrect);

                // If no correct option found, throw an error
                if (correctOptionIndex === -1) {
                    throw new Error(`No correct option for question: "${question.text}"`);
                }

                // Return the formatted multiple choice question
                return {
                    text: question.text,
                    correctOption: correctOptionIndex,
                    options: {
                        create: validOptions.map(option => ({
                            text: option.text,
                        })),
                    },
                };
            } else {
                // Open-ended question
                return {
                    text: question.text,
                    correctOption: null,
                    options: {
                        create: [],
                    },
                };
            }
        });

        // Create the quiz with the formatted questions
        const newQuiz = await prisma.quiz.create({
            data: {
                title,
                description,
                totalQuestions: formattedQuestions.length,
                questions: {
                    create: formattedQuestions,
                },
            },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });

        res.status(201).json(newQuiz);
    } catch (error) {
        console.error('Quiz creation error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


//Grade the open-ended questions
app.post('/api/grade-open-ended', async (req, res) => {
    let openEndedQuestions = req.body.openEndedQuestions || req.body;

    console.log("response body type: ", typeof (req.body));

    // Check if it's a single question (not an array), then convert it to an array
    if (!Array.isArray(openEndedQuestions)) {
        openEndedQuestions = [openEndedQuestions];
    }

    console.log("response body: ", req.body);
    console.log("response body: ", openEndedQuestions);

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        // Grade each open-ended question using OpenAI
        const gradedAnswers = await Promise.all(
            openEndedQuestions.map(async ({ question, answer }, index) => {
                await delay(index * 200);
                const response = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    prompt: `Grade the following answer with 3 options (true, false, maybe) based on its correctness.\n\nQuestion: ${question}\nAnswer: ${answer}`,
                    max_tokens: 50,
                    temperature: 0.0,
                });

                const result = response.data.choices[0].text.trim().toLowerCase();

                // Assign marks based on AI response
                let mark;
                if (result.includes('true')) {
                    mark = 1; // Full mark
                } else if (result.includes('maybe')) {
                    mark = 0.5; // Half mark
                } else {
                    mark = 0; // No marks
                }

                return {
                    question,
                    answer,
                    result,
                    mark,
                };
            })
        );

        res.json({ gradedAnswers });
    } catch (error) {
        console.error('Error grading open-ended questions:', error);
        res.status(500).json({ message: 'Failed to grade open-ended questions.' });
    }
});


// Submit quiz with attempt tracking
app.post('/api/submit-quiz', async (req, res) => {
    const { quizId, userId, score, grading } = req.body;

    // Set the max attempts and time limit (12 hours)
    const MAX_ATTEMPTS = 3;
    const ATTEMPT_LIMIT_HOURS = 12;

    try {
        // Find quiz to validate existence
        const quiz = await prisma.quiz.findUnique({ where: { id: Number(quizId) } });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        // Get the current timestamp
        const now = new Date();
        const timeLimit = new Date(now.getTime() - (ATTEMPT_LIMIT_HOURS * 60 * 60 * 1000)); // 12 hours ago

        // Check number of attempts in the last 12 hours
        const recentAttempts = await prisma.quizAttempt.count({
            where: {
                userId: userId,
                quizId: quizId,
                createdAt: {
                    gte: timeLimit,  // Only consider attempts in the last 12 hours
                },
            },
        });

        // If the user has reached the max attempts, block further submissions
        if (recentAttempts >= MAX_ATTEMPTS) {
            return res.status(403).json({
                error: `You have reached the maximum of ${MAX_ATTEMPTS} attempts in the last ${ATTEMPT_LIMIT_HOURS} hours. Please try again later.`,
            });
        }

        // If within limit, proceed with quiz attempt submission
        const quizAttempt = await prisma.quizAttempt.create({
            data: {
                user: { connect: { id: userId } },
                quiz: { connect: { id: quizId } },
                score: Number(score),
                grading: {
                    create: grading.map(({ questionId, score, correct }) => ({
                        grade: score,
                        feedback: 'None',
                        user: { connect: { id: userId } },
                        quiz: { connect: { id: quizId } },
                    })),
                },
            },
        });

        res.json(quizAttempt);
    } catch (error) {
        console.error('Quiz submission error:', error.message);
        res.status(500).json({ error: 'An error occurred while submitting the quiz.' });
    }
});




// Post request to delete quiz
app.delete('/api/delete-quiz/:quizId', async (req, res) => {
    const { quizId } = req.params;

    try {
        // First delete any related records (questions, etc.) before deleting the quiz
        await prisma.question.deleteMany({
            where: { quizId: Number(quizId) },
        });

        const quiz = await prisma.quiz.delete({
            where: { id: Number(quizId) },
        });
        res.json({ message: 'Quiz deleted successfully!', quiz });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Quiz not found.' });
        }
        console.error('Quiz deletion error:', error.message);
        res.status(500).json({ error: 'An error occurred while deleting the quiz.' });
    }
});




// Get all quizzes with questions and options
app.get('/api/quizzes', async (req, res) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
                grading: true,
                quizAttempts: true
            },

        });
        res.json(quizzes);
    } catch (error) {
        console.error('Error fetching quizzes:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching quizzes.' });
    }
});

// Update quiz by ID
app.put('/api/edit-quiz/:quizId', async (req, res) => {
    const { quizId } = req.params;
    const { title, description, questions } = req.body;

    try {
        const updatedQuiz = await prisma.quiz.update({
            where: { id: Number(quizId) },
            data: {
                title,
                description,
                questions: {
                    update: questions.map(question => ({
                        where: { id: question.id },
                        data: {
                            text: question.text,
                            correctOption: question.correctOption,
                            options: {
                                update: question.options.map(option => ({
                                    where: { id: option.id },
                                    data: { text: option.text }
                                }))
                            }
                        }
                    })),
                },
            },
        });

        res.json(updatedQuiz);
    } catch (error) {
        console.error('Error updating quiz:', error.message);
        res.status(500).json({ error: 'An error occurred while updating the quiz.' });
    }
});



// Get a single quiz by ID with questions and options
app.get('/api/quizzes/:quizId', async (req, res) => {
    const { quizId } = req.params;
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: Number(quizId) },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
            },
        });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching the quiz.' });
    }
});


// Delete a question from a quiz
app.delete('/api/quizzes/:quizId/questions/:questionId', async (req, res) => {
    const { questionId } = req.params;

    try {
        const deletedQuestion = await prisma.question.delete({
            where: { id: Number(questionId) },
        });
        res.json(deletedQuestion);
    } catch (error) {
        console.error('Question deletion error:', error.message);
        res.status(500).json({ error: 'An error occurred while deleting the question.' });
    }
});





// Update an option
app.put('/api/quizzes/:quizId/questions/:questionId/options/:optionId', async (req, res) => {
    const { optionId } = req.params;
    const { text, isCorrect } = req.body;

    try {
        const updatedOption = await prisma.option.update({
            where: { id: Number(optionId) },
            data: { text, isCorrect },
        });
        res.json(updatedOption);
    } catch (error) {
        console.error('Option update error:', error.message);
        res.status(500).json({ error: 'An error occurred while updating the option.' });
    }
});





// POST request to submit a quiz attempt
app.post('/api/quizzes/:quizId/attempts', async (req, res) => {
    const { quizId } = req.params;
    const { userId, answers } = req.body;

    try {
        // Validate quiz existence
        const quiz = await prisma.quiz.findUnique({ where: { id: Number(quizId) } });
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        // Create quiz attempt
        const quizAttempt = await prisma.quizAttempt.create({
            data: {
                user: { connect: { id: userId } },
                quiz: { connect: { id: quizId } },
                answers: {
                    create: answers.map(answer => ({
                        questionId: answer.questionId,
                        selectedOptionId: answer.selectedOptionId,
                    })),
                },
            },
        });

        res.status(201).json(quizAttempt);
    } catch (error) {
        console.error('Quiz attempt submission error:', error.message);
        res.status(500).json({ error: 'An error occurred while submitting the quiz attempt.' });
    }
});

//CERTIFICATES SECTION
app.post("/api/toggle-mint-status", async (req, res) => {
    try {
        // Fetch the existing status or create it if it doesn't exist
        let mintStatus = await prisma.certificateMintStatus.findFirst();

        if (mintStatus) {
            // Update the existing minting status
            mintStatus = await prisma.certificateMintStatus.update({
                where: { id: mintStatus.id },
                data: { allowed: !mintStatus.allowed },
            });
        } else {
            // Create a new minting status entry
            mintStatus = await prisma.certificateMintStatus.create({
                data: { allowed: true },
            });
        }

        res.json({
            message: "Certificate minting status updated successfully.",
            status: mintStatus.allowed,
        });
    } catch (error) {
        console.error("Error toggling minting status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint to get the current certificate minting status
app.get("/api/mint-status", async (req, res) => {
    try {
        const mintStatus = await prisma.certificateMintStatus.findFirst();

        if (mintStatus) {
            // Send the entire mintStatus object
            res.json(mintStatus);
        } else {
            // If no entry exists, return a default response
            res.json({
                id: null,
                allowed: false,
                updatedAt: null
            });
        }
    } catch (error) {
        console.error("Error fetching minting status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});





const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

