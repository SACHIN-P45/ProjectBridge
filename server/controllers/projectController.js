const asyncHandler = require('express-async-handler');
const ProjectRequest = require('../models/ProjectRequest');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @desc Create project
// @route POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { title, description, techStack, budget, deadline, category } = req.body;

  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'attachments', 'raw', file.originalname);
      attachments.push({
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalname,
        fileType: file.mimetype,
      });
    }
  }

  const project = await ProjectRequest.create({
    title,
    description,
    techStack: typeof techStack === 'string' ? JSON.parse(techStack) : techStack,
    budget: Number(budget),
    deadline: new Date(deadline),
    category: category || 'web',
    attachments,
    student: req.user._id,
  });

  res.status(201).json(project);
});

// @desc Get all open projects (for developers to browse)
// @route GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const { search, category, minBudget, maxBudget, techStack, page = 1, limit = 10 } = req.query;

  const query = { status: 'open' };
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (minBudget || maxBudget) {
    query.budget = {};
    if (minBudget) query.budget.$gte = Number(minBudget);
    if (maxBudget) query.budget.$lte = Number(maxBudget);
  }
  if (techStack) {
    const stacks = techStack.split(',');
    query.techStack = { $in: stacks };
  }

  const total = await ProjectRequest.countDocuments(query);
  const projects = await ProjectRequest.find(query)
    .populate('student', 'name avatar college rating')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ projects, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @desc Get student's own projects
// @route GET /api/projects/my
const getMyProjects = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'student'
      ? { student: req.user._id }
      : { assignedDeveloper: req.user._id };

  const projects = await ProjectRequest.find(query)
    .populate('student', 'name avatar')
    .populate('assignedDeveloper', 'name avatar rating')
    .populate('selectedBid')
    .sort({ updatedAt: -1 });

  res.json(projects);
});

// @desc Get single project
// @route GET /api/projects/:id
const getProject = asyncHandler(async (req, res) => {
  const project = await ProjectRequest.findById(req.params.id)
    .populate('student', 'name avatar college email rating')
    .populate('assignedDeveloper', 'name avatar skills rating githubUrl portfolioUrl')
    .populate('selectedBid');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json(project);
});

// @desc Update project status / details
// @route PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const project = await ProjectRequest.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const allowedFields = ['title', 'description', 'techStack', 'budget', 'deadline', 'status',
    'githubRepo', 'liveUrl', 'sourceCodeUrl', 'progressUpdates', 'category'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  });

  if (req.body.progressUpdate) {
    project.progressUpdates.push({
      message: req.body.progressUpdate,
      timestamp: new Date(),
    });
  }

  const updated = await project.save();
  res.json(updated);
});

// @desc Upload source code ZIP
// @route POST /api/projects/:id/upload-source
const uploadSourceCode = asyncHandler(async (req, res) => {
  const project = await ProjectRequest.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'sourcecode', 'raw', req.file.originalname);
  project.sourceCodeUrl = result.secure_url;
  project.sourceCodePublicId = result.public_id;
  project.status = 'delivered';
  await project.save();

  // Notify student
  await Notification.create({
    user: project.student,
    type: 'project_update',
    title: 'Source Code Uploaded',
    message: `Developer has uploaded the source code for "${project.title}"`,
    link: `/student/projects/${project._id}`,
    relatedId: project._id,
  });

  res.json({ message: 'Source code uploaded', sourceCodeUrl: result.secure_url });
});

// @desc Student approves project delivery
// @route PUT /api/projects/:id/approve
const approveProject = asyncHandler(async (req, res) => {
  const project = await ProjectRequest.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  project.status = 'completed';
  project.isPaymentReleased = true;
  await project.save();

  res.json({ message: 'Project approved and payment released', project });
});

// @desc Delete project
// @route DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await ProjectRequest.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  if (project.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (project.status !== 'open') {
    res.status(400);
    throw new Error('Cannot delete a project that is in progress');
  }

  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});

module.exports = {
  createProject, getProjects, getMyProjects, getProject,
  updateProject, uploadSourceCode, approveProject, deleteProject,
};
