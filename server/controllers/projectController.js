const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/db');
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

  const { data: project, error } = await supabase
    .from('project_requests')
    .insert({
      title,
      description,
      tech_stack: typeof techStack === 'string' ? JSON.parse(techStack) : techStack,
      budget: Number(budget),
      deadline: new Date(deadline).toISOString(),
      category: category || 'web',
      attachments,
      student_id: req.user.id,
    })
    .select()
    .single();

  if (error) {
    res.status(400);
    throw error;
  }

  project._id = project.id;
  res.status(201).json(project);
});

// @desc Get all open projects (for developers to browse)
// @route GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const { search, category, minBudget, maxBudget, techStack, page = 1, limit = 10 } = req.query;

  let queryBuilder = supabase
    .from('project_requests')
    .select('*, student:users!student_id(id, name, avatar, college, rating)', { count: 'exact' })
    .eq('status', 'open');

  if (category) {
    queryBuilder = queryBuilder.eq('category', category);
  }
  if (minBudget) {
    queryBuilder = queryBuilder.gte('budget', Number(minBudget));
  }
  if (maxBudget) {
    queryBuilder = queryBuilder.lte('budget', Number(maxBudget));
  }
  if (search) {
    queryBuilder = queryBuilder.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (techStack) {
    const stacks = techStack.split(',');
    queryBuilder = queryBuilder.overlaps('tech_stack', stacks);
  }

  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  const { data: projects, count: total, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedProjects = (projects || []).map((p) => {
    const formatted = {
      ...p,
      _id: p.id,
      techStack: p.tech_stack,
      assignedDeveloper: p.assigned_developer_id,
      selectedBid: p.selected_bid_id,
      studentId: p.student_id,
    };
    if (formatted.student) {
      formatted.student = { ...formatted.student, _id: formatted.student.id };
    }
    return formatted;
  });

  res.json({
    projects: formattedProjects,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

// @desc Get student's own projects
// @route GET /api/projects/my
const getMyProjects = asyncHandler(async (req, res) => {
  let queryBuilder = supabase
    .from('project_requests')
    .select(`
      *,
      student:users!student_id(id, name, avatar),
      assignedDeveloper:users!assigned_developer_id(id, name, avatar, rating),
      selectedBid:bids!selected_bid_id(id, price, delivery_days, proposal, status)
    `);

  if (req.user.role === 'student') {
    queryBuilder = queryBuilder.eq('student_id', req.user.id);
  } else {
    queryBuilder = queryBuilder.eq('assigned_developer_id', req.user.id);
  }

  const { data: projects, error } = await queryBuilder.order('updated_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedProjects = (projects || []).map((p) => {
    const formatted = {
      ...p,
      _id: p.id,
      techStack: p.tech_stack,
      assignedDeveloper: p.assigned_developer_id,
      selectedBid: p.selected_bid_id,
      studentId: p.student_id,
    };
    if (formatted.student) {
      formatted.student = { ...formatted.student, _id: formatted.student.id };
    }
    if (formatted.assignedDeveloper) {
      formatted.assignedDeveloper = { ...formatted.assignedDeveloper, _id: formatted.assignedDeveloper.id };
    }
    if (formatted.selectedBid) {
      formatted.selectedBid = { ...formatted.selectedBid, _id: formatted.selectedBid.id };
    }
    return formatted;
  });

  res.json(formattedProjects);
});

// @desc Get single project
// @route GET /api/projects/:id
const getProject = asyncHandler(async (req, res) => {
  const { data: project, error } = await supabase
    .from('project_requests')
    .select(`
      *,
      student:users!student_id(id, name, avatar, college, email, rating),
      assignedDeveloper:users!assigned_developer_id(id, name, avatar, skills, rating, github_url, portfolio_url),
      selectedBid:bids!selected_bid_id(id, price, delivery_days, proposal, status)
    `)
    .eq('id', req.params.id)
    .maybeSingle();

  if (error || !project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const formatted = {
    ...project,
    _id: project.id,
    techStack: project.tech_stack,
    studentId: project.student_id,
  };
  if (formatted.student) {
    formatted.student = { ...formatted.student, _id: formatted.student.id };
  }
  if (formatted.assignedDeveloper) {
    formatted.assignedDeveloper = {
      ...formatted.assignedDeveloper,
      _id: formatted.assignedDeveloper.id,
      githubUrl: formatted.assignedDeveloper.github_url,
      portfolioUrl: formatted.assignedDeveloper.portfolio_url,
    };
  }
  if (formatted.selectedBid) {
    formatted.selectedBid = { ...formatted.selectedBid, _id: formatted.selectedBid.id };
  }

  res.json(formatted);
});

// @desc Update project status / details
// @route PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const { data: currentProject, error: fetchError } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError || !currentProject) {
    res.status(404);
    throw new Error('Project not found');
  }

  const updateData = {};
  const allowedFields = [
    'title', 'description', 'techStack', 'budget', 'deadline', 'status',
    'githubRepo', 'liveUrl', 'sourceCodeUrl', 'category'
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'techStack') {
        updateData.tech_stack = req.body[field];
      } else if (field === 'githubRepo') {
        updateData.github_repo = req.body[field];
      } else if (field === 'liveUrl') {
        updateData.live_url = req.body[field];
      } else if (field === 'sourceCodeUrl') {
        updateData.source_code_url = req.body[field];
      } else {
        updateData[field] = req.body[field];
      }
    }
  });

  if (req.body.progressUpdate) {
    const progressUpdates = currentProject.progress_updates || [];
    progressUpdates.push({
      message: req.body.progressUpdate,
      timestamp: new Date().toISOString(),
    });
    updateData.progress_updates = progressUpdates;
  }

  const { data: updated, error } = await supabase
    .from('project_requests')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    res.status(400);
    throw error;
  }

  updated._id = updated.id;
  res.json(updated);
});

