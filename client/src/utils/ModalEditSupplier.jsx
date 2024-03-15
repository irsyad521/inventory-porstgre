import { useEffect, useState } from 'react';
import { Button, Modal, TextInput, Alert } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliersSuccess } from '../redux/supplier/supplierSlice';

export default function ModalEditSupplier({ onSetShowModal, onShowModal, supplierId }) {
    const supplierData = useSelector((state) => state.supplier.suppliers);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);

    useEffect(() => {
        const selectedSupplier = supplierData.find((supplier) => supplier.id === supplierId);

        if (selectedSupplier) {
            setFormData(selectedSupplier);
        }
    }, [supplierData, supplierId]);

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/supplier/update/${supplierId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                setPublishError(data.message);
                return;
            }
            if (res.ok) {
                console.log(data);
                onSetShowModal(false);
                const updatedSuppliers = supplierData.map((supplier) => {
                    if (supplier.id === supplierId) {
                        return data;
                    } else {
                        return supplier;
                    }
                });
                dispatch(fetchSuppliersSuccess(updatedSuppliers));
                setFormData({});
                setPublishError(null);
            }
        } catch (error) {
            setPublishError('Something went wrong');
        }
    };

    return (
        <Modal show={onShowModal} onClose={() => onSetShowModal(false)} size="md">
            <Modal.Header />
            <Modal.Body>
                <div className="text-center flex flex-col gap-4">
                    <h1 className="my-7 text-center font-semibold text-3xl">Edit Suplier</h1>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmitEdit}>
                        <TextInput
                            type="text"
                            id="nama_pemasok"
                            placeholder="Nama Pemasok"
                            onChange={(e) => setFormData({ ...formData, nama_pemasok: e.target.value })}
                            value={formData.nama_pemasok}
                        />
                        <TextInput
                            type="text"
                            id="alamat"
                            placeholder="Alamat"
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                            value={formData.alamat}
                        />
                        <TextInput
                            type="text"
                            id="kontak"
                            placeholder="kontak"
                            onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                            value={formData.kontak}
                        />
                        <div className="flex justify-center gap-4">
                            <Button gradientDuoTone="purpleToPink" type="submit">
                                Edit
                            </Button>
                            <Button color="gray" onClick={() => onSetShowModal(false)}>
                                Cancel
                            </Button>
                        </div>
                        {publishError && (
                            <Alert className="mt-5" color="failure">
                                {publishError}
                            </Alert>
                        )}
                    </form>
                </div>
            </Modal.Body>
        </Modal>
    );
}
