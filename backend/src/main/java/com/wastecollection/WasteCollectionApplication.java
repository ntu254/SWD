package com.wastecollection;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WasteCollectionApplication {
    public static void main(String[] args) {
        SpringApplication.run(WasteCollectionApplication.class, args);
    }
}
