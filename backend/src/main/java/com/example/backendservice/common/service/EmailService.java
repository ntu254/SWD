package com.example.backendservice.common.service;

<<<<<<< HEAD
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

=======
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
>>>>>>> 1fe9f3e (feat: Implement Refresh Token and restore OTP functionality)
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

<<<<<<< HEAD
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendOtpEmail(String to, String otp) {
        try {
            log.info("[EMAIL_SERVICE] Sending OTP to: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("GreenLoop - Xác nhận đặt lại mật khẩu");
            message.setText("Mã OTP của bạn là: " + otp + "\n\nMã này sẽ hết hạn sau 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.");

            mailSender.send(message);
            log.info("[EMAIL_SERVICE] Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("[EMAIL_SERVICE] Failed to send email to: {}", to, e);
            // Non-blocking error, user might retry
=======
    @Async
    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("SWD392 - Reset Password OTP");
            
            String htmlContent = String.format("""
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #2c3e50;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You requested to reset your password. Use the code below to proceed:</p>
                    <h3 style="background-color: #f1f1f1; padding: 10px; border-radius: 4px; display: inline-block; color: #333;">%s</h3>
                    <p>This code is valid for 15 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br/>
                    <p>Best regards,<br/>SWD392 Team</p>
                </div>
                """, otp);

            helper.setText(htmlContent, true); // true = isHtml

            mailSender.send(message);
            log.info("OTP email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}", to, e);
>>>>>>> 1fe9f3e (feat: Implement Refresh Token and restore OTP functionality)
        }
    }
}
