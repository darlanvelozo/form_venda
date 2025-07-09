// Cadastro JavaScript
class CadastroCliente {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.init();
    }

    init() {
        this.setupInputMasks();
        this.setupEventListeners();
        this.updateButtons();
    }

    setupInputMasks() {
        // CPF mask
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            Inputmask('999.999.999-99').mask(cpfInput);
        }

        // RG mask
        const rgInput = document.getElementById('rg');
        if (rgInput) {
            Inputmask('99.999.999-*').mask(rgInput);
        }

        // Phone mask
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            Inputmask('(99) 99999-9999').mask(telefoneInput);
        }

        // CEP mask
        const cepInput = document.getElementById('cep');
        if (cepInput) {
            Inputmask('99999-999').mask(cepInput);
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('submitBtn').addEventListener('click', () => {
            this.submitForm();
        });

        // Plan selection
        document.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectPlan(card);
            });
        });

        // Payment option selection
        document.querySelectorAll('.payment-option input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.selectPaymentOption(radio);
            });
        });

        // CEP lookup
        document.getElementById('cep').addEventListener('blur', () => {
            this.lookupCEP();
        });

        // Real-time validation
        document.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });

        // CPF validation
        document.getElementById('cpf').addEventListener('blur', () => {
            this.validateCPF();
        });

        // Phone validation
        document.getElementById('telefone').addEventListener('blur', () => {
            this.validatePhone();
        });
    }

    selectPlan(card) {
        // Remove previous selection
        document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        
        // Store plan data
        this.formData.id_servico = parseInt(card.dataset.plan);
        this.formData.valor = parseFloat(card.dataset.value);
        
        console.log('Plano selecionado:', {
            id_servico: this.formData.id_servico,
            valor: this.formData.valor
        });
        
        // Update form validation
        this.updateButtons();
    }

    selectPaymentOption(radio) {
        this.formData.id_vencimento = parseInt(radio.value);
        
        console.log('Vencimento selecionado:', {
            id_vencimento: this.formData.id_vencimento,
            dia: this.getDiaVencimento(this.formData.id_vencimento)
        });
        
        this.updateButtons();
    }

    getDiaVencimento(id_vencimento) {
        const mapping = {
            9: '5',
            4: '10', 
            5: '15',
            6: '20',
            10: '30'
        };
        return mapping[id_vencimento] || 'N/A';
    }

    async lookupCEP() {
        const cepInput = document.getElementById('cep');
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            this.showFieldError('cep', 'CEP deve ter 8 dígitos');
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (data.erro) {
                this.showFieldError('cep', 'CEP não encontrado');
                return;
            }

            // Fill address fields
            document.getElementById('endereco').value = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('estado').value = data.uf || '';
            
            this.clearFieldError('cep');
            
            // Focus on number field
            document.getElementById('numero').focus();
            
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            this.showFieldError('cep', 'Erro ao buscar CEP. Verifique sua conexão.');
        }
    }

    validateField(input) {
        const value = input.value.trim();
        
        if (input.hasAttribute('required') && !value) {
            this.showFieldError(input.id, 'Este campo é obrigatório');
            return false;
        }
        
        this.clearFieldError(input.id);
        return true;
    }

    validateCPF() {
        const cpfInput = document.getElementById('cpf');
        const cpf = cpfInput.value.replace(/\D/g, '');
        
        if (!this.isValidCPF(cpf)) {
            this.showFieldError('cpf', 'CPF inválido');
            return false;
        }
        
        this.clearFieldError('cpf');
        return true;
    }

    validatePhone() {
        const phoneInput = document.getElementById('telefone');
        const phone = phoneInput.value.replace(/\D/g, '');
        
        if (phone.length < 10 || phone.length > 11) {
            this.showFieldError('telefone', 'Telefone deve ter 10 ou 11 dígitos');
            return false;
        }
        
        this.clearFieldError('telefone');
        return true;
    }

    isValidCPF(cpf) {
        if (cpf.length !== 11 || /^(.)\1*$/.test(cpf)) {
            return false;
        }

        let soma = 0;
        let resto;

        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = field.parentNode.querySelector('.field-error');
        
        if (errorDiv) {
            errorDiv.textContent = message;
        }
        
        field.classList.add('error');
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = field.parentNode.querySelector('.field-error');
        
        if (errorDiv) {
            errorDiv.textContent = '';
        }
        
        field.classList.remove('error');
    }

    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }
        
        this.collectStepData();
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStep();
            
            if (this.currentStep === 4) {
                this.updateSummary();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStep();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            case 3:
                return this.validateStep3();
            case 4:
                return this.validateStep4();
            default:
                return true;
        }
    }

    validateStep1() {
        const selectedPlan = document.querySelector('.plan-card.selected');
        const selectedVencimento = document.querySelector('input[name="vencimento"]:checked');
        
        if (!selectedPlan) {
            alert('Por favor, selecione um plano');
            return false;
        }
        
        if (!selectedVencimento) {
            alert('Por favor, selecione o dia de vencimento');
            return false;
        }
        
        return true;
    }

    validateStep2() {
        const requiredFields = ['nome', 'cpf', 'rg', 'telefone', 'nascimento'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        if (!this.validateCPF()) {
            isValid = false;
        }
        
        if (!this.validatePhone()) {
            isValid = false;
        }
        
        return isValid;
    }

    validateStep3() {
        const requiredFields = ['cep', 'endereco', 'numero', 'bairro'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateStep4() {
        const termsCheckbox = document.getElementById('terms');
        
        if (!termsCheckbox.checked) {
            alert('Você deve aceitar os termos de serviço para continuar');
            return false;
        }
        
        return true;
    }

    collectStepData() {
        switch (this.currentStep) {
            case 2:
                this.formData.nome_razaosocial = document.getElementById('nome').value;
                this.formData.cpf_cnpj = document.getElementById('cpf').value.replace(/\D/g, '');
                this.formData.rg = document.getElementById('rg').value;
                this.formData.telefone = document.getElementById('telefone').value.replace(/\D/g, '');
                this.formData.data_nascimento = document.getElementById('nascimento').value;
                break;
                
            case 3:
                this.formData.cep = document.getElementById('cep').value.replace(/\D/g, '');
                this.formData.endereco = document.getElementById('endereco').value;
                this.formData.numero = document.getElementById('numero').value;
                this.formData.bairro = document.getElementById('bairro').value;
                break;
        }
    }

    updateStep() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        document.getElementById(`step-${this.currentStep}`).classList.add('active');
        
        // Update progress bar
        this.updateProgressBar();
        
        // Update buttons
        this.updateButtons();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgressBar() {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        document.querySelectorAll('.progress-line').forEach((line, index) => {
            if (index + 1 < this.currentStep) {
                line.classList.add('completed');
            } else {
                line.classList.remove('completed');
            }
        });
    }

    updateButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        // Previous button
        prevBtn.style.display = this.currentStep > 1 ? 'inline-flex' : 'none';
        
        // Next/Submit buttons
        if (this.currentStep < this.totalSteps) {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        }
    }

    updateSummary() {
        // Plan summary
        const selectedPlan = document.querySelector('.plan-card.selected');
        const selectedVencimento = document.querySelector('input[name="vencimento"]:checked');
        
        document.getElementById('summary-plan').innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Plano:</span>
                <span class="summary-value">${selectedPlan.querySelector('h3').textContent}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Valor:</span>
                <span class="summary-value">R$ ${this.formData.valor.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Vencimento:</span>
                <span class="summary-value">Dia ${this.getDiaVencimento(this.formData.id_vencimento)}</span>
            </div>
        `;
        
        // Personal data summary
        document.getElementById('summary-personal').innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Nome:</span>
                <span class="summary-value">${this.formData.nome_razaosocial}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">CPF:</span>
                <span class="summary-value">${this.formatCPF(this.formData.cpf_cnpj)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Telefone:</span>
                <span class="summary-value">${this.formatPhone(this.formData.telefone)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Data Nascimento:</span>
                <span class="summary-value">${this.formatDate(this.formData.data_nascimento)}</span>
            </div>
        `;
        
        // Address summary
        document.getElementById('summary-address').innerHTML = `
            <div class="summary-item">
                <span class="summary-label">CEP:</span>
                <span class="summary-value">${this.formatCEP(this.formData.cep)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Endereço:</span>
                <span class="summary-value">${this.formData.endereco}, ${this.formData.numero}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Bairro:</span>
                <span class="summary-value">${this.formData.bairro}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Cidade:</span>
                <span class="summary-value">${document.getElementById('cidade').value}</span>
            </div>
        `;
    }

    async submitForm() {
        if (!this.validateCurrentStep()) {
            return;
        }
        
        this.showLoadingModal();
        
        try {
            // Prepare data for API
            const apiData = {
                cep: this.formData.cep,
                id_servico: this.formData.id_servico,
                valor: this.formData.valor,
                rg: this.formData.rg,
                cpf_cnpj: this.formData.cpf_cnpj,
                telefone: this.formData.telefone,
                nome_razaosocial: this.formData.nome_razaosocial,
                tipo_pessoa: "pf",
                bairro: this.formData.bairro,
                endereco: this.formData.endereco,
                numero: this.formData.numero,
                id_vendedor: 1613,
                id_vencimento: this.formData.id_vencimento,
                data_nascimento: this.formData.data_nascimento,
                empresa: "megalink"
            };
            
            console.log('Enviando dados:', apiData);
            
            // Usar endpoint local como proxy
            const response = await fetch('/api/cadastrar_prospecto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData)
            });
            
            const result = await response.json();
            
            this.hideLoadingModal();
            
            if (response.ok) {
                this.showSuccessModal();
                console.log('Cadastro realizado com sucesso:', result);
            } else {
                throw new Error(result.error || result.message || 'Erro ao processar cadastro');
            }
            
        } catch (error) {
            console.error('Erro ao enviar cadastro:', error);
            this.hideLoadingModal();
            
            let errorMessage = 'Erro ao processar cadastro. Tente novamente.';
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            this.showErrorModal(errorMessage);
        }
    }

    showLoadingModal() {
        document.getElementById('loadingModal').style.display = 'block';
    }

    hideLoadingModal() {
        document.getElementById('loadingModal').style.display = 'none';
    }

    showSuccessModal() {
        document.getElementById('successModal').style.display = 'block';
    }

    showErrorModal(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').style.display = 'block';
    }

    // Utility formatting functions
    formatCPF(cpf) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    formatPhone(phone) {
        if (phone.length === 11) {
            return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else {
            return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
    }

    formatCEP(cep) {
        return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Close error modal function
function closeErrorModal() {
    document.getElementById('errorModal').style.display = 'none';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CadastroCliente();
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const modals = ['successModal', 'errorModal', 'loadingModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}); 