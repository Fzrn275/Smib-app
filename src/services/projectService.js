// src/services/projectService.js
// P2 — Manage Projects (DFD Section 4.2)
// Fetches projects, steps, and materials from Supabase.
// Steps and materials are cached in AsyncStorage after first load
// so learners can follow instructions without an active connection.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

const CACHE_PREFIX = 'smib_proj_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── CACHE HELPERS ───────────────────────────────────────────────────────────

async function writeCache(key, data) {
  try {
    await AsyncStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch {
    // Non-fatal — cache writes failing is acceptable
  }
}

async function readCache(key) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null; // expired
    return data;
  } catch {
    return null;
  }
}

export async function invalidateProjectCache(projectId) {
  await AsyncStorage.multiRemove([
    CACHE_PREFIX + `steps_${projectId}`,
    CACHE_PREFIX + `mats_${projectId}`,
  ]);
}

// ─── PROJECT QUERIES ─────────────────────────────────────────────────────────

/**
 * Fetches all published projects, with optional filters.
 * DFD DS2 read — P2.1 Fetch Projects.
 *
 * @param {object} filters  - { difficulty?, category?, search?, type? }
 * @returns {Array}
 */
export async function getPublishedProjects({ difficulty, category, search, type } = {}) {
  try {
    let query = supabase
      .from('projects')
      .select('id, title, description, difficulty, category, type, cover_image_url, tags, estimated_duration, status')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (difficulty) query = query.eq('difficulty', difficulty);
    if (category)   query = query.eq('category',   category);
    if (type)       query = query.eq('type',        type);
    if (search)     query = query.ilike('title',    `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load projects.');
  }
}

/**
 * Fetches a single project by ID, including the creator's profile.
 * DFD DS2 read — P2.4.
 */
export async function getProjectById(projectId) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creators (
          organisation,
          focus_area,
          is_verified,
          users ( name, avatar_url )
        )
      `)
      .eq('id', projectId)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not load project details.');
  }
}

/**
 * Fetches all steps for a project, sorted by step_number.
 * Results cached in AsyncStorage (TTL: 1 hour).
 * DFD DS3 read — P2.4 Fetch Steps.
 */
export async function getProjectSteps(projectId) {
  const cacheKey = `steps_${projectId}`;
  const cached   = await readCache(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('steps')
      .select('*')
      .eq('project_id', projectId)
      .order('step_number', { ascending: true });
    if (error) throw error;

    await writeCache(cacheKey, data ?? []);
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load project steps.');
  }
}

/**
 * Fetches all materials for a project.
 * Results cached in AsyncStorage (TTL: 1 hour).
 * DFD DS3 / materials table read — P2.4.
 */
export async function getProjectMaterials(projectId) {
  const cacheKey = `mats_${projectId}`;
  const cached   = await readCache(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('project_id', projectId);
    if (error) throw error;

    await writeCache(cacheKey, data ?? []);
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load materials.');
  }
}

/**
 * Fetches a single step by its ID.
 * Used when navigating directly to StepDetailScreen.
 */
export async function getStepById(stepId) {
  try {
    const { data, error } = await supabase
      .from('steps')
      .select('*')
      .eq('id', stepId)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not load step.');
  }
}

// ─── ENROLMENT ───────────────────────────────────────────────────────────────

/**
 * Creates a progress row for the student/project pair — this is "enrolment".
 * Uses upsert so double-tapping Enrol is idempotent.
 * DFD P2.5 Create Enrolment → DS4 progress INSERT.
 */
export async function enrolInProject(studentId, projectId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .upsert(
        {
          student_id:      studentId,
          project_id:      projectId,
          completed_steps: [],
          current_step:    1,
          progress_pct:    0,
          is_completed:    false,
        },
        { onConflict: 'student_id,project_id' },
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not enrol in project.');
  }
}

/**
 * Checks if a student is already enrolled in a project.
 * Returns the progress row, or null if not enrolled.
 */
export async function getEnrolmentStatus(studentId, projectId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('id, progress_pct, is_completed, current_step, completed_steps')
      .eq('student_id', studentId)
      .eq('project_id', projectId)
      .maybeSingle();
    if (error) throw error;
    return data; // null = not enrolled
  } catch (err) {
    throw new Error(err.message || 'Could not check enrolment status.');
  }
}

/**
 * Returns all projects a student is enrolled in, joined with project details.
 * DFD DS4 + DS2 read — used on HomeScreen and ProgressScreen.
 */
export async function getEnrolledProjects(studentId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select(`
        id, progress_pct, is_completed, current_step, enrolled_at, last_updated,
        projects ( id, title, category, difficulty, type, cover_image_url, estimated_duration )
      `)
      .eq('student_id', studentId)
      .order('last_updated', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load enrolled projects.');
  }
}

/**
 * Returns the total number of students enrolled in a project.
 * Used on ProjectDetailScreen and Creator analytics.
 */
export async function getProjectEnrolmentCount(projectId) {
  try {
    const { count, error } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);
    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    return 0; // Non-fatal — don't block the detail screen over a count
  }
}

// ─── CREATOR QUERIES ─────────────────────────────────────────────────────────

/**
 * Fetches all projects for a specific creator (all statuses).
 * Used on CreatorDashboardScreen and MyProjectsScreen.
 */
export async function getCreatorProjects(creatorId) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, category, difficulty, type, status, cover_image_url, created_at, updated_at')
      .eq('creator_id', creatorId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    throw new Error(err.message || 'Could not load your projects.');
  }
}

/**
 * Creates a new draft project.
 * Returns the newly created project row.
 */
export async function createProject(creatorId, projectData) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...projectData, creator_id: creatorId, status: 'draft' })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not create project.');
  }
}

/**
 * Updates an existing project (title, description, category, etc.).
 */
export async function updateProject(projectId, updates) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single();
    if (error) throw error;
    await invalidateProjectCache(projectId);
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not update project.');
  }
}

/**
 * Adds a step to a project.
 */
export async function addStep(projectId, stepData) {
  try {
    const { data, error } = await supabase
      .from('steps')
      .insert({ ...stepData, project_id: projectId })
      .select()
      .single();
    if (error) throw error;
    await invalidateProjectCache(projectId);
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not add step.');
  }
}

/**
 * Adds a material to a project.
 */
export async function addMaterial(projectId, materialData) {
  try {
    const { data, error } = await supabase
      .from('materials')
      .insert({ ...materialData, project_id: projectId })
      .select()
      .single();
    if (error) throw error;
    await invalidateProjectCache(projectId);
    return data;
  } catch (err) {
    throw new Error(err.message || 'Could not add material.');
  }
}
