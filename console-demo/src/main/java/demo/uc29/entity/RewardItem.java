package demo.uc29.entity;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UC-29 Entity: RewardItem
 * Represents a redeemable reward item managed by Administrator.
 */
public class RewardItem {

    private UUID itemId;
    private String name;
    private String description;
    private int pointsCost;
    private int stock;
    private String imageUrl;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RewardItem(String name, String description, int pointsCost, int stock, String imageUrl) {
        this.itemId = UUID.randomUUID();
        this.name = name;
        this.description = description;
        this.pointsCost = pointsCost;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void update(String name, String description, int pointsCost, int stock, String imageUrl) {
        this.name = name;
        this.description = description;
        this.pointsCost = pointsCost;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public void activate() {
        this.isActive = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void deactivate() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }

    public void deductStock() {
        if (this.stock <= 0)
            throw new IllegalStateException("Out of stock!");
        this.stock--;
        this.updatedAt = LocalDateTime.now();
    }

    public UUID getItemId() {
        return itemId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getPointsCost() {
        return pointsCost;
    }

    public int getStock() {
        return stock;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public boolean isActive() {
        return isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
