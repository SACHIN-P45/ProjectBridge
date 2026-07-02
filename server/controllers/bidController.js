const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/db');
const sendEmail = require('../utils/sendEmail');
const { newBidEmail, bidAcceptedEmail } = require('../utils/emailTemplates');

// @desc Submit a bid
// @route POST /api/bids
const submitBid = asyncHandler(async (req, res) => {
  const { projectId, price, deliveryDays, proposal } = req.body;

  const { data: project, error: projectError } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError || !project || project.status !== 'open') {
    res.status(400);
    throw new Error('Project is not open for bids');
  }

  const { data: existingBid, error: checkError } = await supabase
    .from('bids')
    .select('id')
    .eq('project_id', projectId)
    .eq('developer_id', req.user.id)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existingBid) {
    res.status(400);
    throw new Error('You have already submitted a bid for this project');
  }

  const { data: bid, error: createError } = await supabase
    .from('bids')
    .insert({
      project_id: projectId,
      developer_id: req.user.id,
      price: Number(price),
      delivery_days: Number(deliveryDays),
      proposal,
    })
    .select()
    .single();

  if (createError) {
    res.status(400);
    throw createError;
  }

  // Increment bid count on project
  await supabase
    .from('project_requests')
    .update({ bid_count: (project.bid_count || 0) + 1 })
    .eq('id', projectId);

  // Notify student via db notifications
  await supabase
    .from('notifications')
    .insert({
      user_id: project.student_id,
      type: 'bid',
      title: 'New Quotation Received',
      message: `A developer submitted a quotation for "${project.title}"`,
      link: `/student/projects/${projectId}`,
      related_id: bid.id,
    });

  // Notify student via email
  try {
    const { data: student } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', project.student_id)
      .maybeSingle();

    if (student && student.email) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const emailOptions = newBidEmail({
        studentName: student.name || 'Student',
        projectTitle: project.title,
        developerName: req.user.name || 'A developer',
        bidAmount: Number(price),
        deliveryDays: Number(deliveryDays),
        proposal,
        viewLink: `${clientUrl}/student/projects/${projectId}`,
        clientUrl
      });
      
      sendEmail({
        to: student.email,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html
      }).catch(err => console.error('Failed to send new bid email:', err));
    }
  } catch (emailErr) {
    console.error('Error fetching student for bid email:', emailErr);
  }

  const { data: populated, error: popError } = await supabase
    .from('bids')
    .select('*, developer:users(id, name, avatar, skills, rating, completed_projects)')
    .eq('id', bid.id)
    .single();

  if (popError) throw popError;

  const formatted = {
    ...populated,
    _id: populated.id,
    project: populated.project_id,
    developer: {
      ...populated.developer,
      _id: populated.developer.id,
      completedProjects: populated.developer.completed_projects,
    },
    deliveryDays: populated.delivery_days,
  };

  res.status(201).json(formatted);
});

// @desc Get bids for a project
// @route GET /api/bids/project/:projectId
const getProjectBids = asyncHandler(async (req, res) => {
  const { data: bids, error } = await supabase
    .from('bids')
    .select('*, developer:users(id, name, avatar, skills, rating, total_reviews, completed_projects, github_url, portfolio_url, bio)')
    .eq('project_id', req.params.projectId)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedBids = (bids || []).map((b) => {
    const formatted = {
      ...b,
      _id: b.id,
      project: b.project_id,
      deliveryDays: b.delivery_days,
    };
    if (formatted.developer) {
      formatted.developer = {
        ...formatted.developer,
        _id: formatted.developer.id,
        totalReviews: formatted.developer.total_reviews,
        completedProjects: formatted.developer.completed_projects,
        githubUrl: formatted.developer.github_url,
        portfolioUrl: formatted.developer.portfolio_url,
      };
    }
    return formatted;
  });

  res.json(formattedBids);
});

