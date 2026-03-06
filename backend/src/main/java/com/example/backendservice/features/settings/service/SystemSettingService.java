package com.example.backendservice.features.settings.service;

import com.example.backendservice.features.settings.dto.SettingDTO;
import java.util.List;

public interface SystemSettingService {
    List<SettingDTO> getAllSettings();
    SettingDTO getSetting(String key);
    SettingDTO updateSetting(String key, String value);
    String getSettingValue(String key, String defaultValue);
}
