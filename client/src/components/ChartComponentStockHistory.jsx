import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStockTransactionsYear } from '../redux/chart/chartHistorySlice.js';
import { Select } from 'flowbite-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Stock bedasarkan  items ',
        },
    },
};

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

export function ChartComponentStockHistory() {
    const { stockTransactions } = useSelector((state) => state.stockTransaction);
    const itemData = useSelector((state) => state.item.items);
    const defaultIdBarang = itemData.length > 0 ? itemData[0].id : '';
    const [selectedItemId, setSelectedItemId] = useState(defaultIdBarang);
    const [selectedYear, setSelectedYear] = useState('2024');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchStockTransactionsYear(selectedItemId, selectedYear));
    }, [selectedItemId, selectedYear, dispatch]);

    const ItemDataOptions = itemData.map((item) => (
        <option key={item.id} value={item.id}>
            {item.nama_barang}
        </option>
    ));

    const stockInByMonth = new Array(12).fill(0);
    const stockOutByMonth = new Array(12).fill(0);

    stockTransactions.forEach((transaction) => {
        const month = new Date(transaction.tanggal).getMonth();
        if (transaction.jenis === 'masuk') {
            stockInByMonth[month] += transaction.jumlah;
        } else if (transaction.jenis === 'keluar') {
            stockOutByMonth[month] += transaction.jumlah;
        }
    });

    const data = {
        labels,
        datasets: [
            {
                label: 'Stock Masuk',
                data: stockInByMonth,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Stock Keluar',
                data: stockOutByMonth,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    return (
        <div className="max-w-lg mx-auto md:mx-0 p-3 w-full">
            <div className="flex flex-col gap-6 ">
                <form>
                    <h1 className="text-xl text-center mb-5">Stock History</h1>

                    <div className="flex gap-4">
                        <Select id="nama_barang" onChange={(e) => setSelectedItemId(e.target.value)} className="flex-1">
                            {ItemDataOptions}
                        </Select>
                        <Select
                            id="jenis"
                            required
                            defaultValue={'2024'}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </Select>
                    </div>
                </form>
                <Line options={options} data={data} />
            </div>
        </div>
    );
}
