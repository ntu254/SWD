package demo.uc05.repository;

import demo.uc05.entity.RewardTransaction;

import java.util.*;
import java.util.stream.Collectors;

/**
 * UC-05 Repository: In-memory store for RewardTransactions
 * Pattern: Repository
 */
public class RewardTransactionRepository {

    private final List<RewardTransaction> store = new ArrayList<>();

    public void save(RewardTransaction tx) {
        store.add(tx);
    }

    public List<RewardTransaction> findByCitizenUserId(UUID citizenUserId) {
        return store.stream()
                .filter(tx -> tx.getCitizenUserId().equals(citizenUserId))
                .sorted(Comparator.comparing(RewardTransaction::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public double sumPointsByCitizenUserId(UUID citizenUserId) {
        return store.stream()
                .filter(tx -> tx.getCitizenUserId().equals(citizenUserId))
                .mapToDouble(RewardTransaction::getPointsDelta)
                .sum();
    }

    public List<Map.Entry<UUID, Double>> findLeaderboard(int limit) {
        Map<UUID, Double> totals = new LinkedHashMap<>();
        Map<UUID, String> names = new LinkedHashMap<>();
        for (RewardTransaction tx : store) {
            totals.merge(tx.getCitizenUserId(), tx.getPointsDelta(), Double::sum);
            names.putIfAbsent(tx.getCitizenUserId(), tx.getCitizenName());
        }
        return totals.entrySet().stream()
                .sorted(Map.Entry.<UUID, Double>comparingByValue().reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Map<UUID, String> getNameMap() {
        Map<UUID, String> names = new HashMap<>();
        for (RewardTransaction tx : store) {
            names.putIfAbsent(tx.getCitizenUserId(), tx.getCitizenName());
        }
        return names;
    }

    public List<RewardTransaction> findAll() {
        return Collections.unmodifiableList(store);
    }
}