// @desc Upload source code ZIP
// @route POST /api/projects/:id/upload-source
const uploadSourceCode = asyncHandler(async (req, res) => {
  const { data: project, error: fetchError } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError || !project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'sourcecode', 'raw', req.file.originalname);

  const { data: updatedProject, error: updateError } = await supabase
    .from('project_requests')
    .update({
      source_code_url: result.secure_url,
      source_code_public_id: result.public_id,
      status: 'delivered',
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Notify student
  await supabase
    .from('notifications')
    .insert({
      user_id: project.student_id,
      type: 'project_update',
      title: 'Source Code Uploaded',
      message: `Developer has uploaded the source code for "${project.title}"`,
      link: `/student/projects/${project.id}`,
      related_id: project.id,
    });

  res.json({ message: 'Source code uploaded', sourceCodeUrl: result.secure_url });
});

// @desc Student approves project delivery
// @route PUT /api/projects/:id/approve
const approveProject = asyncHandler(async (req, res) => {
  const { data: project, error: fetchError } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError || !project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.student_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { data: updatedProject, error: updateError } = await supabase
    .from('project_requests')
    .update({
      status: 'completed',
      is_payment_released: true,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (updateError) throw updateError;

  // Release all payments for this project (both initial 50% and final 50%)
  await supabase
    .from('payments')
    .update({
      status: 'released',
      released_at: new Date().toISOString(),
    })
    .eq('project_id', project.id)
    .in('status', ['held', 'pending']);

  // Update developer statistics
  if (project.assigned_developer_id) {
    const { updateDeveloperStats } = require('../utils/developerStats');
    await updateDeveloperStats(project.assigned_developer_id);
  }

  // Update student statistics
  if (project.student_id) {
    const { updateStudentStats } = require('../utils/developerStats');
    await updateStudentStats(project.student_id);
  }

  updatedProject._id = updatedProject.id;
  res.json({ message: 'Project approved and payment released', project: updatedProject });
});

// @desc Delete project
// @route DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const { data: project, error: fetchError } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError || !project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.student_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (project.status !== 'open') {
    res.status(400);
    throw new Error('Cannot delete a project that is in progress');
  }

  const { error: deleteError } = await supabase
    .from('project_requests')
    .delete()
    .eq('id', req.params.id);

  if (deleteError) throw deleteError;

  res.json({ message: 'Project deleted' });
});

module.exports = {
  createProject,
  getProjects,
  getMyProjects,
  getProject,
  updateProject,
  uploadSourceCode,
  approveProject,
  deleteProject,
};
