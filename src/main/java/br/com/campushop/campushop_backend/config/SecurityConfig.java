package br.com.campushop.campushop_backend.config;

import br.com.campushop.campushop_backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(authorize -> authorize
                                                .requestMatchers(
                                                                "/",
                                                                "/index.html",
                                                                "/assets/**",
                                                                "/css/**",
                                                                "/js/**",
                                                                "/img/**",
                                                                "/login",
                                                                "/cadastro",
                                                                "/home",
                                                                "/categorias",
                                                                "/produto/**",
                                                                "/carrinho",
                                                                "/pedidos",
                                                                "/conta",
                                                                "/chat",
                                                                "/actuator/health",
                                                                "/error",
                                                                "/produtos",
                                                                "/produtos/**",
                                                                "/api/auth/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .formLogin(form -> form.disable())
                                .httpBasic(httpBasic -> httpBasic.disable())
                                .logout(logout -> logout.disable())
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // Forma correta de expor o AuthenticationManager no Spring Boot 3+
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
                        throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }
}