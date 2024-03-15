import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
    const [formData, setFormData] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            return setErrorMessage('Please fill out all fields.');
        }
        try {
            setLoading(true);
            setErrorMessage(null);
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success === false) {
                setLoading(false);
                return setErrorMessage(data.message);
            }
            setLoading(false);
            if (res.ok) {
                navigate('/');
            }
        } catch (error) {
            setErrorMessage(error.message);
            setLoading(false);
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
                            'Sign Up'
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
