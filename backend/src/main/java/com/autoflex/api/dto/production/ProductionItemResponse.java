package com.autoflex.api.dto.production;

import java.math.BigDecimal;

public class ProductionItemResponse {

    public Long productId;
    public String productCode;
    public String productName;
    public BigDecimal unitPrice;

    public long suggestedQuantity;
    public BigDecimal totalValue;

    public static ProductionItemResponse of(
            Long productId,
            String productCode,
            String productName,
            BigDecimal unitPrice,
            long suggestedQuantity,
            BigDecimal totalValue
    ) {
        ProductionItemResponse r = new ProductionItemResponse();
        r.productId = productId;
        r.productCode = productCode;
        r.productName = productName;
        r.unitPrice = unitPrice;
        r.suggestedQuantity = suggestedQuantity;
        r.totalValue = totalValue;
        return r;
    }
}