import { supabase } from '../lib/supabase';
import { Profile, Resume, SubscriptionTier } from '../types';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'sahil68shaikh68@gmail.com';

/**
 * Fetches the public profile for a given user.
 * If the profile doesn't exist, creates one with default values.
 * @param userId The ID of the user.
 * @param email Optional email for admin check.
 * @returns The user's profile or null if not found or on error.
 */
export const getProfile = async (userId: string, email?: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, updated_at, subscription_tier, subscription_expires_at, is_admin')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const isAdmin = email === ADMIN_EMAIL;
      const newProfile = {
        id: userId,
        full_name: '',
        subscription_tier: isAdmin ? 'pro' : 'standard' as SubscriptionTier,
        is_admin: isAdmin,
        updated_at: new Date().toISOString(),
      };
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }
      return created;
    }

    if (error) throw error;

    // Auto-upgrade admin user
    if (email === ADMIN_EMAIL && data && (!data.is_admin || data.subscription_tier !== 'pro')) {
      await supabase
        .from('profiles')
        .update({ is_admin: true, subscription_tier: 'pro' })
        .eq('id', userId);
      data.is_admin = true;
      data.subscription_tier = 'pro';
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

/**
 * Updates a user's profile.
 * @param userId The ID of the user whose profile to update.
 * @param updates The profile fields to update.
 */
export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Upgrades a user's subscription to Pro.
 * @param userId The user ID.
 * @param paymentId The Razorpay payment ID for record keeping.
 */
export const upgradeSubscription = async (userId: string, paymentId: string): Promise<boolean> => {
  try {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year subscription

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'pro',
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the payment
    await supabase.from('payments').insert([{
      user_id: userId,
      payment_id: paymentId,
      amount: 99,
      currency: 'INR',
      status: 'completed',
      created_at: new Date().toISOString(),
    }]);

    return true;
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return false;
  }
};

/**
 * Uploads a resume file to Supabase Storage.
 * @param file The resume file to upload.
 * @param userId The ID of the user uploading the file.
 * @returns The public URL of the uploaded file or null on error.
 */
export const uploadResumeFile = async (file: File, userId: string): Promise<string | null> => {
    const filePath = `${userId}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    try {
        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading resume file:', error);
        return null;
    }
};

/**
 * Saves the analyzed resume data and its relations to the database.
 * @param payload The complete data payload for the resume.
 * @returns An object with the saved resume data or an error.
 */
export const saveResumeData = async (payload: Omit<Resume, 'id' | 'created_at'>): Promise<{ data: Resume | null, error: any }> => {
    const { skills, feedback, matched_jobs, cover_letter, ...resumeInfo } = payload;

    try {
        const { data: newResume, error: resumeError } = await supabase
            .from('resumes')
            .insert([{ ...resumeInfo, cover_letter }])
            .select()
            .single();

        if (resumeError) throw resumeError;

        const resumeId = newResume.id;

        if (skills && skills.length > 0) {
            const skillsToInsert = skills.map(skill => ({ ...skill, resume_id: resumeId }));
            const { error: skillsError } = await supabase.from('skills').insert(skillsToInsert);
            if (skillsError) console.error('Error saving skills:', skillsError);
        }

        if (feedback && feedback.length > 0) {
            const feedbackToInsert = feedback.map(fb => ({ ...fb, resume_id: resumeId }));
            const { error: feedbackError } = await supabase.from('feedback').insert(feedbackToInsert);
            if (feedbackError) console.error('Error saving feedback:', feedbackError);
        }

        if (matched_jobs && matched_jobs.length > 0) {
            const jobsToInsert = matched_jobs.map(job => ({ ...job, resume_id: resumeId }));
            const { error: jobsError } = await supabase.from('matched_jobs').insert(jobsToInsert);
            if (jobsError) console.error('Error saving matched jobs:', jobsError);
        }
        
        const finalResume = await getResumeData(resumeId);
        return { data: finalResume, error: null };

    } catch (error) {
        console.error('Error saving complete resume data:', error);
        return { data: null, error };
    }
};


/**
 * Fetches all resume analyses for a specific user.
 * @param userId The ID of the user.
 * @returns An array of resumes.
 */
export const getResumesForUser = async (userId: string): Promise<Resume[]> => {
    try {
        const { data, error } = await supabase
            .from('resumes')
            .select('id, filename, score, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        return (data || []) as Resume[];
    } catch(error) {
        console.error('Error fetching resumes for user:', error);
        return [];
    }
};

/**
 * Fetches a single resume analysis and all its related data by ID.
 * @param resumeId The ID of the resume.
 * @returns The complete resume data or null if not found or on error.
 */
export const getResumeData = async (resumeId: string): Promise<Resume | null> => {
    try {
        const { data, error } = await supabase
            .from('resumes')
            .select(`
                *,
                skills(*),
                feedback(*),
                matched_jobs(*)
            `)
            .eq('id', resumeId)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error fetching resume data with relations:', error);
        return null;
    }
};

/**
 * Deletes a resume and all its related data.
 * @param resumeId The ID of the resume to delete.
 * @returns true if successful, false otherwise.
 */
export const deleteResume = async (resumeId: string): Promise<boolean> => {
    try {
        // Delete related data first (cascading should handle this, but explicit is safer)
        await supabase.from('skills').delete().eq('resume_id', resumeId);
        await supabase.from('feedback').delete().eq('resume_id', resumeId);
        await supabase.from('matched_jobs').delete().eq('resume_id', resumeId);

        // Delete the resume itself
        const { error } = await supabase.from('resumes').delete().eq('id', resumeId);
        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error deleting resume:', error);
        return false;
    }
};

/**
 * Signs in with Google OAuth via Supabase.
 */
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });
    return { data, error };
};
