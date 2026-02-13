package com.autoflex.api;

import java.net.URI;
import java.util.List;

import com.autoflex.api.dto.material.RawMaterialRequest;
import com.autoflex.api.dto.material.RawMaterialResponse;

import com.autoflex.domain.RawMaterial;

import com.autoflex.repository.RawMaterialRepository;

import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Sort;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/raw-materials")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class RawMaterialResource {

    private final RawMaterialRepository rawMaterialRepository;

    public RawMaterialResource(RawMaterialRepository rawMaterialRepository) {
        this.rawMaterialRepository = rawMaterialRepository;
    }

    @GET
    public List<RawMaterialResponse> list(
            @QueryParam("q") @DefaultValue("") String q,
            @QueryParam("sort") @DefaultValue("name") String sort,
            @QueryParam("dir") @DefaultValue("asc") String dir
    ) {
        Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.Descending : Sort.Direction.Ascending;
        Sort orderBy = Sort.by(sort).direction(direction);

        PanacheQuery<RawMaterial> query;

        if (q == null || q.isBlank()) {
            query = rawMaterialRepository.findAll(orderBy);
        } else {
            String like = "%" + q.trim().toLowerCase() + "%";
            query = rawMaterialRepository.find("lower(code) like ?1 or lower(name) like ?1", orderBy, like);
        }

        return query.stream()
                .map(rm -> RawMaterialResponse.of(rm.id, rm.code, rm.name, rm.stockQuantity))
                .toList();
    }

    @GET
    @Path("/{id}")
    public RawMaterialResponse get(@PathParam("id") Long id) {
        RawMaterial rm = rawMaterialRepository.findById(id);
        if (rm == null) {
            throw new NotFoundException("Raw material not found");
        }
        return RawMaterialResponse.of(rm.id, rm.code, rm.name, rm.stockQuantity);
    }

    @POST
    @Transactional
    public Response create(@Valid RawMaterialRequest req) {
        if (rawMaterialRepository.find("code", req.code).firstResult() != null) {
            throw new WebApplicationException("Raw material code already exists", 409);
        }

        RawMaterial rm = new RawMaterial();
        rm.code = req.code;
        rm.name = req.name;
        rm.stockQuantity = req.stockQuantity;

        rawMaterialRepository.persist(rm);

        return Response.created(URI.create("/api/raw-materials/" + rm.id))
                .entity(RawMaterialResponse.of(rm.id, rm.code, rm.name, rm.stockQuantity))
                .build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public RawMaterialResponse update(@PathParam("id") Long id, @Valid RawMaterialRequest req) {
        RawMaterial rm = rawMaterialRepository.findById(id);
        if (rm == null) {
            throw new NotFoundException("Raw material not found");
        }

        RawMaterial other = rawMaterialRepository.find("code", req.code).firstResult();
        if (other != null && !other.id.equals(id)) {
            throw new WebApplicationException("Raw material code already exists", 409);
        }

        rm.code = req.code;
        rm.name = req.name;
        rm.stockQuantity = req.stockQuantity;

        return RawMaterialResponse.of(rm.id, rm.code, rm.name, rm.stockQuantity);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        RawMaterial rm = rawMaterialRepository.findById(id);
        if (rm == null) {
            return Response.noContent().build();
        }
        rawMaterialRepository.delete(rm);
        return Response.noContent().build();
    }
}