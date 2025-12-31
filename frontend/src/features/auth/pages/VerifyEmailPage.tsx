import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const VerifyEmailPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const handleVerify = async () => {
    // Giả lập verify
    await authService.verifyEmail(state?.email, otp);
    navigate("/welcome"); // Chuyển sang SCR-03
  };

  const handleResend = () => {
    setCountdown(60); // Reset đếm ngược 60s
    // Gọi API resend thực tế ở đây nếu có
    console.log("Resending email to:", state?.email);
    alert(`Đã gửi lại mã xác thực đến ${state?.email}`);
  };

  // Effect để chạy đồng hồ đếm ngược
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="page-container text-center">
      <h2>Xác thực Email</h2>
      <p>
        Mã xác thực đã gửi đến: <strong>{state?.email}</strong>
      </p>
      <input
        type="text"
        placeholder="Nhập mã OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="otp-input"
      />
      <button onClick={handleVerify} className="btn-primary mt-4">
        Xác nhận
      </button>
      <div className="mt-4">
        <button
          onClick={handleResend}
          disabled={countdown > 0}
          style={{
            background: "none",
            border: "none",
            color: countdown > 0 ? "#94a3b8" : "var(--primary-color)",
            cursor: countdown > 0 ? "default" : "pointer",
            textDecoration: "underline",
          }}
        >
          {countdown > 0
            ? `Gửi lại mã sau (${countdown}s)`
            : "Gửi lại mã xác thực"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
