package com.autoflex.api.dto.product;

import java.math.BigDecimal;

public class ProductResponse {
    public Long id;
    public String code;
    public String name;
    public BigDecimal price;

    public static ProductResponse of(Long id, String code, String name, BigDecimal price) {
        ProductResponse r = new ProductResponse();
        r.id = id;
        r.code = code;
        r.name = name;
        r.price = price;
        return r;
    }
}