import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';

export default function SignIn() {
    const [formData, setFormData] = useState({});
    const { loading, error: errorMessage } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            return dispatch(signInFailure('Please fill all the fields'));
        }
        try {
            dispatch(signInStart());
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success === false) {
                dispatch(signInFailure(data.message));
            }

            if (res.ok) {
                dispatch(signInSuccess(data));
                navigate('/dashboard');
            }
        } catch (error) {
            dispatch(signInFailure(error.message));
        }
    };
    return (
        <div className="min-h-screen mt-20">
            <div className=" p-3 max-w-xl mx-auto ">
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <Label value="Username" />
                        <TextInput type="text" placeholder="Username" id="username" onChange={handleChange} />
                    </div>

                    <div>
                        <Label value="Password" />
                        <TextInput type="password" placeholder="Password" id="password" onChange={handleChange} />
                    </div>
                    <Button gradientDuoTone="purpleToBlue" type="submit" disabled={loading} className="mt-5">
                        {loading ? (
                            <>
                                <Spinner size="sm" />
                                <span className="pl-3">Loading...</span>
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>
                {errorMessage && (
                    <Alert className="mt-5" color="failure">
                        {errorMessage}
                    </Alert>
                )}
            </div>
        </div>
    );
}
