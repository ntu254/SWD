import React, { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { Link } from 'react-router-dom';

// Regex Rules
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const RegisterForm: React.FC = () => {
  const { register, isLoading, error } = useRegister();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validate = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName) errors.fullName = "Vui lòng nhập họ tên";

    // BR-01 Email Validation
    if (!EMAIL_REGEX.test(formData.email))
      errors.email = "Email không đúng định dạng";

    // BR-03 Password Policy
    if (!PASSWORD_REGEX.test(formData.password)) {
      errors.password =
        "Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, thường và số.";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu nhập lại không khớp.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="error-message global">
            {error}
            {/* Nếu lỗi chứa từ khóa liên quan đến trùng email, hiện gợi ý */}
            {(error.includes("tồn tại") || error.includes("Conflict")) && (
              <div style={{ marginTop: "5px", fontSize: "0.9em" }}>
                Bạn đã có tài khoản?{" "}
                <Link to="/login" style={{ fontWeight: "bold" }}>
                  Đăng nhập ngay
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            className={validationErrors.fullName ? "input-error" : ""}
          />
          {validationErrors.fullName && (
            <span className="error-text">{validationErrors.fullName}</span>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            className={validationErrors.email ? "input-error" : ""}
          />
          {validationErrors.email && (
            <span className="error-text">{validationErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={validationErrors.password ? "input-error" : ""}
          />
          {validationErrors.password && (
            <span className="error-text">{validationErrors.password}</span>
          )}
        </div>

        <div className="form-group">
          <label>Nhập lại mật khẩu</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={validationErrors.confirmPassword ? "input-error" : ""}
          />
          {validationErrors.confirmPassword && (
            <span className="error-text">
              {validationErrors.confirmPassword}
            </span>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
