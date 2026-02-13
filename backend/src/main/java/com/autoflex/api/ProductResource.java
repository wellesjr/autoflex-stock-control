package com.autoflex.api;

import java.net.URI;
import java.util.List;

import com.autoflex.api.dto.ProductMaterialRequest;
import com.autoflex.api.dto.ProductMaterialResponse;
import com.autoflex.domain.ProductRawMaterial;
import com.autoflex.domain.RawMaterial;
import com.autoflex.repository.ProductRawMaterialRepository;
import com.autoflex.repository.RawMaterialRepository;
import com.autoflex.api.dto.ProductRequest;
import com.autoflex.api.dto.ProductResponse;
import com.autoflex.domain.Product;
import com.autoflex.repository.ProductRepository;

import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Sort;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/products")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ProductResource {

    private final ProductRepository productRepository;
    private final ProductRawMaterialRepository productRawMaterialRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public ProductResource(ProductRepository productRepository, ProductRawMaterialRepository productRawMaterialRepository, RawMaterialRepository rawMaterialRepository) {
        this.productRepository = productRepository;
        this.productRawMaterialRepository = productRawMaterialRepository;
        this.rawMaterialRepository = rawMaterialRepository;
    }

    @GET
    public List<ProductResponse> list(
            @QueryParam("q") @DefaultValue("") String q,
            @QueryParam("sort") @DefaultValue("name") String sort,
            @QueryParam("dir") @DefaultValue("asc") String dir
    ) {
        Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.Descending : Sort.Direction.Ascending;
        Sort orderBy = Sort.by(sort).direction(direction);

        PanacheQuery<Product> query;

        if (q == null || q.isBlank()) {
            query = productRepository.findAll(orderBy);
        } else {
            String like = "%" + q.trim().toLowerCase() + "%";
            query = productRepository.find("lower(code) like ?1 or lower(name) like ?1", orderBy, like);
        }

        return query.stream()
                .map(p -> ProductResponse.of(p.id, p.code, p.name, p.price))
                .toList();
    }

    @GET
    @Path("/{id}")
    public ProductResponse get(@PathParam("id") Long id) {
        Product p = productRepository.findById(id);
        if (p == null) {
            throw new NotFoundException("Product not found");
        }
        return ProductResponse.of(p.id, p.code, p.name, p.price);
    }

    @POST
    @Transactional
    public Response create(@Valid ProductRequest req) {
        // unique code check
        if (productRepository.find("code", req.code).firstResult() != null) {
            throw new WebApplicationException("Product code already exists", 409);
        }

        Product p = new Product();
        p.code = req.code;
        p.name = req.name;
        p.price = req.price;

        productRepository.persist(p);

        return Response.created(URI.create("/api/products/" + p.id))
                .entity(ProductResponse.of(p.id, p.code, p.name, p.price))
                .build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public ProductResponse update(@PathParam("id") Long id, @Valid ProductRequest req) {
        Product p = productRepository.findById(id);
        if (p == null) {
            throw new NotFoundException("Product not found");
        }

        // unique code check for other product
        Product other = productRepository.find("code", req.code).firstResult();
        if (other != null && !other.id.equals(id)) {
            throw new WebApplicationException("Product code already exists", 409);
        }

        p.code = req.code;
        p.name = req.name;
        p.price = req.price;

        return ProductResponse.of(p.id, p.code, p.name, p.price);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        Product p = productRepository.findById(id);
        if (p == null) {
            return Response.status(Response.Status.NO_CONTENT).build();
        }
        productRepository.delete(p);
        return Response.noContent().build();
    }

        @GET
    @Path("/{id}/materials")
    public List<ProductMaterialResponse> listMaterials(@PathParam("id") Long productId) {
        Product product = productRepository.findById(productId);
        if (product == null) {
            throw new NotFoundException("Product not found");
        }

        return productRawMaterialRepository
                .find("product.id", Sort.by("rawMaterial.name"), productId)
                .stream()
                .map(prm -> ProductMaterialResponse.of(
                        prm.rawMaterial.id,
                        prm.rawMaterial.code,
                        prm.rawMaterial.name,
                        prm.requiredQuantity
                ))
                .toList();
    }

    @POST
    @Path("/{id}/materials")
    @Transactional
    public Response addMaterial(@PathParam("id") Long productId, @Valid ProductMaterialRequest req) {
        Product product = productRepository.findById(productId);
        if (product == null) {
            throw new NotFoundException("Product not found");
        }

        RawMaterial rawMaterial = rawMaterialRepository.findById(req.rawMaterialId);
        if (rawMaterial == null) {
            throw new NotFoundException("Raw material not found");
        }

        ProductRawMaterial existing = productRawMaterialRepository
                .find("product.id = ?1 and rawMaterial.id = ?2", productId, req.rawMaterialId)
                .firstResult();

        if (existing != null) {
            throw new WebApplicationException("Raw material already linked to product", 409);
        }

        ProductRawMaterial prm = new ProductRawMaterial();
        prm.product = product;
        prm.rawMaterial = rawMaterial;
        prm.requiredQuantity = req.requiredQuantity;

        productRawMaterialRepository.persist(prm);

        return Response.created(URI.create("/api/products/" + productId + "/materials/" + rawMaterial.id))
                .entity(ProductMaterialResponse.of(rawMaterial.id, rawMaterial.code, rawMaterial.name, prm.requiredQuantity))
                .build();
    }

    @PUT
    @Path("/{id}/materials/{rawMaterialId}")
    @Transactional
    public ProductMaterialResponse updateMaterial(
            @PathParam("id") Long productId,
            @PathParam("rawMaterialId") Long rawMaterialId,
            @Valid ProductMaterialRequest req
    ) {
        if (!rawMaterialId.equals(req.rawMaterialId)) {
            throw new WebApplicationException("rawMaterialId in path must match request body", 400);
        }

        ProductRawMaterial prm = productRawMaterialRepository
                .find("product.id = ?1 and rawMaterial.id = ?2", productId, rawMaterialId)
                .firstResult();

        if (prm == null) {
            throw new NotFoundException("Link not found");
        }

        prm.requiredQuantity = req.requiredQuantity;

        return ProductMaterialResponse.of(
                prm.rawMaterial.id,
                prm.rawMaterial.code,
                prm.rawMaterial.name,
                prm.requiredQuantity
        );
    }

    @DELETE
    @Path("/{id}/materials/{rawMaterialId}")
    @Transactional
    public Response removeMaterial(
            @PathParam("id") Long productId,
            @PathParam("rawMaterialId") Long rawMaterialId
    ) {
        ProductRawMaterial prm = productRawMaterialRepository
                .find("product.id = ?1 and rawMaterial.id = ?2", productId, rawMaterialId)
                .firstResult();

        if (prm == null) {
            return Response.noContent().build();
        }

        productRawMaterialRepository.delete(prm);
        return Response.noContent().build();
    }
}