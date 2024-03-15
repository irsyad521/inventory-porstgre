import { Pagination, Table } from 'flowbite-react';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchStockTransactions } from '../redux/chart/chartHistorySlice';

export default function TableDashboard() {
    const { stockTransactions } = useSelector((state) => state.stockTransaction);
    const itemData = useSelector((state) => state.item.items);
    const [currentPage, setCurrentPage] = useState(1);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchStockTransactions());
    }, []);

    const formatDate = (isoDateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(isoDateString);
        return date.toLocaleDateString('id-ID', options);
    };

    const onPageChange = (page) => setCurrentPage(page);
    const itemsPerPage = 5;
    const getPaginatedData = (data) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };
    return (
        <>
            <h1 className="text-2xl mt-3 mb-5 p-3 text-center font-serif max-w-2xl mx-auto ">
                History Stock Transaction All Items
            </h1>
            <div className="overflow-x-auto flow-root   mx-auto w-full mb-5">
                <Table hoverable className="text-center">
                    <Table.Head>
                        <Table.HeadCell>No</Table.HeadCell>
                        <Table.HeadCell>Nama Item</Table.HeadCell>
                        <Table.HeadCell>Type</Table.HeadCell>
                        <Table.HeadCell>Jumlah</Table.HeadCell>
                        <Table.HeadCell>Tanggal</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {getPaginatedData(stockTransactions).map((transaction, index) => {
                            const itemName =
                                itemData.find((item) => item.id === transaction.id_barang)?.nama_barang || 'Unknown';
                            return (
                                <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <Table.Cell>{(currentPage - 1) * itemsPerPage + index + 1}</Table.Cell>
                                    <Table.Cell>{itemName}</Table.Cell>
                                    <Table.Cell
                                        className={`${
                                            transaction.jenis === 'masuk'
                                                ? 'text-green-400'
                                                : 'text-red-600 line-through '
                                        } whitespace-nowrap font-medium   uppercase `}
                                    >
                                        {transaction.jenis}
                                    </Table.Cell>
                                    <Table.Cell
                                        className={`${
                                            transaction.jenis === 'masuk' ? 'text-green-400' : 'text-red-600  '
                                        } whitespace-nowrap font-medium `}
                                    >
                                        {transaction.jumlah}
                                    </Table.Cell>
                                    <Table.Cell>{formatDate(transaction.tanggal)}</Table.Cell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
            </div>
            <div className="flex overflow-x-auto sm:justify-center">
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(stockTransactions.length / itemsPerPage)}
                    onPageChange={onPageChange}
                />
            </div>
        </>
    );
}
