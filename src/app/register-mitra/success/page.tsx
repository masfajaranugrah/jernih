import Link from "next/link";

export const metadata = {
  title: "Pendaftaran Berhasil - Jernih Creatife",
  description: "Pendaftaran mitra Jernih Creatife Anda berhasil dikirim.",
};

export default function RegisterMitraSuccessPage() {
  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 bg-[#f8f9fa] shadow-sm h-20 flex items-center px-6">
        <div className="max-w-[1280px] mx-auto w-full flex justify-center md:justify-start">
          <div
            className="font-bold text-[#003527]"
            style={{ fontSize: "48px", lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: 600 }}
          >
            Jernih Creatife
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center py-20 px-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#003527]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#d9dff5]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
          {/* Animated checkmark */}
          <div className="flex justify-center" style={{ animation: "subtleFloat 4s ease-in-out infinite" }}>
            <div className="w-[120px] h-[120px] relative inline-block">
              <div
                className="w-[120px] h-[120px] rounded-full border-4 border-[#003527] relative"
                style={{ boxSizing: "content-box" }}
              >
                {/* tip line */}
                <span
                  className="block absolute z-10 bg-[#003527] rounded"
                  style={{
                    height: "5px",
                    width: "35px",
                    top: "65px",
                    left: "20px",
                    transform: "rotate(45deg)",
                    animation: "iconLineTip 0.75s ease forwards",
                  }}
                />
                {/* long line */}
                <span
                  className="block absolute z-10 bg-[#003527] rounded"
                  style={{
                    height: "5px",
                    width: "65px",
                    top: "55px",
                    right: "15px",
                    transform: "rotate(-45deg)",
                    animation: "iconLineLong 0.75s ease forwards",
                  }}
                />
                {/* circle border */}
                <div
                  className="absolute rounded-full border-4 border-[#003527]/10 z-10"
                  style={{ top: "-4px", left: "-4px", width: "120px", height: "120px" }}
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h1
              className="text-[#003527] tracking-tight"
              style={{ fontSize: "30px", lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: 500 }}
            >
              Pendaftaran Berhasil Dikirim
            </h1>
            <p
              className="text-[#575e70] max-w-lg mx-auto"
              style={{ fontSize: "18px", lineHeight: "1.6", fontWeight: 400 }}
            >
              Terima kasih telah bergabung. Tim verifikasi Jernih Creatife sedang meninjau dokumen Anda untuk memastikan standar kualitas layanan kami.
            </p>
          </div>

          {/* Status card */}
          <div className="bg-[#f3f4f5] border border-[#bfc9c3] p-6 rounded-xl flex items-center gap-6 text-left max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#064e3b] flex items-center justify-center flex-shrink-0">
              {/* Timer icon */}
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p
                className="text-[#003527] uppercase tracking-widest"
                style={{ fontSize: "14px", lineHeight: 1, letterSpacing: "0.05em", fontWeight: 600 }}
              >
                Status Tinjauan
              </p>
              <p className="text-[#404944]" style={{ fontSize: "16px", lineHeight: "1.5", fontWeight: 400 }}>
                Estimasi waktu peninjauan adalah{" "}
                <span className="font-semibold text-[#003527]">1 x 24 jam</span>. Kami akan mengirimkan notifikasi via email.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-2">
            <Link
              href="/"
              className="w-full md:w-auto px-12 py-3 bg-[#003527] text-white rounded-lg shadow-lg hover:bg-[#095d47] transition-all duration-300 flex items-center justify-center gap-2 group"
              style={{ fontSize: "14px", letterSpacing: "0.05em", fontWeight: 600 }}
            >
              Cek Status Pendaftaran
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/"
              className="w-full md:w-auto px-12 py-3 border border-[#003527] text-[#003527] rounded-lg hover:bg-[#003527]/5 transition-all duration-300"
              style={{ fontSize: "14px", letterSpacing: "0.05em", fontWeight: 600 }}
            >
              Kembali ke Beranda
            </Link>
          </div>


        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-20 bg-[#282f3b] text-white">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div style={{ fontSize: "24px", lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: 500 }}>
              Jernih Creatife
            </div>
            <div className="text-[#abb2c2]" style={{ fontSize: "12px", lineHeight: 1, fontWeight: 500 }}>
              © 2024 Jernih Creatife. All rights reserved.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Settings", "Contact Support"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[#abb2c2] hover:text-white transition-colors"
                style={{ fontSize: "12px", lineHeight: 1, fontWeight: 500 }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes subtleFloat {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes iconLineTip {
          0%   { width: 0; left: 0px; top: 30px; }
          54%  { width: 0; left: 0px; top: 30px; }
          70%  { width: 50px; left: -10px; top: 50px; }
          84%  { width: 25px; left: 26px; top: 65px; }
          100% { width: 35px; left: 20px; top: 65px; }
        }
        @keyframes iconLineLong {
          0%   { width: 0; right: 65px; top: 75px; }
          65%  { width: 0; right: 65px; top: 75px; }
          84%  { width: 75px; right: 0px; top: 45px; }
          100% { width: 65px; right: 15px; top: 55px; }
        }
      `}</style>
    </div>
  );
}
