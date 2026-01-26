import React, { useState } from 'react';
import { Sidebar } from '@shared/components';
import {
    Search, Filter, RefreshCw, Layers,
    MapPin, Archive, Activity, AlertCircle, Clock, CheckCircle,
    BarChart3
} from 'lucide-react';
import { ProcessingTable, Processor } from '../components/ProcessingTable';
import { ProcessingModal } from '../components/ProcessingModal';
import { ViewProcessingModal } from '../components/ViewProcessingModal';
import { DeleteProcessingModal } from '../components/DeleteProcessingModal';
import { Toast } from '../components/Toast';
import { FileText, PieChart, Plus } from 'lucide-react';

// Mock Data
const MOCK_DATA: Processor[] = [
    {
        id: '1',
        name: 'GreenCycle Ltd',
        wasteTypes: ['recycle', 'hazardous', 'bulky'],
        capacity: 1200,
        currentLoad: 800,
        serviceArea: ['Quận 5', 'Quận 6', 'Quận 8'],
        status: 'ACTIVE'
    },
    {
        id: '2',
        name: 'EcoRecycle Co.',
        wasteTypes: ['organic', 'recycle'],
        capacity: 2000,
        currentLoad: 1500,
        serviceArea: ['Quận 1', 'Bình Tân'],
        status: 'PENDING'
    },
    {
        id: '3',
        name: 'RenewEco Solutions',
        wasteTypes: ['electronic'],
        capacity: 310,
        currentLoad: 300,
        serviceArea: ['Quận 2'],
        status: 'OVERLOADED'
    },
    {
        id: '4',
        name: 'BioWaste Innovators',
        wasteTypes: ['organic', 'bulky'],
        capacity: 4000,
        currentLoad: 2000,
        serviceArea: ['Nhà Bè', 'Quận 7'],
        status: 'ACTIVE'
    },
    {
        id: '5',
        name: 'MetalMaster Corp',
        wasteTypes: ['recycle', 'electronic'],
        capacity: 800,
        currentLoad: 500,
        serviceArea: ['Thủ Đức', 'Quận 9'],
        status: 'ACTIVE'
    }
];