// @desc Accept a bid
// @route PUT /api/bids/:id/accept
const acceptBid = asyncHandler(async (req, res) => {
  const { data: bid, error: bidError } = await supabase
    .from('bids')
    .select('*, developer:users(*)')
    .eq('id', req.params.id)
    .maybeSingle();

  if (bidError || !bid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  const { data: project, error: projectError } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', bid.project_id)
    .maybeSingle();

  if (projectError || !project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.student_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Accept this bid
  await supabase
    .from('bids')
    .update({ status: 'accepted' })
    .eq('id', bid.id);

  // Reject all other bids
  await supabase
    .from('bids')
    .update({ status: 'rejected' })
    .eq('project_id', bid.project_id)
    .neq('id', bid.id);

  // Update project
  await supabase
    .from('project_requests')
    .update({
      status: 'in-progress',
      assigned_developer_id: bid.developer_id,
      selected_bid_id: bid.id,
    })
    .eq('id', project.id);

  // Create chat room (upsert)
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id')
    .eq('project_id', project.id)
    .maybeSingle();

  if (!existingChat) {
    await supabase
      .from('chats')
      .insert({
        project_id: project.id,
        student_id: project.student_id,
        developer_id: bid.developer_id,
      });
  }

  // Notify developer via DB notifications
  await supabase
    .from('notifications')
    .insert({
      user_id: bid.developer_id,
      type: 'bid_accepted',
      title: 'Your Bid Was Accepted! 🎉',
      message: `Your bid on "${project.title}" was accepted. Check your messages!`,
      link: `/developer/assigned`,
      related_id: project.id,
    });

  // Notify developer via email
  try {
    if (bid.developer && bid.developer.email) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const emailOptions = bidAcceptedEmail({
        developerName: bid.developer.name || 'Developer',
        projectTitle: project.title,
        studentName: req.user.name || 'Student',
        bidAmount: Number(bid.price),
        deliveryDays: Number(bid.delivery_days),
        dashboardLink: `${clientUrl}/developer/assigned`,
        clientUrl
      });

      sendEmail({
        to: bid.developer.email,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html
      }).catch(err => console.error('Failed to send bid accepted email:', err));
    }
  } catch (emailErr) {
    console.error('Error sending bid accepted email:', emailErr);
  }

  // Fetch updated bid and project to return
  const { data: updatedBid } = await supabase
    .from('bids')
    .select('*')
    .eq('id', bid.id)
    .single();

  const { data: updatedProject } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', project.id)
    .single();

  updatedBid._id = updatedBid.id;
  updatedProject._id = updatedProject.id;

  res.json({ message: 'Bid accepted successfully', bid: updatedBid, project: updatedProject });
});

// @desc Get developer's own bids
// @route GET /api/bids/my
const getMyBids = asyncHandler(async (req, res) => {
  const { data: bids, error } = await supabase
    .from('bids')
    .select('*, project:project_requests(id, title, status, budget, deadline, student_id, tech_stack, category, student:users!student_id(id, name, avatar))')
    .eq('developer_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedBids = (bids || []).map((b) => {
    const formatted = {
      ...b,
      _id: b.id,
      project: b.project_id,
      deliveryDays: b.delivery_days,
    };
    if (b.project) {
      formatted.project = {
        ...b.project,
        _id: b.project.id,
        techStack: b.project.tech_stack,
        studentId: b.project.student_id,
      };
      if (b.project.student) {
        formatted.project.student = {
          ...b.project.student,
          _id: b.project.student.id,
        };
      }
    }
    return formatted;
  });

  res.json(formattedBids);
});

// @desc Update bid
// @route PUT /api/bids/:id
const updateBid = asyncHandler(async (req, res) => {
  const { data: bid, error: fetchError } = await supabase
    .from('bids')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError || !bid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  if (bid.developer_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (bid.status !== 'pending') {
    res.status(400);
    throw new Error('Cannot update a bid that is already processed');
  }

  const { price, deliveryDays, proposal } = req.body;
  const updateData = {};
  if (price) updateData.price = Number(price);
  if (deliveryDays) updateData.delivery_days = Number(deliveryDays);
  if (proposal) updateData.proposal = proposal;

  const { data: updated, error: updateError } = await supabase
    .from('bids')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (updateError) {
    res.status(400);
    throw updateError;
  }

  updated._id = updated.id;
  res.json(updated);
});

module.exports = { submitBid, getProjectBids, acceptBid, getMyBids, updateBid };
