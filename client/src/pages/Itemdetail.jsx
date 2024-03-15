import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Pagination, Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { fetchStockTransactions } from '../redux/chart/chartHistorySlice';
export default function Itemdetail() {
    const itemData = useSelector((state) => state.item.items);
    const { stockTransactions } = useSelector((state) => state.stockTransaction);
    const { itemslug } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const dispatch = useDispatch();

    const item = itemData.find((item) => item.slug === itemslug);

    useEffect(() => {
        dispatch(fetchStockTransactions(item.id));
    }, [itemslug, item.id, dispatch]);

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
        <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
            <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
                {item && item.nama_barang}
            </h1>
            <img
                src={item && item.gambar_barang}
                alt={item && item.nama_barang}
                className="mt-10 mb-20 p-3 max-h-[400px] w-full object-cover"
            />
            <h1 className="text-3xl mt-3 mb-5 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">information</h1>
            <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
                <span>{item && new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div
                className="p-3 max-w-2xl mx-auto w-full post-content"
                dangerouslySetInnerHTML={{ __html: item && item.deskripsi }}
            ></div>

            <div className="flex justify-between p-3 border-t border-slate-500 mx-auto w-full max-w-2xl text-xs"></div>

            <div className="flow-root  max-w-2xl mx-auto w-full mb-5">
                <dl className="-my-3 divide-y divide-gray-100 text-sm">
                    <div className="grid grid-cols-2 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium ">Harga</dt>
                        <dd className=" sm:col-span-2">{item && item.harga}</dd>
                    </div>

                    <div className="grid grid-cols-2 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium ">Stock</dt>
                        <dd className=" sm:col-span-2">{item && item.stock}</dd>
                    </div>

                    <div className="grid grid-cols-2 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium ">Supplier</dt>
                        <dd className=" sm:col-span-2">{item && item.pemasok.nama_pemasok}</dd>
                    </div>

                    <div className="grid grid-cols-2 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium ">Alamat Supplier</dt>
                        <dd className=" sm:col-span-2">{item && item.pemasok.alamat}</dd>
                    </div>

                    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium ">Kontak</dt>
                        <dd className=" sm:col-span-2">{item && item.pemasok.kontak}</dd>
                    </div>
                </dl>
            </div>

            <div className="flex justify-between p-3 border-t border-slate-500 mx-auto w-full max-w-2xl text-xs"></div>
            <h1 className="text-xl mt-3 mb-5 p-3 text-center font-serif max-w-2xl mx-auto ">
                History Stock Transaction
            </h1>

            <div className="overflow-x-auto flow-root  max-w-2xl mx-auto w-full mb-5">
                <Table hoverable className="text-center">
                    <Table.Head>
                        <Table.HeadCell>No</Table.HeadCell>
                        <Table.HeadCell>Type</Table.HeadCell>
                        <Table.HeadCell>Jumlah</Table.HeadCell>
                        <Table.HeadCell>Tanggal</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {getPaginatedData(stockTransactions).map((transaction, index) => (
                            <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <Table.Cell>{(currentPage - 1) * itemsPerPage + index + 1}</Table.Cell>
                                <Table.Cell
                                    className={`${
                                        transaction.jenis === 'masuk' ? 'text-green-400' : 'text-red-600 line-through '
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
                        ))}
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
        </main>
    );
}
