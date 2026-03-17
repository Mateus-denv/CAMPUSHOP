document.addEventListener('DOMContentLoaded', function() {

    // Função para alternar a visibilidade da senha
    window.togglePassword = function(fieldId) {
        const field = document.getElementById(fieldId);
        const icon = field.nextElementSibling;
        if (field.type === 'password') {
            field.type = 'text';
            icon.textContent = '🙈'; // Ícone de olho fechado
        } else {
            field.type = 'password';
            icon.textContent = '👁️'; // Ícone de olho aberto
        }
    }

    // Lógica para a seleção de perfil de usuário
    const profileOptions = document.querySelectorAll('.profile-option');
    if (profileOptions.length > 0) {
        profileOptions.forEach(option => {
            option.addEventListener('click', () => {
                profileOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            });
        });
    }
});
