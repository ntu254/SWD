package com.example.backendservice.features.settings.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.settings.dto.SettingDTO;
import com.example.backendservice.features.settings.entity.SystemSetting;
import com.example.backendservice.features.settings.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    @Override
    public List<SettingDTO> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public SettingDTO getSetting(String key) {
        SystemSetting setting = systemSettingRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting", "key", key));
        return toDto(setting);
    }

    @Override
    @Transactional
    public SettingDTO updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting", "key", key));
        
        setting.setValue(value);
        return toDto(systemSettingRepository.save(setting));
    }

    @Override
    public String getSettingValue(String key, String defaultValue) {
        return systemSettingRepository.findById(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }

    private SettingDTO toDto(SystemSetting setting) {
        return SettingDTO.builder()
                .key(setting.getKey())
                .value(setting.getValue())
                .description(setting.getDescription())
                .dataType(setting.getDataType())
                .build();
    }
}
