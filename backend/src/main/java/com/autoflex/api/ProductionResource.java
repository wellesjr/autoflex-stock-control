package com.autoflex.api;

import java.math.BigDecimal;
import java.util.List;

import com.autoflex.api.dto.production.ProductionItemResponse;
import com.autoflex.api.dto.production.ProductionSuggestionResponse;

import com.autoflex.domain.Product;

import com.autoflex.service.ProductionSuggestionService;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api/production")
@Produces(MediaType.APPLICATION_JSON)
public class ProductionResource {

    private final ProductionSuggestionService service;

    public ProductionResource(ProductionSuggestionService service) {
        this.service = service;
    }

    @GET
    @Path("/suggestion")
    public ProductionSuggestionResponse suggestion() {
        List<ProductionSuggestionService.SuggestionItem> items = service.suggest();

        List<ProductionItemResponse> responseItems = items.stream()
                .map(it -> toResponse(it.product(), it.quantity()))
                .toList();

        BigDecimal grandTotal = responseItems.stream()
                .map(i -> i.totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ProductionSuggestionResponse.of(responseItems, grandTotal);
    }

    private ProductionItemResponse toResponse(Product p, long qty) {
        BigDecimal total = p.price.multiply(BigDecimal.valueOf(qty));
        return ProductionItemResponse.of(p.id, p.code, p.name, p.price, qty, total);
    }
}