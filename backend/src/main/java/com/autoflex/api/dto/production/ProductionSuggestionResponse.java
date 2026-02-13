package com.autoflex.api.dto.production;

import java.math.BigDecimal;
import java.util.List;

public class ProductionSuggestionResponse {

    public List<ProductionItemResponse> items;
    public BigDecimal grandTotalValue;

    public static ProductionSuggestionResponse of(List<ProductionItemResponse> items, BigDecimal grandTotalValue) {
        ProductionSuggestionResponse r = new ProductionSuggestionResponse();
        r.items = items;
        r.grandTotalValue = grandTotalValue;
        return r;
    }
}