export const ProcessingCapacityPage: React.FC = () => {
    const [data, setData] = useState<Processor[]>(MOCK_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Processor | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Processor | null>(null);

    // Filter States
    const [filterRegion, setFilterRegion] = useState('');
    const [filterWasteType, setFilterWasteType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Filtering Logic
    const filteredData = data.filter(item => {
        const matchRegion = filterRegion ? item.serviceArea.some(area => area.includes(filterRegion)) : true;
        const matchWasteType = filterWasteType ? item.wasteTypes.includes(filterWasteType as any) : true;
        const matchStatus = filterStatus ? item.status === filterStatus : true;
        const matchSearch = searchTerm
            ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.includes(searchTerm)
            : true;
        return matchRegion && matchWasteType && matchStatus && matchSearch;
    });

    const handleSaveBusiness = (newData: Omit<Processor, 'id' | 'currentLoad'>) => {
        if (selectedItem) {
            // Update existing
            setData(data.map(item =>
                item.id === selectedItem.id
                    ? { ...item, ...newData }
                    : item
            ));
            setToastMessage('Cập nhật doanh nghiệp thành công!');
        } else {
            // Add new
            const business: Processor = {
                id: Math.random().toString(36).substr(2, 9),
                currentLoad: 0,
                ...newData
            };
            setData([business, ...data]);
            setToastMessage('Thêm mới doanh nghiệp thành công!');
        }
        setSelectedItem(null);
        setShowToast(true);
    };

    const handleDelete = (id: string) => {
        const item = data.find(i => i.id === id);
        if (item) {
            setItemToDelete(item);
            setIsDeleteModalOpen(true);
        }
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            setData(data.filter(item => item.id !== itemToDelete.id));
            setItemToDelete(null);
            setIsDeleteModalOpen(false);
            setToastMessage('Đã xóa doanh nghiệp thành công!');
            setShowToast(true);
        }
    };

    const handleEdit = (item: Processor) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleView = (item: Processor) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const handleOpenCreate = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleResetFilters = () => {
        setFilterRegion('');
        setFilterWasteType('');
        setFilterStatus('');
        setSearchTerm('');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 py-4 px-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Quản lý Năng lực Xử lý</h1>
                        <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý năng lực các doanh nghiệp tái chế</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* User profile dropdown placeholder */}
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-gray-900">Admin</div>
                            <div className="text-xs text-gray-500">Quản trị viên</div>
                        </div>
                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold border-2 border-white shadow-sm">
                            A
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-[1600px] mx-auto space-y-6">

                        {/* Stats Cards - Keeping data.length to show totals relative to ALL data, or filtered? Usually total is ALL data. */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-blue-500 text-white p-5 rounded-xl shadow-lg shadow-blue-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-blue-100 font-medium text-sm">Tổng doanh nghiệp</p>
                                        <h3 className="text-3xl font-bold mt-1">{data.length}</h3>
                                    </div>
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Layers size={22} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-500 text-white p-5 rounded-xl shadow-lg shadow-green-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-green-100 font-medium text-sm">Đang hoạt động</p>
                                        <h3 className="text-3xl font-bold mt-1">{data.filter(i => i.status === 'ACTIVE').length}</h3>
                                    </div>
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <CheckCircle size={22} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-400 text-white p-5 rounded-xl shadow-lg shadow-amber-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-amber-50 font-medium text-sm">Chờ phê duyệt</p>
                                        <h3 className="text-3xl font-bold mt-1">{data.filter(i => i.status === 'PENDING').length}</h3>
                                    </div>
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Clock size={22} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-500 text-white p-5 rounded-xl shadow-lg shadow-red-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-red-100 font-medium text-sm">Quá tải</p>
                                        <h3 className="text-3xl font-bold mt-1">{data.filter(i => i.status === 'OVERLOADED').length}</h3>
                                    </div>
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <AlertCircle size={22} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters & Actions */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    {/* Region Filter - Simplified for Mock using Text Input logic on ServiceArea or just hardcoded options matching mock data */}
                                    <select
                                        value={filterRegion}
                                        onChange={(e) => setFilterRegion(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-w-[160px]"
                                    >
                                        <option value="">Tất cả khu vực</option>
                                        <option value="Quận 1">Quận 1</option>
                                        <option value="Quận 2">Quận 2</option>
                                        <option value="Quận 5">Quận 5</option>
                                        <option value="Quận 7">Quận 7</option>
                                        <option value="Thủ Đức">Thủ Đức</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>

                                <div className="relative">
                                    <select
                                        value={filterWasteType}
                                        onChange={(e) => setFilterWasteType(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-w-[160px]"
                                    >
                                        <option value="">Tất cả loại rác</option>
                                        <option value="organic">Rác hữu cơ</option>
                                        <option value="recycle">Rác tái chế</option>
                                        <option value="hazardous">Rác nguy hại</option>
                                        <option value="bulky">Rác cồng kềnh</option>
                                        <option value="electronic">Rác điện tử</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>

                                <div className="relative">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-w-[160px]"
                                    >
                                        <option value="">Tất cả trạng thái</option>
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="PENDING">Chờ phê duyệt</option>
                                        <option value="OVERLOADED">Quá tải</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 lg:flex-none lg:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Tìm doanh nghiệp..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleResetFilters}
                                    title="Đặt lại bộ lọc"
                                    className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white transition-colors"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 shadow-brand-sm transition-all">
                                    <Filter size={18} /> Lọc
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <ProcessingTable
                                data={filteredData}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                            {/* Footer Actions & Pagination */}
                            <div className="px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={handleOpenCreate}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-sm"
                                    >
                                        <Plus size={18} /> Thêm doanh nghiệp
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                                        <FileText size={18} /> Báo cáo năng lực
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                                        <PieChart size={18} /> Thống kê tổng hợp
                                    </button>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500 hidden lg:inline">Hiển thị trang 1 / 4</span>
                                    <div className="flex items-center gap-1">
                                        <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">Trước</button>
                                        <button className="w-8 h-8 flex items-center justify-center bg-brand-600 text-white rounded text-sm font-medium">1</button>
                                        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm">2</button>
                                        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm">3</button>
                                        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded text-sm">4</button>
                                        <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded">Sau</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <ProcessingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveBusiness}
                initialData={selectedItem}
            />

            <ViewProcessingModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                data={selectedItem}
                onEdit={() => { setIsViewModalOpen(false); handleEdit(selectedItem!); }}
                onDelete={() => { setIsViewModalOpen(false); handleDelete(selectedItem!.id); }}
            />

            <DeleteProcessingModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                businessName={itemToDelete?.name || ''}
            />

            <Toast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
};

// Helper for Dropdown Arrow
const ChevronDown = ({ size, className }: { size: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
);
