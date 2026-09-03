import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExerciseLibrary from '@/pages/exerciselibrary';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
jest.mock('framer-motion', () => {
  const React = require('react');
  const motion = new Proxy({}, { get: (_, tag) => React.forwardRef((props: any, ref: any) => React.createElement(tag as string, { ...props, ref })) });
  return { motion, AnimatePresence: ({ children }: any) => children };
});

const mockExercises = [
  { id: 1, name: 'Bench Press', muscle_group: 'Chest', description: 'Flat bench', image_url: '' },
  { id: 2, name: 'Squat', muscle_group: 'Legs', description: 'Barbell squat', image_url: '' },
];

beforeEach(() => { jest.clearAllMocks(); });

test('renders exercises after loading', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockExercises });
  render(<ExerciseLibrary />);
  await waitFor(() => expect(screen.getByText('Bench Press')).toBeInTheDocument());
  expect(screen.getByText('Squat')).toBeInTheDocument();
});

test('filters by muscle group', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockExercises });
  render(<ExerciseLibrary />);
  await waitFor(() => expect(screen.getByText('Bench Press')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Legs'));
  expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
  expect(screen.getByText('Squat')).toBeInTheDocument();
});

test('shows error state', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<ExerciseLibrary />);
  await waitFor(() => expect(screen.getByText('Failed to load exercises')).toBeInTheDocument());
});

test('opens add modal and submits', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
  (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 3, name: 'Deadlift', muscle_group: 'Back', description: '', image_url: '' } });
  render(<ExerciseLibrary />);
  await waitFor(() => expect(screen.getByText('Add Exercise')).toBeInTheDocument());
  fireEvent.click(screen.getByText('Add Exercise'));
  fireEvent.change(screen.getByDisplayValue(''), { target: { value: 'Deadlift' } });
  fireEvent.click(screen.getByText('Save Exercise'));
  await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
});