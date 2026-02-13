package com.autoflex.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

import com.autoflex.domain.Product;
import com.autoflex.domain.ProductRawMaterial;
import com.autoflex.domain.RawMaterial;
import com.autoflex.repository.ProductRawMaterialRepository;
import com.autoflex.repository.ProductRepository;
import com.autoflex.repository.RawMaterialRepository;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProductionSuggestionService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductRawMaterialRepository productRawMaterialRepository;

    public ProductionSuggestionService(
            ProductRepository productRepository,
            RawMaterialRepository rawMaterialRepository,
            ProductRawMaterialRepository productRawMaterialRepository
    ) {
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.productRawMaterialRepository = productRawMaterialRepository;
    }

    public record SuggestionItem(Product product, long quantity) {}

    public List<SuggestionItem> suggest() {
        Map<Long, BigDecimal> availableStock = new HashMap<>();
        for (RawMaterial rm : rawMaterialRepository.listAll()) {
            availableStock.put(rm.id, rm.stockQuantity);
        }

        List<Product> products = productRepository.list("order by price desc, name asc");

        List<SuggestionItem> result = new ArrayList<>();

        for (Product product : products) {
            List<ProductRawMaterial> bom = productRawMaterialRepository
                    .find("product.id", product.id)
                    .list();

            if (bom.isEmpty()) {
                result.add(new SuggestionItem(product, 0));
                continue;
            }

            long maxUnits = computeMaxUnits(bom, availableStock);

            if (maxUnits > 0) {
                consumeStock(bom, availableStock, maxUnits);
            }

            result.add(new SuggestionItem(product, maxUnits));
        }

        return result;
    }

    private long computeMaxUnits(List<ProductRawMaterial> bom, Map<Long, BigDecimal> availableStock) {
        long maxUnits = Long.MAX_VALUE;

        for (ProductRawMaterial prm : bom) {
            BigDecimal stock = availableStock.getOrDefault(prm.rawMaterial.id, BigDecimal.ZERO);
            BigDecimal required = prm.requiredQuantity;

            if (required == null || required.compareTo(BigDecimal.ZERO) <= 0) {
                return 0;
            }

            BigDecimal possible = stock.divide(required, 0, RoundingMode.FLOOR);
            long possibleLong = possible.longValue();

            maxUnits = Math.min(maxUnits, possibleLong);

            if (maxUnits == 0) {
                return 0;
            }
        }

        return maxUnits == Long.MAX_VALUE ? 0 : maxUnits;
    }

    private void consumeStock(List<ProductRawMaterial> bom, Map<Long, BigDecimal> availableStock, long units) {
        BigDecimal u = BigDecimal.valueOf(units);

        for (ProductRawMaterial prm : bom) {
            BigDecimal stock = availableStock.getOrDefault(prm.rawMaterial.id, BigDecimal.ZERO);
            BigDecimal consumed = prm.requiredQuantity.multiply(u);
            BigDecimal remaining = stock.subtract(consumed);

            if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                remaining = BigDecimal.ZERO;
            }

            availableStock.put(prm.rawMaterial.id, remaining);
        }
    }
}