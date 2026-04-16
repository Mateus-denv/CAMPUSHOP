package br.com.campushop.campushop_backend.config;

import br.com.campushop.campushop_backend.model.Categoria;
import br.com.campushop.campushop_backend.repository.CategoriaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final CategoriaRepository categoriaRepository;

    public DatabaseSeeder(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    public void run(String... args) {
        try {
            // Verificar se a conexão com o banco está ok
            List<Categoria> existing = categoriaRepository.findAll();
            System.out.println("✓ Banco de dados conectado. Categorias existentes: " + existing.size());

            if (existing.isEmpty()) {
                seedCategories();
            }
        } catch (Exception e) {
            System.out.println("⚠ Aviso: Banco de dados não está disponível ou seeding falhou.");
            System.out.println("  Erro: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            // Não falha a inicialização da aplicação se o banco não estiver disponível
        }
    }

    private void seedCategories() {
        List<Categoria> defaultCategorias = List.of(
                createCategoria("Livros", "Materiais de estudo e leitura"),
                createCategoria("Eletrônicos", "Itens eletrônicos e acessórios"),
                createCategoria("Roupas", "Vestuário e acessórios"),
                createCategoria("Alimentos", "Produtos alimentícios e bebidas"),
                createCategoria("Móveis", "Móveis e decoração"),
                createCategoria("Esportes", "Equipamentos e acessórios esportivos"),
                createCategoria("Beleza", "Produtos de beleza e cuidados pessoais"),
                createCategoria("Informática", "Computadores, periféricos e software"),
                createCategoria("Automotivo", "Peças e acessórios para veículos"),
                createCategoria("Casa e Jardim", "Itens para casa e jardim"));

        try {
            Set<String> existingNames = categoriaRepository.findAll().stream()
                    .map(Categoria::getNome_categoria)
                    .collect(Collectors.toSet());

            List<Categoria> missingCategorias = defaultCategorias.stream()
                    .filter(cat -> !existingNames.contains(cat.getNome_categoria()))
                    .collect(Collectors.toList());

            if (!missingCategorias.isEmpty()) {
                categoriaRepository.saveAll(missingCategorias);
                System.out.println("✓ " + missingCategorias.size() + " categorias criadas com sucesso.");
            }
        } catch (Exception e) {
            System.err.println("✗ Erro ao criar categorias: " + e.getMessage());
        }
    }

    private Categoria createCategoria(String nome, String descricao) {
        Categoria categoria = new Categoria();
        categoria.setNome_categoria(nome);
        categoria.setDescricao(descricao);
        return categoria;
    }
}
