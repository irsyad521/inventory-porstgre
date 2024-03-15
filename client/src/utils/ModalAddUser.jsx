import { useState } from 'react';
import { Button, Modal, TextInput, Alert, Select } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserSuccess } from '../redux/user/userDataSlice';

export default function ModalAddUser({ onSetShowModal, onShowModal }) {
    const { userdata } = useSelector((state) => state.userdata);
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        role: 'user',
    });
    const [publishError, setPublishError] = useState(null);

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user/createUser', {
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
                dispatch(fetchUserSuccess([data, ...userdata]));
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
                    <h1 className="my-7 text-center font-semibold text-3xl">Add User</h1>
                    <form className="flex flex-col gap-4" onSubmit={handleAddUser}>
                        <TextInput
                            type="text"
                            id="username"
                            placeholder="Username"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                            onChange={(e) => {
                                setFormData({ ...formData, role: e.target.value });
                            }}
                        >
                            <option value="user">User</option>
                            <option value="guest">Guest</option>
                        </Select>
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
