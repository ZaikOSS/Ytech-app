import React, { useState, useEffect } from 'react';

const CheckoutModal = ({ packageDetails, onClose, onCheckoutSuccess }) => {
    const [paymentMethod, setPaymentMethod] = useState('local'); // 'local' or 'stripe'
    const [cardholderName, setCardholderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expires, setExpires] = useState('');
    const [cvv, setCvv] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        try {
            const token = localStorage.getItem('ytech_token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserId(payload.id);
            }
        } catch (e) {
            console.error('Failed to parse token for user ID');
        }
    }, []);

    const handleExpiresChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        setExpires(val);
    };

    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(formatted.substring(0, 19)); // 16 digits + 3 spaces
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            // Simulate realistic network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const token = localStorage.getItem('ytech_token');
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    cardholderName, 
                    cardNumber, 
                    expires,
                    cvv,
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
            setError('An network error occurred during checkout.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStripeLink = () => {
        const links = {
            'Pack E-Commerce': 'https://buy.stripe.com/test_5kQ6oBcR40Q27tsg8K0Ny01',
            'Pack Showcase / Vitrine': 'https://buy.stripe.com/test_fZu4gteZc1U6dRQcWy0Ny00'
        };
        // Fallback to showcase if custom pack
        const baseUrl = links[packageDetails.name] || links['Pack Showcase / Vitrine'];
        return `${baseUrl}?client_reference_id=${userId}`;
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
                    <h1 className="font-headline-md text-headline-md text-primary-container m-0">Checkout</h1>
                    <p className="text-sm text-on-surface-variant mt-1">{packageDetails.name}</p>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                    
                    {!isSuccess && (
                        <div className="flex bg-surface-container-high rounded-lg p-1">
                            <button 
                                onClick={() => setPaymentMethod('local')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${paymentMethod === 'local' ? 'bg-white shadow text-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}
                            >
                                Credit Card
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('stripe')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-1 ${paymentMethod === 'stripe' ? 'bg-[#635BFF] text-white shadow' : 'text-on-surface-variant hover:bg-surface-variant'}`}
                            >
                                <span className="material-symbols-outlined text-sm">payments</span> Stripe
                            </button>
                        </div>
                    )}

                    {/* Amount Sector */}
                    <div className="flex flex-col gap-2 border-b border-surface-variant pb-6">
                        <div className="flex justify-between items-center w-full">
                            <span className="font-body-md text-body-md text-on-surface-variant">Total Amount</span>
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
                            <h2 className="text-2xl font-bold text-gray-800 text-center">Payment Complete!</h2>
                            <p className="text-gray-500 text-center text-sm px-4">Your project for {packageDetails.name} has been initiated.</p>
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

                            {paymentMethod === 'stripe' ? (
                                <div className="flex flex-col gap-4 text-center py-4">
                                    <p className="text-on-surface-variant text-sm mb-4">
                                        You will be redirected to Stripe's secure checkout. Once you complete the payment, our system will automatically verify it via webhooks.
                                    </p>
                                    <a 
                                        href={getStripeLink()} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full bg-[#635BFF] hover:bg-[#4E44E7] text-white py-4 px-6 rounded-lg font-button text-button transition-colors duration-200 flex justify-center items-center gap-2"
                                    >
                                        Proceed to Stripe <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    </a>
                                    <p className="text-xs text-outline mt-2">
                                        After paying on Stripe, you can safely close this window and refresh your dashboard.
                                    </p>
                                </div>
                            ) : (
                                <form className="flex flex-col gap-6" onSubmit={handleCheckout}>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="cardName">Name on card</label>
                                        <input 
                                            className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" 
                                            id="cardName" 
                                            placeholder="e.g. Jane Doe" 
                                            required 
                                            type="text"
                                            value={cardholderName}
                                            onChange={(e) => setCardholderName(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="companyName">Company</label>
                                            <input 
                                                className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline" 
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
                                                className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline" 
                                                id="email" 
                                                placeholder="billing@acme.com" 
                                                required 
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="cardNumber">Card number</label>
                                        <input 
                                            className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline" 
                                            id="cardNumber" 
                                            placeholder="XXXX XXXX XXXX XXXX" 
                                            required 
                                            type="text"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="cardExpiry">Expires</label>
                                            <input 
                                                className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline" 
                                                id="cardExpiry" 
                                                placeholder="MM/YY" 
                                                required 
                                                type="text"
                                                value={expires}
                                                onChange={handleExpiresChange}
                                                maxLength="5"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-sm text-label-sm text-on-surface-variant flex justify-between" htmlFor="cardCvv">
                                                CVV
                                            </label>
                                            <input 
                                                className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline" 
                                                id="cardCvv" 
                                                placeholder="123" 
                                                required 
                                                type="text"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value)}
                                                maxLength="4"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="zipCode">ZIP code</label>
                                        <input 
                                            className="ds-input w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline" 
                                            id="zipCode" 
                                            placeholder="90210" 
                                            required 
                                            type="text"
                                            value={zipcode}
                                            onChange={(e) => setZipcode(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        disabled={isLoading}
                                        className="mt-4 w-full bg-[#10B981] hover:bg-[#059669] disabled:bg-[#a7dccb] disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-button text-button flex items-center justify-center gap-2 transition-colors duration-200" 
                                        type="submit"
                                    >
                                        {isLoading ? (
                                            <span className="animate-spin material-symbols-outlined">refresh</span>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                                                Pay ${packageDetails.price.toFixed(2)}
                                            </>
                                        )}
                                    </button>
                                    
                                    <div className="text-center mt-2">
                                        <p className="font-label-sm text-label-sm text-outline font-normal flex items-center justify-center gap-1">
                                            <span className="material-symbols-outlined text-xs">verified_user</span>
                                            Secure simulated transaction
                                        </p>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
