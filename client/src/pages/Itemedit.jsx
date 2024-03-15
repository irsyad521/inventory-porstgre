import { useEffect, useState } from 'react';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchItemsSuccess } from '../redux/item/itemSlice.js';

export default function Itemedit() {
    const { itemId } = useParams();

    const supplierData = useSelector((state) => state.supplier.suppliers);
    const itemData = useSelector((state) => state.item.items);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [selectedSupplierName, setSelectedSupplierName] = useState('');
    const [file, setFile] = useState(null);
    const [imageUploadProgress, setImageUploadProgress] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const selectedItem = itemData.find((item) => item.id === itemId);

        if (selectedItem) {
            setFormData(selectedItem);
            const { pemasok } = selectedItem;
            setSelectedSupplierName(pemasok.nama_pemasok);
        }
    }, [itemData, itemId]);

    const supplierOptions = supplierData.map((supplier) => (
        <option key={supplier.id} value={supplier.id}>
            {supplier.nama_pemasok}
        </option>
    ));

    const handleUpdloadImage = async () => {
        try {
            if (!file) {
                setImageUploadError('Please select an image');
                return;
            }
            setImageUploadError(null);
            const storage = getStorage(app);
            const fileName = new Date().getTime() + '-' + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setImageUploadProgress(progress.toFixed(0));
                },
                (error) => {
                    setImageUploadError('Image upload failed');
                    setImageUploadProgress(null);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setImageUploadProgress(null);
                        setImageUploadError(null);
                        setFormData({ ...formData, gambar_barang: downloadURL });
                    });
                },
            );
        } catch (error) {
            setImageUploadError('Image upload failed');
            setImageUploadProgress(null);
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/items/update/${itemId}`, {
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
                const updateItem = itemData.map((supplier) => {
                    if (supplier.id === formData.id) {
                        return data;
                    } else {
                        return supplier;
                    }
                });
                dispatch(fetchItemsSuccess(updateItem));

                setFormData({});
                setPublishError(null);
                navigate('/dashboard?tab=item');
            }
        } catch (error) {
            setPublishError('Something went wrong');
        }
    };

    return (
        <div className="p-3 max-w-3xl mx-auto min-h-screen">
            <h1 className="text-center text-3xl my-7 font-semibold">Create New Item</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 sm:flex-row justify-between">
                    <TextInput
                        type="text"
                        placeholder="Nama Barang"
                        required
                        id="nama_barang"
                        className="flex-1"
                        value={formData.nama_barang}
                        onChange={(e) => {
                            setFormData({ ...formData, nama_barang: e.target.value });
                        }}
                    />
                    <TextInput
                        type="text"
                        placeholder="Harga Barang"
                        required
                        id="harga"
                        className="flex-1"
                        value={formData.harga}
                        onChange={(e) => {
                            setFormData({ ...formData, harga: e.target.value });
                        }}
                    />
                    <Select
                        value={selectedSupplier}
                        onChange={(e) => {
                            setSelectedSupplier(e.target.value);
                            setFormData({ ...formData, pemasokId: e.target.value });
                        }}
                    >
                        <option value={selectedSupplierName}>{selectedSupplierName}</option>
                        {supplierOptions}
                    </Select>
                </div>
                <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
                    <FileInput type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                    <Button
                        type="button"
                        gradientDuoTone="purpleToBlue"
                        size="sm"
                        outline
                        onClick={handleUpdloadImage}
                        disabled={imageUploadProgress}
                    >
                        {imageUploadProgress ? (
                            <div className="w-16 h-16">
                                <CircularProgressbar
                                    value={imageUploadProgress}
                                    text={`${imageUploadProgress || 0}%`}
                                />
                            </div>
                        ) : (
                            'Upload Image'
                        )}
                    </Button>
                </div>
                {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
                {formData.gambar_barang && (
                    <img src={formData.gambar_barang} alt="upload" className="w-full h-72 object-cover" />
                )}
                <ReactQuill
                    theme="snow"
                    placeholder="Tulis Deskripsi"
                    className="h-72 mb-12"
                    required
                    value={formData.deskripsi}
                    onChange={(value) => {
                        setFormData({ ...formData, deskripsi: value });
                    }}
                />
                <Button type="submit" gradientDuoTone="purpleToBlue">
                    Publish
                </Button>
                <Button type="button" gradientDuoTone="redToYellow" onClick={() => navigate('/dashboard?tab=item')}>
                    Cancel
                </Button>
                {publishError && (
                    <Alert className="mt-5" color="failure">
                        {publishError}
                    </Alert>
                )}
            </form>
        </div>
    );
}
