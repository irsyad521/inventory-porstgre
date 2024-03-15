import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Alert, Button, Modal } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserSuccess } from '../redux/user/userDataSlice';
import { useState } from 'react';
import { fetchChangeRole } from '../redux/user/userSlice';

export default function ModalDeleteUser({ onSetShowModal, onShowModal, userId }) {
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [publishError, setPublishError] = useState(null);
    const { userdata } = useSelector((state) => state.userdata);
    const handleDeleteSubmitSupplier = async (userId) => {
        try {
            const res = await fetch(`/api/user/deleteUser/${userId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok) {
                onSetShowModal(false);
                dispatch(fetchUserSuccess(userdata.filter((user) => user._id !== userId)));
                currentUser._id === userId ? dispatch(fetchChangeRole()) : null;
            }
            if (!res.ok) {
                setPublishError(data.message);
                return;
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
                        Are you sure you want to delete this User?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="failure" onClick={() => handleDeleteSubmitSupplier(userId)}>
                            Yes, I am sure
                        </Button>
                        <Button color="gray" onClick={() => onSetShowModal(false)}>
                            No, cancel
                        </Button>
                    </div>
                    {publishError && (
                        <Alert className="mt-5" color="failure">
                            {publishError}
                        </Alert>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
}
