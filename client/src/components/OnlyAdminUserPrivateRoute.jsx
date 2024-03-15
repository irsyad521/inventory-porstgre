import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function OnlyAdminUserPrivateRoute() {
    const { currentUser } = useSelector((state) => state.user);
    return currentUser && (currentUser.role === 'admin' || currentUser.role === 'user') ? (
        <Outlet />
    ) : (
        <Navigate to="/dashboard?tab=dash" />
    );
}
