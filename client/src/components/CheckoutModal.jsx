import React, { useState } from 'react';

const CheckoutModal = ({ packageDetails, onClose, onCheckoutSuccess }) => {
    const [cardholderName, setCardholderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expires, setExpires] = useState('');
    const [cvv, setCvv] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleExpiresChange = (e) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove all non-digits
        
        // Auto-insert slash after 2 digits
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 6);
        }
        setExpires(val);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setError('');
        
        // Construct the string the backend expects, replacing the slash in expires with a pipe
        const formattedExpires = expires.replace('/', '|');
        const cardDetailsString = `card number: ${cardNumber} expiration date ${formattedExpires} sercet code${cvv}`;

        try {
            const token = localStorage.getItem('ytech_token');
            const res = await fetch('http://localhost:3001/api/checkout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    cardholderName, 
                    cardDetailsString, 
                    zipcode,
                    companyName,
                    email,
                    amount: packageDetails.price
                })
            });
            const data = await res.json();
            if (res.ok) {
                setIsSuccess(true);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('An error occurred during checkout.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md mx-auto bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden hover-shadow-subtle relative z-10 shadow-2xl">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-outline hover:text-on-surface"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                {/* Header */}
                <div className="bg-surface-container-low py-6 px-8 text-center border-b border-surface-variant">
                    <h1 className="font-headline-md text-headline-md text-primary-container m-0">Pay Invoice</h1>
                    <p className="text-sm text-on-surface-variant mt-1">{packageDetails.name}</p>
                </div>
                {/* Content Area */}
                <div className="p-8 flex flex-col gap-8 max-h-[80vh] overflow-y-auto">
                    {/* Accepted Cards Row */}
                    <div className="flex items-center gap-4 justify-start text-on-surface-variant">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Accepted</span>
                        <div className="flex gap-2">
                            <span className="material-symbols-outlined text-outline text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
                            <span className="material-symbols-outlined text-outline text-2xl">account_balance_wallet</span>
                            <span className="material-symbols-outlined text-outline text-2xl">payments</span>
                        </div>
                    </div>
                    {/* Amount Sector */}
                    <div className="flex flex-col gap-2 border-b border-surface-variant pb-6">
                        <div className="flex justify-between items-center w-full">
                            <span className="font-body-md text-body-md text-on-surface-variant">Payment amount</span>
                            <button className="font-button text-button text-secondary hover:text-on-secondary-container transition-colors focus:outline-none" type="button">Edit</button>
                        </div>
                        <div className="font-display-lg-mobile text-display-lg-mobile text-primary-container tracking-tight">
                            ${packageDetails.price.toFixed(2)}
                        </div>
                    </div>
                    
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-green-500 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 text-center">Payment Successful!</h2>
                            <p className="text-gray-500 text-center text-sm px-4">Your order for {packageDetails.name} has been processed successfully. Your assigned manager will reach out shortly.</p>
                            <button 
                                onClick={onCheckoutSuccess}
                                className="mt-4 w-full bg-[#10B981] hover:bg-[#059669] text-white py-4 px-6 rounded-lg font-button text-button transition-colors duration-200"
                            >
                                Let's go to Dashboard
                            </button>
                        </div>
                    ) : (
                        <>
                            {error && <div className="bg-error-container text-error p-3 rounded font-body-md text-body-md">{error}</div>}

                            {/* Core Inputs Form */}
                    <form className="flex flex-col gap-6" onSubmit={handleCheckout}>
                        {/* Name Input */}
                        <div className="flex flex-col gap-2">
                            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="cardName">Name on card</label>
                            <input 
                                className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" 
                                id="cardName" 
                                name="cardName" 
                                placeholder="e.g. Jane Doe" 
                                required 
                                type="text"
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="companyName">Company name</label>
                                <input 
                                    className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" 
                                    id="companyName" 
                                    placeholder="Acme Corp" 
                                    required 
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">Email</label>
                                <input 
                                    className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" 
                                    id="email" 
                                    placeholder="billing@acme.com" 
                                    required 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        {/* Card Number */}
                        <div className="flex flex-col gap-2">
                            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="cardNumber">Card number</label>
                            <input 
                                className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" 
                                id="cardNumber" 
                                name="cardNumber" 
                                placeholder="e.g. 1442216444355245" 
                                required 
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />
                        </div>
                        {/* Expiry and CVV Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="cardExpiry">Expires</label>
                                <input 
                                    className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" 
                                    id="cardExpiry" 
                                    name="cardExpiry" 
                                    placeholder="MM/YY" 
                                    required 
                                    type="text"
                                    value={expires}
                                    onChange={handleExpiresChange}
                                    maxLength="7"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="font-label-sm text-label-sm text-on-surface-variant flex justify-between" htmlFor="cardCvv">
                                    Security code
                                    <span className="material-symbols-outlined text-outline text-sm" title="3 or 4 digit code on back of card">info</span>
                                </label>
                                <input 
                                    className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" 
                                    id="cardCvv" 
                                    name="cardCvv" 
                                    placeholder="CVV" 
                                    required 
                                    type="text"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                    maxLength="4"
                                />
                            </div>
                        </div>
                        {/* ZIP Code */}
                        <div className="flex flex-col gap-2">
                            <label className="font-label-sm text-label-sm text-on-surface-variant flex justify-between" htmlFor="zipCode">
                                ZIP code
                                <span className="material-symbols-outlined text-outline text-sm" title="Billing ZIP or postal code">info</span>
                            </label>
                            <input 
                                className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" 
                                id="zipCode" 
                                name="zipCode" 
                                placeholder="e.g. 90210" 
                                required 
                                type="text"
                                value={zipcode}
                                onChange={(e) => setZipcode(e.target.value)}
                            />
                        </div>
                        {/* Action Button */}
                        <button className="mt-4 w-full bg-[#10B981] hover:bg-[#059669] text-white py-4 px-6 rounded-lg font-button text-button flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981]" type="submit">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                            Pay ${packageDetails.price.toFixed(2)}
                        </button>
                        
                        <div className="text-center mt-2">
                            <p className="font-label-sm text-label-sm text-outline font-normal flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-xs">verified_user</span>
                                Secure encrypted transaction
                            </p>
                        </div>
                        
                        <div className="text-center font-label-sm text-label-sm text-outline mt-2 bg-surface-container-high p-2 rounded">
                            Demo Auth Required:<br/>
                            Name: zaikos <br/>
                            Card number: 1442216444355245 <br/>
                            Expires: 02/2231 <br/>
                            Security code: 795 <br/>
                            Zip: 30000
                        </div>
                    </form>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
