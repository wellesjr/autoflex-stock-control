package com.autoflex.api.dto.product;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ProductRequest {

    @NotBlank
    @Size(max = 50)
    public String code;

    @NotBlank
    @Size(max = 200)
    public String name;

    @NotNull
    @DecimalMin("0.01")
    public BigDecimal price;
}