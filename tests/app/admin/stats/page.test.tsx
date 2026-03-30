import { render, screen, fireEvent } from '@testing-library/react';
import StatsPage from '@/app/admin/stats/page';

describe('StatsPage', () => {
    it('renders the page title and description correctly', () => {
        render(<StatsPage />);

        expect(screen.getByText('💰 Thống Kê Doanh Thu')).toBeInTheDocument();
        expect(screen.getByText('Theo dõi doanh thu theo ngày')).toBeInTheDocument();
    });

    it('renders correctly calculated summary stats', () => {
        render(<StatsPage />);

        expect(screen.getByText('59.1M')).toBeInTheDocument();
        expect(screen.getByText('591')).toBeInTheDocument();
        expect(screen.getByText('14.5M')).toBeInTheDocument();
        expect(screen.getByText('Chủ nhật')).toBeInTheDocument();
    });

    it('renders table data correctly', () => {
        render(<StatsPage />);

        expect(screen.getByText('Thứ 2')).toBeInTheDocument();
        expect(screen.getByText('4.500.000 ₫')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();

        expect(screen.getByText('CN')).toBeInTheDocument();
        expect(screen.getByText('14.500.000 ₫')).toBeInTheDocument();
        expect(screen.getByText('145')).toBeInTheDocument();
    });

    it('allows changing time range filter', () => {
        render(<StatsPage />);

        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('7days');

        fireEvent.change(select, { target: { value: '30days' } });
        expect(select).toHaveValue('30days');
    });

    it('displays chart elements', () => {
        render(<StatsPage />);

        expect(screen.getByText('Biểu đồ doanh thu 7 ngày')).toBeInTheDocument();

        const bars = screen.getAllByText(/đơn/);
        expect(bars).toHaveLength(7);
    });
});