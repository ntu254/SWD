package com.example.demo.decorator;

/**
 * Component Interface - base interface cho Decorator pattern.
 * Các action (submit complaint, track progress) implement interface này.
 */
public interface BaseAction {
    String execute();
    String getDescription();
}
