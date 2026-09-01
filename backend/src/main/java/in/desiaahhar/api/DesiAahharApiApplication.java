package in.desiaahhar.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestClient;

@SpringBootApplication
public class DesiAahharApiApplication {
    @Bean
    RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

    public static void main(String[] args) {
        SpringApplication.run(DesiAahharApiApplication.class, args);
    }
}
