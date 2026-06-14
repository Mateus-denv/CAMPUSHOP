package br.com.campushop.campushop_backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração do Swagger/OpenAPI 3.0
 * Gera documentação automática da API em http://localhost:8080/swagger-ui.html
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI campuShopAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CampuShop API")
                        .description("API do marketplace universitário - Conectando estudantes para comprar e vender")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipe CampuShop")
                                .email("campushop@email.com")
                                .url("https://github.com/campushop")))
                // Adiciona suporte a JWT nos endpoints protegidos
                .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Auth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Cole seu token JWT aqui (apenas o token, sem 'Bearer ')")));
    }
}
