import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:3000/api';

interface Label {
  id: number;
  name: string;
  color: string;
  icon: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  description?: string;
  parent_category_id?: number;
  created_at: string;
  updated_at: string;
}

interface LabelsContextType {
  labels: Label[];
  categories: Category[];
  loading: boolean;
  fetchLabels: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createLabel: (labelData: Partial<Label>) => Promise<Label>;
  updateLabel: (id: number, labelData: Partial<Label>) => Promise<Label>;
  deleteLabel: (id: number) => Promise<void>;
  createCategory: (categoryData: Partial<Category>) => Promise<Category>;
  updateCategory: (id: number, categoryData: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  assignLabelsToNote: (noteId: number, labelIds: number[]) => Promise<void>;
  assignCategoriesToNote: (noteId: number, categoryIds: number[]) => Promise<void>;
  fetchNotesWithLabels: (filters?: any) => Promise<any>;
}

const LabelsContext = createContext<LabelsContextType | undefined>(undefined);

export const useLabels = () => {
  const context = useContext(LabelsContext);
  if (context === undefined) {
    throw new Error('useLabels must be used within a LabelsProvider');
  }
  return context;
};

interface LabelsProviderProps {
  children: ReactNode;
}

export const LabelsProvider: React.FC<LabelsProviderProps> = ({ children }) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/labels`);
      setLabels(response.data.labels || []);
    } catch (error: any) {
      console.error('Failed to fetch labels:', error);
      setLabels([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      setCategories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const createLabel = async (labelData: Partial<Label>): Promise<Label> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/labels`, labelData);
      const newLabel = response.data.label;
      setLabels(prev => [...prev, newLabel]);
      return newLabel;
    } catch (error: any) {
      console.error('Failed to create label:', error);
      throw error;
    }
  };

  const updateLabel = async (id: number, labelData: Partial<Label>): Promise<Label> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/labels/${id}`, labelData);
      const updatedLabel = response.data.label;
      
      setLabels(prev => prev.map(label => 
        label.id === id ? updatedLabel : label
      ));
      
      return updatedLabel;
    } catch (error: any) {
      console.error('Failed to update label:', error);
      throw error;
    }
  };

  const deleteLabel = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/labels/${id}`);
      setLabels(prev => prev.filter(label => label.id !== id));
    } catch (error: any) {
      console.error('Failed to delete label:', error);
      throw error;
    }
  };

  const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/categories`, categoryData);
      const newCategory = response.data.category;
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error: any) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: number, categoryData: Partial<Category>): Promise<Category> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/categories/${id}`, categoryData);
      const updatedCategory = response.data.category;
      
      setCategories(prev => prev.map(category => 
        category.id === id ? updatedCategory : category
      ));
      
      return updatedCategory;
    } catch (error: any) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/categories/${id}`);
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  };

  const assignLabelsToNote = async (noteId: number, labelIds: number[]): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/notes/${noteId}/labels`, { labelIds });
    } catch (error: any) {
      console.error('Failed to assign labels to note:', error);
      throw error;
    }
  };

  const assignCategoriesToNote = async (noteId: number, categoryIds: number[]): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/notes/${noteId}/categories`, { categoryIds });
    } catch (error: any) {
      console.error('Failed to assign categories to note:', error);
      throw error;
    }
  };

  const fetchNotesWithLabels = async (filters = {}): Promise<any> => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_BASE_URL}/notes-with-labels?${queryParams}`);
      return response.data.notes;
    } catch (error: any) {
      console.error('Failed to fetch notes with labels:', error);
      throw error;
    }
  };

  const value = {
    labels,
    categories,
    loading,
    fetchLabels,
    fetchCategories,
    createLabel,
    updateLabel,
    deleteLabel,
    createCategory,
    updateCategory,
    deleteCategory,
    assignLabelsToNote,
    assignCategoriesToNote,
    fetchNotesWithLabels,
  };

  return <LabelsContext.Provider value={value}>{children}</LabelsContext.Provider>;
};