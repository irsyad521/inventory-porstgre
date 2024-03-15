import { useState, useEffect } from 'react';
import { Button, Table } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import ModalAddUser from '../utils/ModalAddUser';
import { fetchUserSuccess, fetchUsers } from '../redux/user/userDataSlice';
import { FaCheck, FaTimes } from 'react-icons/fa';
import ModalEditUser from '../utils/ModalEditUser';
import ModalDeleteUser from '../utils/ModalDeleteUser';

export default function DashUser() {
    const { userdata } = useSelector((state) => state.userdata);
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showMore, setShowMore] = useState(true);

    useEffect(() => {
        dispatch(fetchUsers());
    }, []);

    const handleDeleteSupplier = async (id) => {
        setSelectedUserId(id);
        setShowModalDelete(true);
    };

    const handleDeleteUser = async (id) => {
        setSelectedUserId(id);
        setShowModalEdit(true);
    };
    const handleShowMore = async () => {
        const startIndex = userdata.length;
        try {
            const res = await fetch(`/api/user/getUsers?startIndex=${startIndex}`);
            const data = await res.json();

            if (res.ok) {
                const newData = [...userdata, ...data.users];

                dispatch(fetchUserSuccess(newData));
                if (data.users.length < 9) {
                    setShowMore(false);
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div className="w-full overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-50">
            <div className="w-full flex justify-between px-4 py-6">
                <Button gradientDuoTone="purpleToPink" type="button" onClick={() => setShowModal(true)}>
                    Add User
                </Button>
                <Button gradientDuoTone="purpleToBlue" outline>
                    Cetak Data
                </Button>
            </div>
            <div className="table-auto ">
                {userdata.length > 0 ? (
                    <>
                        <Table hoverable className="shadow-md">
                            <Table.Head>
                                <Table.HeadCell>Date updated</Table.HeadCell>
                                <Table.HeadCell>Username</Table.HeadCell>
                                <Table.HeadCell>Role</Table.HeadCell>
                                <Table.HeadCell>Admin</Table.HeadCell>
                                <Table.HeadCell>Delete</Table.HeadCell>
                                <Table.HeadCell>Edit</Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {userdata.map((user) => (
                                    <Table.Row
                                        key={user._id}
                                        className="bg-white dark:border-gray-700 dark:bg-gray-800 divide-y"
                                    >
                                        <Table.Cell>{new Date(user.updatedAt).toLocaleDateString()}</Table.Cell>
                                        <Table.Cell>{user.username}</Table.Cell>
                                        <Table.Cell>{user.role}</Table.Cell>
                                        <Table.Cell>
                                            {user.isAdmin ? (
                                                <FaCheck className="text-green-500" />
                                            ) : (
                                                <FaTimes className="text-red-500" />
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span
                                                className="font-medium text-red-500 hover:underline cursor-pointer"
                                                onClick={() => handleDeleteSupplier(user._id)}
                                            >
                                                Delete
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span
                                                className="font-medium text-teal-500 hover:underline cursor-pointer"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                Edit
                                            </span>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                        {showMore && (
                            <button onClick={handleShowMore} className="w-full text-teal-500 self-center text-sm py-7">
                                Show more
                            </button>
                        )}
                    </>
                ) : (
                    <p>You have no supplier yet!</p>
                )}
                <ModalAddUser onSetShowModal={setShowModal} onShowModal={showModal} />
                <ModalEditUser onSetShowModal={setShowModalEdit} onShowModal={showModalEdit} userId={selectedUserId} />
                <ModalDeleteUser
                    onSetShowModal={setShowModalDelete}
                    onShowModal={showModalDelete}
                    userId={selectedUserId}
                />
            </div>
        </div>
    );
}
