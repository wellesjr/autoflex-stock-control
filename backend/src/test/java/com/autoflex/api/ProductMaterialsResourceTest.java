package com.autoflex.api;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

@QuarkusTest
class ProductMaterialsResourceTest extends BaseApiTest {

    @Test
    void shouldManageProductMaterialsCrudFlow() {
        Long productId = createProduct("P-010", "Bushing", "50.00");
        Long rawMaterialId = createRawMaterial("RM-010", "Rubber", "30.00");

        linkMaterial(productId, rawMaterialId, "2.5000");

        given()
                .when()
                .get("/api/products/" + productId + "/materials")
                .then()
                .statusCode(200)
                .body("$", hasSize(1))
                .body("[0].rawMaterialId", equalTo(rawMaterialId.intValue()))
                .body("[0].requiredQuantity", equalTo(2.5000f));

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("rawMaterialId", rawMaterialId, "requiredQuantity", "3.0000"))
                .when()
                .put("/api/products/" + productId + "/materials/" + rawMaterialId)
                .then()
                .statusCode(200)
                .body("requiredQuantity", equalTo(3.0000f));

        given()
                .when()
                .delete("/api/products/" + productId + "/materials/" + rawMaterialId)
                .then()
                .statusCode(204);

        given()
                .when()
                .get("/api/products/" + productId + "/materials")
                .then()
                .statusCode(200)
                .body("$", hasSize(0));
    }

    @Test
    void shouldReturn409WhenLinkingSameRawMaterialTwice() {
        Long productId = createProduct("P-020", "Bearing", "70.00");
        Long rawMaterialId = createRawMaterial("RM-020", "Alloy Steel", "15.00");

        linkMaterial(productId, rawMaterialId, "1.0000");

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("rawMaterialId", rawMaterialId, "requiredQuantity", "2.0000"))
                .when()
                .post("/api/products/" + productId + "/materials")
                .then()
                .statusCode(409);
    }
}
