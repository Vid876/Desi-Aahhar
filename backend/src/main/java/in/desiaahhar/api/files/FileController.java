package in.desiaahhar.api.files;

import in.desiaahhar.api.common.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {
    private final Path uploads;
    private final String publicBaseUrl;

    public FileController(@Value("${app.uploads-dir}") String uploadsDir,
                          @Value("${app.public-base-url}") String publicBaseUrl) {
        this.uploads = Path.of(uploadsDir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.replaceAll("/$", "");
    }

    @PostMapping("/delivery-proof")
    Map<String, String> deliveryProof(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose an image smaller than 10 MB");
        String extension = extension(file.getOriginalFilename());
        if (!Set.of("jpg", "jpeg", "png", "webp").contains(extension))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Delivery proof must be JPG, PNG or WebP");
        String name = "proof-" + UUID.randomUUID() + "." + extension;
        try {
            Files.createDirectories(uploads);
            Path destination = uploads.resolve(name).normalize();
            if (!destination.startsWith(uploads)) throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid filename");
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return Map.of("url", publicBaseUrl + "/uploads/" + name);
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Delivery proof could not be saved");
        }
    }

    private String extension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
