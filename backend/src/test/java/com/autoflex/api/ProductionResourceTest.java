package com.autoflex.api;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

@QuarkusTest
class ProductionResourceTest extends BaseApiTest {

    @Test
    void shouldPrioritizeHigherPriceProductsWhenSuggestingProduction() {
        Long highValueProductId = createProduct("P-HIGH", "High Value Product", "100.00");
        Long lowValueProductId = createProduct("P-LOW", "Low Value Product", "10.00");
        Long sharedRawMaterialId = createRawMaterial("RM-SHARED", "Shared Material", "3.0000");

        linkMaterial(highValueProductId, sharedRawMaterialId, "3.0000");
        linkMaterial(lowValueProductId, sharedRawMaterialId, "2.0000");

        given()
                .when()
                .get("/api/production/suggestion")
                .then()
                .statusCode(200)
                .body("items", hasSize(2))
                .body("items[0].productId", equalTo(highValueProductId.intValue()))
                .body("items[0].suggestedQuantity", equalTo(1))
                .body("items[1].productId", equalTo(lowValueProductId.intValue()))
                .body("items[1].suggestedQuantity", equalTo(0))
                .body("grandTotalValue", equalTo(100.00f));
    }
}
