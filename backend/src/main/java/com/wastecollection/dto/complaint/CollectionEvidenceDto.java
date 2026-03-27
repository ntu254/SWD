package com.wastecollection.dto.complaint;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CollectionEvidenceDto {
    private String visitStatus;
    private String collectorName;
    private String collectorNote;
    private LocalDateTime visitedAt;
    private List<String> evidencePhotos;
}
