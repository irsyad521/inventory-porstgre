import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockTotal } from '../redux/chart/chartStockTotal';
import { Select } from 'flowbite-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export function ChartAreaStock() {
    const { stocktotal } = useSelector((state) => state.stocktotal);
    const [selectedYear, setSelectedYear] = useState('2024');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchStockTotal(selectedYear));
    }, [selectedYear, dispatch]);

    const stockByMonth = new Array(12).fill(0);

    stocktotal.forEach((transaction) => {
        const month = new Date(transaction.tanggal).getMonth();
        const year = new Date(transaction.tanggal).getFullYear();
        if (year === parseInt(selectedYear, 10)) {
            if (transaction.jenis === 'masuk') {
                stockByMonth[month] += transaction.jumlah;
            } else if (transaction.jenis === 'keluar') {
                stockByMonth[month] -= transaction.jumlah;
            }
        }
    });

    const endingStockByMonth = stockByMonth.reduce((acc, curr, index) => {
        if (index === 0) {
            acc.push(curr);
        } else {
            const endingStock = acc[index - 1] + curr;
            acc.push(endingStock);
        }
        return acc;
    }, []);

    const labels = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: `Stock`,
                data: endingStockByMonth,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Total Stock ${endingStockByMonth[endingStockByMonth.length - 1]}`,
            },
        },
    };

    return (
        <div className="max-w-lg mx-auto md:mx-0 p-3 w-full">
            <div className="flex flex-col gap-6  ">
                <h1 className="text-xl text-center mb-5">Stock Total All Items</h1>
                <Select id="jenis" required defaultValue={'2024'} onChange={(e) => setSelectedYear(e.target.value)}>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </Select>
                <Line options={options} data={data} />;
            </div>
        </div>
    );
}
