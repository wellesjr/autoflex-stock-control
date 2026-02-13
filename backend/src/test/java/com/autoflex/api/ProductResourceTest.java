package com.autoflex.api;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

@QuarkusTest
class ProductResourceTest extends BaseApiTest {

    @Test
    void shouldPerformProductCrudFlow() {
        Long id = createProduct("P-001", "Brake Pad", "120.00");

        given()
                .when()
                .get("/api/products/" + id)
                .then()
                .statusCode(200)
                .body("id", equalTo(id.intValue()))
                .body("code", equalTo("P-001"))
                .body("name", equalTo("Brake Pad"))
                .body("price", equalTo(120.00f));

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("code", "P-001", "name", "Brake Pad Updated", "price", "150.50"))
                .when()
                .put("/api/products/" + id)
                .then()
                .statusCode(200)
                .body("name", equalTo("Brake Pad Updated"))
                .body("price", equalTo(150.50f));

        given()
                .when()
                .get("/api/products")
                .then()
                .statusCode(200)
                .body("$", hasSize(1));

        given()
                .when()
                .delete("/api/products/" + id)
                .then()
                .statusCode(204);

        given()
                .when()
                .get("/api/products")
                .then()
                .statusCode(200)
                .body("$", hasSize(0));
    }

    @Test
    void shouldReturn409WhenCreatingDuplicateCode() {
        createProduct("P-100", "Disc", "90.00");

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("code", "P-100", "name", "Disc 2", "price", "95.00"))
                .when()
                .post("/api/products")
                .then()
                .statusCode(409);
    }
}
