import { Button, Navbar, Dropdown, Avatar } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { HiUser } from 'react-icons/hi';
export default function Header() {
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.theme);
    const { currentUser } = useSelector((state) => state.user);
    const handleSignout = async () => {
        try {
            const res = await fetch('/api/auth/signout', {
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok) {
                console.log(data.message);
            } else {
                dispatch(signoutSuccess());
            }
        } catch (error) {
            console.log(error.message);
        }
    };
    return (
        <Navbar className="border-b-2">
            <Link to="/" className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white">
                <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 rounded-lg text-white">
                    Inventory
                </span>
                App
            </Link>

            <div className="flex gap-5 md:order-2">
                <Button className="w-12 h-10  sm:inline" color="gray" pill onClick={() => dispatch(toggleTheme())}>
                    {theme === 'light' ? <FaSun /> : <FaMoon />}
                </Button>
                {currentUser && (
                    <Dropdown arrowIcon={false} inline label={<Avatar alt="user" img={HiUser} rounded />}>
                        <Dropdown.Header>
                            <span className="block text-sm px-4 py-2 rounded-3xl">{currentUser.username}</span>
                        </Dropdown.Header>

                        <Dropdown.Item>
                            <Link to={'/dashboard?tab=dash'}>
                                <span className="block text-sm px-4 py-2 rounded-3xl">Dashboard</span>
                            </Link>
                        </Dropdown.Item>

                        <Dropdown.Item onClick={handleSignout}>
                            <span className="block text-sm px-4 py-2 rounded-3xl">Sign Out</span>
                        </Dropdown.Item>
                    </Dropdown>
                )}
            </div>
        </Navbar>
    );
}
