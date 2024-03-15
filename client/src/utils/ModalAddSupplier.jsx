import { useState } from 'react';
import { Button, Modal, TextInput, Alert } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliersSuccess } from '../redux/supplier/supplierSlice';

export default function ModalAddSupplier({ onSetShowModal, onShowModal }) {
    const supplierData = useSelector((state) => state.supplier.suppliers);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);
    const handleAddItems = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/supplier/add', {
                method: 'POST',
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
                onSetShowModal(false);
                dispatch(fetchSuppliersSuccess([...supplierData, data]));
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
                    <h1 className="my-7 text-center font-semibold text-3xl">Add Suplier</h1>
                    <form className="flex flex-col gap-4" onSubmit={handleAddItems}>
                        <TextInput
                            type="text"
                            id="nama_pemasok"
                            placeholder="Nama Pemasok"
                            onChange={(e) => setFormData({ ...formData, nama_pemasok: e.target.value })}
                        />
                        <TextInput
                            type="text"
                            id="alamat"
                            placeholder="Alamat"
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        />
                        <TextInput
                            type="text"
                            id="kontak"
                            placeholder="kontak"
                            onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                        />
                        <div className="flex justify-center gap-4">
                            <Button gradientDuoTone="purpleToPink" type="submit">
                                Create
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
