import { useEffect, useState } from 'react';
import { Button, Modal, TextInput, Alert, Select } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserSuccess } from '../redux/user/userDataSlice';
import { fetchChangeRole } from '../redux/user/userSlice';

export default function ModalEditUser({ onSetShowModal, onShowModal, userId }) {
    const { currentUser } = useSelector((state) => state.user);

    const { userdata } = useSelector((state) => state.userdata);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);

    useEffect(() => {
        const selectedUser = userdata.find((user) => user._id === userId);

        if (selectedUser) {
            setFormData(selectedUser);
        }
    }, [userdata, userId]);

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/user/updateUser/${userId}`, {
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
                onSetShowModal(false);
                const updatedUser = userdata.map((user) => {
                    if (user._id === userId) {
                        return data;
                    } else {
                        return user;
                    }
                });
                dispatch(fetchUserSuccess(updatedUser));
                if (
                    (formData.role === 'user' || formData.role === 'guest') &&
                    currentUser.isAdmin &&
                    currentUser.role === 'admin'
                ) {
                    dispatch(fetchChangeRole());
                }
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
                    <h1 className="my-7 text-center font-semibold text-3xl">Edit User</h1>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmitEdit}>
                        <TextInput
                            type="text"
                            id="username"
                            placeholder="Username"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            value={formData.username}
                        />
                        <TextInput
                            type="password"
                            id="password"
                            placeholder="Password"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <Select
                            id="role"
                            required
                            value={formData.role}
                            onChange={(e) => {
                                setFormData({ ...formData, role: e.target.value });
                            }}
                        >
                            <option value="user">User</option>
                            <option value="guest">Guest</option>
                            <option value="admin">Admin</option>
                        </Select>
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
