import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Workouts from '@/pages/workouts';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef((props: any, ref: any) => <div ref={ref} {...props} />),
      button: React.forwardRef((props: any, ref: any) => <button ref={ref} {...props} />),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

const mockWorkouts = [
  { id: 1, title: 'Morning Run', date: '2024-06-10T08:00:00Z', duration_minutes: 30, notes: 'Great run' },
  { id: 2, title: 'Upper Body', date: '2024-06-11T07:00:00Z', duration_minutes: 45, notes: null },
];

describe('Workouts Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockWorkouts });
  });

  it('renders workouts list', async () => {
    render(<Workouts />);
    await waitFor(() => {
      expect(screen.getByText('Morning Run')).toBeInTheDocument();
      expect(screen.getByText('Upper Body')).toBeInTheDocument();
    });
  });

  it('shows empty state when no workouts', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<Workouts />);
    await waitFor(() => {
      expect(screen.getByText('No workouts found')).toBeInTheDocument();
    });
  });

  it('opens create modal on button click', async () => {
    render(<Workouts />);
    await waitFor(() => screen.getByText('Morning Run'));
    fireEvent.click(screen.getByText('Log Workout'));
    expect(screen.getByText('Log a Workout')).toBeInTheDocument();
  });

  it('filters workouts by search', async () => {
    render(<Workouts />);
    await waitFor(() => screen.getByText('Morning Run'));
    fireEvent.change(screen.getByPlaceholderText('Search workouts…'), { target: { value: 'Upper' } });
    expect(screen.queryByText('Morning Run')).not.toBeInTheDocument();
    expect(screen.getByText('Upper Body')).toBeInTheDocument();
  });

  it('calls delete endpoint', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
    render(<Workouts />);
    await waitFor(() => screen.getByText('Morning Run'));
    const deleteBtns = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
    // Click first delete button (trash icon)
    fireEvent.click(deleteBtns[1]); // index 1 is first trash
    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/api/workouts/1');
    });
  });

  it('loads workout detail on click', async () => {
    const detail = { ...mockWorkouts[0], sets: [{ id: 1, exercise_id: 1, exercise_name: 'Squat', reps: 10, set_number: 1, weight: 135 }] };
    (apiClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/workouts/1') return Promise.resolve({ data: detail });
      return Promise.resolve({ data: mockWorkouts });
    });
    render(<Workouts />);
    await waitFor(() => screen.getByText('Morning Run'));
    fireEvent.click(screen.getByText('Morning Run'));
    await waitFor(() => {
      expect(screen.getByText('Squat')).toBeInTheDocument();
    });
  });
});