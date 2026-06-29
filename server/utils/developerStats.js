const { supabase } = require('../config/db');

const updateDeveloperStats = async (developerId) => {
  if (!developerId) return;

  try {
    // 1. Get completed projects count
    const { count: completedProjectsCount, error: projectError } = await supabase
      .from('project_requests')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_developer_id', developerId)
      .eq('status', 'completed');

    if (projectError) throw projectError;

    // 2. Get released payments for total earnings
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('amount')
      .eq('developer_id', developerId)
      .eq('status', 'released');

    if (paymentError) throw paymentError;

    const totalEarningsAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // 3. Get reviews for average rating
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', developerId);

    if (reviewError) throw reviewError;

    const totalReviewsCount = reviews.length;
    const averageRating = totalReviewsCount > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount) * 10) / 10
      : 0;

    // 4. Update developer user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        completed_projects: completedProjectsCount || 0,
        total_earnings: totalEarningsAmount || 0,
        rating: averageRating || 0,
        total_reviews: totalReviewsCount || 0,
      })
      .eq('id', developerId);

    if (updateError) throw updateError;

    console.log(`Updated stats for developer ${developerId}. Completed: ${completedProjectsCount}, Earnings: ${totalEarningsAmount}, Rating: ${averageRating} (${totalReviewsCount} reviews)`);
  } catch (err) {
    console.error(`Error updating stats for developer ${developerId}:`, err);
  }
};

const syncAllDeveloperStats = async () => {
  try {
    const { data: developers, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'developer');

    if (error) throw error;

    console.log(`Starting stats sync for ${developers.length} developers...`);
    for (const dev of developers) {
      await updateDeveloperStats(dev.id);
    }
    console.log('Successfully synchronized all developer statistics.');
  } catch (err) {
    console.error('Error synchronizing developer statistics:', err);
  }
};

const updateStudentStats = async (studentId) => {
  if (!studentId) return;

  try {
    // 1. Get completed projects count
    const { count: completedProjectsCount, error: projectError } = await supabase
      .from('project_requests')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('status', 'completed');

    if (projectError) throw projectError;

    // 2. Get reviews for average rating
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', studentId);

    if (reviewError) throw reviewError;

    const totalReviewsCount = reviews.length;
    const averageRating = totalReviewsCount > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount) * 10) / 10
      : 0;

    // 3. Update student user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        completed_projects: completedProjectsCount || 0,
        rating: averageRating || 0,
        total_reviews: totalReviewsCount || 0,
      })
      .eq('id', studentId);

    if (updateError) throw updateError;

    console.log(`Updated stats for student ${studentId}. Completed: ${completedProjectsCount}, Rating: ${averageRating} (${totalReviewsCount} reviews)`);
  } catch (err) {
    console.error(`Error updating stats for student ${studentId}:`, err);
  }
};

const syncAllStudentStats = async () => {
  try {
    const { data: students, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'student');

    if (error) throw error;

    console.log(`Starting stats sync for ${students.length} students...`);
    for (const student of students) {
      await updateStudentStats(student.id);
    }
    console.log('Successfully synchronized all student statistics.');
  } catch (err) {
    console.error('Error synchronizing student statistics:', err);
  }
};

module.exports = {
  updateDeveloperStats,
  syncAllDeveloperStats,
  updateStudentStats,
  syncAllStudentStats,
};
