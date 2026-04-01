import React, { useState, useEffect } from 'react';
import { orderService } from '../orderService';
import { Check, Truck, Home, Package, Loader2 } from 'lucide-react';

const OrderTracking = ({ orderId }) => {
    const [tracking, setTracking] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracking = async () => {
            const res = await orderService.getOrderTracking(orderId);
            if (res.success) {
                setTracking(res.tracking);
            }
            setLoading(false);
        };
        fetchTracking();
    }, [orderId]);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;

    const stages = [
        { status: 'ORDER_PLACED', label: 'Order Placed', icon: Package },
        { status: 'SHIPPED', label: 'Shipped', icon: Truck },
        { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
        { status: 'DELIVERED', label: 'Delivered', icon: Home },
    ];

    // Current status is the first item in the tracking list since it's sorted by time DESC
    const currentStatus = tracking[0]?.status || 'ORDER_PLACED';
    const currentStageIndex = stages.findIndex(s => s.status === currentStatus);

    return (
        <div className="relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-4">
                {stages.map((stage, index) => {
                    const isCompleted = index <= currentStageIndex;
                    const isActive = index === currentStageIndex;
                    const StageIcon = stage.icon;

                    return (
                        <div key={stage.status} className="flex-1 flex flex-row md:flex-col items-center gap-4 md:text-center group relative w-full">
                            {/* Connector Line */}
                            {index < stages.length - 1 && (
                                <div className={`hidden md:block absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-5 h-1 rounded-full transition-all duration-1000 ${index < currentStageIndex ? 'bg-green-500' : 'bg-gray-100'}`} />
                            )}

                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-300'}`}>
                                {isCompleted ? <Check size={18} /> : <StageIcon size={18} />}
                            </div>

                            <div className="space-y-1">
                                <p className={`font-bold text-sm tracking-tight transition-all ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>{stage.label}</p>
                                {isActive && (
                                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest animate-pulse">In Progress</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Timeline */}
            <div className="mt-12 space-y-6">
                 {tracking.map((item, i) => (
                     <div key={i} className="flex gap-4 items-start">
                         <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0 shadow-lg shadow-indigo-100" />
                         <div>
                             <p className="font-bold text-gray-900 text-sm">{item.message}</p>
                             <p className="text-xs text-gray-400 font-medium">{new Date(item.timestamp).toLocaleString()}</p>
                         </div>
                     </div>
                 ))}
            </div>
        </div>
    );
};

export default OrderTracking;
