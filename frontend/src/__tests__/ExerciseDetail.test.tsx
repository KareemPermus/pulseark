import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExerciseDetail from '@/pages/exercisedetail';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('next/router', () => ({ useRouter: () => ({ query: { id: '1' }, back: jest.fn() }) }));

const mockExercise = {
  id: 1,
  name: 'Bench Press',
  muscle_group: 'chest',
  description: 'A compound movement',
  image_url: '',
};

describe('ExerciseDetail page', () => {
  it('renders exercise details on success', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockExercise });
    render(<ExerciseDetail />);
    await waitFor(() => expect(screen.getByText('Bench Press')).toBeInTheDocument());
    expect(screen.getByText('chest')).toBeInTheDocument();
    expect(screen.getByText('A compound movement')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<ExerciseDetail />);
    await waitFor(() => expect(screen.getByText('Failed to load exercise.')).toBeInTheDocument());
  });
});