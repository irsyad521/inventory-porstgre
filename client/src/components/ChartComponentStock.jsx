import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select } from 'flowbite-react';
import { fetchStock } from '../redux/chart/chartStockSlice.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

export function ChartComponentStock() {
    const { stock } = useSelector((state) => state.stock);
    const itemData = useSelector((state) => state.item.items);
    const defaultIdBarang = itemData.length > 0 ? itemData[0].id : '';
    const [selectedItemId, setSelectedItemId] = useState(defaultIdBarang);
    const [selectedYear, setSelectedYear] = useState('2024');
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchStock(selectedItemId, selectedYear));
    }, [selectedItemId, selectedYear, dispatch]);

    const ItemDataOptions = itemData.map((item) => (
        <option key={item.id} value={item.id}>
            {item.nama_barang}
        </option>
    ));

    const stockByMonth = new Array(12).fill(0);

    stock.forEach((transaction) => {
        const month = new Date(transaction.tanggal).getMonth();
        if (transaction.jenis === 'masuk') {
            stockByMonth[month] += transaction.jumlah;
        } else if (transaction.jenis === 'keluar') {
            stockByMonth[month] -= transaction.jumlah;
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

    const data = {
        labels,
        datasets: [
            {
                label: `Stock Total`,
                data: endingStockByMonth,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
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
                text: `Stock Akhir  ${endingStockByMonth[endingStockByMonth.length - 1]}`,
            },
        },
    };

    return (
        <div className="max-w-lg mx-auto md:mx-0 p-3 w-full">
            <div className="flex flex-col gap-6 ">
                <form>
                    <h1 className="text-xl text-center mb-5">Stock Total</h1>

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
                <Bar options={options} data={data} />
            </div>
        </div>
    );
}
