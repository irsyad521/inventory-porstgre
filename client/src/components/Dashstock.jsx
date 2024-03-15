import { Button, Select, TextInput, Label, Datepicker, Alert } from 'flowbite-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function DashStock() {
    const itemData = useSelector((state) => state.item.items);
    const defaultIdBarang = itemData.length > 0 ? itemData[0].id : '';
    const [publishError, setPublishError] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id_barang: defaultIdBarang,
        jenis: 'masuk',
        tanggal: new Date(),
    });

    const ItemDataOptions = itemData.map((item) => (
        <option
            key={item.id}
            value={item.id}
            className={`${item.pemasok === null ? 'text-red-500 font-bold' : ''}`}
            disabled={item.pemasok === null}
        >
            {item.pemasok === null ? `${item.nama_barang} (Tanpa Pemasok)` : item.nama_barang}
        </option>
    ));

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/stock-transactions/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    jumlah: parseInt(formData.jumlah),
                    tanggal: formatDate(formData.tanggal),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPublishError(data.message);
                return;
            }

            if (res.ok) {
                setFormData({});
                setPublishError(null);
                navigate('/dashboard?tab=item');
            }
        } catch (error) {
            setPublishError('Something went wrong');
        }
    };
    return (
        <div className="max-w-lg mx-auto p-3 w-full">
            <h1 className="my-7 text-center font-semibold text-3xl">Stock Update</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="mb-2 block">
                    <Label htmlFor="nama_barang" value="Item" className="text-xl" />
                </div>

                <Select
                    id="nama_barang"
                    required
                    value={formData.id_barang}
                    onChange={(e) => {
                        setFormData({ ...formData, id_barang: e.target.value });
                    }}
                >
                    {ItemDataOptions}
                </Select>

                <div className="mb-2 block">
                    <Label htmlFor="jenis" value="Tipe transaction" className="text-xl" />
                </div>

                <Select
                    id="jenis"
                    required
                    defaultValue={'masuk'}
                    onChange={(e) => {
                        setFormData({ ...formData, jenis: e.target.value });
                    }}
                >
                    <option value="masuk">Masuk</option>
                    <option value="keluar">Keluar</option>
                </Select>

                <div className="mb-2 block">
                    <Label htmlFor="Jumlah" value="Jumlah Barang" className="text-xl" />
                </div>

                <TextInput
                    type="text"
                    id="jumlah"
                    placeholder="jumlah"
                    required
                    onChange={(e) => {
                        setFormData({ ...formData, jumlah: e.target.value });
                    }}
                />
                <div className="mb-2 block">
                    <Label htmlFor="tanggal" value="Tanggal" className="text-xl" />
                </div>
                <Datepicker
                    id="tanggal"
                    required
                    onSelectedDateChanged={(date) => setFormData({ ...formData, tanggal: date })}
                />
                <Button type="submit" gradientDuoTone="purpleToBlue" outline>
                    Update
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
