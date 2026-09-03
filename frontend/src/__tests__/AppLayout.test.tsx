import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

import AppLayout from '@/components/layout/AppLayout';

describe('AppLayout', () => {
  it('renders brand name and nav links', () => {
    render(<AppLayout><div>child</div></AppLayout>);
    expect(screen.getByText('PulseArk')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Exercises')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});