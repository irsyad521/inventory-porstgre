import { Button, Table } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItems } from '../redux/item/itemSlice';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ModalDeleteItem from '../utils/ModalDeleteItem';

export default function DashItem() {
    const itemData = useSelector((state) => state.item.items);
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        dispatch(fetchItems());
    }, []);

    const handleDeleteItem = async (id) => {
        setSelectedItemId(id);
        setShowModal(true);
    };

    return (
        <div
            className={`${
                currentUser.role === 'guest' ? 'w-full md:w-3/4' : 'w-full'
            } overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-50`}
        >
            <div className="w-full flex justify-between px-4 py-6">
                {(currentUser.role === 'admin' || currentUser.role === 'user') && (
                    <Button gradientDuoTone="purpleToPink" type="button">
                        <Link to={'/item/add'}>Add Item</Link>
                    </Button>
                )}
                <Button gradientDuoTone="purpleToBlue" outline>
                    Cetak Data
                </Button>
            </div>
            <div className="table-auto ">
                {itemData.length > 0 ? (
                    <>
                        <Table hoverable className="shadow-md">
                            <Table.Head>
                                <Table.HeadCell>Nama Item</Table.HeadCell>
                                <Table.HeadCell>Image</Table.HeadCell>
                                <Table.HeadCell>Harga</Table.HeadCell>
                                <Table.HeadCell>Pemasok</Table.HeadCell>
                                <Table.HeadCell>Stock</Table.HeadCell>
                                {(currentUser.role === 'admin' || currentUser.role === 'user') && (
                                    <>
                                        <Table.HeadCell>Delete</Table.HeadCell>
                                        <Table.HeadCell>Edit</Table.HeadCell>
                                    </>
                                )}
                            </Table.Head>
                            <Table.Body>
                                {itemData.map((item) => (
                                    <Table.Row
                                        key={item.id}
                                        className="bg-white dark:border-gray-700 dark:bg-gray-800 divide-y"
                                    >
                                        <Table.Cell>{item.nama_barang}</Table.Cell>
                                        <Table.Cell>
                                            <Link to={`/item/${item.slug}`}>
                                                <img
                                                    src={item.gambar_barang}
                                                    alt={item.nama_barang}
                                                    className="w-20 h-10 object-cover bg-gray-500"
                                                />
                                            </Link>
                                        </Table.Cell>
                                        <Table.Cell>{item.harga}</Table.Cell>
                                        <Table.Cell
                                            className={`${item.pemasok === null ? 'text-red-500 font-bold' : ''}`}
                                        >
                                            {item.pemasok === null
                                                ? 'Supplier Tidak Tersedia'
                                                : item.pemasok.nama_pemasok}
                                        </Table.Cell>
                                        <Table.Cell>{item.stock}</Table.Cell>
                                        {(currentUser.role === 'admin' || currentUser.role === 'user') && (
                                            <>
                                                <Table.Cell>
                                                    <span
                                                        className="font-medium text-red-500 hover:underline cursor-pointer"
                                                        onClick={() => handleDeleteItem(item.id)}
                                                    >
                                                        Delete
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Link to={`/item/edit/${item.id}`}>
                                                        <span className="font-medium text-teal-500 hover:underline cursor-pointer">
                                                            Edit
                                                        </span>
                                                    </Link>
                                                </Table.Cell>
                                            </>
                                        )}
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </>
                ) : (
                    <p>You have no posts yet!</p>
                )}
                <ModalDeleteItem onSetShowModal={setShowModal} onShowModal={showModal} itemId={selectedItemId} />
            </div>
        </div>
    );
}
