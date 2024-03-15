import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useSelector } from 'react-redux';

ChartJS.register(ArcElement, Tooltip, Legend);

export function ChartPieStock() {
    const { items } = useSelector((state) => state.item);

    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }

    const data = {
        labels: items.map((item) => item.nama_barang + ' ' + item.stock),
        datasets: [
            {
                label: 'Stock',
                data: items.map((item) => item.stock),
                backgroundColor: items.map(() => getRandomColor()),
                borderColor: items.map(() => getRandomColor()),
                borderWidth: 3,
            },
        ],
    };

    return (
        <div className="max-w-lg mx-auto md:mx-0 p-3 w-full ">
            <h1 className="text-xl text-center mb-5">Stock Total All Items </h1>
            <div>
                <h1 className="text-lg text-center mb-5">{items.reduce((total, item) => total + item.stock, 0)}</h1>
                <Pie data={data} />
            </div>
        </div>
    );
}
