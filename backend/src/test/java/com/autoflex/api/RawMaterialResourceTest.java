package com.autoflex.api;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

@QuarkusTest
class RawMaterialResourceTest extends BaseApiTest {

    @Test
    void shouldPerformRawMaterialCrudFlow() {
        Long id = createRawMaterial("RM-001", "Steel", "100.00");

        given()
                .when()
                .get("/api/raw-materials/" + id)
                .then()
                .statusCode(200)
                .body("id", equalTo(id.intValue()))
                .body("code", equalTo("RM-001"))
                .body("name", equalTo("Steel"))
                .body("stockQuantity", equalTo(100.00f));

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("code", "RM-001", "name", "Steel 304", "stockQuantity", "175.25"))
                .when()
                .put("/api/raw-materials/" + id)
                .then()
                .statusCode(200)
                .body("name", equalTo("Steel 304"))
                .body("stockQuantity", equalTo(175.25f));

        given()
                .when()
                .get("/api/raw-materials")
                .then()
                .statusCode(200)
                .body("$", hasSize(1));

        given()
                .when()
                .delete("/api/raw-materials/" + id)
                .then()
                .statusCode(204);

        given()
                .when()
                .get("/api/raw-materials")
                .then()
                .statusCode(200)
                .body("$", hasSize(0));
    }

    @Test
    void shouldReturn409WhenCreatingDuplicateCode() {
        createRawMaterial("RM-100", "Copper", "20.00");

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("code", "RM-100", "name", "Copper 2", "stockQuantity", "30.00"))
                .when()
                .post("/api/raw-materials")
                .then()
                .statusCode(409);
    }
}
