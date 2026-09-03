import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KpiCard from '@/components/dashboard/KpiCard';
import { FiActivity } from 'react-icons/fi';

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total" value={42} icon={FiActivity} color="#84cc16" bgColor="#f7fee7" />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});