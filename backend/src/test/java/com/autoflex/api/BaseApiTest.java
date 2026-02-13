package com.autoflex.api;

import java.util.Map;

import com.autoflex.repository.ProductRawMaterialRepository;
import com.autoflex.repository.ProductRepository;
import com.autoflex.repository.RawMaterialRepository;

import io.restassured.http.ContentType;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;

import static io.restassured.RestAssured.given;

public abstract class BaseApiTest {

    @Inject
    ProductRepository productRepository;

    @Inject
    RawMaterialRepository rawMaterialRepository;

    @Inject
    ProductRawMaterialRepository productRawMaterialRepository;

    @BeforeEach
    @Transactional
    void cleanDatabase() {
        productRawMaterialRepository.deleteAll();
        productRepository.deleteAll();
        rawMaterialRepository.deleteAll();
    }

    protected Long createProduct(String code, String name, String price) {
        Number id = given()
                .contentType(ContentType.JSON)
                .body(Map.of("code", code, "name", name, "price", price))
                .when()
                .post("/api/products")
                .then()
                .statusCode(201)
                .extract()
                .path("id");
        return id.longValue();
    }

    protected Long createRawMaterial(String code, String name, String stockQuantity) {
        Number id = given()
                .contentType(ContentType.JSON)
                .body(Map.of("code", code, "name", name, "stockQuantity", stockQuantity))
                .when()
                .post("/api/raw-materials")
                .then()
                .statusCode(201)
                .extract()
                .path("id");
        return id.longValue();
    }

    protected void linkMaterial(Long productId, Long rawMaterialId, String requiredQuantity) {
        given()
                .contentType(ContentType.JSON)
                .body(Map.of("rawMaterialId", rawMaterialId, "requiredQuantity", requiredQuantity))
                .when()
                .post("/api/products/" + productId + "/materials")
                .then()
                .statusCode(201);
    }
}
