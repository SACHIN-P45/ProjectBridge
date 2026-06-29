const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'developer', 'admin'], required: true },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    techStack: [{ type: String }],
    githubUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    college: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    totalEarnings: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpire: { type: Date },
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
