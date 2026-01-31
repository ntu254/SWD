package com.example.backendservice.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

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
        }
    }
}
