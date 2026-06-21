import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/projects', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyProjects = createAsyncThunk('projects/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/projects/my');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createProject = createAsyncThunk('projects/create', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProjectStatus = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    myProjects: [],
    currentProject: null,
    loading: false,
    error: null,
    total: 0,
    pages: 1,
    page: 1,
  },
  reducers: {
    clearCurrentProject(state) { state.currentProject = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (s) => { s.loading = true; })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.projects = a.payload.projects; s.total = a.payload.total; s.pages = a.payload.pages; })
      .addCase(fetchProjects.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyProjects.fulfilled, (s, a) => { s.myProjects = a.payload; })
      .addCase(fetchProject.pending, (s) => { s.loading = true; s.currentProject = null; })
      .addCase(fetchProject.fulfilled, (s, a) => { s.loading = false; s.currentProject = a.payload; })
      .addCase(fetchProject.rejected, (s) => { s.loading = false; })
      .addCase(createProject.fulfilled, (s, a) => { s.myProjects.unshift(a.payload); });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
