import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Button, Modal } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliersSuccess } from '../redux/supplier/supplierSlice';

export default function ModalDeleteSupplier({ onSetShowModal, onShowModal, supplierId }) {
    const dispatch = useDispatch();
    const supplierData = useSelector((state) => state.supplier.suppliers);
    const handleDeleteSubmitSupplier = async (supplierId) => {
        try {
            const res = await fetch(`/api/supplier/delete/${supplierId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                onSetShowModal(false);
                dispatch(fetchSuppliersSuccess(supplierData.filter((supplier) => supplier.id !== supplierId)));
            }
        } catch (error) {
            console.log(error.message);
        }
    };
    return (
        <Modal show={onShowModal} onClose={() => onSetShowModal(false)} size="md">
            <Modal.Header />
            <Modal.Body>
                <div className="text-center">
                    <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
                    <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this supplier?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="failure" onClick={() => handleDeleteSubmitSupplier(supplierId)}>
                            Yes, I am sure
                        </Button>
                        <Button color="gray" onClick={() => onSetShowModal(false)}>
                            No, cancel
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}
