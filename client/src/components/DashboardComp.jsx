import { ChartAreaStock } from './ChartAreaStock';
import { ChartComponentStock } from './ChartComponentStock';
import { ChartComponentStockHistory } from './ChartComponentStockHistory';
import { ChartPieStock } from './ChartPieStock';

import TableDashboard from './TableDashboard';

export default function DashboardComp() {
    return (
        <div className="w-full flex flex-col gap-14 ">
            <div className="w-full justify-center flex flex-col md:flex-row gap-14">
                <ChartComponentStockHistory />
                <ChartComponentStock />
            </div>
            <div className="w-full justify-center flex flex-col md:flex-row gap-14">
                <ChartPieStock />
                <ChartAreaStock />
            </div>
            <TableDashboard />
        </div>
    );
}
