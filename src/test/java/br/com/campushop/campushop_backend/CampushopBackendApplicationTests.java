package br.com.campushop.campushop_backend;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@ActiveProfiles("test")
class CampushopBackendApplicationTests {

    @Test
    void contextLoads() {
        // O teste existe para validar que a aplicação sobe com o perfil isolado de
        // testes.
    }

}
