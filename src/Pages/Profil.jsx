import { useState } from "react";

const toggleStyles = `
  .toggle-checkbox:checked {
    right: 0;
    border-color: #fff;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #b91c1c;
  }
  .toggle-label {
    transition: background-color 0.2s ease;
  }
`;

export default function MyProfile() {
  const [pushNotif, setPushNotif] = useState(true);
  const [emailSub, setEmailSub] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
      <style>{toggleStyles}</style>
      <div className="max-w-5xl mx-auto" style={{ width: "1000px", maxWidth: "100%" }}>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your account settings and preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-red-100 shadow-md flex-shrink-0">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Alex Mercer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Alex Mercer</h2>
              <p className="text-gray-400 text-sm mb-3">alex.mercer@example.com</p>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 text-gray-600 text-xs font-medium bg-gray-50">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Premium Member
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 text-gray-600 text-xs font-medium bg-gray-50">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  42 Orders
                </span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14.414L7 15l.586-3a2 2 0 01.586-1.414z" />
            </svg>
            Edit Profile
          </button>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-2 gap-5">

          {/* Left Column */}
          <div className="flex flex-col gap-5">

            {/* Saved Addresses */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-base font-bold text-gray-900">Saved Addresses</h3>
                </div>
                <button className="text-red-700 text-sm font-semibold hover:text-red-800 transition-colors">Add New</button>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Home", addr: "123 Market Street, Apt 4B, San Francisco...", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                  { label: "Office", addr: "500 Howard St, Floor 8, San Francisco,...", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.addr}</p>
                      </div>
                    </div>
                    <button className="text-gray-300 hover:text-red-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h3 className="text-base font-bold text-gray-900">Payment Methods</h3>
                </div>
                <button className="text-red-700 text-sm font-semibold hover:text-red-800 transition-colors">Add New</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { brand: "VISA", last4: "4242", exp: "12/25", isDefault: true, italic: true },
                  { brand: "MC", last4: "8899", exp: "08/26", isDefault: false, italic: false },
                ].map((card, i) => (
                  <div key={i} className={`relative p-4 rounded-xl border ${card.isDefault ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"} hover:shadow-sm transition-shadow`}>
                    {card.isDefault && (
                      <span className="absolute top-2.5 right-2.5 bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded">DEFAULT</span>
                    )}
                    <p className={`text-lg font-black text-gray-800 mb-2 ${card.italic ? "italic" : ""}`}>{card.brand}</p>
                    <p className="text-xs text-gray-400 tracking-widest mb-1">•••• •••• •••• {card.last4}</p>
                    <p className="text-xs font-semibold text-gray-700">Expires {card.exp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Account Settings */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 h-fit">
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-base font-bold text-gray-900">Account Settings</h3>
            </div>

            {/* Toggle rows */}
            {[
              { label: "Push Notifications", desc: "Order updates and promotions", val: pushNotif, set: setPushNotif },
              { label: "Email Subscriptions", desc: "Weekly newsletter and offers", val: emailSub, set: setEmailSub },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.set(!item.val)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${item.val ? "bg-red-700" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${item.val ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            ))}

            {/* Links */}
            {[
              { label: "Privacy & Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
              { label: "Help & Support", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((item, i) => (
              <button key={i} className="w-full flex items-center justify-between py-4 border-b border-gray-100 hover:bg-gray-50 -mx-5 px-5 transition-colors group">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}

            <div className="pt-5 text-center">
              <button className="flex items-center gap-2 text-red-700 hover:text-red-800 text-sm font-semibold transition-colors mx-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}