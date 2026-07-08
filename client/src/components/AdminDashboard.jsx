import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [managers, setManagers] = useState([]);
    const [allManagers, setAllManagers] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedManagerId, setSelectedManagerId] = useState('');
    const [expandedMessageId, setExpandedMessageId] = useState(null);
    const [currentView, setCurrentView] = useState('overview');
    const [managerModal, setManagerModal] = useState({ isOpen: false, mode: 'CREATE', manager: null });
    const [managerForm, setManagerForm] = useState({ full_name: '', username: '', password: '' });
    const [loading, setLoading] = useState(true);
    const [currentProjectPage, setCurrentProjectPage] = useState(1);

    const steps = [
        { id: 1, label: 'Payment Confirmed' },
        { id: 2, label: 'Requirements Gathering' },
        { id: 3, label: 'Design Phase' },
        { id: 4, label: 'Development' },
        { id: 5, label: 'Deployment & Go-Live' }
    ];

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('ytech_token');
            const [projRes, mgrRes, mgrAllRes, inqRes] = await Promise.all([
                fetch('/api/admin/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/managers', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/managers/all', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/inquiries', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            const projData = await projRes.json();
            const mgrData = await mgrRes.json();
            const mgrAllData = await mgrAllRes.json();
            const inqData = await inqRes.json();
            
            setProjects(projData.sort((a, b) => b.id - a.id));
            setManagers(mgrData);
            setAllManagers(mgrAllData);
            setInquiries(inqData);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignManager = async () => {
        if (!selectedProjectId || !selectedManagerId) return;
        try {
            const token = localStorage.getItem('ytech_token');
            const res = await fetch('/api/admin/assign', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    projectId: selectedProjectId, 
                    managerId: selectedManagerId 
                })
            });
            
            if (res.ok) {
                fetchData();
                setSelectedProjectId(null);
                setSelectedManagerId('');
            }
        } catch (err) {
            console.error("Failed to assign manager", err);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            const token = localStorage.getItem('ytech_token');
            const res = await fetch(`/api/admin/inquiries/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (err) {
            console.error("Failed to mark inquiry as read", err);
        }
    };

    const handleSaveManager = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('ytech_token');
            const url = managerModal.mode === 'CREATE' ? '/api/admin/managers' : `/api/admin/managers/${managerModal.manager.id}`;
            const method = managerModal.mode === 'CREATE' ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(managerForm)
            });
            if (res.ok) {
                fetchData();
                setManagerModal({ isOpen: false, mode: 'CREATE', manager: null });
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save manager');
            }
        } catch (err) {
            console.error("Failed to save manager", err);
        }
    };

    const handleDeleteManager = async (id) => {
        if (!window.confirm("Are you sure you want to delete this manager? Any assigned projects will be unassigned.")) return;
        try {
            const token = localStorage.getItem('ytech_token');
            const res = await fetch(`/api/admin/managers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchData();
            else alert('Failed to delete manager');
        } catch (err) {
            console.error("Failed to delete manager", err);
        }
    };

    const openCreateManager = () => {
        setManagerForm({ full_name: '', username: '', password: '' });
        setManagerModal({ isOpen: true, mode: 'CREATE', manager: null });
    };

    const openEditManager = (mgr) => {
        setManagerForm({ full_name: mgr.full_name, username: mgr.username, password: '' });
        setManagerModal({ isOpen: true, mode: 'EDIT', manager: mgr });
    };

    if (loading) return <div className="p-10">Loading workspace...</div>;

    const unassignedCount = projects.filter(p => !p.manager_name).length;
    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const projectsPerPage = 8;
    const indexOfLastProject = currentProjectPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
    const totalProjectPages = Math.ceil(projects.length / projectsPerPage);

    return (
        <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-sans">
            <header className="w-full bg-white border-b border-[#c5c6cd] h-16 flex items-center justify-between px-10">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
                        <div className="w-8 h-8 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                        </div>
                        <span className="font-['Outfit'] text-2xl font-black text-gray-900 tracking-tight">YTECH<span className="text-[#10B981]">.</span></span>
                    </div>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <h1 className="text-xl font-bold text-[#091426]">Admin Operations</h1>
                </div>
                <div className="flex items-center gap-6">
                    <nav className="flex gap-4 mr-8">
                        <button 
                            onClick={() => setCurrentView('overview')}
                            className={`font-bold pb-2 transition-colors border-b-2 ${currentView === 'overview' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                        >
                            System Overview
                        </button>
                        <button 
                            onClick={() => setCurrentView('managers')}
                            className={`font-bold pb-2 transition-colors border-b-2 ${currentView === 'managers' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                        >
                            Manager Accounts
                        </button>
                        <button 
                            onClick={() => setCurrentView('inquiries')}
                            className={`font-bold pb-2 transition-colors border-b-2 ${currentView === 'inquiries' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                        >
                            Incoming Inquiries
                        </button>
                    </nav>
                    <div className="w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center font-bold">
                        A
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Sign Out
                    </button>
                </div>
            </header>

            <main className="flex-1 p-10 max-w-[1280px] mx-auto w-full space-y-10">
                {currentView === 'overview' && (
                <>
                {/* HEADER SUMMARY METRICS */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl border border-[#c5c6cd] flex flex-col gap-2">
                        <span className="text-sm font-medium uppercase tracking-widest text-[#45474c]">Total Active Clients</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-[#091426]">{projects.length}</span>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-[#c5c6cd] flex flex-col gap-2">
                        <span className="text-sm font-medium uppercase tracking-widest text-[#45474c]">Unassigned Projects</span>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-5xl font-bold ${unassignedCount > 0 ? 'text-red-600' : 'text-[#091426]'}`}>{unassignedCount}</span>
                            {unassignedCount > 0 && <span className="text-[#45474c] text-sm">Requires immediate attention</span>}
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-[#c5c6cd] flex flex-col gap-2">
                        <span className="text-sm font-medium uppercase tracking-widest text-[#45474c]">Available Managers</span>
                        <div className="flex items-center gap-3">
                            <span className="text-5xl font-bold text-[#091426]">{managers.length}</span>
                        </div>
                    </div>
                </section>

                {/* PROJECT & MANAGER DISPATCH CENTER */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Project List */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#091426]">Active Client Projects</h2>
                        </div>
                        <div className="bg-white rounded-2xl border border-[#c5c6cd] overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#eceef0] text-[#45474c] text-sm">
                                    <tr>
                                        <th className="px-6 py-4 font-bold uppercase">Client Name</th>
                                        <th className="px-6 py-4 font-bold uppercase">Manager</th>
                                        <th className="px-6 py-4 font-bold uppercase">Current Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eceef0]">
                                    {currentProjects.map(p => {
                                        const isSelected = selectedProjectId === p.id;
                                        const phaseLabel = steps[p.current_phase - 1]?.label || 'Pending';
                                        
                                        return (
                                            <tr 
                                                key={p.id} 
                                                onClick={() => setSelectedProjectId(p.id)}
                                                className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-[#f2f4f6]'}`}
                                            >
                                                <td className="px-6 py-5 font-bold text-[#091426]">{p.client_name}</td>
                                                <td className="px-6 py-5">
                                                    {p.manager_name ? (
                                                        <span className="text-[#091426]">{p.manager_name}</span>
                                                    ) : (
                                                        <span className="text-red-600 font-bold">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.current_phase >= 5 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {phaseLabel}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {projects.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-5 text-center text-gray-500">No projects found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        {totalProjectPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <button 
                                    onClick={() => setCurrentProjectPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentProjectPage === 1}
                                    className="px-4 py-2 rounded-lg font-bold text-sm bg-white border border-[#c5c6cd] text-[#45474c] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalProjectPages }, (_, i) => i + 1).map(pageNumber => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentProjectPage(pageNumber)}
                                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${currentProjectPage === pageNumber ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-[#c5c6cd] text-[#45474c] hover:bg-gray-50'}`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentProjectPage(prev => Math.min(prev + 1, totalProjectPages))}
                                    disabled={currentProjectPage === totalProjectPages}
                                    className="px-4 py-2 rounded-lg font-bold text-sm bg-white border border-[#c5c6cd] text-[#45474c] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Assignment Card */}
                    <div className="lg:col-span-4 space-y-8">
                        <h2 className="text-2xl font-bold text-[#091426]">Assignment</h2>
                        <div className="bg-white p-8 rounded-2xl border border-[#c5c6cd] flex flex-col h-full shadow-sm">
                            {selectedProject ? (
                                <>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-[#091426]">Assign Dedicated Manager</h3>
                                        <p className="text-[#45474c] text-sm">For {selectedProject.client_name}'s Project</p>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        {managers.map(m => (
                                            <label 
                                                key={m.id} 
                                                className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedManagerId === m.id ? 'border-[#10B981] bg-green-50' : 'border-[#c5c6cd] hover:border-[#10B981] hover:bg-green-50/50'}`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="manager" 
                                                    className="hidden" 
                                                    checked={selectedManagerId === m.id}
                                                    onChange={() => setSelectedManagerId(m.id)}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[#091426]">{m.full_name}</span>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase text-[#10B981] bg-green-100 px-2 py-0.5 rounded">Available</span>
                                                {selectedManagerId === m.id && (
                                                    <div className="absolute inset-0 border-2 border-[#10B981] rounded-xl pointer-events-none"></div>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={handleAssignManager}
                                        disabled={!selectedManagerId}
                                        className={`mt-8 w-full font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 ${selectedManagerId ? 'bg-[#10B981] text-white hover:bg-[#0e9f6e]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        Confirm Manager Assignment
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                    </button>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    Select a project to assign a manager
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                </>
                )}

                {currentView === 'inquiries' && (
                <section className="space-y-8">
                    {/* INQUIRIES SECTION */}
                    <h2 className="text-2xl font-bold text-[#091426]">Incoming Contact Inquiries</h2>
                    <div className="bg-white rounded-2xl border border-[#c5c6cd] overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#eceef0] text-[#45474c] text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-bold uppercase">Date</th>
                                    <th className="px-6 py-4 font-bold uppercase">Name</th>
                                    <th className="px-6 py-4 font-bold uppercase">Email</th>
                                    <th className="px-6 py-4 font-bold uppercase w-1/3">Message</th>
                                    <th className="px-6 py-4 font-bold uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eceef0]">
                                {inquiries.map(inq => (
                                    <tr key={inq.id} className={`transition-colors ${inq.status === 'UNREAD' ? 'bg-orange-50 font-semibold' : 'bg-white text-gray-500'}`}>
                                        <td className="px-6 py-5 whitespace-nowrap">{new Date(inq.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-5">{inq.name}</td>
                                        <td className="px-6 py-5">{inq.email}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <p className={expandedMessageId === inq.id ? '' : 'line-clamp-2'}>
                                                    {inq.message}
                                                </p>
                                                {inq.message.length > 100 && (
                                                    <button 
                                                        onClick={() => setExpandedMessageId(expandedMessageId === inq.id ? null : inq.id)}
                                                        className="text-left text-sm font-bold text-blue-600 hover:text-blue-800"
                                                    >
                                                        {expandedMessageId === inq.id ? 'Show Less' : 'Read Full Message'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {inq.status === 'UNREAD' ? (
                                                <button onClick={() => handleMarkRead(inq.id)} className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-bold hover:bg-[#0e9f6e]">Mark Read</button>
                                            ) : (
                                                <span className="text-gray-400 font-bold text-sm">Reviewed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {inquiries.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No contact inquiries found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                )}

                {currentView === 'managers' && (
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[#091426]">Manager Accounts</h2>
                        <button onClick={openCreateManager} className="bg-[#10B981] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#0e9f6e] transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">person_add</span>
                            Add Manager
                        </button>
                    </div>
                    <div className="bg-white rounded-2xl border border-[#c5c6cd] overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#eceef0] text-[#45474c] text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-bold uppercase">Full Name</th>
                                    <th className="px-6 py-4 font-bold uppercase">Username</th>
                                    <th className="px-6 py-4 font-bold uppercase">Joined Date</th>
                                    <th className="px-6 py-4 font-bold uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eceef0]">
                                {allManagers.map(mgr => (
                                    <tr key={mgr.id} className="transition-colors hover:bg-[#f2f4f6]">
                                        <td className="px-6 py-5 font-bold text-[#091426]">{mgr.full_name}</td>
                                        <td className="px-6 py-5">{mgr.username}</td>
                                        <td className="px-6 py-5 text-gray-500">{new Date(mgr.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                                            <button onClick={() => openEditManager(mgr)} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button onClick={() => handleDeleteManager(mgr.id)} className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {allManagers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No managers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                )}
            </main>

            {/* Manager Modal */}
            {managerModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-[#091426] text-xl">
                                {managerModal.mode === 'CREATE' ? 'Add New Manager' : 'Edit Manager'}
                            </h3>
                            <button onClick={() => setManagerModal({ ...managerModal, isOpen: false })} className="text-gray-400 hover:text-gray-700">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveManager} className="p-6 flex flex-col gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={managerForm.full_name}
                                    onChange={(e) => setManagerForm({...managerForm, full_name: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={managerForm.username}
                                    onChange={(e) => setManagerForm({...managerForm, username: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                    placeholder="johndoe123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Password {managerModal.mode === 'EDIT' && <span className="text-gray-400 text-xs font-normal">(Leave blank to keep unchanged)</span>}
                                </label>
                                <input 
                                    type="password" 
                                    required={managerModal.mode === 'CREATE'} 
                                    value={managerForm.password}
                                    onChange={(e) => setManagerForm({...managerForm, password: e.target.value})}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                    placeholder="********"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setManagerModal({ ...managerModal, isOpen: false })} className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-[#10B981] text-white hover:bg-[#0e9f6e] rounded-xl font-bold transition-colors shadow-lg shadow-green-500/20">
                                    {managerModal.mode === 'CREATE' ? 'Create Manager' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
