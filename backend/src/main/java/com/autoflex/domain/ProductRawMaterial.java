package com.autoflex.domain;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
        name = "product_raw_materials",
        uniqueConstraints = @UniqueConstraint(name = "uq_product_material", columnNames = {"product_id", "raw_material_id"})
)
public class ProductRawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @NotNull
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;

    @NotNull
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id", nullable = false)
    public RawMaterial rawMaterial;

    @NotNull
    @DecimalMin("0.0001")
    @Column(name = "required_quantity", nullable = false, precision = 19, scale = 4)
    public BigDecimal requiredQuantity;
}