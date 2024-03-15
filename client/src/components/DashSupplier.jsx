import { useState, useEffect } from 'react';
import { Button, Table } from 'flowbite-react';
import ModalAddSupplier from '../utils/ModalAddSupplier';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchSuppliers } from '../redux/supplier/supplierSlice';
import ModalEditSupplier from '../utils/ModalEditSupplier';
import ModalDeleteSupplier from '../utils/ModalDeleteSupplier';

export default function DashSupplier() {
    const supplierData = useSelector((state) => state.supplier.suppliers);
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState(null);

    console.log(supplierData);

    useEffect(() => {
        dispatch(fetchSuppliers());
    }, []);

    const handleDeleteSupplier = async (id) => {
        setSelectedSupplierId(id);
        setShowModalDelete(true);
    };

    const handleEditSupplier = async (id) => {
        setSelectedSupplierId(id);
        setShowModalEdit(true);
    };

    return (
        <div
            className={`${
                currentUser.role === 'guest' ? 'w-full md:w-3/4' : 'w-full'
            } overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-50`}
        >
            <div className="w-full flex justify-between px-4 py-6">
                {(currentUser.role === 'admin' || currentUser.role === 'user') && (
                    <Button gradientDuoTone="purpleToPink" type="button" onClick={() => setShowModal(true)}>
                        Add Supplier
                    </Button>
                )}
                <Button gradientDuoTone="purpleToBlue" outline>
                    Cetak Data
                </Button>
            </div>
            <div className="table-auto ">
                {supplierData.length > 0 ? (
                    <>
                        <Table hoverable className="shadow-md">
                            <Table.Head>
                                <Table.HeadCell>Date updated</Table.HeadCell>
                                <Table.HeadCell>Supplier</Table.HeadCell>
                                <Table.HeadCell>Alamat</Table.HeadCell>
                                <Table.HeadCell>Kontak</Table.HeadCell>
                                {(currentUser.role === 'admin' || currentUser.role === 'user') && (
                                    <>
                                        <Table.HeadCell>Delete</Table.HeadCell>
                                        <Table.HeadCell>Edit</Table.HeadCell>
                                    </>
                                )}
                            </Table.Head>
                            <Table.Body>
                                {supplierData.map((supplier) => (
                                    <Table.Row
                                        key={supplier.id}
                                        className="bg-white dark:border-gray-700 dark:bg-gray-800 divide-y"
                                    >
                                        <Table.Cell>
                                            {new Date(supplier.updatedAt).toLocaleDateString()}
                                            {console.og}
                                        </Table.Cell>
                                        <Table.Cell>{supplier.nama_pemasok}</Table.Cell>
                                        <Table.Cell>{supplier.alamat}</Table.Cell>
                                        <Table.Cell>{supplier.kontak}</Table.Cell>
                                        {(currentUser.role === 'admin' || currentUser.role === 'user') && (
                                            <>
                                                <Table.Cell>
                                                    <span
                                                        className="font-medium text-red-500 hover:underline cursor-pointer"
                                                        onClick={() => handleDeleteSupplier(supplier.id)}
                                                    >
                                                        Delete
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span
                                                        className="font-medium text-teal-500 hover:underline cursor-pointer"
                                                        onClick={() => handleEditSupplier(supplier.id)}
                                                    >
                                                        Edit
                                                    </span>
                                                </Table.Cell>
                                            </>
                                        )}
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </>
                ) : (
                    <p>You have no supplier yet!</p>
                )}

                <ModalAddSupplier onSetShowModal={setShowModal} onShowModal={showModal} />
                <ModalEditSupplier
                    onSetShowModal={setShowModalEdit}
                    onShowModal={showModalEdit}
                    supplierId={selectedSupplierId}
                />
                <ModalDeleteSupplier
                    onSetShowModal={setShowModalDelete}
                    onShowModal={showModalDelete}
                    supplierId={selectedSupplierId}
                />
            </div>
        </div>
    );
}
