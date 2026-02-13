package com.autoflex.api.dto.product;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class ProductMaterialRequest {

    @NotNull
    public Long rawMaterialId;

    @NotNull
    @DecimalMin("0.0001")
    public BigDecimal requiredQuantity;
}