import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ChatComponent from './ChatComponent';

const ClientDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [projectsData, setProjectsData] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [currentView, setCurrentView] = useState('projects');
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('ytech_token');
            const res = await fetch('http://localhost:3001/api/client/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setProjectsData(data || []);
            if (data && data.length > 0 && !activeProjectId) {
                setActiveProjectId(data[0].project.id);
            }
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) return <div className="p-10">Loading workspace...</div>;

    if (projectsData.length === 0) {
        return (
            <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-8">
                <div className="text-center bg-white p-12 rounded-2xl border border-gray-200 shadow-sm max-w-md print:hidden">
                    <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">inventory_2</span>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Projects</h2>
                    <p className="text-gray-500 mb-8">You haven't purchased a web package yet. Please return to the homepage to select a package and start your journey.</p>
                    <a href="/" className="bg-[#10B981] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#059669] transition-colors inline-block">Browse Packages</a>
                </div>
            </div>
        );
    }

    const activeData = projectsData.find(p => p.project.id === activeProjectId) || projectsData[0];
    const { project, invoice } = activeData;
    const currentPhase = project.current_phase; // 1 to 5

    const steps = [
        { id: 1, label: 'Payment Confirmed', icon: 'check' },
        { id: 2, label: 'Requirements Gathering', icon: 'assignment' },
        { id: 3, label: 'Design Phase', icon: 'palette' },
        { id: 4, label: 'Development', icon: 'code' },
        { id: 5, label: 'Deployment & Go-Live', icon: 'rocket_launch' }
    ];

    return (
        <div className="bg-[#f7f9fb] text-[#191c1e] font-sans min-h-screen flex">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-72 fixed h-full bg-white border-r border-[#c5c6cd] z-50 py-8 px-4 gap-2 print:hidden">
                <div className="mb-8 px-4 flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
                    <div className="w-8 h-8 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                        <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                    </div>
                    <span className="font-['Outfit'] text-2xl font-black text-gray-900 tracking-tight">YTECH<span className="text-[#10B981]">.</span></span>
                </div>
                <nav className="flex flex-col gap-2">
                    <div className="px-4 py-2 mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Your Projects</div>
                    {projectsData.map((p, index) => (
                        <a 
                            key={p.project.id}
                            onClick={() => { setActiveProjectId(p.project.id); setCurrentView('projects'); }}
                            className={`flex items-center gap-4 p-4 rounded-lg font-semibold cursor-pointer transition-colors ${activeProjectId === p.project.id && currentView === 'projects' ? 'bg-[#6cf8bb] text-[#00714d]' : 'text-[#45474c] hover:bg-[#f2f4f6]'}`}
                        >
                            <span className="material-symbols-outlined">folder_open</span>
                            <span>Project #{index + 1}</span>
                        </a>
                    ))}
                    
                    <div className="px-4 py-2 mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Account</div>
                    <a 
                        onClick={() => setCurrentView('billing')}
                        className={`flex items-center gap-4 p-4 rounded-lg font-semibold cursor-pointer transition-colors ${currentView === 'billing' ? 'bg-[#6cf8bb] text-[#00714d]' : 'text-[#45474c] hover:bg-[#f2f4f6]'}`}
                    >
                        <span className="material-symbols-outlined">shopping_cart</span>
                        <span>Billing & Invoices</span>
                    </a>
                    <div className="mt-auto pt-8 border-t border-[#c5c6cd]">
                        <a onClick={logout} className="flex items-center gap-4 p-4 text-[#45474c] hover:bg-[#f2f4f6] rounded-lg font-semibold cursor-pointer">
                            <span className="material-symbols-outlined">logout</span>
                            <span>Sign Out</span>
                        </a>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="md:ml-72 flex-grow min-h-screen flex flex-col print:ml-0 print:bg-white print:w-full">
                <header className="w-full sticky top-0 bg-white border-b border-[#c5c6cd] z-40 h-20 flex items-center justify-between px-10 print:hidden">
                    <h1 className="text-2xl font-semibold text-[#091426]">Workspace</h1>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-[#45474c]">Welcome, <span className="font-bold text-[#091426]">{user.full_name}</span></span>
                        <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
                             <span className="material-symbols-outlined">person</span>
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-[1280px] w-full mx-auto space-y-8 flex-grow print:p-0 print:space-y-4">
                    {currentView === 'billing' ? (
                        <div className="bg-white border border-[#c5c6cd] rounded-2xl p-8 shadow-sm print:hidden">
                            <h2 className="text-2xl font-semibold text-[#091426] mb-8">Billing & Invoices</h2>
                            <div className="space-y-4">
                                {projectsData.map((p, index) => {
                                    const inv = p.invoice;
                                    const txn = inv?.transaction;
                                    if (!inv) return null;
                                    return (
                                        <div key={inv.id} className="flex items-center justify-between p-6 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                                    <span className="material-symbols-outlined">receipt_long</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-[#091426]">{inv.invoice_number}</h3>
                                                    <p className="text-sm text-gray-500">Project #{index + 1} - {txn?.company_name || 'Individual'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-6">
                                                <div>
                                                    <p className="font-bold text-[#091426]">${inv.amount}</p>
                                                    <p className="text-sm text-green-600 font-semibold">{inv.status}</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setActiveProjectId(p.project.id);
                                                        setCurrentView('projects');
                                                        setTimeout(() => window.print(), 100);
                                                    }}
                                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" title="View & Print"
                                                >
                                                    <span className="material-symbols-outlined text-gray-600">visibility</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
                        {/* Project Stepper */}
                        <section className="lg:col-span-12 bg-white border border-[#c5c6cd] rounded-2xl p-8 shadow-sm print:hidden">
                            <div className="flex justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-semibold text-[#091426] mb-1">Active Project Lifecycle Tracker</h2>
                                    <p className="text-[#45474c]">Real-time status of your Premium Web Pack</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[#45474c] text-sm uppercase tracking-wider mb-1 block">Status</span>
                                    <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#6cf8bb] text-[#00714d] text-sm font-bold">
                                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                                        {steps[currentPhase - 1]?.label || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="relative py-12 px-4 overflow-x-auto">
                                <div className="flex items-center justify-between min-w-[800px] relative">
                                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2 z-0"></div>
                                    <div 
                                        className="absolute top-1/2 left-0 h-[2px] bg-[#10B981] -translate-y-1/2 z-0 transition-all duration-1000"
                                        style={{ width: `${((currentPhase - 1) / (steps.length - 1)) * 100}%` }}
                                    ></div>
                                    
                                    {steps.map((step, index) => {
                                        const isCompleted = index + 1 < currentPhase;
                                        const isActive = index + 1 === currentPhase;
                                        const isPending = index + 1 > currentPhase;

                                        return (
                                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-4 bg-white px-4">
                                                {isCompleted ? (
                                                    <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center">
                                                        <span className="material-symbols-outlined">check</span>
                                                    </div>
                                                ) : isActive ? (
                                                    <div className="w-14 h-14 rounded-full bg-white border-2 border-[#10B981] flex items-center justify-center animate-pulse">
                                                        <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center">
                                                            <span className="material-symbols-outlined">{step.icon}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                                                        <span className="material-symbols-outlined">{step.icon}</span>
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <p className={`font-semibold ${isActive ? 'text-[#10B981]' : isCompleted ? 'text-[#091426]' : 'text-gray-500'}`}>
                                                        {step.label}
                                                    </p>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        {isActive ? 'In Progress' : isCompleted ? 'Done' : 'Pending'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Digital Receipt */}
                        {invoice && (
                        <section className="lg:col-span-4 bg-white border border-[#c5c6cd] rounded-2xl p-6 shadow-sm print:border-none print:shadow-none print:p-0 h-fit">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-[#091426]">Receipt</h2>
                                <span className="px-2 py-1 bg-[#10B981] text-white text-[10px] rounded-full uppercase font-bold">STATUS: {invoice.status}</span>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Order ID</span>
                                    <span className="font-bold text-[#091426] truncate max-w-[120px]" title={invoice.invoice_number}>{invoice.invoice_number}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Name</span>
                                    <span className="font-bold text-[#091426] truncate max-w-[120px]">{user.full_name}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Email</span>
                                    <span className="font-bold text-[#091426] truncate max-w-[120px]" title={invoice.transaction?.email || user.username}>{invoice.transaction?.email || user.username}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Company</span>
                                    <span className="font-bold text-[#091426] truncate max-w-[120px]">{invoice.transaction?.company_name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Zip Code</span>
                                    <span className="font-bold text-[#091426]">{invoice.transaction?.zipcode || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-3">
                                    <span className="text-gray-500">Method</span>
                                    <span className="font-bold text-[#091426]">
                                        {invoice.transaction?.card_details_string ? (
                                            `*${invoice.transaction.card_details_string.match(/card number:\s*(\d+)/)?.[1]?.slice(-4) || '****'}`
                                        ) : 'Card'}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600">Total Paid</p>
                                    <p className="text-xl font-bold text-[#091426]">${invoice.amount}</p>
                                </div>
                                <button onClick={() => window.print()} className="bg-[#091426] text-white p-2.5 rounded-lg hover:bg-gray-800 transition-all print:hidden" title="Print Receipt">
                                    <span className="material-symbols-outlined text-sm">download</span>
                                </button>
                            </div>
                        </section>
                        )}
                        
                        {/* Manager Banner & Chat */}
                        <section className="lg:col-span-8 print:hidden flex flex-col gap-6">
                            {/* Dedicated Manager Banner */}
                            <div className="bg-gradient-to-r from-[#091426] to-[#1a2b4c] rounded-2xl p-5 text-white flex items-center justify-between shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#10B981]/20 rounded-full flex items-center justify-center border border-[#10B981]/30 flex-shrink-0">
                                        <span className="material-symbols-outlined text-[#10B981] text-2xl">support_agent</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight mb-1">Dedicated Manager</h3>
                                        <p className="text-sm text-gray-300">
                                            {project.manager_id ? `${project.manager_name} is actively managing your project.` : 'A manager will be assigned to your project shortly.'}
                                        </p>
                                    </div>
                                </div>
                                {project.manager_id && (
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/20 text-[#10B981] rounded-full text-xs font-bold border border-[#10B981]/30">
                                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                                        ONLINE
                                    </div>
                                )}
                            </div>

                            {/* Project Chat UI */}
                            <ChatComponent projectId={activeProjectId} currentUserId={user.id} isLocked={!project.manager_id} />
                        </section>
                    </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ClientDashboard;
