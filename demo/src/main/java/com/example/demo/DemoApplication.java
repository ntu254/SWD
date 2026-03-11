package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.PrintStream;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) throws Exception {
        // Fix hiển thị tiếng Việt trên Windows Console
        System.setOut(new PrintStream(System.out, true, "UTF-8"));
        System.setErr(new PrintStream(System.err, true, "UTF-8"));
        SpringApplication.run(DemoApplication.class, args);
    }

}
