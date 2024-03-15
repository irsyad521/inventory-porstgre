import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import Itempost from './pages/Itempost';
import Itemedit from './pages/Itemedit';
import SignIn from './pages/SignIn';
import PrivateRoute from './components/PrivateRoute';
import OnlyAdminUserPrivateRoute from './components/OnlyAdminUserPrivateRoute';
import Itemdetail from './pages/Itemdetail';
export default function App() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />}></Route>
                    <Route path="/item/:itemslug" element={<Itemdetail />}></Route>
                    <Route element={<OnlyAdminUserPrivateRoute />}>
                        <Route path="/item/add" element={<Itempost />}></Route>
                        <Route path="/item/edit/:itemId" element={<Itemedit />}></Route>
                    </Route>
                </Route>
                <Route path="/" element={<SignIn />}></Route>
                {/*  <Route path="/sign-up" element={<SignUp />}></Route>*/}
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}
