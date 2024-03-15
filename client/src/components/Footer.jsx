import { Footer } from 'flowbite-react';

export default function FooterCom() {
    return (
        <Footer container className="border border-t-8 border-purple-500">
            <div className="w-full max-w-7xl mx-auto">
                <div className="w-full mx-auto">
                    <Footer.Copyright href="#" by="PT Bejana Varia Globalindo" year={new Date().getFullYear()} />
                </div>
            </div>
        </Footer>
    );
}
