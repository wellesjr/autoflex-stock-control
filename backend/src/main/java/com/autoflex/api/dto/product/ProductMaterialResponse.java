package com.autoflex.api.dto.product;

import java.math.BigDecimal;

public class ProductMaterialResponse {

    public Long rawMaterialId;
    public String rawMaterialCode;
    public String rawMaterialName;
    public BigDecimal requiredQuantity;

    public static ProductMaterialResponse of(
            Long rawMaterialId,
            String rawMaterialCode,
            String rawMaterialName,
            BigDecimal requiredQuantity
    ) {
        ProductMaterialResponse r = new ProductMaterialResponse();
        r.rawMaterialId = rawMaterialId;
        r.rawMaterialCode = rawMaterialCode;
        r.rawMaterialName = rawMaterialName;
        r.requiredQuantity = requiredQuantity;
        return r;
    }
}