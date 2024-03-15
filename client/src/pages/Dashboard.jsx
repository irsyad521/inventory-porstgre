import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from '../components/DashSidebar';
import DashboardComp from '../components/DashboardComp';
import DashSupplier from '../components/DashSupplier';
import DashItem from '../components/DashItem';
import Dashstock from '../components/Dashstock';
import DashUser from '../components/DashUser';
import { useSelector } from 'react-redux';

export default function Dashboard() {
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
        <div className="min-h-screen flex  flex-col md:flex-row">
            <div className="md:w-56">
                <DashSidebar />
            </div>
            {tab === 'dash' && <DashboardComp />}

            {currentUser.isAdmin && currentUser.role === 'admin' && tab === 'user' && <DashUser />}

            {tab === 'supplier' && <DashSupplier />}

            {tab === 'item' && <DashItem />}

            {(currentUser.role === 'user' || currentUser.role === 'admin') && tab === 'stock' && <Dashstock />}
        </div>
    );
}
