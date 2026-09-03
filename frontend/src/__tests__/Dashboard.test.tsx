import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '@/pages/index';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, { get: (_t: any, prop: string) => React.forwardRef((p: any, ref: any) => React.createElement(prop === 'div' ? 'div' : prop === 'button' ? 'button' : 'div', { ...p, ref })) }),
    AnimatePresence: ({ children }: any) => children,
  };
});

const mockStats = {
  total_workouts: 3,
  total_sets: 20,
  total_duration_minutes: 120,
  workouts_by_day: [{ date: '2024-01-01', count: 2 }, { date: '2024-01-02', count: 1 }],
};

const mockWorkouts = [
  { id: 1, title: 'Morning Run', date: '2024-06-10T08:00:00Z', duration_minutes: 30, notes: '' },
  { id: 2, title: 'Strength', date: '2024-06-09T07:00:00Z', duration_minutes: 45, notes: '' },
];

beforeEach(() => {
  (apiClient.get as jest.Mock).mockImplementation((url: string) => {
    if (url === '/api/stats/weekly') return Promise.resolve({ data: mockStats });
    if (url === '/api/workouts') return Promise.resolve({ data: mockWorkouts });
    return Promise.resolve({ data: {} });
  });
  (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 3 } });
});

test('renders dashboard KPIs and recent workouts', async () => {
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('Morning Run')).toBeInTheDocument());
  expect(screen.getByText('20')).toBeInTheDocument(); // total sets
  expect(screen.getByText('120')).toBeInTheDocument(); // duration
});

test('opens log modal and submits', async () => {
  render(<Dashboard />);
  await waitFor(() => screen.getByText('Log workout'));
  fireEvent.click(screen.getByText('Log workout'));
  await waitFor(() => expect(screen.getByText('Save workout')).toBeInTheDocument());
  const titleInput = screen.getByPlaceholderText('e.g. Upper Body Strength');
  fireEvent.change(titleInput, { target: { value: 'Test Workout' } });
  fireEvent.click(screen.getByText('Save workout'));
  await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
});

test('shows error state on API failure', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<Dashboard />);
  await waitFor(() => expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument());
  expect(screen.getByText('Retry')).toBeInTheDocument();
});