import { Sidebar } from 'flowbite-react';
import { HiArchive, HiChartPie, HiTruck, HiUser } from 'react-icons/hi';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AiOutlineStock } from 'react-icons/ai';
import { useSelector } from 'react-redux';

export default function DashSidebar() {
    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();
    const [tab, setTab] = useState('');
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabFromUrl = urlParams.get('tab');
        if (tabFromUrl) {
            setTab(tabFromUrl);
        }
    }, [location.search]);
    return (
        <Sidebar className="w-full md:w-56">
            <Sidebar.Items>
                <Sidebar.ItemGroup>
                    <Link to="/dashboard?tab=dash">
                        <Sidebar.Item
                            active={tab === 'dash'}
                            icon={HiChartPie}
                            labelColor="dark"
                            as="div"
                            label={
                                currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'user' ? 'User' : 'Guest'
                            }
                        >
                            Dashboard
                        </Sidebar.Item>
                    </Link>

                    {currentUser.isAdmin && currentUser.role === 'admin' && (
                        <Link to="/dashboard?tab=user">
                            <Sidebar.Item active={tab === 'user'} icon={HiUser} labelColor="dark" as="div">
                                User
                            </Sidebar.Item>
                        </Link>
                    )}

                    <Link to="/dashboard?tab=supplier">
                        <Sidebar.Item active={tab === 'supplier'} icon={HiTruck} labelColor="dark" as="div">
                            Supplier
                        </Sidebar.Item>
                    </Link>

                    <Link to="/dashboard?tab=item">
                        <Sidebar.Item active={tab === 'item'} icon={HiArchive} labelColor="dark" as="div">
                            Items
                        </Sidebar.Item>
                    </Link>
                    {(currentUser.role === 'user' || currentUser.role === 'admin') && (
                        <Link to="/dashboard?tab=stock">
                            <Sidebar.Item active={tab === 'stock'} icon={AiOutlineStock} labelColor="dark" as="div">
                                Stock
                            </Sidebar.Item>
                        </Link>
                    )}
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    );
}
