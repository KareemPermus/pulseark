import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Exercises from '@/pages/exercises';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ default: { get: jest.fn(), post: jest.fn() }, __esModule: true }));
jest.mock('framer-motion', () => {
  const R = require('react');
  const m = (tag: string) => R.forwardRef((p: any, ref: any) => R.createElement(tag === 'motion.div' ? 'div' : 'button', { ...p, ref }));
  return { motion: { div: m('motion.div'), button: m('motion.button') }, AnimatePresence: ({ children }: any) => children };
});

const mockExercises = [
  { id: 1, name: 'Bench Press', muscle_group: 'Chest', description: 'Flat bench', image_url: '' },
  { id: 2, name: 'Squat', muscle_group: 'Legs', description: '', image_url: '' },
];

beforeEach(() => { jest.clearAllMocks(); });

test('renders exercises after loading', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockExercises });
  render(<Exercises />);
  await waitFor(() => expect(screen.getByText('Bench Press')).toBeInTheDocument());
  expect(screen.getByText('Squat')).toBeInTheDocument();
});

test('shows error state', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<Exercises />);
  await waitFor(() => expect(screen.getByText('Failed to load exercises')).toBeInTheDocument());
});

test('filters by muscle group', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockExercises });
  render(<Exercises />);
  await waitFor(() => screen.getByText('Bench Press'));
  fireEvent.click(screen.getByText('Legs'));
  expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
  expect(screen.getByText('Squat')).toBeInTheDocument();
});

test('opens and closes add modal', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
  render(<Exercises />);
  await waitFor(() => screen.getByText('Add Exercise'));
  fireEvent.click(screen.getByText('Add Exercise'));
  expect(screen.getByText('Save Exercise')).toBeInTheDocument();
});