const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { supabase } = require('./db');

// ── Google Strategy ──────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        // Try to find by googleId first, then by email
        let { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('google_id', profile.id)
          .maybeSingle();

        if (error) throw error;

        if (!user) {
          const { data: userByEmail, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (emailError) throw emailError;
          user = userByEmail;
        }

        if (user) {
          // Existing user — link Google account if not already linked
          if (!user.google_id) {
            if (user.role !== 'student') {
              return done(new Error('OAuth login is only available for student accounts'), null);
            }

            const { data: updatedUser, error: updateError } = await supabase
              .from('users')
              .update({
                google_id: profile.id,
                avatar: user.avatar || profile.photos?.[0]?.value || '',
              })
              .eq('id', user.id)
              .select()
              .single();

            if (updateError) throw updateError;
            user = updatedUser;
          }
          user._id = user.id;
          return done(null, user);
        }

        // New user — create as student
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            name: profile.displayName || email.split('@')[0],
            email,
            google_id: profile.id,
            auth_provider: 'google',
            role: 'student',
            is_verified: true, // Google already verified their email
            avatar: profile.photos?.[0]?.value || '',
          })
          .select()
          .single();

        if (createError) throw createError;
        newUser._id = newUser.id;
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ── GitHub Strategy ──────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.find((e) => e.primary)?.value?.toLowerCase()
          || profile.emails?.[0]?.value?.toLowerCase();

        // Try to find by githubId first, then by email
        let { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('github_id', String(profile.id))
          .maybeSingle();

        if (error) throw error;

        if (!user && email) {
          const { data: userByEmail, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (emailError) throw emailError;
          user = userByEmail;
        }

        if (user) {
          // Existing user — link GitHub account if not already linked
          if (!user.github_id) {
            if (user.role !== 'student') {
              return done(new Error('OAuth login is only available for student accounts'), null);
            }

            const { data: updatedUser, error: updateError } = await supabase
              .from('users')
              .update({
                github_id: String(profile.id),
                avatar: user.avatar || profile.photos?.[0]?.value || '',
                github_url: user.github_url || profile.profileUrl || '',
              })
              .eq('id', user.id)
              .select()
              .single();

            if (updateError) throw updateError;
            user = updatedUser;
          }
          user._id = user.id;
          return done(null, user);
        }

        if (!email) {
          return done(
            new Error(
              'Your GitHub email is private. Please make your primary email public in GitHub settings and try again.'
            ),
            null
          );
        }

        // New user — create as student
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            name: profile.displayName || profile.username || email.split('@')[0],
            email,
            github_id: String(profile.id),
            auth_provider: 'github',
            role: 'student',
            is_verified: true,
            avatar: profile.photos?.[0]?.value || '',
            github_url: profile.profileUrl || '',
          })
          .select()
          .single();

        if (createError) throw createError;
        newUser._id = newUser.id;
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Passport serialize/deserialize (only needed transiently during OAuth flow)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) throw new Error('User not found');
    delete user.password;
    user._id = user.id;
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
