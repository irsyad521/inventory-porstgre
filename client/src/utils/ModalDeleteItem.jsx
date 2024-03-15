import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Button, Modal } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItemsSuccess } from '../redux/item/itemSlice';

export default function ModalDeleteItem({ onSetShowModal, onShowModal, itemId }) {
    const dispatch = useDispatch();
    const itemData = useSelector((state) => state.item.items);
    const handleDeleteSubmitSupplier = async (itemId) => {
        try {
            const res = await fetch(`/api/items/delete/${itemId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                onSetShowModal(false);
                dispatch(fetchItemsSuccess(itemData.filter((item) => item.id !== itemId)));
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
                        Are you sure you want to delete this item?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="failure" onClick={() => handleDeleteSubmitSupplier(itemId)}>
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
