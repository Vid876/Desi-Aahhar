package in.desiaahhar.api.catalog;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {
    private final CatalogService catalog;

    public CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/categories")
    List<CatalogService.CategoryView> categories() {
        return catalog.categories();
    }

    @GetMapping("/products")
    List<CatalogService.ProductView> products(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean featured) {
        return catalog.products(category, featured, null);
    }

    @GetMapping("/products/{id}")
    CatalogService.ProductView product(@PathVariable UUID id) {
        return catalog.product(id);
    }

    @GetMapping("/search")
    List<CatalogService.ProductView> search(@RequestParam String q) {
        return catalog.products(null, null, q);
    }

    @GetMapping("/offers")
    List<CatalogService.OfferView> offers() {
        return catalog.offers();
    }
}
