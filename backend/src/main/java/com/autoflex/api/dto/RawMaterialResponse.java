package com.autoflex.api.dto;

import java.math.BigDecimal;

public class RawMaterialResponse {

    public Long id;
    public String code;
    public String name;
    public BigDecimal stockQuantity;

    public static RawMaterialResponse of(
            Long id,
            String code,
            String name,
            BigDecimal stockQuantity
    ) {
        RawMaterialResponse r = new RawMaterialResponse();
        r.id = id;
        r.code = code;
        r.name = name;
        r.stockQuantity = stockQuantity;
        return r;
    }
}