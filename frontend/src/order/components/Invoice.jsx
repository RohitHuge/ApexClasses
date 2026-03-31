import React from 'react';
import { Download, Printer, X } from 'lucide-react';

const Invoice = ({ order, user, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-8 md:p-12 selection:bg-gray-100">
            <div id="invoice-content">
                <div className="flex justify-between items-start mb-12">
                     <div>
                         <h1 className="text-4xl font-black text-indigo-600">INVOICE</h1>
                         <p className="text-gray-500 mt-2">Order ID: #{order.id.slice(0, 8)}</p>
                     </div>
                     <div className="text-right">
                         <h2 className="text-xl font-bold text-gray-900">Apex Classes</h2>
                         <p className="text-sm text-gray-500">Express Learning Center</p>
                         <p className="text-sm text-gray-500">Pune, Maharashtra</p>
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Bill To</p>
                        <h3 className="font-bold text-gray-900 text-lg">{user?.name}</h3>
                        <p className="text-gray-600">{user?.email}</p>
                        <p className="text-gray-600">{order.metadata?.phone}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Invoice Details</p>
                        <p className="text-gray-900 font-bold">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        <p className="text-gray-900 font-bold">Payment: {order.status}</p>
                        <p className="text-gray-900 font-bold">Mode: {order.mode}</p>
                    </div>
                </div>

                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="py-3 text-left font-black uppercase tracking-widest text-xs">Description</th>
                            <th className="py-3 text-center font-black uppercase tracking-widest text-xs">Qty</th>
                            <th className="py-3 text-right font-black uppercase tracking-widest text-xs">Price</th>
                            <th className="py-3 text-right font-black uppercase tracking-widest text-xs">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-6">
                                <p className="font-bold text-gray-900 capitalize">{order.product_type} - Service</p>
                                <p className="text-sm text-gray-500 mt-1">{order.mode} delivery mode</p>
                            </td>
                            <td className="py-6 text-center font-bold">1</td>
                            <td className="py-6 text-right font-bold">₹{order.amount}</td>
                            <td className="py-6 text-right font-bold text-indigo-600">₹{order.amount}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex justify-end mb-12">
                    <div className="w-72 space-y-3">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>₹{order.amount}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 pb-3 border-b border-gray-100">
                            <span>Tax (0%)</span>
                            <span>₹0.00</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-gray-900">
                            <span>Total</span>
                            <span>₹{order.amount}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-400">Thank you for choosing Apex Classes. This is a computer generated invoice.</p>
                </div>
            </div>

            <div className="mt-12 flex gap-4 justify-center print:hidden">
                <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
                    <Printer size={20} /> Print Invoice
                </button>
                <button className="flex items-center gap-2 px-8 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">
                    <Download size={20} /> Download PDF
                </button>
                <button onClick={onClose} className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">
                    Close
                </button>
            </div>
        </div>
    );
};

export default Invoice;
